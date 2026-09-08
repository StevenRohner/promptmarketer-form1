import { inflateSync } from 'node:zlib';
import { inspectIban } from './iban.mjs';
export { ibanValid } from './iban.mjs';

export const LIMIT = 820_000;
export const FIELDS = {
  sponsor_partner_number: 128, first_name: 100, last_name: 100, birth_date: 10,
  email: 254, street: 150, house_number: 30, postal_code: 5, city: 120,
  country: 2, phone: 40, mobile: 40, tax_number: 40, vat_id: 20,
  tax_office: 150, start_option: 100, iban: 42, bic: 11, bank: 150,
  account_holder: 200, start_date: 10, signing_location: 120,
  sponsor_name: 200, vitarights_leader: 200
};
const required = new Set(['sponsor_partner_number','first_name','last_name','birth_date','email','street','house_number','postal_code','city','country','phone','start_option','iban','bic','account_holder','start_date']);
const confirmations = ['contract_accepted','privacy_accepted','self_employed_confirmed'];
export class InputError extends Error {
  constructor(code, status = 400, fields = []) { super(code); this.code = code; this.status = status; this.fields = fields; }
}
export function realDate(v) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(v+'T12:00:00Z');
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0,10) === v;
}
const crcTable = Array.from({length:256},(_,n)=>{
  for (let k=0;k<8;k++) n = n&1 ? 0xedb88320^(n>>>1) : n>>>1;
  return n>>>0;
});
function crc32(bytes) {
  let c=0xffffffff;
  for (const b of bytes) c=crcTable[(c^b)&255]^(c>>>8);
  return (c^0xffffffff)>>>0;
}
// Validate the PNG structure, CRCs and bounded decompression; not signature identity.
export function validPng(uri) {
  try {
    if (typeof uri!=='string' || uri.length>700000 || !/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(uri)) return false;
    const raw=uri.slice(22),b=Buffer.from(raw,'base64');
    if (b.length>524288 || raw!==b.toString('base64') || b.length<57 || b.subarray(0,8).toString('hex')!=='89504e470d0a1a0a') return false;
    let off=8,width=0,height=0,channels=0,end=false,seenData=false,dataEnded=false,count=0;const chunks=[];
    while(off<b.length) {
      if(++count>2048 || off+12>b.length) return false;
      const len=b.readUInt32BE(off),type=b.toString('ascii',off+4,off+8),to=off+12+len;
      if(to>b.length || !/^[A-Za-z]{4}$/.test(type) || crc32(b.subarray(off+4,to-4))!==b.readUInt32BE(to-4)) return false;
      if(off===8 && type!=='IHDR') return false;
      if(type==='IHDR') {
        if(off!==8 || len!==13) return false;
        width=b.readUInt32BE(off+8);height=b.readUInt32BE(off+12);
        const depth=b[off+16],colour=b[off+17];channels=colour===6?4:colour===2?3:0;
        if(!width||!height||width>2000||height>1000||depth!==8||!channels||b[off+18]||b[off+19]||b[off+20]) return false;
      } else if(type==='IDAT') {
        if(dataEnded) return false;seenData=true;chunks.push(b.subarray(off+8,to-4));
      } else {
        if(seenData)dataEnded=true;
        if(type==='IEND'){if(len||to!==b.length)return false;end=true;}
        else if(type==='PLTE'){if(seenData||!len||len%3||len>768)return false;}
        else if(type[0]===type[0].toUpperCase())return false;
      }
      off=to;
    }
    if(!end||!seenData) return false;
    const stride=width*channels+1,expected=stride*height;
    const pixels=inflateSync(Buffer.concat(chunks),{maxOutputLength:expected});
    if(pixels.length!==expected)return false;
    for(let y=0;y<height;y++)if(pixels[y*stride]>4)return false;
    return true;
  } catch { return false; }
}
export function validatePayload(body,projectId) {
  if (!body || typeof body!=='object' || Array.isArray(body)) throw new InputError('INVALID_JSON');
  // project/user/company IDs, source and API credentials are NEVER browser-authoritative.
  const allowed=new Set([...Object.keys(FIELDS),...confirmations,'vat_liable','signature']);
  if(Object.keys(body).some(k=>!allowed.has(k)))throw new InputError('UNKNOWN_FIELDS');
  const errors=new Set(),out={project_id:projectId};
  const taxed=body.vat_liable===true;
  for(const [name,max] of Object.entries(FIELDS)) {
    const isTax=['tax_number','vat_id','tax_office'].includes(name);
    if(isTax&&!taxed) continue;
    if(body[name]!==undefined&&typeof body[name]!=='string'){errors.add(name);continue;}
    const v=(body[name]||'').trim();
    if((required.has(name)||(isTax&&taxed))&&!v)errors.add(name);
    if(v.length>max || /[\x00-\x1F\x7F]/.test(v))errors.add(name);
    if(v)out[name]=v;
  }
  const v=n=>out[n]||'';
  if(!/^[0-9]+$/.test(v('sponsor_partner_number')))errors.add('sponsor_partner_number');
  if(!['DE','AT'].includes(v('country')))errors.add('country');
  if(!new RegExp(v('country')==='AT'?'^[0-9]{4}$':'^[0-9]{5}$').test(v('postal_code')))errors.add('postal_code');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email')))errors.add('email');
  for(const name of ['birth_date','start_date'])if(!realDate(v(name)))errors.add(name);
  const today=new Date(),adult=new Date(Date.UTC(today.getUTCFullYear()-18,today.getUTCMonth(),today.getUTCDate())).toISOString().slice(0,10);
  if(v('birth_date')>adult)errors.add('birth_date');
  for(const name of ['phone','mobile'])if(v(name)&&(!/^\+?[0-9][0-9 ()/.\-]{5,38}$/.test(v(name))||v(name).replace(/\D/g,'').length<6))errors.add(name);
  const ibanResult=inspectIban(v('iban'));
  if(!ibanResult.valid)errors.add('iban');else out.iban=ibanResult.iban;
  out.bic=v('bic').toUpperCase();
  if(!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(out.bic))errors.add('bic');
  if(typeof body.vat_liable!=='boolean')errors.add('vat_liable');out.vat_liable=body.vat_liable;
  if(taxed)out.vat_id=v('vat_id').toUpperCase().replace(/\s/g,'');
  for(const name of confirmations){if(body[name]!==true)errors.add(name);out[name]=body[name];}
  if(!validPng(body.signature))errors.add('signature');else out.signature=body.signature;
  out.source='vitarights_partner_form';
  if(errors.size)throw new InputError('VALIDATION',422,[...errors]);
  return out;
}
