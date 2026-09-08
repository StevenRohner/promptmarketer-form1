"""Keyboard regression checks for the built form. All HTTP calls are stubbed.

Run npm run build, then:
  python test/browser-date-input.py --chromium /usr/bin/chromium
Requires Python Playwright and a Chromium executable. No live forms are submitted.
The test uses set_content so it also works in network-restricted environments.
"""
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = Path(__file__).resolve().parents[1]
HTML = (BASE / 'public/index.html').read_text()
MOCK = """() => {
  window.__requests=[];
  window.fetch=async (url,options={})=>{
    if(String(url).startsWith('/api/session'))return new Response(JSON.stringify({ready:true,token:'local-test-token'}),{status:200});
    if(url==='/api/submit'){
      window.__requests.push(JSON.parse(options.body));
      return new Response(JSON.stringify({code:'STORED',stored:true,application_id:'local-test-only',request_id:'local-test-ref'}),{status:201});
    }
    throw Error('Unexpected request in offline test');
  };
}"""

def open_page(browser, width=1280, language='de', light=False):
    page=browser.new_page(viewport={'width':width,'height':900},locale='en-US')
    # Browser segment order is mm/dd/yyyy; the app UI is independently DE/EN.
    page.route('**/*', lambda route: route.abort())
    errors=[]
    page.on('pageerror',lambda error: errors.append(str(error)))
    page.evaluate(MOCK)
    page.set_content(HTML)
    if language=='en':page.locator('#langSwitch').click()
    if light:page.locator('#themeToggle').click()
    return page,errors

def select_year(page, name, initial):
    field=page.locator('#'+name)
    field.fill(initial)
    # Real native editor keyboard input, not fill() for the year under test.
    field.click(position={'x':100,'y':25})
    return field

def type_year(page, field, year):
    values=[]
    for digit in year:
        page.keyboard.press(digit)
        values.append(field.input_value())
    return values

def show_start(page):
    # Native widget test only: reveal the existing panel without changing its code.
    page.evaluate("""() => {
      document.querySelectorAll('[data-step]').forEach(p=>p.hidden=p.dataset.step!=='3');
    }""")

def run(executable):
    passed=[]
    with sync_playwright() as engine:
        browser=engine.chromium.launch(executable_path=executable,headless=True,args=['--no-sandbox'])
        for width in [320,390,1280]:
            for language in ['de','en']:
                for light in [False,True]:
                    page,errors=open_page(browser,width,language,light)
                    field=select_year(page,'birthDate','2000-04-11')
                    values=type_year(page,field,'1984')
                    assert values==['0001-04-11','0019-04-11','0198-04-11','1984-04-11'],values
                    # Deleting a year must not erase its existing month and day.
                    field.click(position={'x':100,'y':25});page.keyboard.press('Backspace')
                    assert type_year(page,field,'1990')[-1]=='1990-04-11'
                    # DE/EN and theme changes must retain the completed date.
                    page.locator('#langSwitch').click();page.locator('#themeToggle').click()
                    assert field.input_value()=='1990-04-11'
                    show_start(page)
                    start=select_year(page,'startDate','2028-04-11')
                    assert type_year(page,start,'2027')[-1]=='2027-04-11'
                    assert not errors,errors
                    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
                    passed.append(f'{width}px {language} {"light" if light else "dark"}: birth, delete/retype, switches, start, no overflow')
                    page.close()
        # The original error must also stay fixed after a failed validation attempt.
        page,errors=open_page(browser,390)
        page.locator('[data-step="0"] .next').click()
        field=select_year(page,'birthDate','2000-04-11')
        assert type_year(page,field,'1984')[-1]=='1984-04-11'
        assert not errors,errors
        passed.append('year typing after validation errors');page.close()

        # Full local browser flow: values reach the API payload as ISO strings.
        page,errors=open_page(browser,390,'en',True)
        for name,val in {'firstName':'Test','lastName':'Example','email':'test@example.com','email2':'test@example.com','street':'Teststrasse','houseNo':'11','postal':'10115','city':'Berlin','phone':'+49 30 1234567'}.items():
            page.locator('#'+name).fill(val)
        page.locator('#country').select_option('DE')
        field=select_year(page,'birthDate','2000-04-11')
        assert type_year(page,field,'1984')[-1]=='1984-04-11'
        page.locator('[data-step="0"] .next').click()
        page.locator('[name="vat"][value="nein"]').check()
        page.locator('[name="startOption"][value="Erfolgsstart Business"]').check()
        page.locator('[data-step="1"] .next').click()
        page.locator('#iban').fill('DE89 3704 0044 0532 0130 00')
        page.locator('#bic').fill('COBADEFFXXX')
        page.locator('#holder').fill('Test Example')
        page.locator('[data-step="2"] .next').click()
        start=select_year(page,'startDate','2028-04-11')
        assert type_year(page,start,'2027')[-1]=='2027-04-11'
        page.locator('#sponsorId').fill('00471123')
        page.locator('[data-step="3"] .next').click()
        for name in ['c1','c2','c3']:page.locator('#'+name).check()
        page.locator('[data-step="4"] .next').click()
        assert '1984' in page.locator('#review').inner_text()
        # Draw a test stroke only in this local, offline copy.
        canvas=page.locator('#sig');canvas.scroll_into_view_if_needed();box=canvas.bounding_box()
        page.mouse.move(box['x']+20,box['y']+70);page.mouse.down()
        page.mouse.move(box['x']+100,box['y']+30,steps=8)
        page.mouse.move(box['x']+180,box['y']+100,steps=8);page.mouse.up()
        page.locator('#submitButton').click()
        page.wait_for_function('window.__requests.length===1')
        payload=page.evaluate('__requests[0]')
        assert payload['birth_date']=='1984-04-11'
        assert payload['start_date']=='2027-04-11'
        assert payload['signature'].startswith('data:image/png;base64,')
        assert page.locator('#success').is_visible()
        assert not errors,errors
        passed.append('complete offline API flow: correct ISO dates and PNG payload')
        page.close();browser.close()
    for line in passed:print('PASS',line)
    print(f'{len(passed)} browser scenarios passed; no live network calls.')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--chromium',default='/usr/bin/chromium')
    run(parser.parse_args().chromium)
