"""Offline Chromium regression for IBANs. No production submissions/network calls.
Run after npm run build: python test/browser-international-iban.py
"""
import argparse
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
EXAMPLES=[
 ('NL91 ABNA 0417 1643 00','ABNANL2A'),
 ('CH93 0076 2011 6238 5295 7','POFICHBEXXX'),
 ('GB29 NWBK 6016 1331 9268 19','NWBKGB2L'),
 ('FR14 2004 1010 0505 0001 3M02 606','PSSTFRPP'),
 ('LT12 1000 0111 0100 1000','HABALT22'),
 ('IT60 X054 2811 1010 0000 0123 456','BCITITMM'),
 ('AE07 0331 2345 6789 0123 456','BOMLAEAD'),
 ('HN88 CABF 0000 0000 0002 5000 5469','CABFHNTE')
]

def run(chromium, screenshot=None):
    cases=[]
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path=chromium,headless=True,args=['--no-sandbox'])
        for width,lang,light,residence in [
            (320,'de',False,'DE'),(390,'de',True,'AT'),
            (320,'en',True,'DE'),(390,'en',False,'AT'),
            (768,'de',False,'AT'),(1280,'en',True,'DE')]:
            page=browser.new_page(viewport={'width':width,'height':900},locale='en-US')
            print(f'RUN {width}px/{lang}/{light}/{residence}', flush=True)
            page.emulate_media(reduced_motion='reduce')
            page.set_default_timeout(8000)
            errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
            page.route('**/*',lambda r:r.abort())
            page.evaluate(MOCK)
            # This environment blocks navigation, even localhost. Inject only the
            # query input into the unchanged parser in our offline HTML fixture.
            query="const sponsorLink=readSponsorLink(location.search);"
            assert HTML.count(query)==1
            page.set_content(HTML.replace(query,"const sponsorLink=readSponsorLink('?sponsorId=00471123');"), wait_until='domcontentloaded')
            if lang=='en':page.locator('#langSwitch').click()
            if light:page.locator('#themeToggle').click()
            for name,value in {'firstName':'Test','lastName':'Example','birthDate':'1984-04-11','email':'test@example.com','email2':'test@example.com','street':'Teststrasse','houseNo':'11','postal':'1010' if residence=='AT' else '10115','city':'Wien' if residence=='AT' else 'Berlin','phone':'+49 30 1234567'}.items():
                page.locator('#'+name).fill(value)
            page.locator('#country').select_option(residence)
            page.locator('[data-step="0"] .next').click()
            page.locator('[name="vat"][value="nein"]').check()
            page.locator('[name="startOption"][value="Erfolgsstart Business"]').check()
            page.locator('[data-step="1"] .next').click()
            page.locator('#holder').fill('Test Example')
            for iban,bic in EXAMPLES:
                print(f'  {iban[:2]}',flush=True)
                page.locator('#iban').fill(iban.lower().replace(' ','\u00a0'))
                page.locator('#bic').fill(bic)
                page.locator('[data-step="2"] .next').click()
                assert page.locator('[data-step="3"]').is_visible(),(iban,lang,page.locator('#ibanError').inner_text())
                assert page.locator('#country').input_value()==residence
                assert page.locator('#sponsorId').input_value()=='00471123'
                assert page.locator('#sponsorId').get_attribute('readonly') is not None
                page.locator('[data-step="3"] .back').click()
                cases.append(f'{width}px/{lang}/{residence}/{iban[:2]} passes')
            # Wrong length and checksum are still blocked, error in selected language.
            page.locator('#iban').fill('NL91ABNA041716430')
            page.locator('[data-step="2"] .next').click()
            assert page.locator('[data-step="2"]').is_visible()
            message=page.locator('#ibanError').inner_text()
            assert '18' in message and ('characters' if lang=='en' else 'Zeichen') in message,message
            page.locator('#iban').fill('NL00ABNA0417164300')
            page.locator('[data-step="2"] .next').click()
            assert page.locator('#ibanError').is_visible()
            assert page.locator('[data-step="2"]').is_visible()
            # Correct, then edit the account once from the review.
            page.locator('#iban').fill(EXAMPLES[0][0]);page.locator('#bic').fill(EXAMPLES[0][1])
            page.locator('[data-step="2"] .next').click()
            page.locator('#startDate').fill((date.today()+timedelta(days=1)).isoformat())
            page.locator('[data-step="3"] .next').click()
            for name in ['c1','c2','c3']:page.locator('#'+name).check()
            page.locator('[data-step="4"] .next').click()
            page.locator('[data-edit="2"]').click()
            page.locator('#iban').fill(EXAMPLES[1][0]);page.locator('#bic').fill(EXAMPLES[1][1])
            page.locator('[data-step="2"] .next').click()
            assert page.locator('[data-step="5"]').is_visible()
            assert 'CH93' in page.locator('#review').inner_text()
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),width
            page.locator('#langSwitch').click();page.locator('#themeToggle').click()
            assert page.locator('#iban').input_value().replace(' ','')=='CH9300762011623852957'
            canvas=page.locator('#sig');canvas.scroll_into_view_if_needed();box=canvas.bounding_box()
            page.mouse.move(box['x']+20,box['y']+80);page.mouse.down()
            page.mouse.move(box['x']+80,box['y']+25,steps=8);page.mouse.move(box['x']+160,box['y']+100,steps=8);page.mouse.up()
            page.locator('#submitButton').click();page.wait_for_function('__requests.length===1')
            payload=page.evaluate('__requests[0]')
            assert payload['iban']=='CH9300762011623852957'
            assert payload['country']==residence
            assert payload['sponsor_partner_number']=='00471123'
            assert payload['signature'].startswith('data:image/png;base64,')
            assert page.locator('#success').is_visible()
            assert not errors,errors
            if screenshot and width==390 and lang=='de':
                page.screenshot(path=screenshot)
            cases.append(f'{width}px/{lang}/{residence}: errors, correction, review/edit, switches and complete offline POST')
            page.close()
        browser.close()
    print('\n'.join('PASS '+case for case in cases))
    print(f'{len(cases)} browser checks passed, all network calls mocked.')

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--chromium',default='/usr/bin/chromium')
    parser.add_argument('--screenshot',default=None)
    args=parser.parse_args()
    run(args.chromium,args.screenshot)
