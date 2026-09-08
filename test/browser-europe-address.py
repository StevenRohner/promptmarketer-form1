"""Offline browser regression: compiled PROD HTML, mock session/POST only.
Run: npm run build && python test/browser-europe-address.py
"""
from pathlib import Path
from datetime import date, timedelta
from playwright.sync_api import sync_playwright
HTML=(Path(__file__).resolve().parents[1]/'public/index.html').read_text()
MOCK="""() => {
  window.__requests=[];
  window.fetch=async (url,options={})=>{
    if(String(url).startsWith('/api/session'))return new Response(JSON.stringify({ready:true,token:'offline-token'}),{status:200});
    if(url==='/api/submit'){
      window.__requests.push(JSON.parse(options.body));
      return new Response(JSON.stringify({code:'STORED',stored:true,application_id:'offline-only',request_id:'offline-ref'}),{status:201});
    }
    throw Error('Unexpected request');
  };
}"""
CASES=[('CY','2008'),('GB','sw1a1aa'),('IE','d6wx285'),('MT','vlt1117'),('NL','1012ab'),('PL','00001'),('PT','1000001'),('SE','11455'),('CZ','11000'),('KZ','Z00Y5M7'),('VA','00120')]
CANON={'GB':'SW1A 1AA','IE':'D6W X285','MT':'VLT 1117','NL':'1012 AB','PL':'00-001','PT':'1000-001','SE':'114 55','CZ':'110 00'}
checks=[]
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for width,lang,light in [(320,'de',False),(390,'en',True),(768,'de',True),(1280,'en',False)]:
  page=browser.new_page(viewport={'width':width,'height':900},locale='en-US');page.set_default_timeout(7000)
  page.emulate_media(reduced_motion='reduce');errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.route('**/*',lambda r:r.abort());page.evaluate(MOCK)
  page.set_content(HTML.replace('const sponsorLink=readSponsorLink(location.search);',"const sponsorLink=readSponsorLink('?sponsorId=00471123');"),wait_until='domcontentloaded')
  if lang=='en':page.locator('#langSwitch').click()
  if light:page.locator('#themeToggle').click()
  assert page.locator('#country option').count()==59
  assert page.locator('#country option[value=CY]').inner_text()==('Cyprus' if lang=='en' else 'Zypern')
  for name,value in {'firstName':'Test','lastName':'Example','birthDate':'1984-04-11','email':'test@example.com','email2':'test@example.com','street':'Test Street','houseNo':'12','city':'Test City','phone':'+357 22 123456'}.items():page.locator('#'+name).fill(value)
  # Select after input (autofill-like): validity must use the selected country.
  page.locator('#postal').fill('2008');page.locator('#country').select_option('CY')
  assert page.locator('#postal').get_attribute('inputmode')=='numeric'
  assert page.locator('#postal').get_attribute('placeholder')=='2008'
  page.locator('[data-step="0"] .next').click();assert page.locator('[data-step="1"]').is_visible()
  # CY VAT must not be forced to the old German pattern.
  page.locator('[name=vat][value=ja]').check()
  for name,value in {'taxNo':'12345678A','vatId':'CY12345678A','taxOffice':'Nicosia'}.items():page.locator('#'+name).fill(value)
  assert page.locator('#vatId').get_attribute('pattern') is None
  page.locator('[name=startOption][value="Erfolgsstart Business"]').check()
  page.locator('[data-step="1"] .next').click();assert page.locator('[data-step="2"]').is_visible()
  page.locator('[data-step="2"] .back').click();page.locator('[data-step="1"] .back').click()
  # Both changed country and corrected postal must clear stale validation.
  page.locator('#country').select_option('DE')
  assert page.locator('#postalError').is_visible()
  assert '10115' in page.locator('#postalError').inner_text()
  page.locator('#postal').fill('01067');page.locator('#city').click()
  assert not page.locator('#postalError').is_visible()
  for country,raw in CASES:
   page.locator('#country').select_option(country);page.locator('#postal').fill(raw)
   page.locator('[data-step="0"] .next').click();assert page.locator('[data-step="1"]').is_visible(),(country,page.locator('#postalError').inner_text())
   assert page.locator('#postal').input_value()==CANON.get(country,raw)
   page.locator('[data-step="1"] .back').click()
   checks.append(f'{width}/{lang}/{country}: postcode accepted/normalised')
  # Invalid alphanumeric and numeric formats are blocked with localised examples.
  for country,bad,example in [('CY','10115','2008'),('GB','10115','SW1A 1AA'),('MT','1117','VLT 1117'),('NL','AB1012','1012 AB')]:
   page.locator('#country').select_option(country);page.locator('#postal').fill(bad)
   page.locator('[data-step="0"] .next').click();assert page.locator('[data-step="0"]').is_visible()
   assert example in page.locator('#postalError').inner_text()
   checks.append(f'{width}/{lang}/{country}: invalid format blocked')
  # Switch locale/theme and return with same country, entered code and order.
  page.locator('#country').select_option('CY');page.locator('#postal').fill('2008')
  page.locator('#langSwitch').click();page.locator('#themeToggle').click()
  assert page.locator('#country').input_value()=='CY';assert page.locator('#postal').input_value()=='2008'
  assert page.locator('#country option[value=CY]').inner_text()==('Zypern' if lang=='en' else 'Cyprus')
  page.locator('#langSwitch').click();page.locator('#themeToggle').click()
  page.locator('[data-step="0"] .next').click()
  page.locator('[name=vat][value=nein]').check();assert not page.locator('#tax').is_visible()
  page.locator('[data-step="1"] .next').click()
  for name,value in {'iban':'CH9300762011623852957','bic':'POFICHBEXXX','holder':'Test Example'}.items():page.locator('#'+name).fill(value)
  page.locator('[data-step="2"] .next').click();page.locator('#startDate').fill((date.today()+timedelta(days=1)).isoformat())
  page.locator('[data-step="3"] .next').click()
  for name in ['c1','c2','c3']:page.locator('#'+name).check()
  page.locator('[data-step="4"] .next').click()
  assert ('Cyprus' if lang=='en' else 'Zypern') in page.locator('#review').inner_text()
  page.locator('[data-edit="0"]').click();page.locator('#country').select_option('GB');page.locator('#postal').fill('sw1a1aa')
  page.locator('[data-step="0"] .next').click();assert page.locator('[data-step="5"]').is_visible()
  assert ('United Kingdom' if lang=='en' else 'Vereinigtes Königreich') in page.locator('#review').inner_text()
  assert 'SW1A 1AA' in page.locator('#review').inner_text()
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  assert page.locator('#sponsorId').input_value()=='00471123'
  canvas=page.locator('#sig');canvas.scroll_into_view_if_needed();box=canvas.bounding_box()
  page.mouse.move(box['x']+20,box['y']+80);page.mouse.down();page.mouse.move(box['x']+90,box['y']+25,steps=8);page.mouse.move(box['x']+150,box['y']+100,steps=8);page.mouse.up()
  page.locator('#submitButton').click();page.wait_for_function('__requests.length===1')
  payload=page.evaluate('__requests[0]')
  assert payload['country']=='GB';assert payload['postal_code']=='SW1A 1AA';assert payload['iban']=='CH9300762011623852957'
  assert payload['sponsor_partner_number']=='00471123';assert 'tax_number' not in payload
  assert payload['signature'].startswith('data:image/png;base64,');assert not errors,errors
  assert page.locator('#success').is_visible()
  checks.append(f'{width}/{lang}: all switches, CY VAT, country edit, review, PNG and mock POST')
  page.close()
 # A simple screenshot on a fresh mobile CY screen.
 page=browser.new_page(viewport={'width':390,'height':844});page.route('**/*',lambda r:r.abort());page.evaluate(MOCK)
 page.set_content(HTML,wait_until='domcontentloaded');page.locator('#country').select_option('CY');page.locator('#postal').fill('2008')
 page.locator('#country').scroll_into_view_if_needed();page.screenshot(path='/mnt/data/pm_europe/cyprus-mobile.png')
 browser.close()
print('\n'.join('PASS '+case for case in checks));print(f'{len(checks)} browser checks passed; no production requests.')
