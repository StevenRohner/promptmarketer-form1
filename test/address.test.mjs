import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {EUROPE_CODES,EUROPE_COUNTRIES,countrySpec,countryLabel,countryOptions,inspectPostal,postalValid,vatPattern} from '../address.mjs';
import {compileForm} from '../build.mjs';
const source=readFileSync(new URL('../address.mjs',import.meta.url),'utf8');
const context={};runInNewContext(source.replace(/^export /gm,'')+'\nthis.inspect=inspectPostal;',context);

test('all 51 European/border-region countries plus seven European postal territories',()=>{
 assert.equal(EUROPE_CODES.length,58);assert.equal(new Set(EUROPE_CODES).size,58);
 for(const code of 'AD AL AM AT AZ BA BE BG BY CH CY CZ DE DK EE ES FI FR GB GE GR HR HU IE IS IT KZ LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SK SM TR UA VA XK'.split(' '))assert(countrySpec(code),code);
 for(const code of ['CY','VA','XK','GG','IM','JE','FO','AX','GI','SJ'])assert(countrySpec(code),code);
 for(const code of ['US','CA','ZZ','cy','__proto__','constructor','',null,42])assert.equal(countrySpec(code),null);
});
for(const code of EUROPE_CODES){
 test(code+': valid format, rejects invalid data, browser/server parity',()=>{
  const example=EUROPE_COUNTRIES[code].example;
  assert(postalValid(example,code),example);
  for(const v of [example,example.toLowerCase(),' '+example+' ',example.replace(' ','\u00a0')]){
   const a=inspectPostal(v,code),b=context.inspect(v,code);
   assert(a.valid,code+': '+v);assert.deepEqual(JSON.parse(JSON.stringify(b)),a);
   assert.equal(inspectPostal(a.value,code).value,a.value);
  }
  for(const v of ['',null,1234,{},'!'+example,example+'#','A'.repeat(17),'<script>','１２３４']){
   assert.equal(postalValid(v,code),false,code+': '+v);
   assert.equal(context.inspect(v,code).valid,false);
  }
 });
}
const examples=[
 ['CY','CY-2008','2008'],['CY','cy 2008','2008'],['CY','6036','6036'],
 ['DE','D-01067','01067'],['CH','CH-8001','8001'],['AT','A-1010','1010'],
 ['PL','00001','00-001'],['PT','1000001','1000-001'],['NL','1012ab','1012 AB'],
 ['GB','sw1a1aa','SW1A 1AA'],['GB','gir 0aa','GIR 0AA'],['IE','d6wx285','D6W X285'],['IE','a65f4e2','A65 F4E2'],
 ['MT','vlt1117','VLT 1117'],['MT','tp 1001','TP 1001'],['CZ','11000','110 00'],['SK','81101','811 01'],['GR','10558','105 58'],['SE','11455','114 55'],
 ['LV','LV-1050','1050'],['LT','LT01100','01100'],['MD','MD2001','2001'],['AZ','az1000','1000'],['LU','L-1111','1111'],['AD','500','AD500'],
 ['KZ','Z00Y5M7','Z00Y5M7'],['KZ','010013','010013'],['VA','00120','00120'],['SM','47890','47890'],
 ['GG','gy11aa','GY1 1AA'],['JE','je23aa','JE2 3AA'],['IM','im11aa','IM1 1AA'],['GI','gx111aa','GX11 1AA']
];
for(const [country,raw,want] of examples)test(`${country}: ${raw} -> ${want}`,()=>assert.equal(inspectPostal(raw,country).value,want));
test('wrong country/length/separators and Unicode lookalikes are rejected',()=>{
 for(const [c,v]of [['CY','10115'],['DE','2008'],['CY','DE-2008'],['DE','10-115'],['NL','1012'],['MT','1117'],['IE','D02 O000'],['PL','0-0001'],['PT','100-0001'],['VA','12345'],['MC','75001'],['KZ','Z000000'],['GB','SW1A\n1AA'],['GB','ſw1a1aa']])assert(!postalValid(v,c),c+': '+v);
});
test('country labels and sorting follow the active UI language',()=>{
 assert.equal(countryLabel('CY','de'),'Zypern');assert.equal(countryLabel('CY','en'),'Cyprus');
 assert.equal(countryLabel('NL','en'),'Netherlands');
 for(const lang of ['de','en']){
  const options=countryOptions(lang);assert.equal(options.length,58);
  const collator=new Intl.Collator(lang);
  assert(options.every((o,i)=>!i||collator.compare(options[i-1].label,o.label)<=0));
 }
});
test('existing German and Austrian VAT checks do not leak into other countries',()=>{
 assert.equal(vatPattern('DE'),'DE[0-9]{9}');assert.equal(vatPattern('AT'),'ATU[0-9]{8}');
 for(const code of EUROPE_CODES.filter(c=>!['DE','AT'].includes(c)))assert.equal(vatPattern(code),null);
});
test('compiled HTML has all country options and shares validator with server',()=>{
 const html=compileForm(readFileSync(new URL('../index.html',import.meta.url),'utf8'),readFileSync(new URL('../integration.js',import.meta.url),'utf8'));
 assert(html.includes('europe-address-v1'));assert(html.includes(source.replace(/^export /gm,'')));
 for(const code of EUROPE_CODES)assert(html.includes('<option value="'+code+'">'));
 assert(!html.includes("if(name==='country'&&!['DE','AT'].includes(v))"));
 assert(!html.includes("if(name==='country')return t(v==='AT'?"));
 assert(html.includes("updateCountryOptions()"));assert(html.includes('date-year-v1'));
 assert(!html.includes('id="apiConnection"'));assert(!html.includes('id="localModeNotice"'));
 assert.equal((html.match(/form\.addEventListener\('submit'/g)||[]).length,1);
});
