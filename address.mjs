// Shared residence/postcode rules for the browser and Railway. No remote lookup.
// Format checks, NOT a postcode directory or proof of address/payment eligibility.
// Sources and scope: docs/european-addresses.md. Numeric values remain strings.
export const ADDRESS_VERSION='europe-address-v1';
export const POSTAL_MAX_LENGTH=16; // Includes optional country prefix and separators.
// [German label, English label, input format, example, alphabetic keyboard?]
const rows={
 AD:['Andorra','Andorra','(?:AD)?[0-9]{3}','AD500',true],
 AL:['Albanien','Albania','[0-9]{4}','1001'],
 AM:['Armenien','Armenia','[0-9]{4}','0010'],
 AT:['Österreich','Austria','[0-9]{4}','1010'],
 AX:['Åland','Åland Islands','22[0-9]{3}','22100'],
 AZ:['Aserbaidschan','Azerbaijan','[0-9]{4}','1000'],
 BA:['Bosnien und Herzegowina','Bosnia and Herzegovina','[0-9]{5}','71000'],
 BE:['Belgien','Belgium','[0-9]{4}','1000'],
 BG:['Bulgarien','Bulgaria','[0-9]{4}','1000'],
 BY:['Belarus','Belarus','[0-9]{6}','220030'],
 CH:['Schweiz','Switzerland','[0-9]{4}','8001'],
 CY:['Zypern','Cyprus','[0-9]{4}','2008'],
 CZ:['Tschechien','Czechia','[0-9]{3} ?[0-9]{2}','110 00'],
 DE:['Deutschland','Germany','[0-9]{5}','10115'],
 DK:['Dänemark','Denmark','[0-9]{4}','1050'],
 EE:['Estland','Estonia','[0-9]{5}','10111'],
 ES:['Spanien','Spain','[0-9]{5}','28001'],
 FI:['Finnland','Finland','[0-9]{5}','00100'],
 FO:['Färöer','Faroe Islands','[0-9]{3}','100'],
 FR:['Frankreich','France','[0-9]{5}','75001'],
 GB:['Vereinigtes Königreich','United Kingdom','(?:GIR ?0AA|[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2})','SW1A 1AA',true],
 GE:['Georgien','Georgia','[0-9]{4}','0100'],
 GG:['Guernsey','Guernsey','GY[0-9]{1,2} ?[0-9][A-Z]{2}','GY1 1AA',true],
 GI:['Gibraltar','Gibraltar','GX11 ?1AA','GX11 1AA',true],
 GR:['Griechenland','Greece','[0-9]{3} ?[0-9]{2}','105 58'],
 HR:['Kroatien','Croatia','[0-9]{5}','10000'],
 HU:['Ungarn','Hungary','[0-9]{4}','1011'],
 IE:['Irland','Ireland','(?:[AC-FHKNPRTV-Y][0-9]{2}|D6W) ?[0-9AC-FHKNPRTV-Y]{4}','D02 X285',true],
 IM:['Isle of Man','Isle of Man','IM[0-9]{1,2} ?[0-9][A-Z]{2}','IM1 1AA',true],
 IS:['Island','Iceland','[0-9]{3}','101'],
 IT:['Italien','Italy','[0-9]{5}','00100'],
 JE:['Jersey','Jersey','JE[0-9]{1,2} ?[0-9][A-Z]{2}','JE2 3AA',true],
 KZ:['Kasachstan','Kazakhstan','(?:[0-9]{6}|[A-Z][0-9]{2}[A-Z][0-9][A-Z][0-9])','Z00Y5M7',true],
 LI:['Liechtenstein','Liechtenstein','[0-9]{4}','9490'],
 LT:['Litauen','Lithuania','[0-9]{5}','01100'],
 LU:['Luxemburg','Luxembourg','[0-9]{4}','1111'],
 LV:['Lettland','Latvia','[0-9]{4}','1050'],
 MC:['Monaco','Monaco','980[0-9]{2}','98000'],
 MD:['Moldau','Moldova','[0-9]{4}','2001'],
 ME:['Montenegro','Montenegro','[0-9]{5}','81000'],
 MK:['Nordmazedonien','North Macedonia','[0-9]{4}','1000'],
 // Personal postcodes may have a two-letter prefix (e.g. Tigné Point).
 MT:['Malta','Malta','[A-Z]{2,3} ?[0-9]{4}','VLT 1117',true],
 NL:['Niederlande','Netherlands','[1-9][0-9]{3} ?[A-Z]{2}','1012 AB',true],
 NO:['Norwegen','Norway','[0-9]{4}','0150'],
 PL:['Polen','Poland','[0-9]{2}[- ]?[0-9]{3}','00-001'],
 PT:['Portugal','Portugal','[0-9]{4}[- ]?[0-9]{3}','1000-001'],
 RO:['Rumänien','Romania','[0-9]{6}','010011'],
 RS:['Serbien','Serbia','[0-9]{5}','11000'],
 RU:['Russland','Russia','[0-9]{6}','101000'],
 SE:['Schweden','Sweden','[0-9]{3} ?[0-9]{2}','114 55'],
 SI:['Slowenien','Slovenia','[0-9]{4}','1000'],
 SJ:['Spitzbergen und Jan Mayen','Svalbard and Jan Mayen','[0-9]{4}','9170'],
 SK:['Slowakei','Slovakia','[0-9]{3} ?[0-9]{2}','811 01'],
 SM:['San Marino','San Marino','4789[0-9]','47890'],
 TR:['Türkei','Türkiye','[0-9]{5}','34000'],
 UA:['Ukraine','Ukraine','[0-9]{5}','01001'],
 VA:['Vatikanstadt','Vatican City','00120','00120'],
 XK:['Kosovo','Kosovo','[0-9]{5}','10000']
};
export const EUROPE_COUNTRIES=Object.freeze(Object.fromEntries(Object.entries(rows).map(([code,[de,en,pattern,example,alpha=false]])=>[code,Object.freeze({code,de,en,pattern,example,inputMode:alpha?'text':'numeric'})])));
export const EUROPE_CODES=Object.freeze(Object.keys(EUROPE_COUNTRIES));
export function countrySpec(code){return typeof code==='string'&&Object.prototype.hasOwnProperty.call(EUROPE_COUNTRIES,code)?EUROPE_COUNTRIES[code]:null;}
export function countryLabel(code,language='de'){const c=countrySpec(code);return c?c[language==='en'?'en':'de']:code;}
export function countryOptions(language='de'){
 const collator=new Intl.Collator(language==='en'?'en':'de');
 return EUROPE_CODES.map(code=>({value:code,label:countryLabel(code,language)})).sort((a,b)=>collator.compare(a.label,b.label));
}
// Returns null for malformed input; never coerce numbers or delete arbitrary letters.
export function inspectPostal(raw,country){
 const spec=countrySpec(country);
 if(!spec)return {valid:false,error:'country',value:''};
 if(typeof raw!=='string'||raw.length>POSTAL_MAX_LENGTH)return {valid:false,error:'format',value:''};
 let v=raw.trim().replace(/[\u00a0\u202f]/g,' ');
 if(!v)return {valid:false,error:'required',value:''};
 if(!/^[A-Za-z0-9 -]+$/.test(v))return {valid:false,error:'format',value:''};
 v=v.toUpperCase().replace(/ +/g,' ');
 // Country prefixes are accepted only for the SELECTED country. AD is an
 // integral part of its postcode; never strip it as a generic country prefix.
 if(country!=='AD'){
   const aliases={LU:'(?:LU|L)',CH:'(?:CH)',LI:'(?:LI|FL)',AT:'(?:AT|A)',DE:'(?:DE|D)',FI:'(?:FI|FIN)',SE:'(?:SE|S)'};
   const prefix=aliases[country]||country;
   v=v.replace(new RegExp('^'+prefix+'[- ](?=[A-Z0-9])'),'');
   if(['AZ','LV','LT','MD'].includes(country))v=v.replace(new RegExp('^'+country+'(?=[0-9])'),'');
 }
 if(!new RegExp('^(?:'+spec.pattern+')$').test(v))return {valid:false,error:'format',value:''};
 if(['GB','GG','GI','IM','JE'].includes(country)){v=v.replace(/ /g,'');v=v.slice(0,-3)+' '+v.slice(-3);}
 if(['IE','MT'].includes(country)){v=v.replace(/ /g,'');v=v.slice(0,-4)+' '+v.slice(-4);}
 if(country==='NL'){v=v.replace(/ /g,'');v=v.slice(0,4)+' '+v.slice(4);}
 if(['CZ','GR','SE','SK'].includes(country)){v=v.replace(/ /g,'');v=v.slice(0,3)+' '+v.slice(3);}
 if(['PL','PT'].includes(country)){v=v.replace(/[- ]/g,'');const split=country==='PL'?2:4;v=v.slice(0,split)+'-'+v.slice(split);}
 if(country==='AD'&&!v.startsWith('AD'))v='AD'+v;
 return {valid:true,error:null,value:v};
}
export function postalValid(raw,country){return inspectPostal(raw,country).valid;}
// Preserve the established DE/AT rules. For other residences no unrelated
// German format is imposed; this is not tax-registration validation.
export function vatPattern(country){return country==='DE'?'DE[0-9]{9}':country==='AT'?'ATU[0-9]{8}':null;}
