import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {deflateSync} from 'node:zlib';
import {randomUUID} from 'node:crypto';
import {once} from 'node:events';
import {loadConfig,createApplication} from '../server.mjs';
import {validatePayload,validPng,ibanValid,realDate} from '../validation.mjs';
import {compileForm} from '../build.mjs';

function crc(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=c&1?0xedb88320^(c>>>1):c>>>1;}return(c^0xffffffff)>>>0;}
function chunk(type,data){const n=Buffer.alloc(4),end=Buffer.alloc(4),t=Buffer.from(type);n.writeUInt32BE(data.length);end.writeUInt32BE(crc(Buffer.concat([t,data])));return Buffer.concat([n,t,data,end]);}
function png(){const ih=Buffer.alloc(13);ih.writeUInt32BE(1);ih.writeUInt32BE(1,4);ih[8]=8;ih[9]=6;return 'data:image/png;base64,'+Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',ih),chunk('IDAT',deflateSync(Buffer.from([0,0,0,0,255]))),chunk('IEND',Buffer.alloc(0))]).toString('base64');}
function data(extra={}){return {sponsor_partner_number:'00471123',first_name:'Test',last_name:'Example',birth_date:'1990-02-01',email:'test@example.com',street:'Teststraße',house_number:'12a',postal_code:'10115',city:'Berlin',country:'DE',phone:'+49 30 1234567',vat_liable:false,start_option:'Erfolgsstart Business',iban:'DE89 3704 0044 0532 0130 00',bic:'COBADEFFXXX',account_holder:'Test Example',start_date:'2026-09-09',signature:png(),contract_accepted:true,privacy_accepted:true,self_employed_confirmed:true,...extra};}
const configuration=()=>loadConfig({BASE44_FUNCTION_URL:'https://api.promptmarketer.io/functions/createVitarightsPartnerApplication',VITARIGHTS_PARTNER_API_KEY:'test-key-not-used-on-live-systems-123456',PUBLIC_ORIGIN:'http://localhost'});
async function setup(t,answer={success:true,stored:true,application_id:'test-record-123'},status=201,extra={}){
  let calls=0,received;const logs=[];
  const config=configuration();
  const server=createApplication({config,html:'<html>test</html>',log:x=>logs.push(x),fetchImpl:async(url,options)=>{calls++;received={url,options,body:JSON.parse(options.body)};if(typeof answer==='function')return answer(url,options);return new Response(JSON.stringify(answer),{status,headers:{'Content-Type':'application/json'}});},...extra});
  server.listen(0,'127.0.0.1');await once(server,'listening');
  t.after(()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections();}));
  const base='http://127.0.0.1:'+server.address().port;
  const s=await fetch(base+'/api/session?sponsorId=00471123');const session=await s.json();
  const headers={'Content-Type':'application/json',Origin:'http://localhost','X-Form-Token':session.token,Cookie:s.headers.get('set-cookie').split(';')[0],'Idempotency-Key':randomUUID()};
  return {base,headers,logs,config,get calls(){return calls;},get received(){return received;},post:(body=data(),h={})=>fetch(base+'/api/submit',{method:'POST',headers:{...headers,...h},body:JSON.stringify(body)})};
}
test('real dates, checksum and PNG bytes',()=>{
  assert(realDate('2000-02-29'));assert(!realDate('2001-02-29'));assert(!realDate('2026-13-01'));
  assert(ibanValid('DE89370400440532013000'));assert(ibanValid('AT611904300234573201'));assert(!ibanValid('DE00370400440532013000'));
  assert(validPng(png()));assert(!validPng('data:image/svg+xml;base64,PHN2Zz4='));assert(!validPng(png().slice(0,-6)+'AAAAAA'));
});
test('normalisation, strict booleans, tax disabled and optional fields',()=>{
  const d=validatePayload(data({tax_number:'ignore',vat_id:'ignore',tax_office:'ignore'}),'project');
  assert.equal(d.project_id,'project');assert.equal(d.sponsor_partner_number,'00471123');assert.equal(d.iban,'DE89370400440532013000');assert(!('tax_number'in d));assert(!('mobile'in d));
  for(const field of ['contract_accepted','privacy_accepted','self_employed_confirmed'])for(const value of [false,'true',1])assert.throws(()=>validatePayload(data({[field]:value}),'x'));
  assert.throws(()=>validatePayload(data({phone:undefined}),'x'));
  assert.throws(()=>validatePayload(data({vat_liable:true}),'x'));
  assert.throws(()=>validatePayload(data({user_id:'spoof'}),'x'));
  assert.throws(()=>validatePayload(data({project_id:'spoof'}),'x'));
  assert.throws(()=>validatePayload(data({api_key:'spoof'}),'x'));
  assert.throws(()=>validatePayload(data({first_name:45}),'x'));
  assert.throws(()=>validatePayload(data({sponsor_partner_number:471123}),'x'));
});
test('configuration contains no implicit secret aliases; project override separate from company',()=>{
  assert.deepEqual(loadConfig({BASE44_INGRESS_SECRET:'old'}).missing,['BASE44_FUNCTION_URL','VITARIGHTS_PARTNER_API_KEY']);
  assert.equal(configuration().projectId,'689b57ef278375135d0068b9');
  assert.equal(loadConfig({BASE44_PROJECT_ID:'project-2',VITARIGHTS_COMPANY_ID:'company-1'}).projectId,'project-2');
  assert(configuration().ready);assert(!loadConfig({BASE44_FUNCTION_URL:'http://evil.test',VITARIGHTS_PARTNER_API_KEY:'x'}).ready);
});
test('POST forwards field contract and secret in X-API-Key only',async t=>{
  const s=await setup(t);const r=await s.post();assert.equal(r.status,201);const b=await r.json();assert.equal(b.code,'STORED');
  assert.equal(s.received.options.headers['X-API-Key'],s.config.key);assert.equal(s.received.options.redirect,'error');
  assert.equal(s.received.body.project_id,s.config.projectId);assert.equal(s.received.body.sponsor_partner_number,'00471123');
  assert.equal(s.received.body.source,'vitarights_partner_form');assert(!('api_key'in s.received.body));
  assert(!JSON.stringify(s.logs).includes(s.config.key));assert(!JSON.stringify(s.logs).includes('test@example.com'));
});
test('same-origin and bound sponsor checks happen before forwarding',async t=>{
  const s=await setup(t);
  assert.equal((await s.post(data(),{Origin:'https://evil.test'})).status,403);
  assert.equal((await s.post(data(),{'X-Form-Token':'bad'})).status,403);
  assert.equal((await s.post(data({sponsor_partner_number:'471123'}))).status,409);
  assert.equal((await s.post(data({company_id:'other'}))).status,400);assert.equal(s.calls,0);
});
test('duplicate simultaneous POSTs forward exactly once within this process',async t=>{
  const s=await setup(t,async()=>{await new Promise(r=>setTimeout(r,50));return Response.json({success:true,stored:true,application_id:'saved'});});
  const [a,b]=await Promise.all([s.post(),s.post()]);assert.equal(a.status,201);assert.equal(b.status,201);assert.equal(s.calls,1);
  const c=await s.post(data({city:'Hamburg'}));assert.equal(c.status,409);assert.equal(s.calls,1);
});
for(const [answer,status,expectedStatus,expectedCode]of [
  [{success:true,stored:false,reason:'sponsor_not_found',admin_notified:true},200,202,'MANUAL_REVIEW'],
  [{success:true,stored:false,reason:'sponsor_not_found',admin_notified:false},200,422,'NOT_STORED'],
  [{success:true},200,502,'RESULT_UNKNOWN'],
  [{error:'secret details'},401,502,'UPSTREAM_AUTH'],
  [{error:'firewall'},403,502,'UPSTREAM_FORBIDDEN'],
  [{error:'internal'},500,502,'RESULT_UNKNOWN'],
  [{details:['phone ist erforderlich.']},400,422,'UPSTREAM_VALIDATION'],
  [{},429,429,'RATE_LIMIT']]) {
  test('upstream response '+expectedCode,async t=>{const s=await setup(t,answer,status),r=await s.post(),b=await r.json();assert.equal(r.status,expectedStatus);assert.equal(b.code,expectedCode);assert(!JSON.stringify(b).includes('secret details'));if(expectedCode==='UPSTREAM_VALIDATION')assert.deepEqual(b.fields,['phone']);});
}
test('timeout is ambiguous and same key does not resend',async t=>{
  const s=await setup(t,(_u,o)=>new Promise((_r,reject)=>o.signal.addEventListener('abort',()=>reject(Error('timeout')))),200,{upstreamTimeout:10});
  const r=await s.post();assert.equal(r.status,504);assert.equal((await r.json()).code,'RESULT_UNKNOWN');await s.post();assert.equal(s.calls,1);
});
test('invalid JSON, payload limits, body types and paths',async t=>{
  const s=await setup(t);
  assert.equal((await s.post([])).status,400);
  assert.equal((await fetch(s.base+'/api/submit',{method:'POST',headers:s.headers,body:'{'})).status,400);
  assert.equal((await s.post(data(),{'Content-Type':'text/plain'})).status,415);
  assert.equal((await s.post(data({first_name:'x'.repeat(900000)}))).status,413);
  for(const p of ['/server.mjs','/.env','/package.json','/integration.js','/api/config','/../.env'])assert.equal((await fetch(s.base+p)).status,404);
  assert.equal((await fetch(s.base+'/api/submit')).status,405);assert.equal(s.calls,0);
});
test('health never contacts upstream or returns credentials',async t=>{
  const s=await setup(t);const h=await fetch(s.base+'/api/health'),b=await h.json();assert.equal(b.submission_ready,true);assert.equal(s.calls,0);assert(!JSON.stringify(b).includes(s.config.key));
  for(const suffix of ['?sponsorId=','?sponsorId=1&sponsorId=2','?sponsorId=abc'])assert.equal((await fetch(s.base+'/api/session'+suffix)).status,400);
  const p=await fetch(s.base+'/');assert(p.headers.get('content-security-policy').includes("connect-src 'self'"));
});
test('build preserves source branding and replaces only the demo submit listener',()=>{
  const source=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const client=readFileSync(new URL('../integration.js',import.meta.url),'utf8');const html=compileForm(source,client);
  assert(html.includes('#C026D3'));assert(html.includes('viewBox="0 0 256 256"'));assert(html.includes('prod-api-v1'));
  assert(!html.includes('// Deliberately no network request.'));assert.equal((html.match(/form\.addEventListener\('submit'/g)||[]).length,1);
  assert(html.includes("fetch('/api/submit'"));assert(!html.includes('test-key-not-used'));
  assert.throws(()=>compileForm('changed template',client));
});
