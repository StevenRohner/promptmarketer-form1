// Inserted into the existing form closure by build.mjs. No secrets in this file.
const apiText={
 de:{apiSubmit:'Antrag übermitteln →',apiSending:'Wird übermittelt …',apiNote:'Die Übermittlung ist aktiv. Nach dem Absenden werden die Daten an PromptMarketer übermittelt. Für den PROD-Test bitte ausschließlich eigene oder ausdrücklich freigegebene Testdaten verwenden.',apiLoading:'Verbindung zur Übermittlung wird vorbereitet …',apiUnavailable:'Die Übermittlung ist noch nicht verfügbar. Deine Eingaben bleiben erhalten. Bitte den Betreiber kontaktieren oder die Verbindung erneut prüfen.',apiRetryConnection:'Verbindung erneut prüfen',apiFailed:'Übermittlung nicht abgeschlossen',apiStoredTitle:'Antrag gespeichert',apiStoredText:'PromptMarketer hat die Speicherung bestätigt. Dies ist noch keine Freischaltung als Vitarights-Partner und keine Gegenzeichnung des Vertrags.',apiManualTitle:'Manuelle Prüfung erforderlich',apiManualText:'Der Antrag wurde nicht in der Antragstabelle gespeichert. Der Server bestätigt eine Benachrichtigung an die Administration. Bitte nicht erneut absenden und den Betreiber kontaktieren.',apiUnknown:'Keine eindeutige Bestätigung erhalten. Der Antrag könnte bereits verarbeitet worden sein. Bitte nicht erneut absenden. Kläre den Status mit dem Betreiber anhand der Referenz.',apiNoStore:'Der Antrag wurde nicht gespeichert und eine Admin-Benachrichtigung wurde nicht bestätigt. Bitte den Betreiber kontaktieren.',apiAuth:'Der Zieldienst hat die Server-Anmeldung abgelehnt. Bitte den Betreiber informieren. Deine Eingaben bleiben erhalten.',apiForbidden:'Der Zieldienst oder ein vorgeschalteter Schutz hat die Anfrage blockiert. Bitte den Betreiber informieren.',apiValidation:'Bitte die markierten Angaben prüfen. Der Server hat den Antrag nicht akzeptiert.',apiServerField:'Bitte dieses Feld prüfen; der Server hat die Angabe abgelehnt.',apiSession:'Die sichere Formular-Sitzung ist abgelaufen. Bitte die Verbindung erneut prüfen; deine Eingaben bleiben erhalten.',apiRate:'Zu viele Anfragen. Bitte mindestens eine Minute warten und danach erneut versuchen.',apiBusy:'Die Übermittlung ist ausgelastet. Bitte später erneut versuchen.',apiSponsor:'Die Förderernummer stimmt nicht mit dem Einladungslink überein. Bitte den richtigen Link neu öffnen.',apiLarge:'Die Anfrage ist zu groß oder die Unterschrift ungültig. Bitte die Unterschrift neu zeichnen.',apiNetwork:'Die Serverantwort fehlt. Der Antrag könnte bereits verarbeitet worden sein. Bitte nicht erneut absenden und mit der Referenz beim Betreiber nachfragen.',apiRef:'Referenz',apiId:'Antrags-ID',apiFoot:'Partnerformular · Version 3.0 · Servergestützte Übermittlung',apiUnknownLock:'Status zuerst klären',apiOther:'Der Antrag konnte nicht bestätigt werden. Bitte mit der Referenz beim Betreiber nachfragen.'},
 en:{apiSubmit:'Submit application →',apiSending:'Submitting …',apiNote:'Submission is enabled. Submitting sends your data to PromptMarketer. For the production test, only use your own or explicitly authorised test data.',apiLoading:'Preparing the secure submission connection …',apiUnavailable:'Submission is not available yet. Your entries are retained. Please contact the operator or check the connection again.',apiRetryConnection:'Check connection again',apiFailed:'Submission not completed',apiStoredTitle:'Application saved',apiStoredText:'PromptMarketer has confirmed that your application was saved. This does not activate your Vitarights partnership or countersign the contract.',apiManualTitle:'Manual review required',apiManualText:'The application was not saved in the application table. The server confirms that the administration was notified. Please do not submit again; contact the operator.',apiUnknown:'No definite confirmation was received. Your application may already have been processed. Please do not submit again. Contact the operator with the reference to clarify its status.',apiNoStore:'The application was not saved and an admin notification was not confirmed. Please contact the operator.',apiAuth:'The destination rejected the server credentials. Please inform the operator. Your entries are retained.',apiForbidden:'The destination or its security gateway blocked the request. Please inform the operator.',apiValidation:'Please review the highlighted entries. The server did not accept the application.',apiServerField:'Please review this field; the server rejected this entry.',apiSession:'Your secure form session has expired. Please check the connection again; your entries are retained.',apiRate:'Too many requests. Please wait at least one minute before trying again.',apiBusy:'Submission is currently busy. Please try again later.',apiSponsor:'The sponsor number does not match the invitation link. Please reopen the correct invitation link.',apiLarge:'The request is too large or the signature is invalid. Please draw your signature again.',apiNetwork:'The server response is missing. Your application may have been processed. Please do not resubmit; contact the operator with the reference.',apiRef:'Reference',apiId:'Application ID',apiFoot:'Partner application · Version 3.0 · Server-side submission',apiUnknownLock:'Clarify status first',apiOther:'The application could not be confirmed. Please contact the operator with the reference.'}
};
for(const language of ['de','en'])Object.assign(I18N[language],apiText[language]);
// Keep project_id server-owned. The server defaults it to the known Base44 app ID;
// operators can explicitly override it with BASE44_PROJECT_ID.
let apiReady=false,apiLoading=false,apiToken='',sending=false,submissionOutcome=null;
let apiProblem=null,unknownResult=false,requestId='',requestPayload=null;
const attemptStorage='pm-pending:'+draftKey;
const notice=byId('localModeNotice');notice.replaceChildren();
const noticeText=document.createElement('span'),connectionButton=document.createElement('button');
connectionButton.type='button';connectionButton.style.marginTop='12px';connectionButton.style.display='block';
notice.append(noticeText,connectionButton);
const apiBox=document.createElement('div');apiBox.className='notice';apiBox.id='apiStatus';apiBox.hidden=true;apiBox.setAttribute('role','alert');apiBox.tabIndex=-1;
byId('signatureSection').before(apiBox);
const banner=document.createElement('p');banner.className='notice';banner.id='apiConnection';banner.setAttribute('role','status');
byId('progress').before(banner);
byId('submitButton').removeAttribute('data-i18n');
byId('successTitle').removeAttribute('data-i18n');
const successCopy=byId('success').querySelector('p');successCopy.removeAttribute('data-i18n');
const receipt=document.createElement('p');byId('success').querySelector('.success').append(receipt);
const foot=document.querySelector('[data-i18n="previewFoot"]');if(foot)foot.dataset.i18n='apiFoot';
const fieldsMap={first_name:'firstName',last_name:'lastName',birth_date:'birthDate',email:'email',street:'street',house_number:'houseNo',postal_code:'postal',city:'city',country:'country',phone:'phone',mobile:'mobile',tax_number:'taxNo',vat_id:'vatId',tax_office:'taxOffice',start_option:'startOption',iban:'iban',bic:'bic',bank:'bank',account_holder:'holder',start_date:'startDate',signing_location:'location',sponsor_name:'sponsor',sponsor_partner_number:'sponsorId',vitarights_leader:'leader',vat_liable:'vat',contract_accepted:'c1',privacy_accepted:'c2',self_employed_confirmed:'c3'};
// Match the API contract provided by the operator, including optional fields.
for(const name of ['phone','mobile','bank','location','sponsor','leader']){
  const input=control(name),required=name==='phone';input.required=required;
  const label=input.closest('[data-field]').querySelector('label');
  label.querySelectorAll('.req,[data-i18n="optional"]').forEach(el=>el.remove());
  const suffix=document.createElement('span');suffix.className=required?'req':'hint';
  if(required){suffix.textContent=' *';suffix.setAttribute('aria-hidden','true');}else{suffix.dataset.i18n='optional';suffix.textContent=t('optional');}
  label.append(document.createTextNode(' '),suffix);
}
function uuid(){
  if(crypto.randomUUID)return crypto.randomUUID();
  const b=crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;
  return Array.from(b,x=>x.toString(16).padStart(2,'0')).join('').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/,'$1-$2-$3-$4-$5');
}
function rememberAttempt(state){try{sessionStorage.setItem(attemptStorage,JSON.stringify({id:requestId,state}));}catch{}}
function forgetAttempt(){try{sessionStorage.removeItem(attemptStorage);}catch{}}
// On a reload during a POST, never silently send a second application.
try{const old=JSON.parse(sessionStorage.getItem(attemptStorage)||'null');if(old&&/^[a-f0-9-]{36}$/.test(old.id)){requestId=old.id;unknownResult=true;apiProblem={key:'apiUnknown',id:old.id};}}catch{}
function renderApi(){
  const noteKey=apiLoading?'apiLoading':apiReady?'apiNote':'apiUnavailable';
  noticeText.textContent=t(noteKey);banner.textContent=t(noteKey);banner.hidden=apiReady;
  connectionButton.textContent=t('apiRetryConnection');connectionButton.hidden=apiReady||apiLoading;connectionButton.disabled=apiLoading||sending;
  const button=byId('submitButton');button.textContent=t(sending?'apiSending':unknownResult?'apiUnknownLock':'apiSubmit');
  button.disabled=!apiReady||sending||unknownResult||sponsorLink.mode==='invalid';
  form.inert=sending;form.setAttribute('aria-busy',String(sending));
  apiBox.hidden=!apiProblem;
  if(apiProblem){apiBox.textContent=t(apiProblem.key)+(apiProblem.id?' · '+t('apiRef')+': '+apiProblem.id:'');}
  if(submissionOutcome){
    const stored=submissionOutcome.code==='STORED';
    byId('successTitle').textContent=t(stored?'apiStoredTitle':'apiManualTitle');successCopy.textContent=t(stored?'apiStoredText':'apiManualText');
    byId('success').querySelector('i').textContent=stored?'✓':'!';
    receipt.textContent=t('apiRef')+': '+submissionOutcome.request_id+(stored?' · '+t('apiId')+': '+submissionOutcome.application_id:'');
  }
}
const previousShowStep=showStep;
showStep=function(...args){previousShowStep(...args);renderApi();};
const previousLocalise=localise;
localise=function(){previousLocalise();renderApi();};
async function connect(){
  if(sponsorLink.mode==='invalid')return;
  apiLoading=true;renderApi();
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try{
    const suffix=sponsorLink.mode==='linked'?'?sponsorId='+encodeURIComponent(sponsorLink.value):'';
    const response=await fetch('/api/session'+suffix,{credentials:'same-origin',cache:'no-store',signal:controller.signal});
    if(!response.ok)throw Error();const result=await response.json();
    apiReady=result.ready===true;apiToken=typeof result.token==='string'?result.token:'';
    if(!apiToken)apiReady=false;
    if(apiProblem?.key==='apiSession')apiProblem=null;
  }catch{apiReady=false;}finally{clearTimeout(timer);apiLoading=false;renderApi();}
}
connectionButton.addEventListener('click',connect);
function pngSignature(){
  const output=document.createElement('canvas'),rect=canvas.getBoundingClientRect();output.width=1000;output.height=Math.max(1,Math.min(1000,Math.round(1000*rect.height/Math.max(1,rect.width))));
  const ink=output.getContext('2d');if(!ink)throw Error('canvas');
  ink.fillStyle='#ffffff';ink.fillRect(0,0,output.width,output.height);
  ink.strokeStyle='#111111';ink.lineWidth=3.5;ink.lineCap='round';ink.lineJoin='round';
  strokes.forEach(stroke=>{if(stroke.length<2)return;ink.beginPath();stroke.forEach((q,i)=>{const x=q[0]*output.width,y=q[1]*output.height;i?ink.lineTo(x,y):ink.moveTo(x,y);});ink.stroke();});
  const uri=output.toDataURL('image/png');if(uri.length>700000||!uri.startsWith('data:image/png;base64,'))throw Error('signature size');return uri;
}
function buildPayload(){
  const payload={};
  for(const [api,ui] of Object.entries(fieldsMap)){
    if(['vat_liable','contract_accepted','privacy_accepted','self_employed_confirmed'].includes(api))continue;
    if(['tax_number','vat_id','tax_office'].includes(api)&&value('vat')!=='ja')continue;
    const v=value(ui);if(v)payload[api]=v;
  }
  payload.iban=value('iban').toUpperCase().replace(/\s/g,'');payload.bic=value('bic').toUpperCase();
  payload.vat_liable=value('vat')==='ja';
  payload.contract_accepted=control('c1').checked===true;payload.privacy_accepted=control('c2').checked===true;payload.self_employed_confirmed=control('c3').checked===true;
  payload.signature=pngSignature();return payload;
}
function showApiProblem(key,id){apiProblem={key,id};renderApi();apiBox.focus({preventScroll:true});apiBox.scrollIntoView({block:'center',behavior:scrollBehavior()});}
function handleApiError(result){
  const keys={NOT_CONFIGURED:'apiUnavailable',UPSTREAM_AUTH:'apiAuth',UPSTREAM_FORBIDDEN:'apiForbidden',VALIDATION:'apiValidation',UPSTREAM_VALIDATION:'apiValidation',SESSION_EXPIRED:'apiSession',RATE_LIMIT:'apiRate',BUSY:'apiBusy',SPONSOR:'apiSponsor',TOO_LARGE:'apiLarge',NOT_STORED:'apiNoStore',RESULT_UNKNOWN:'apiUnknown',REQUEST_CONFLICT:'apiUnknown'};
  const code=result.code||'RESULT_UNKNOWN';
  if(!keys[code]||['RESULT_UNKNOWN','REQUEST_CONFLICT','NOT_STORED'].includes(code)){unknownResult=true;rememberAttempt('unknown');}
  else{forgetAttempt();requestPayload=null;requestId='';}
  if(code==='SESSION_EXPIRED'){apiReady=false;apiToken='';}
  const names=(result.fields||[]).map(name=>fieldsMap[name]).filter(Boolean);
  if(names.length){
    const field=firstControl(names[0]);returnReview=true;showStep(Number(field.closest('[data-step]').dataset.step),false);
    for(const name of names)renderField(name,issue('apiServerField'));focusField(names[0]);
    announce(keys[code]||'apiOther');apiProblem={key:keys[code]||'apiOther',id:result.request_id};renderApi();
  }else showApiProblem(keys[code]||'apiUnknown',result.request_id||requestId);
}
form.addEventListener('submit',async event=>{
  event.preventDefault();if(sending||unknownResult||!linkOK())return;
  if(step!==5){next();return;}if(!validateAll())return;
  if(hasSignature()&&signatureSnapshot!==formSnapshot())clearSignature(true);
  if(!hasSignature()){signatureMissing=true;signatureUI();canvas.focus({preventScroll:true});byId('signatureSection').scrollIntoView({block:'center',behavior:scrollBehavior()});return;}
  if(!apiReady){showApiProblem('apiUnavailable');return;}
  try{requestPayload=buildPayload();}catch{showApiProblem('apiLarge');return;}
  requestId=uuid();rememberAttempt('pending');apiProblem=null;sending=true;renderApi();
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),35000);
  try{
    const response=await fetch('/api/submit',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','X-Form-Token':apiToken,'Idempotency-Key':requestId},body:JSON.stringify(requestPayload),signal:controller.signal});
    const result=await response.json();
    if(!result||typeof result!=='object')throw Error();
    if(response.ok&&((result.code==='STORED'&&result.stored===true&&result.application_id)||(result.code==='MANUAL_REVIEW'&&result.stored===false&&result.admin_notified===true))){
      submissionOutcome=result;clearTimeout(saveTimer);finished=true;
      if(result.code==='STORED'){
        forgetAttempt();try{sessionStorage.removeItem(draftKey);sessionStorage.removeItem('vrDraft');}catch{}
      }else{rememberAttempt('manual_review');}
      unknownResult=true;form.hidden=true;byId('progress').hidden=true;byId('success').hidden=false;renderApi();
      byId('successTitle').focus({preventScroll:true});byId('success').scrollIntoView({block:'start',behavior:scrollBehavior()});
    }else handleApiError(result);
  }catch{unknownResult=true;rememberAttempt('unknown');showApiProblem('apiNetwork',requestId);}
  finally{clearTimeout(timer);sending=false;renderApi();}
});
// The existing language/theme and back-to-review handlers continue to work.
form.addEventListener('input',()=>{if(!sending)renderApi();});
form.addEventListener('change',()=>{if(!sending)renderApi();});
window.addEventListener('pageshow',renderApi);
queueMicrotask(()=>{renderApi();connect();});
