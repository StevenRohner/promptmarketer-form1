import http from 'node:http';
import { readFileSync } from 'node:fs';
import { randomBytes, createHmac, createHash, timingSafeEqual, randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { LIMIT, FIELDS, InputError, validatePayload } from './validation.mjs';

export const VERSION='prod-api-v1';
const DEFAULT_PROJECT='689b57ef278375135d0068b9';
const SESSION_SECONDS=8*60*60;
const cookieName='pm_form_session';
export function loadConfig(env=process.env) {
  const url=env.BASE44_FUNCTION_URL||'',key=env.VITARIGHTS_PARTNER_API_KEY||'';
  const projectId=env.BASE44_PROJECT_ID||DEFAULT_PROJECT;
  const origin=env.PUBLIC_ORIGIN||'https://vitarights-partner.promptmarketer.io';
  const missing=[],invalid=[];
  if(!url)missing.push('BASE44_FUNCTION_URL');
  else try {
    const u=new URL(url);
    if(u.protocol!=='https:'||u.username||u.password||u.hash||u.search||!['api.promptmarketer.io','base44.app'].includes(u.hostname)&&!u.hostname.endsWith('.base44.app'))invalid.push('BASE44_FUNCTION_URL');
  }catch{invalid.push('BASE44_FUNCTION_URL');}
  if(!key)missing.push('VITARIGHTS_PARTNER_API_KEY');
  else if(key.length<32||key.length>512||/[^\x21-\x7E]/.test(key))invalid.push('VITARIGHTS_PARTNER_API_KEY');
  if(!/^[A-Za-z0-9_.:-]{1,128}$/.test(projectId))invalid.push('BASE44_PROJECT_ID');
  const origins=new Set();
  try{const u=new URL(origin);if(u.origin!==origin||!['http:','https:'].includes(u.protocol))throw Error();origins.add(u.origin);}catch{invalid.push('PUBLIC_ORIGIN');}
  if(env.RAILWAY_PUBLIC_DOMAIN&&/^[a-z0-9.-]+$/i.test(env.RAILWAY_PUBLIC_DOMAIN))origins.add('https://'+env.RAILWAY_PUBLIC_DOMAIN);
  return {url,key,projectId,origins,ready:missing.length+invalid.length===0,missing,invalid,
    projectIdSource:env.BASE44_PROJECT_ID?'BASE44_PROJECT_ID':'default_app_id',
    companyConfigured:!!env.VITARIGHTS_COMPANY_ID,
    secureCookie:!origin.startsWith('http://localhost')&&!origin.startsWith('http://127.0.0.1')};
}
function same(a,b){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
function digest(v){return createHash('sha256').update(v).digest('hex');}
export function createApplication({config=loadConfig(),html,fetchImpl=fetch,log=entry=>console.log(JSON.stringify(entry)),upstreamTimeout=25000}={}) {
  if(html===undefined)html=readFileSync(new URL('./public/index.html',import.meta.url),'utf8');
  const secret=randomBytes(32),attempts=new Map(),rates=new Map();
  const csp="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'";
  const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':csp,'Permissions-Policy':'camera=(), microphone=(), geolocation=()','X-Frame-Options':'DENY'};
  const mac=s=>createHmac('sha256',secret).update(s).digest('base64url');
  const sign=o=>{const s=Buffer.from(JSON.stringify(o)).toString('base64url');return s+'.'+mac(s);};
  const session=req=>{const m=(req.headers.cookie||'').match(/(?:^|;\s*)pm_form_session=([a-f0-9]{64})(?:;|$)/);return m?m[1]:'';};
  function send(res,status,data,extra={}){res.writeHead(status,{...headers,'Content-Type':'application/json; charset=utf-8',...extra});res.end(JSON.stringify(data));}
  function logResult(id,code,status){log({event:'submission',request_id:id,code,status});}
  function tokenContext(req) {
    const token=req.headers['x-form-token'];
    if(typeof token!=='string'||token.length>1200)throw new InputError('SESSION_EXPIRED',403);
    const [encoded,sig,extra]=token.split('.');
    if(extra||!encoded||!sig||!same(sig,mac(encoded)))throw new InputError('SESSION_EXPIRED',403);
    let p;try{p=JSON.parse(Buffer.from(encoded,'base64url').toString());}catch{throw new InputError('SESSION_EXPIRED',403);}
    const sid=session(req);
    if(!sid||p.session!==digest(sid)||!Number.isFinite(p.exp)||p.exp<Date.now())throw new InputError('SESSION_EXPIRED',403);
    return p;
  }
  function rate(key,max,windowMs) {
    const now=Date.now();let v=rates.get(key);
    if(!v||v.until<now){v={n:0,until:now+windowMs};rates.set(key,v);}
    if(++v.n>max)throw new InputError('RATE_LIMIT',429);
  }
  const gc=setInterval(()=>{const now=Date.now();for(const [k,v]of rates)if(v.until<now)rates.delete(k);for(const[k,v]of attempts)if(v.until<now&&!v.pending)attempts.delete(k);},60000);gc.unref();
  async function readBody(req) {
    if(Number(req.headers['content-length'])>LIMIT)throw new InputError('TOO_LARGE',413);
    let size=0;const chunks=[];
    for await(const chunk of req){size+=chunk.length;if(size>LIMIT)throw new InputError('TOO_LARGE',413);chunks.push(chunk);}
    try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new InputError('INVALID_JSON');}
  }
  async function upstream(payload,id) {
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),upstreamTimeout);
    try {
      const response=await fetchImpl(config.url,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json','Accept':'application/json','X-API-Key':config.key},body:JSON.stringify(payload),signal:controller.signal});
      let size=0,text='';
      for await(const chunk of response.body||[]){size+=chunk.length;if(size>65536)throw Error('response limit');text+=Buffer.from(chunk).toString('utf8');}
      let body;try{body=JSON.parse(text);}catch{body=null;}
      log({event:'base44_response',request_id:id,http_status:response.status,success:body?.success===true,stored:typeof body?.stored==='boolean'?body.stored:null,has_application_id:typeof body?.application_id==='string'});
      if(response.status===401||response.status===403)return {status:502,body:{code:response.status===401?'UPSTREAM_AUTH':'UPSTREAM_FORBIDDEN',request_id:id}};
      if([400,422].includes(response.status)) {
        const details=Array.isArray(body?.details)?body.details.filter(x=>typeof x==='string').slice(0,40):[];
        const fields=[...Object.keys(FIELDS),'vat_liable','signature','contract_accepted','privacy_accepted','self_employed_confirmed'].filter(k=>details.some(s=>new RegExp('(^|[^a-z_])'+k+'([^a-z_]|$)','i').test(s)));
        return {status:422,body:{code:'UPSTREAM_VALIDATION',fields,request_id:id}};
      }
      if(response.status===429)return {status:429,body:{code:'RATE_LIMIT',request_id:id}};
      if(response.ok&&body?.success===true&&body?.stored===true&&typeof body.application_id==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(body.application_id))return {status:201,body:{code:'STORED',stored:true,application_id:body.application_id,request_id:id}};
      if(response.ok&&body?.stored===false&&body?.reason==='sponsor_not_found')return {status:body.admin_notified===true?202:422,body:{code:body.admin_notified===true?'MANUAL_REVIEW':'NOT_STORED',stored:false,admin_notified:body.admin_notified===true,request_id:id}};
      // A timeout, unexpected 2xx, redirect or 5xx may happen after a successful write.
      // Never retry automatically or claim data was stored without confirmation.
      return {status:502,body:{code:'RESULT_UNKNOWN',request_id:id}};
    }catch{return {status:504,body:{code:'RESULT_UNKNOWN',request_id:id}};}
    finally{clearTimeout(timer);}
  }
  const server=http.createServer({requestTimeout:40000,headersTimeout:10000,maxHeaderSize:12000},async(req,res)=>{
    let id=randomUUID();
    try{
      const u=new URL(req.url,'http://internal');
      if(req.method==='GET'&&u.pathname==='/api/health')return send(res,200,{status:'ok',version:VERSION,submission_ready:config.ready,missing:config.missing,invalid:config.invalid,project_id_source:config.projectIdSource,company_id_configured:config.companyConfigured});
      if(['GET','HEAD'].includes(req.method)&&['/','/index.html'].includes(u.pathname)){
        res.writeHead(200,{...headers,'Content-Type':'text/html; charset=utf-8'});return res.end(req.method==='HEAD'?undefined:html);
      }
      if(req.method==='GET'&&u.pathname==='/api/session'){
        if(req.headers['sec-fetch-site']==='cross-site'||req.headers.origin&&!config.origins.has(req.headers.origin))throw new InputError('ORIGIN',403);
        rate('sessions',120,60000);
        const all=u.searchParams.getAll('sponsorId');
        if(all.length>1||all.length===1&&!/^[0-9]{1,128}$/.test(all[0]))throw new InputError('SPONSOR',400);
        const sid=session(req)||randomBytes(32).toString('hex');
        const token=sign({session:digest(sid),sponsor:all.length?all[0]:null,exp:Date.now()+SESSION_SECONDS*1000});
        return send(res,200,{ready:config.ready,token,version:VERSION},{'Set-Cookie':`${cookieName}=${sid}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_SECONDS}${config.secureCookie?'; Secure':''}`});
      }
      if(u.pathname!=='/api/submit')return send(res,404,{code:'NOT_FOUND'});
      if(req.method!=='POST')return send(res,405,{code:'METHOD'},{Allow:'POST'});
      if(!config.origins.has(req.headers.origin)||req.headers['sec-fetch-site']==='cross-site')throw new InputError('ORIGIN',403);
      if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||'')||req.headers['content-encoding']&&req.headers['content-encoding']!=='identity')throw new InputError('CONTENT_TYPE',415);
      if(!config.ready)throw new InputError('NOT_CONFIGURED',503);
      const context=tokenContext(req),key=req.headers['idempotency-key'];
      if(typeof key!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(key))throw new InputError('REQUEST_ID',400);
      id=key; // Correlate browser reference, proxy logs and any ambiguous response.
      rate('all',60,60000);rate(context.session,20,15*60000);
      const payload=validatePayload(await readBody(req),config.projectId);
      if(context.sponsor!==null&&payload.sponsor_partner_number!==context.sponsor)throw new InputError('SPONSOR',409,['sponsor_partner_number']);
      const hash=digest(JSON.stringify(payload)),mapKey=context.session+':'+key;
      let entry=attempts.get(mapKey);
      if(entry&&entry.hash!==hash)throw new InputError('REQUEST_CONFLICT',409);
      if(!entry){
        if(attempts.size>=1000)throw new InputError('BUSY',503);
        entry={hash,until:Date.now()+24*3600000,pending:true};attempts.set(mapKey,entry);
        entry.promise=upstream(payload,id).then(result=>{entry.pending=false;logResult(id,result.body.code,result.status);return result;});
      }
      const result=await entry.promise;
      return send(res,result.status,result.body,result.status===429?{'Retry-After':'60'}:{});
    }catch(error){
      const known=error instanceof InputError,code=known?error.code:'INTERNAL',status=known?error.status:500;
      logResult(id,code,status);
      if(!res.headersSent&&!res.destroyed)send(res,status,{code,fields:known?error.fields:[],request_id:id},status===429?{'Retry-After':'60'}:{});
    }
  });
  server.on('close',()=>clearInterval(gc));
  return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const config=loadConfig(),server=createApplication({config});
  const port=Number(process.env.PORT||3000);
  server.listen(port,'0.0.0.0',()=>console.log(JSON.stringify({event:'startup',version:VERSION,port,submission_ready:config.ready,missing:config.missing,invalid:config.invalid,project_id_source:config.projectIdSource})));
  const shutdown=()=>{server.close(()=>process.exit(0));setTimeout(()=>process.exit(1),30000).unref();};
  process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
}
