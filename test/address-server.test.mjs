import {test} from 'node:test';
import assert from 'node:assert/strict';
import {deflateSync} from 'node:zlib';
import {randomUUID} from 'node:crypto';
import {once} from 'node:events';
import {loadConfig,createApplication} from '../server.mjs';

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

// Residence formats are independent of the account country.
for(const [country,postal,expected]of [
 ['CY','CY-2008','2008'],['NL','1012ab','1012 AB'],['GB','sw1a1aa','SW1A 1AA'],
 ['IE','D6W X285','D6W X285'],['MT','VLT1117','VLT 1117'],['PL','00001','00-001'],
 ['PT','1000001','1000-001'],['KZ','Z00Y5M7','Z00Y5M7'],['VA','00120','00120']
])test('proxy forwards '+country+' residence and its complete postal code',async t=>{
 const s=await setup(t),r=await s.post(data({country,postal_code:postal}));
 assert.equal(r.status,201);assert.equal(s.received.body.country,country);assert.equal(s.received.body.postal_code,expected);
 assert.equal(s.received.body.iban,'DE89370400440532013000');assert.equal(s.received.body.sponsor_partner_number,'00471123');
});
test('country/postcode validation rejects mismatches before upstream',async t=>{
 const s=await setup(t);
 for(const [country,postal]of [['CY','10115'],['DE','2008'],['US','10001'],['GB','10115']]){
  const r=await s.post(data({country,postal_code:postal}));assert.equal(r.status,422);
  assert((await r.json()).fields.includes('postal_code'));
 }
 assert.equal(s.calls,0);
});
