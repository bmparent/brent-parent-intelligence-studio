"""Repo-root browser acceptance using the already installed Python Playwright.

python scripts/verify-template-browser.py --base http://127.0.0.1:5190
Local lab timings are not field performance or an accessibility certification.
"""
import argparse
import atexit
import json
import re
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base', default='http://127.0.0.1:5190')
parser.add_argument('--out', default='artifacts/templates/browser')
parser.add_argument('--browsers', default='chromium,firefox,webkit')
args = parser.parse_args()
out = Path(args.out)
out.mkdir(parents=True, exist_ok=True)
catalog = json.loads(Path('products/templates/catalog.json').read_text(encoding='utf-8'))
report = {'base': args.base, 'scope': 'rendered static/source and shop, no provider transactions',
          'browserRoute': 'Python Playwright fallback; in-app browser timed out at 30 seconds',
          'checks': [], 'failures': [], 'performance': [], 'limitations': ['Local lab only; no field metrics or certification.']}
report['result'] = 'incomplete'
def save_receipt():
    (out / 'browser-receipt.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
atexit.register(save_receipt)

def require(condition, message):
    if not condition:
        raise AssertionError(message)

def open_page(page, path):
    start = time.monotonic()
    response = page.goto(args.base.rstrip('/') + path, wait_until='domcontentloaded', timeout=90000)
    page.locator('h1').first.wait_for(timeout=60000)
    require(response and response.status in (200, 304), f'{path}: expected HTTP 200/304, got {response.status if response else None}')
    require(page.locator('h1').count() == 1, f'{path}: expected one h1')
    page.evaluate('document.fonts.ready')
    report['performance'].append({'path': path, 'navigationToHeadingMs': round((time.monotonic()-start)*1000), 'conditions': 'local desktop, domcontentloaded + visible h1; not LCP/INP'})

def no_overflow(page, label):
    dimensions = page.evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth})')
    require(dimensions['scroll'] <= dimensions['width'] + 2, f'{label}: horizontal overflow {dimensions}')
    heading = page.locator('h1').first.bounding_box()
    require(heading and heading['x'] >= -2 and heading['x'] + heading['width'] <= dimensions['width'] + 2, f'{label}: heading clipped {heading}')


def original_headline_words(page):
    # Bounds alone missed a readable-width word being split by overflow-wrap.
    # Inspect each normal demo word before inserting long-copy stress fixtures.
    words = page.evaluate(r"""() => {
      const heading=document.querySelector('.hero h1');
      const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT), words=[];
      for(let node=walker.nextNode();node;node=walker.nextNode()) {
        for(const match of node.textContent.matchAll(/\S+/g)) {
          const range=document.createRange();
          range.setStart(node,match.index);range.setEnd(node,match.index+match[0].length);
          const rects=[...range.getClientRects()].filter(r=>r.width>0&&r.height>0);
          words.push({word:match[0],lineFragments:new Set(rects.map(r=>Math.round(r.y))).size});
        }
      }
      return words;
    }""")
    require(words, 'Original headline has no measurable words')
    require(all(word['lineFragments'] == 1 for word in words), f'Original headline splits a word: {words}')
    return words


def nightjar_breakpoint_words(browser, browser_name):
    context = browser.new_context(viewport={'width':641,'height':844}, reduced_motion='reduce')
    try:
        page = context.new_page()
        open_page(page, '/template-demos/nightjar/index.html')
        no_overflow(page, f'{browser_name}/nightjar/641')
        words = original_headline_words(page)
        report['checks'].append({'browser':browser_name,'product':'nightjar','viewport':641,
                                 'scope':'immediate phone breakpoint',
                                 'originalHeadlineWords':'passed','words':words})
    finally:
        context.close()

