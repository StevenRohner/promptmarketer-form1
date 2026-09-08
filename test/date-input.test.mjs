import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {compileForm} from '../build.mjs';

const template=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const integration=readFileSync(new URL('../integration.js',import.meta.url),'utf8');
const html=compileForm(template,integration);
const start=html.indexOf('function applyRules(){');
const end=html.indexOf('function firstControl(',start);
assert(start>=0&&end>start);
const rules=html.slice(start,end);

// Native date editors reset their year buffer even when the same bound is set.
// Browser keyboard regression is covered separately in browser-date-input.py.
function fixture(){
  const counters={birth:0,start:0};
  const birth={value:'1984-04-11',_max:''};
  const start={value:'2027-04-11',_min:''};
  Object.defineProperty(birth,'max',{get(){return this._max;},set(v){counters.birth++;this._max=v;}});
  Object.defineProperty(start,'min',{get(){return this._min;},set(v){counters.start++;this._min=v;}});
  const controls={birthDate:birth,startDate:start,postal:{},vatId:{setCustomValidity(){}},taxNo:{setCustomValidity(){}},taxOffice:{setCustomValidity(){}}};
  const state={vat:'nein',country:'DE'},document={activeElement:null};
  const context={document,control:name=>controls[name],value:name=>state[name],
    byId:()=>({hidden:true}),applySponsorLink(){},renderField(){},
    form:{querySelectorAll:()=>[]},localDate:date=>[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-')};
  runInNewContext(rules+'\nthis.apply=applyRules;',context);
  return {...context,birth,start,counters,controls,state};
}

test('compiled PROD page includes the native date editor fix',()=>{
  assert(html.includes('name="pm-input-fix" content="date-year-v1"'));
  assert(!rules.includes("control('birthDate').max=localDate(adult)"));
  assert(!rules.includes("control('startDate').min=localDate(now)"));
});

test('date limits are assigned once; repeated input/change events do not rewrite them',()=>{
  const f=fixture();f.apply();
  assert.equal(f.counters.birth,1);assert.equal(f.counters.start,1);
  for(let i=0;i<20;i++)f.apply();
  assert.equal(f.counters.birth,1);assert.equal(f.counters.start,1);
  assert.match(f.birth.max,/^\d{4}-\d{2}-\d{2}$/);
  assert.match(f.start.min,/^\d{4}-\d{2}-\d{2}$/);
  assert.equal(f.birth.value,'1984-04-11');assert.equal(f.start.value,'2027-04-11');
});

test('focused birth-date editor is left intact until blur, even if its limit changed',()=>{
  const f=fixture();f.apply();f.birth._max='2000-01-01';
  f.document.activeElement=f.birth;
  for(let i=0;i<4;i++)f.apply();
  assert.equal(f.birth.max,'2000-01-01');assert.equal(f.counters.birth,1);
  f.document.activeElement=null;f.apply();
  assert.notEqual(f.birth.max,'2000-01-01');assert.equal(f.counters.birth,2);
  f.apply();assert.equal(f.counters.birth,2);
});

test('focused start-date editor is protected by the same rule',()=>{
  const f=fixture();f.apply();f.start._min='2000-01-01';f.document.activeElement=f.start;
  for(let i=0;i<4;i++)f.apply();
  assert.equal(f.start.min,'2000-01-01');assert.equal(f.counters.start,1);
  f.document.activeElement=null;f.apply();
  assert.notEqual(f.start.min,'2000-01-01');assert.equal(f.counters.start,2);
});

test('conditional tax rules remain functional alongside stable date bounds',()=>{
  const f=fixture();f.apply();assert.equal(f.controls.taxNo.required,false);assert.equal(f.controls.taxNo.disabled,true);
  f.state.vat='ja';f.apply();assert.equal(f.controls.taxNo.required,true);assert.equal(f.controls.taxNo.disabled,false);
  f.state.vat='nein';f.apply();assert.equal(f.controls.taxNo.required,false);assert.equal(f.controls.taxNo.disabled,true);
  assert.equal(f.counters.birth,1);assert.equal(f.counters.start,1);
});

test('date-value normalisation never writes into the native editor',()=>{
  const a=html.indexOf('function normalise(field){'),b=html.indexOf('function updateNavigation()',a);
  const context={};runInNewContext(html.slice(a,b)+'\nthis.normalise=normalise;',context);
  for(const name of ['birthDate','startDate']){
    const field={name,type:'date'};
    Object.defineProperty(field,'value',{get(){throw Error('Date value should not be read by text normalisation');},set(){throw Error('Date value should not be rewritten');}});
    context.normalise(field);
  }
});

test('build fails closed if the template date rule moves or changes',()=>{
  const rule="  control('birthDate').max=localDate(adult);control('startDate').min=localDate(now);";
  assert.throws(()=>compileForm(template.replace(rule,''),integration),/Date-input rule changed/);
  assert.throws(()=>compileForm(template.replace(rule,rule+'\n'+rule),integration),/Date-input rule changed/);
});
