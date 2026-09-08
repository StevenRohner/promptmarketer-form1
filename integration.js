// Inserted into the existing form closure by build.mjs. No secrets in this file.
const apiText={
  "de": {
    "apiSubmit": "Antrag absenden →",
    "apiSending": "Wird gesendet …",
    "apiUnavailable": "Dein Antrag kann gerade nicht gesendet werden. Deine Angaben bleiben erhalten. Bitte versuche es später erneut.",
    "apiBeforeSend": "Die Verbindung konnte nicht hergestellt werden. Es wurde nichts gesendet. Bitte versuche es erneut.",
    "apiFailed": "Dein Antrag wurde noch nicht gesendet.",
    "apiStoredTitle": "Dein Antrag ist eingegangen",
    "apiStoredText": "Danke! Dein Antrag wird jetzt geprüft. Du bist damit noch nicht als Vitarights-Partner freigeschaltet.",
    "apiManualTitle": "Dein Antrag benötigt eine Prüfung",
    "apiManualText": "Dein Antrag konnte nicht automatisch zugeordnet werden. Unser Team wurde informiert. Bitte sende den Antrag nicht erneut.",
    "apiUnknown": "Wir konnten den Eingang nicht eindeutig bestätigen. Bitte sende den Antrag nicht erneut und kläre den Status mit unserem Team. Halte dafür die Referenz bereit.",
    "apiNoStore": "Dein Antrag konnte nicht gespeichert werden. Bitte wende dich mit der Referenz an unser Team.",
    "apiAuth": "Dein Antrag konnte gerade nicht gesendet werden. Deine Angaben bleiben erhalten. Bitte versuche es später erneut.",
    "apiForbidden": "Dein Antrag konnte gerade nicht gesendet werden. Deine Angaben bleiben erhalten. Bitte versuche es später erneut.",
    "apiValidation": "Bitte korrigiere die markierten Angaben.",
    "apiServerField": "Bitte prüfe diese Angabe.",
    "apiSession": "Bitte versuche es erneut. Deine Angaben bleiben erhalten.",
    "apiRate": "Bitte warte eine Minute und versuche es erneut.",
    "apiBusy": "Bitte versuche es in wenigen Minuten erneut. Deine Angaben bleiben erhalten.",
    "apiSponsor": "Bitte öffne den richtigen Einladungslink deines Förderers.",
    "apiLarge": "Bitte lösche deine Unterschrift und unterschreibe noch einmal.",
    "apiNetwork": "Wir konnten den Eingang nicht eindeutig bestätigen. Bitte sende den Antrag nicht erneut und kläre den Status mit unserem Team. Halte dafür die Referenz bereit.",
    "apiRef": "Referenz",
    "apiId": "Antragsnummer",
    "apiUnknownLock": "Eingang zuerst klären",
    "apiOther": "Bitte wende dich mit der Referenz an unser Team.",
    "heroTag": "Partnerantrag",
    "heroSub": "Fülle deinen Partnerantrag aus und prüfe deine Angaben vor dem Absenden.",
    "s3": "Start & Förderer",
    "sub0": "Deine persönlichen Angaben.",
    "sub1": "Deine Tätigkeit und die gewünschte Startoption.",
    "sub2": "Dein Konto für Provisionsauszahlungen.",
    "sub3": "Wann möchtest du starten und wer hat dich eingeladen?",
    "ibanHint": "Die IBAN findest du in deinem Onlinebanking.",
    "badIban": "Bitte prüfe die IBAN auf Tippfehler.",
    "ibanLength": "Eine IBAN mit {country} muss {n} Zeichen ohne Leerzeichen enthalten.",
    "ibanCountry": "Für dieses Länderkürzel ist kein IBAN-Format hinterlegt. Bitte prüfe die IBAN.",
    "linkedHint": "",
    "linkedNotice": "",
    "sponsorHint": "",
    "invalidLink": "Dieser Einladungslink ist ungültig. Bitte frage deinen Förderer nach einem neuen Link.",
    "invalidLinkHint": "Bitte verwende einen gültigen Einladungslink.",
    "editMode": "",
    "counterSign": "Vitarights prüft und bestätigt deinen Antrag anschließend."
  },
  "en": {
    "apiSubmit": "Submit application →",
    "apiSending": "Sending …",
    "apiUnavailable": "Your application cannot be sent right now. Your entries are retained. Please try again later.",
    "apiBeforeSend": "We could not connect. Nothing was sent. Please try again.",
    "apiFailed": "Your application has not been sent yet.",
    "apiStoredTitle": "Your application has been received",
    "apiStoredText": "Thank you! Your application will now be reviewed. Your Vitarights partnership is not active yet.",
    "apiManualTitle": "Your application needs a review",
    "apiManualText": "We could not automatically assign your application. Our team has been notified. Please do not submit it again.",
    "apiUnknown": "We could not confirm receipt. Please do not submit again. Contact our team with the reference to check its status.",
    "apiNoStore": "Your application could not be saved. Please contact our team with the reference.",
    "apiAuth": "Your application could not be sent right now. Your entries are retained. Please try again later.",
    "apiForbidden": "Your application could not be sent right now. Your entries are retained. Please try again later.",
    "apiValidation": "Please correct the highlighted entries.",
    "apiServerField": "Please check this entry.",
    "apiSession": "Please try again. Your entries are retained.",
    "apiRate": "Please wait one minute and try again.",
    "apiBusy": "Please try again in a few minutes. Your entries are retained.",
    "apiSponsor": "Please open the correct invitation link from your sponsor.",
    "apiLarge": "Please clear your signature and sign again.",
    "apiNetwork": "We could not confirm receipt. Please do not submit again. Contact our team with the reference to check its status.",
    "apiRef": "Reference",
    "apiId": "Application number",
    "apiUnknownLock": "Check receipt first",
    "apiOther": "Please contact our team with the reference.",
    "heroTag": "Partner application",
    "heroSub": "Complete your partner application and review your details before submitting.",
    "s3": "Start & sponsor",
    "sub0": "Your personal details.",
    "sub1": "Your business and preferred starting option.",
    "sub2": "Your account for commission payments.",
    "sub3": "When would you like to start, and who invited you?",
    "ibanHint": "You can find your IBAN in your online banking.",
    "badIban": "Please check your IBAN for typing errors.",
    "ibanLength": "An IBAN starting with {country} must contain {n} characters without spaces.",
    "ibanCountry": "There is no registered IBAN format for this country code. Please check your IBAN.",
    "linkedHint": "",
    "linkedNotice": "",
    "sponsorHint": "",
    "invalidLink": "This invitation link is invalid. Please ask your sponsor for a new link.",
    "invalidLinkHint": "Please use a valid invitation link.",
    "editMode": "",
    "counterSign": "Vitarights will review and confirm your application."
  }
};
for(const language of ['de','en'])Object.assign(I18N[language],apiText[language]);
// Keep project_id server-owned. The server defaults it to the known Base44 app ID;
// operators can explicitly override it with BASE44_PROJECT_ID.
let apiReady=false,apiLoading=false,apiToken='',sending=false,submissionOutcome=null;
let apiProblem=null,unknownResult=false,requestId='',requestPayload=null;
let connectionPromise=null;
const attemptStorage='pm-pending:'+draftKey;
// One contextual error at the point of submission, never setup banners.
byId('localModeNotice')?.remove();
const apiBox=document.createElement('div');apiBox.className='notice';apiBox.id='apiStatus';apiBox.hidden=true;apiBox.setAttribute('role','alert');apiBox.tabIndex=-1;
byId('submitButton').closest('.actions').before(apiBox);
const previousApplySponsorLink=applySponsorLink;
applySponsorLink=function(){
  previousApplySponsorLink();
  if(sponsorLink.mode!=='invalid')byId('sponsorLinkNotice').hidden=true;
  byId('sponsorIdHint').hidden=sponsorLink.mode!=='invalid';
  // Keep the safety lock for an in-flight/ambiguous POST even after validation.
  byId('submitButton').disabled=sending||unknownResult||sponsorLink.mode==='invalid';
};
const oldUpdateNavigation=updateNavigation;
updateNavigation=function(){oldUpdateNavigation();form.querySelectorAll('.edit-note').forEach(node=>node.hidden=true);};
byId('submitButton').removeAttribute('data-i18n');
byId('successTitle').removeAttribute('data-i18n');
const successCopy=byId('success').querySelector('p');successCopy.removeAttribute('data-i18n');
const receipt=document.createElement('p');byId('success').querySelector('.success').append(receipt);
document.querySelector('.footer')?.remove();
document.querySelector('[data-i18n="newPartner"]')?.closest('.notice')?.remove();
const fieldsMap={first_name:'firstName',last_name:'lastName',birth_date:'birthDate',email:'email',street:'street',house_number:'houseNo',postal_code:'postal',city:'city',country:'country',phone:'phone',mobile:'mobile',tax_number:'taxNo',vat_id:'vatId',tax_office:'taxOffice',start_option:'startOption',iban:'iban',bic:'bic',bank:'bank',account_holder:'holder',start_date:'startDate',signing_location:'location',sponsor_name:'sponsor',sponsor_partner_number:'sponsorId',vitarights_leader:'leader',vat_liable:'vat',contract_accepted:'c1',privacy_accepted:'c2',self_employed_confirmed:'c3'};
// Match the API contract provided by the operator, including optional fields.
for(const name of ['phone','mobile','bank','location','sponsor','leader']){
  const input=control(name),required=name==='phone';input.required=required;
  const label=input.closest('[data-field]').querySelector('label');
  label.querySelectorAll('.req,.optional,[data-i18n="optional"]').forEach(el=>el.remove());
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
  const button=byId('submitButton');
  button.textContent=t(sending?'apiSending':unknownResult?'apiUnknownLock':'apiSubmit');
  // An initial connection failure must not permanently disable submission.
  // The next user-initiated submit refreshes the connection before any POST.
  button.disabled=sending||unknownResult||sponsorLink.mode==='invalid';
  form.inert=sending;form.setAttribute('aria-busy',String(sending));
  apiBox.hidden=!apiProblem;
  if(apiProblem){
    panels[step].querySelector('.actions').before(apiBox);
    apiBox.replaceChildren();
    const message=document.createElement('p');message.style.margin='0';message.textContent=t(apiProblem.key);apiBox.append(message);
    if(apiProblem.id){const reference=document.createElement('small');reference.className='hint';reference.style.overflowWrap='anywhere';reference.textContent=t('apiRef')+': '+apiProblem.id;apiBox.append(reference);}
  }
  if(submissionOutcome){
    const stored=submissionOutcome.code==='STORED';
    byId('successTitle').textContent=t(stored?'apiStoredTitle':'apiManualTitle');successCopy.textContent=t(stored?'apiStoredText':'apiManualText');
    byId('success').querySelector('i').textContent=stored?'✓':'!';
    receipt.textContent=stored?t('apiId')+': '+submissionOutcome.application_id:t('apiRef')+': '+submissionOutcome.request_id;
  }
}
const previousShowStep=showStep;
showStep=function(...args){previousShowStep(...args);renderApi();};
const previousLocalise=localise;
localise=function(){previousLocalise();renderApi();};
async function connect(){
  if(sponsorLink.mode==='invalid')return {ok:false,code:'SPONSOR'};
  if(connectionPromise)return connectionPromise;
  connectionPromise=(async()=>{
    apiLoading=true;
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
    try{
      const suffix=sponsorLink.mode==='linked'?'?sponsorId='+encodeURIComponent(sponsorLink.value):'';
      const response=await fetch('/api/session'+suffix,{credentials:'same-origin',cache:'no-store',signal:controller.signal});
      const result=await response.json();
      apiReady=response.ok&&result?.ready===true&&typeof result.token==='string'&&!!result.token;
      apiToken=apiReady?result.token:'';
      return {ok:apiReady,code:apiReady?null:result?.code||(result?.ready===false?'NOT_CONFIGURED':'CONNECTION'),request_id:typeof result?.request_id==='string'?result.request_id:undefined};
    }catch{apiReady=false;apiToken='';return {ok:false,code:'CONNECTION'};}
    finally{clearTimeout(timer);apiLoading=false;}
  })();
  try{return await connectionPromise;}finally{connectionPromise=null;}
}
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
  payload.iban=normaliseIban(value('iban'));payload.bic=value('bic').toUpperCase();
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
  if(code==='SESSION_EXPIRED'||code==='NOT_CONFIGURED'){apiReady=false;apiToken='';}
  const names=(Array.isArray(result.fields)?result.fields:[]).map(name=>fieldsMap[name]).filter(Boolean);
  if(names.length){
    const field=firstControl(names[0]);returnReview=true;showStep(Number(field.closest('[data-step]').dataset.step),false);
    for(const name of names)renderField(name,issue('apiServerField'));focusField(names[0]);
    apiProblem={key:keys[code]||'apiOther',id:result.request_id};renderApi();
  }else showApiProblem(keys[code]||'apiUnknown',result.request_id||requestId);
}
form.addEventListener('submit',async event=>{
  event.preventDefault();if(sending||unknownResult||!linkOK())return;
  if(step!==5){next();return;}if(!validateAll())return;
  if(hasSignature()&&signatureSnapshot!==formSnapshot())clearSignature(true);
  if(!hasSignature()){signatureMissing=true;signatureUI();canvas.focus({preventScroll:true});byId('signatureSection').scrollIntoView({block:'center',behavior:scrollBehavior()});return;}
  apiProblem=null;sending=true;renderApi();
  let timer=null,postStarted=false;
  try{
    // Always check at the user's actual submission, not just once on page load.
    // A failure here is safe to retry: no application has left the browser.
    const connection=await connect();
    if(!connection.ok){
      apiProblem={key:connection.code==='NOT_CONFIGURED'?'apiUnavailable':'apiBeforeSend',id:connection.request_id};return;
    }
    try{requestPayload=buildPayload();}catch{apiProblem={key:'apiLarge'};return;}
    requestId=uuid();rememberAttempt('pending');postStarted=true;
    const controller=new AbortController();timer=setTimeout(()=>controller.abort(),35000);
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
  }catch{
    if(postStarted){unknownResult=true;rememberAttempt('unknown');apiProblem={key:'apiNetwork',id:requestId};}
    else{apiProblem={key:'apiBeforeSend'};}
  }finally{
    clearTimeout(timer);sending=false;renderApi();
    if(apiProblem&&!form.hidden&&step===5){apiBox.focus({preventScroll:true});apiBox.scrollIntoView({block:'center',behavior:scrollBehavior()});}
  }
});
// The existing language/theme and back-to-review handlers continue to work.
form.addEventListener('input',()=>{if(!sending)renderApi();});
form.addEventListener('change',()=>{if(!sending)renderApi();});
window.addEventListener('pageshow',renderApi);
// No page-load request or connection-state messaging. Check on submit only.
queueMicrotask(renderApi);
