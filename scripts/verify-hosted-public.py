"""Read-only hosted preview smoke. Usage: python scripts/verify-hosted-public.py URL OUTPUT_DIR"""
import json
import pathlib
import sys
from datetime import datetime, timezone
from playwright.sync_api import sync_playwright

base = sys.argv[1].rstrip('/')
out = pathlib.Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
routes = [
    '/', '/services/digital-experiences', '/services/business-systems',
    '/services/intelligent-systems', '/insights',
    '/insights/storefront-ux-find-right-product-faster', '/playground', '/account',
]
report = {'checkedAt': datetime.now(timezone.utc).isoformat(), 'base': base,
          'browser': 'Playwright Chromium viewport emulation; no physical device', 'checks': []}

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    for width, height in [(390, 844), (768, 1024), (1440, 900)]:
        context = browser.new_context(viewport={'width': width, 'height': height},
                                      device_scale_factor=1, reduced_motion='reduce')
        for route in routes:
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            try:
                # Turnstile keeps the account page connected while checking the browser.
                # A quiet network is not a valid readiness condition for that route.
                response = page.goto(base + route, wait_until='domcontentloaded' if route == '/account' else 'networkidle', timeout=30000)
                page.wait_for_timeout(1200 if route == '/account' else 250)
                result = page.evaluate("""() => ({
                    title: document.title,
                    heading: document.querySelector('h1')?.textContent?.trim() ||
                        document.querySelector('iframe')?.contentDocument?.querySelector('h1')?.textContent?.trim() || '',
                    documentWidth: document.documentElement.scrollWidth,
                    viewportWidth: innerWidth,
                    brokenImages: [...document.images].filter(image => image.complete && image.naturalWidth === 0).map(image => image.currentSrc),
                    overlay: !!document.querySelector('vite-error-overlay, nextjs-portal')
                })""")
                if route == '/playground' and not result['heading']:
                    result['heading'] = page.frame_locator('iframe').locator('h1').first.inner_text(timeout=3000).strip()
                check = {'route': route, 'viewport': width, 'status': response.status if response else None,
                         **result, 'pageErrors': errors}
                check['passed'] = (check['status'] == 200 and bool(check['heading'])
                                   and check['documentWidth'] <= width + 1
                                   and not check['brokenImages'] and not check['overlay'] and not errors)
                report['checks'].append(check)
                if width in (390, 1440) and route in ('/services/business-systems', '/insights', '/account'):
                    label = route.strip('/').replace('/', '-')
                    page.screenshot(path=str(out / f'{label}-{width}.png'), full_page=False)
                if width == 390 and route == '/insights':
                    page.get_by_label('Search Insights').fill('no-such-topic-20260923')
                    page.get_by_role('button', name='Search', exact=True).click()
                    empty = page.get_by_text('No stories match these filters.').is_visible()
                    query = 'q=no-such-topic-20260923' in page.url
                    page.get_by_role('button', name='Clear search and topic').click()
                    cleared = 'q=' not in page.url and page.get_by_text('No stories match these filters.').count() == 0
                    report['checks'].append({'interaction': 'Insights search, empty state, clear',
                                             'viewport': width, 'empty': empty, 'queryInUrl': query,
                                             'cleared': cleared, 'passed': empty and query and cleared})
                if width == 390 and route == '/':
                    menu = page.get_by_role('button', name='Menu')
                    menu.click()
                    opened = page.get_by_role('button', name='Close').is_visible()
                    page.keyboard.press('Escape')
                    closed = page.get_by_role('button', name='Menu').is_visible()
                    focused = page.evaluate("document.activeElement?.classList.contains('ew-menu-toggle')")
                    report['checks'].append({'interaction': 'mobile menu open, Escape, focus return',
                                             'viewport': width, 'opened': opened, 'closed': closed,
                                             'focused': focused, 'passed': opened and closed and focused})
            except Exception as error:
                report['checks'].append({'route': route, 'viewport': width, 'passed': False,
                                         'error': str(error)[:1000]})
            finally:
                page.close()
        context.close()
    browser.close()

report['passed'] = all(check['passed'] for check in report['checks'])
(out / 'hosted-public-browser.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(f"{sum(check['passed'] for check in report['checks'])}/{len(report['checks'])} hosted browser checks passed")
for check in report['checks']:
    if not check['passed']:
        print(json.dumps(check))
sys.exit(0 if report['passed'] else 1)
