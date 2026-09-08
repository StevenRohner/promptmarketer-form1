import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {IBAN_FORMATS,IBAN_REGISTRY_VERSION,normaliseIban,inspectIban,ibanValid} from '../iban.mjs';
import {compileForm} from '../build.mjs';

// Published format examples and common reference examples; never sent live.
const examples={
 AD:'AD1200012030200359100100',AT:'AT611904300234573201',BE:'BE68539007547034',
 CH:'CH9300762011623852957',DE:'DE89370400440532013000',FR:'FR1420041010050500013M02606',
 GB:'GB29NWBK60161331926819',IE:'IE29AIBK93115212345678',IT:'IT60X0542811101000000123456',
 LT:'LT121000011101001000',LU:'LU280019400644750000',NL:'NL91ABNA0417164300',
 ES:'ES9121000418450200051332',PL:'PL61109010140000071219812874',NO:'NO9386011117947',
 MT:'MT84MALT011000012345MTLCAST001S',AE:'AE070331234567890123456',
 TR:'TR330006100519786457841326',HN:'HN88CABF00000000000250005469',
 YE:'YE15CBYE0001018861234567891234'
};
// Independent BigInt checksum generator for synthetic structure tests only.
function withCheck(code,bban){
  const digits=(bban+code+'00').replace(/[A-Z]/g,c=>String(c.charCodeAt(0)-55));
  return code+String(98n-BigInt(digits)%97n).padStart(2,'0')+bban;
}
function synthetic(code,spec){return withCheck(code,spec.replace(/(\d+)!([nac])/g,(_,n,t)=>(t==='n'?'0':'A').repeat(Number(n))));}
const source=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const integration=readFileSync(new URL('../integration.js',import.meta.url),'utf8');
const compiled=compileForm(source,integration);
const a=compiled.indexOf('// Pure, shared IBAN validation'),b=compiled.indexOf('function fieldIssue(name)',a);
assert(a>=0&&b>a);
const browser={};runInNewContext(compiled.slice(a,b)+';this.check=inspectIban;this.valid=ibanOK;this.rules=IBAN_FORMATS;',browser);

test('coverage snapshot includes 89 registered prefixes, not country aliases',()=>{
 assert.equal(IBAN_REGISTRY_VERSION,'SWIFT-102-2026-06');assert.equal(Object.keys(IBAN_FORMATS).length,89);
 assert(Object.isFrozen(IBAN_FORMATS));assert(!IBAN_FORMATS.US&&!IBAN_FORMATS.CA&&!IBAN_FORMATS.JE&&!IBAN_FORMATS.GF);
 assert.equal(IBAN_FORMATS.HN[0],28);assert.equal(IBAN_FORMATS.YE[0],30);
 assert.deepEqual(JSON.parse(JSON.stringify(browser.rules)),IBAN_FORMATS);
});
for(const [code,iban] of Object.entries(examples))test('reference IBAN '+code,()=>{
 assert(ibanValid(iban),code);assert(browser.valid(iban,'DE'));assert(browser.valid(iban,'AT'));
 assert.equal(inspectIban(iban).country,code);
});
for(const [code,[length,spec]] of Object.entries(IBAN_FORMATS))test('country structure/length/checksum and browser/server parity: '+code,()=>{
 const iban=synthetic(code,spec);
 assert.equal(iban.length,length);assert(ibanValid(iban));assert(browser.valid(iban,'DE'));assert(browser.valid(iban,'AT'));
 const formatted=iban.toLowerCase().replace(/(.{4})/g,'$1\u00a0');
 assert(ibanValid(formatted));assert.equal(inspectIban(formatted).iban,iban);
 for(const bad of [iban.slice(0,-1),iban+'0',code+'00'+iban.slice(4),code+'01'+iban.slice(4),code+'99'+iban.slice(4)]){
  assert.equal(ibanValid(bad),false,bad);assert.equal(browser.valid(bad,'DE'),false,bad);
 }
 // Change a check digit rather than a BBAN character, preserving valid syntax.
 const changed=iban.slice(0,3)+String((Number(iban[3])+1)%10)+iban.slice(4);
 assert(!ibanValid(changed));assert(!browser.valid(changed));
});
test('spaces and lowercase are accepted without losing leading zeroes',()=>{
 assert.equal(normaliseIban('  nl91\u202fABNA\u00a00417 1643 00 '),'NL91ABNA0417164300');
 assert(ibanValid('nl91\u202fABNA\u00a00417 1643 00'));
 for(const v of [null,undefined,12,{},[],true,'','US1234567890123456789012','ZZ12345678901234567890','NL91-ABNA0417164300','NL91ABNA0417164300<script>','ΝL91ABNA0417164300','ＮＬ91ABNA0417164300','ßL91ABNA0417164300','\u200bNL91ABNA0417164300']){
  assert(!ibanValid(v),String(v));assert(!browser.valid(v),String(v));
 }
 assert.equal(inspectIban('NL91ABNA041716430').error,'length');
});
test('valid MOD97 alone does not permit invalid country-specific character classes',()=>{
 const wrongBank=withCheck('NL','12340417164300');
 const wrongAccount=withCheck('NL','ABNA041716430A');
 const wrongNumeric=withCheck('DE','A70400440532013000');
 for(const v of [wrongBank,wrongAccount,wrongNumeric]){assert(!ibanValid(v));assert(!browser.valid(v));assert.equal(inspectIban(v).error,'structure');}
});
test('compiled form uses international validation with unchanged API, branding and UX',()=>{
 assert(compiled.includes('international-iban-v1'));assert(compiled.includes("if(name==='iban'){"));
 assert(!compiled.includes("ibanOK(v,value('country'))"));assert(!compiled.includes('function ibanOK(raw,country)'));
 assert(compiled.includes('normaliseIban(value(\'iban\'))'));assert(compiled.includes('"ibanLength"'));
 assert(compiled.includes('clean-submit-v1'));assert(compiled.includes('date-year-v1'));assert(compiled.includes('#C026D3'));
 assert(!compiled.includes('id="apiConnection"'));assert(compiled.includes('maxlength="42"'));
});
