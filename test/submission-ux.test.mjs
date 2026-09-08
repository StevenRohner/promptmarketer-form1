import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {once} from 'node:events';
import {createApplication,loadConfig} from '../server.mjs';
import {compileForm} from '../build.mjs';

test('missing runtime credentials do not allow forwarding',async t=>{
  let calls=0;
  const config=loadConfig({PUBLIC_ORIGIN:'http://localhost'});
  const server=createApplication({config,html:'<html>test</html>',log:()=>{},fetchImpl:async()=>{calls++;throw Error('must not call');}});
  server.listen(0,'127.0.0.1');await once(server,'listening');
  t.after(()=>new Promise(resolve=>{server.close(resolve);server.closeAllConnections();}));
  const base='http://127.0.0.1:'+server.address().port;
  const health=await (await fetch(base+'/api/health')).json();
  assert.equal(health.submission_ready,false);
  assert.deepEqual(health.missing,['BASE44_FUNCTION_URL','VITARIGHTS_PARTNER_API_KEY']);
  const session=await fetch(base+'/api/session?sponsorId=471123'),body=await session.json();
  assert.equal(session.status,200);assert.equal(body.ready,false);
  const post=await fetch(base+'/api/submit',{method:'POST',headers:{Origin:'http://localhost','Content-Type':'application/json'},body:'{}'});
  assert.equal(post.status,503);assert.equal((await post.json()).code,'NOT_CONFIGURED');
  assert.equal(calls,0);
});

test('production output removes setup banners and keeps date-entry fix',()=>{
  const source=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const client=readFileSync(new URL('../integration.js',import.meta.url),'utf8');
  const html=compileForm(source,client);
  assert(!html.includes('id="localModeNotice"'));
  assert(!html.includes('id="apiConnection"'));
  assert(!html.includes('<footer class="footer">'));
  assert(html.includes('date-year-v1'));assert(html.includes('clean-submit-v1'));
  assert(html.includes('await connect()'));assert(!html.includes('button.disabled=!apiReady'));
  assert.equal((html.match(/form\.addEventListener\('submit'/g)||[]).length,1);
});