def night_text_contrast(page):
    # Inspect rendered inherited colors, including inline configured day tokens.
    # Merely checking data-theme missed the original unreadable night palette.
    values = page.evaluate('''() => {
      const rgb = value => value.match(/[\\d.]+/g).map(Number);
      const luminance = value => rgb(value).slice(0,3).map(v => {
        v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
      }).reduce((sum,v,i) => sum + v * [.2126,.7152,.0722][i],0);
      const background = element => {
        for(let current=element;current;current=current.parentElement) {
          const color=getComputedStyle(current).backgroundColor, channels=rgb(color);
          if(channels.length===3 || channels[3]===1) return color;
        }
        return 'rgb(255,255,255)';
      };
      return [...document.querySelectorAll('.hero h1,.hero .lede,.card p,.card h3,.card a,.site-header a,.site-header button')]
        .filter(el=>el.getClientRects().length).map(el=>{
          const fg=getComputedStyle(el).color,bg=background(el),a=luminance(fg),b=luminance(bg);
          return {text:el.textContent.trim().slice(0,80),foreground:fg,background:bg,
            ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),minimum:el.tagName==='H1'?3:4.5};
        });
    }''')
    require(values, 'No rendered night-mode text samples')
    for value in values:
        require(value['ratio'] >= value['minimum'], f'Night-mode text contrast failed: {value}')
    return values


