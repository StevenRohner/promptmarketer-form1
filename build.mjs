import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {Script} from 'node:vm';
const ibanSource=readFileSync(new URL('./iban.mjs',import.meta.url),'utf8').replace(/^export /gm,'');

// Keep the established single-file DE/EN design as the template. Build the
// production HTML with one replacement, not a second competing submit listener.
export function compileForm(template,integration){
  const start="form.addEventListener('submit',event=>{";
  const end="byId('backReview').addEventListener";
  const a=template.indexOf(start),b=template.indexOf(end,a);
  if(a<0||b<0||template.indexOf(start,a+1)!==-1||!template.includes('brand-i18n-v2'))throw Error('Form template changed: review the submission integration before deploying.');
  let html=template.slice(0,a)+integration+'\n'+template.slice(b);
  // Embed the SAME country rules used by the server: no runtime lookup/API,
  // no coupling to the applicant's DE/AT residence and no second script load.
  const ibanStart=html.indexOf('function ibanOK(raw,country){');
  const ibanEnd=html.indexOf('function fieldIssue(name){',ibanStart);
  if(ibanStart<0||ibanEnd<ibanStart)throw Error('IBAN validator changed: review international support.');
  html=html.slice(0,ibanStart)+ibanSource+'\nfunction ibanOK(raw){return ibanValid(raw); }\n'+html.slice(ibanEnd);
  const oldIbanCheck="  if(name==='iban'&&!ibanOK(v,value('country')))return issue('badIban');";
  if(html.split(oldIbanCheck).length!==2)throw Error('IBAN field check changed: review international support.');
  html=html.replace(oldIbanCheck,`  if(name==='iban'){
    const result=inspectIban(v);
    if(!result.valid)return issue(result.error==='length'?'ibanLength':result.error==='country'?'ibanCountry':'badIban',{country:result.country,n:result.length});
  }`);
  // Normalisation must not turn non-ASCII lookalikes into a different account.
  html=html.replace("if(field.name==='iban')field.value=field.value.toUpperCase().replace(/\\s/g,'').replace(/(.{4})/g,'$1 ').trim();",
    "if(field.name==='iban'){const iban=normaliseIban(field.value);if(iban)field.value=iban.replace(/(.{4})/g,'$1 ').trim();}");
  html=html.replace('<meta name="referrer" content="no-referrer">','<meta name="referrer" content="no-referrer"><meta name="pm-iban-version" content="international-iban-v1">');
  // Native date editors reset their year buffer when min/max are reassigned.
  const dateBounds="  control('birthDate').max=localDate(adult);control('startDate').min=localDate(now);";
  if(html.split(dateBounds).length!==2)throw Error('Date-input rule changed: review the keyboard-entry regression fix.');
  html=html.replace(dateBounds,`  const birth=control('birthDate'),start=control('startDate');
  const maximumBirth=localDate(adult),minimumStart=localDate(now);
  if(document.activeElement!==birth&&birth.max!==maximumBirth)birth.max=maximumBirth;
  if(document.activeElement!==start&&start.min!==minimumStart)start.min=minimumStart;`);
  html=html.replace('content="brand-i18n-v2"','content="prod-api-v1"');
  html=html.replace('<meta name="pm-form-version" content="prod-api-v1">','<meta name="pm-form-version" content="prod-api-v1"><meta name="pm-input-fix" content="date-year-v1"><meta name="pm-ux-version" content="clean-submit-v1">');
  // No setup/test instructions should flash before JS finishes booting.
  html=html.replace(/<div class="notice" id="localModeNotice">[\s\S]*?<\/div>/,'');
  html=html.replace(/<footer class="footer">[\s\S]*?<\/footer>/,'');
  html=html.replace(/(<p class="notice edit-note"[^>]*>)[\s\S]*?<\/p>/g,'$1</p>');
  html=html.replace(/(<p class="sub"[^>]*data-i18n="heroSub"[^>]*>)[\s\S]*?<\/p>/,'$1Fülle deinen Partnerantrag aus und prüfe deine Angaben vor dem Absenden.</p>');
  // Make the actual final action explicit, including before initial localisation.
  html=html.replace('data-i18n="localSubmit">Lokal prüfen →','data-i18n="apiSubmit">Antrag absenden →');

  // A boot failure cannot leak data through a default GET form submission.
  html=html.replace(/<form\b([^>]*?)>/,(_,attrs)=>`<form${attrs} method="post" action="/api/submit">`);
  for(const [name,required]of [['phone',true],['mobile',false],['bank',false],['location',false],['sponsor',false],['leader',false]]){
    const re=new RegExp('<input\\b[^>]*\\bid="'+name+'"[^>]*>');
    if(!re.test(html))throw Error('Missing field '+name);
    html=html.replace(re,tag=>required?tag.replace(/>$/, ' required>'):tag.replace(/\srequired\b/g,''));
  }

  for(const [,script] of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new Script(script);
  if(html.includes('// Deliberately no network request.'))throw Error('Demo submit handler survived compilation');
  return html;
}
if(process.argv[1]?.endsWith('build.mjs')){
  const html=compileForm(readFileSync(new URL('./index.html',import.meta.url),'utf8'),readFileSync(new URL('./integration.js',import.meta.url),'utf8'));
  mkdirSync(new URL('./public',import.meta.url),{recursive:true});writeFileSync(new URL('./public/index.html',import.meta.url),html);
  console.log('Production HTML compiled: PNG signature + same-origin server submission.');
}
