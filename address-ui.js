// Shared address rules have been embedded by the build before this UI adapter.
let countryOptionsLanguage='';
function updateCountryOptions(){
  if(countryOptionsLanguage===lang)return;
  const select=control('country'),selected=select.value;
  const options=countryOptions(lang).map(({value,label})=>new Option(label,value));
  select.replaceChildren(new Option(t('choose'),''),...options);
  select.value=countrySpec(selected)?selected:'';countryOptionsLanguage=lang;
}
function applyAddressRules(){
  const selected=value('country'),spec=countrySpec(selected),postal=control('postal');
  // Updating native attributes is guarded; never rewrite the current input value.
  const mode=spec?.inputMode||'text';
  if(postal.inputMode!==mode)postal.inputMode=mode;
  if(postal.maxLength!==POSTAL_MAX_LENGTH)postal.maxLength=POSTAL_MAX_LENGTH;
  if(postal.placeholder!==(spec?.example||''))postal.placeholder=spec?.example||'';
  // Our shared validator also accepts optional country prefixes and lower-case.
  // Avoid an inconsistent second native regex or stale setCustomValidity state.
  if(postal.hasAttribute('pattern'))postal.removeAttribute('pattern');
  postal.autocapitalize='characters';postal.spellcheck=false;
  const vat=control('vatId'),pattern=vatPattern(selected);
  if(pattern){if(vat.pattern!==pattern)vat.pattern=pattern;}
  else if(vat.hasAttribute('pattern'))vat.removeAttribute('pattern');
}

Object.assign(I18N.de,{badPostal:'Bitte gib eine gültige Postleitzahl für {country} ein, z. B. {example}.'});
Object.assign(I18N.en,{badPostal:'Enter a valid postcode for {country}, for example {example}.'});
form.addEventListener('change',event=>{
  if(event.target.name==='country'){
    applyAddressRules();
    if(value('postal'))renderField('postal',fieldIssue('postal'));
    if(value('vatId')&&!control('vatId').disabled)renderField('vatId',fieldIssue('vatId'));
  }
});