def shop_catalog_contract(page, width):
    # Mock only the read-only catalog. Terms/challenge remain untouched and no
    # checkout request is made. Exercise both initial and corrected versions.
    checkout_requests = []
    def observe(request):
        if '/api/shop/checkout' in request.url:
            checkout_requests.append(request.method)
    page.on('request', observe)
    try:
        for slug in ['switchboard', 'nightjar']:
            product = next(item for item in catalog['products'] if item['slug'] == slug)
            edition = next(item for item in product['editions'] if item['platform'] == 'developer')
            expected = {'id': edition['id'], 'available': True,
                        'priceCents': edition['draftPriceCents'],
                        'version': edition.get('version', '1.0.0')}
            for case in ['matching', 'stale-version', 'wrong-price', 'unavailable']:
                offered = dict(expected)
                if case == 'stale-version':
                    offered['version'] = '0.0.0-stale'
                elif case == 'wrong-price':
                    offered['priceCents'] += 100
                elif case == 'unavailable':
                    offered['available'] = False
                payload = {'mode': 'test', 'ready': True, 'editions': [offered]}
                def fulfill(route):
                    route.fulfill(status=200, content_type='application/json', body=json.dumps(payload))
                page.route('**/api/shop/catalog', fulfill)
                try:
                    with page.expect_response(lambda response: response.url.endswith('/api/shop/catalog')) as received:
                        open_page(page, '/shop/' + slug)
                    require(received.value.status == 200, 'Mock catalog was not read')
                    received.value.finished()
                    page.evaluate('() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
                    label = re.compile(r'^Try TEST checkout') if case == 'matching' else 'Purchasing unavailable'
                    button = page.get_by_role('button', name=label, exact=True)
                    button.wait_for(state='visible', timeout=15000)
                    require(button.is_disabled(), 'Readiness must not bypass ordinary terms/challenge')
                    if case != 'matching':
                        require(page.get_by_role('button', name=re.compile(r'^Try TEST checkout')).count() == 0,
                                'Mismatched or unavailable catalog enabled checkout')
                    report['checks'].append({'scope': 'mocked TEST catalog contract', 'product': slug,
                                             'viewport': width, 'case': case, 'version': expected['version'],
                                             'result': 'passed', 'checkoutSubmitted': False,
                                             'challengeInteracted': False})
                finally:
                    page.unroute('**/api/shop/catalog', fulfill)
        require(not checkout_requests, 'Catalog-only checks must not submit checkout')
    finally:
        page.remove_listener('request', observe)


def turnstile_action_contract(browser, width):
    # Observe component render options only. The spy issues no token and never
    # invokes callbacks; production verification and submit paths are untouched.
    context = browser.new_context(viewport={'width': width, 'height': 844})
    context.add_init_script("""(() => {
      window.__qaTurnstileActions = [];
      window.turnstile = {
        render: (_element, options) => {
          window.__qaTurnstileActions.push(options.action);
          return 'qa-options-only-widget';
        },
        remove: () => {}, reset: () => {}
      };
    })();""")
    config = {'gaMeasurementId': '', 'turnstileSiteKey': 'qa-options-only-placeholder',
              'communityReady': False, 'accountsReady': False, 'aiReady': False,
              'shopReady': False, 'localTest': False}
    context.route('**/api/public-config', lambda route: route.fulfill(
        status=200, content_type='application/json', body=json.dumps(config)))
    context.route('**/api/shop/catalog', lambda route: route.fulfill(
        status=200, content_type='application/json',
        body=json.dumps({'mode': 'test', 'ready': False, 'editions': []})))
    page = context.new_page()
    submitted = []
    page.on('request', lambda request: submitted.append(request.url)
            if request.method == 'POST' and any(path in request.url for path in
                ['/api/shop/checkout', '/api/shop/recover']) else None)
    try:
        for path, action, label in [('/shop/nightjar', 'checkout', 'Purchasing unavailable'),
                                     ('/shop/start', 'recovery', 'Send a private recovery link')]:
            open_page(page, path)
            page.wait_for_function('window.__qaTurnstileActions.length > 0', timeout=15000)
            observed = page.evaluate('window.__qaTurnstileActions')
            require(set(observed) == {action}, f'{path}: wrong widget action {observed}; expected {action}')
            require(page.get_by_role('button', name=label, exact=True).is_disabled(),
                    'Options-only widget spy must not enable submission')
            require(not submitted, 'Action contract must not submit payment or recovery')
            report['checks'].append({'scope': 'Turnstile component action contract',
                                     'path': path, 'viewport': width, 'expectedAction': action,
                                     'observedActions': observed, 'result': 'passed',
                                     'challengeCallbackInvoked': False, 'tokensIssued': 0,
                                     'paymentOrRecoverySubmitted': False})
    finally:
        context.close()

with sync_playwright() as playwright:
    for browser_name in args.browsers.split(','):
        browser = getattr(playwright, browser_name).launch()
        for width, height in [(1440, 1000), (390, 844)]:
            context = browser.new_context(viewport={'width': width, 'height': height}, reduced_motion='reduce')
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            for product in catalog['products']:
                slug = product['slug']
                try:
                    open_page(page, f'/template-demos/{slug}/index.html')
                    no_overflow(page, f'{browser_name}/{slug}/{width}')
                    words = original_headline_words(page)
                    report['checks'].append({'browser':browser_name,'product':slug,'viewport':width,'originalHeadlineWords':'passed','words':words})
                    for picture in page.locator('img').all():
                        picture.scroll_into_view_if_needed()
                        picture.evaluate('(i)=>i.decode()')
                        require(picture.evaluate('(i)=>i.complete&&i.naturalWidth>0'), 'Source image failed to load')
                    page.evaluate('scrollTo(0,0)')
                    if slug == 'switchboard':
                        page.locator('[data-problem="repair"]').click()
                        require(page.locator('[data-service]:visible').count() == 1, 'Service selection did not narrow to one service')
                    elif slug == 'tideglass':
                        page.locator('button[data-time="evening"]').click()
                        require(page.locator('.hero').get_attribute('data-time') == 'evening', 'Scene did not change')
                    elif slug == 'matter':
                        page.locator('[data-material="timber"]').click()
                        require('timber.svg' in page.locator('[data-material-image]').get_attribute('src'), 'Material did not change')
                        page.locator('[data-lens]').focus()
                        page.keyboard.press('Enter')
                        require(page.locator('[data-lens]').get_attribute('aria-pressed') == 'true', 'Keyboard lens did not respond')
                    else:
                        page.locator('[data-theme-toggle]').click()
                        require(page.locator('body').get_attribute('data-theme') == 'night', 'Day/night did not change')
                        contrast = night_text_contrast(page)
                        report['checks'].append({'browser': browser_name, 'product': slug, 'viewport': width, 'nightModeComputedTextContrast': 'passed', 'samples': contrast})
                        page.locator('[data-program="sound"]').click()
                        require(page.locator('[data-event]:visible').count() >= 1, 'Program filter lost events')
                    if width == 390:
                        page.locator('.nav-toggle').click()
                        require(page.locator('.nav-toggle').get_attribute('aria-expanded') == 'true', 'Phone navigation did not open')
                        page.keyboard.press('Escape')
                        require(page.locator('.nav-toggle').get_attribute('aria-expanded') == 'false', 'Escape did not close navigation')
                    page.screenshot(path=str(out / f'{browser_name}-{slug}-{width}.jpg'), full_page=True, type='jpeg', quality=75)
                    # Long copy is a stress fixture; this does not personalize any archive.
                    page.locator('h1').evaluate("e=>e.textContent='A considered, exceptionally long business headline with enough detail to test a narrow phone screen'")
                    no_overflow(page, f'{slug} long-headline/{width}')
                    for html in Path(f'products/templates/{slug}/developer').glob('*.html'):
                        open_page(page, f'/template-demos/{slug}/{html.name}')
                        no_overflow(page, f'{slug}/{html.name}/{width}')
                    require(not errors, f'Runtime errors: {errors}')
                    report['checks'].append({'browser': browser_name, 'product': slug, 'viewport': [width,height], 'pages': 6, 'interaction': 'passed', 'navigation': 'passed', 'overflow': 'passed', 'console': 'passed'})
                except Exception as error:
                    report['failures'].append({'browser': browser_name, 'product': slug, 'viewport': width, 'error': str(error)})
                    print(f'FAIL {browser_name}/{slug}/{width}: {error}', flush=True)
            if browser_name == 'chromium':
                try:
                    open_page(page, '/shop')
                    require(page.locator('.et-product').count() == 4, 'Collection should contain four families')
                    for preview in page.locator('.et-preview iframe').all():
                        preview.scroll_into_view_if_needed()
                        preview.content_frame.locator('h1').wait_for(state='visible', timeout=30000)
                    report['checks'].append({'scope':'actual catalog iframe previews','viewport':width,'result':'passed'})
                    page.get_by_label('Your business').select_option(label='Makers')
                    require(page.locator('.et-product').count() == 1, 'Market filter failed')
                    require('Matter' in page.locator('.et-product').inner_text(), 'Wrong product after filter')
                    page.screenshot(path=str(out / f'shop-filter-{width}.jpg'), full_page=True, type='jpeg', quality=75)
                    page.get_by_label('Your business').select_option('all')
                    no_overflow(page, f'shop/{width}')
                    page.evaluate('scrollTo(0,0)')
                    page.screenshot(path=str(out / f'shop-{width}.jpg'), full_page=True, type='jpeg', quality=75)
                    for product in catalog['products']:
                        open_page(page, '/shop/' + product['slug'])
                        require(page.get_by_role('button', name='Purchasing unavailable').is_disabled(), 'Checkout must fail closed')
                        page.get_by_label('Platform & package').select_option(product['slug'] + '-wordpress-v1')
                        require('WordPress' in page.locator('.et-purchase').inner_text(), 'Edition state failed')
                        no_overflow(page, f'detail/{product["slug"]}/{width}')
                        page.screenshot(path=str(out / f'detail-{product["slug"]}-{width}.jpg'), full_page=True, type='jpeg', quality=75)
                    shop_catalog_contract(page, width)
                    turnstile_action_contract(browser, width)
                    open_page(page, '/shop/start')
                    require(page.get_by_role('button', name='Send a private recovery link').is_disabled(), 'Recovery must require verification')
                    report['checks'].append({'browser': browser_name, 'scope': 'shop', 'viewport': width, 'filter': 'passed', 'editions': 'passed', 'closedCheckout': 'passed', 'recovery': 'passed'})
                except Exception as error:
                    report['failures'].append({'browser': browser_name, 'scope': 'shop', 'viewport': width, 'error': str(error)})
                    print(f'FAIL shop/{width}: {error}', flush=True)
            context.close()
        nightjar_breakpoint_words(browser, browser_name)
        if browser_name == 'chromium':
            context = browser.new_context(java_script_enabled=False, viewport={'width':390,'height':844})
            page = context.new_page()
            for product in catalog['products']:
                try:
                    open_page(page, '/template-demos/' + product['slug'] + '/index.html')
                    require(page.locator('.site-nav').is_visible(), 'No-JS navigation must be visible')
                    require(page.locator('a[href="contact.html"]').count() > 0, 'No-JS contact path missing')
                    no_overflow(page, 'noJS/' + product['slug'])
                    report['checks'].append({'product':product['slug'], 'noJavaScript':'passed'})
                except Exception as error:
                    report['failures'].append({'scope':'noJavaScript', 'product':product['slug'], 'error':str(error)})
            context.close()
        browser.close()
report['result'] = 'passed' if not report['failures'] else 'failed'
(out / 'browser-receipt.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'result':report['result'],'checks':len(report['checks']),'failures':report['failures']}, indent=2), flush=True)
raise SystemExit(1 if report['failures'] else 0)
