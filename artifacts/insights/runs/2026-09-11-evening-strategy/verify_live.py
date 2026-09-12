"""Run from the repository root after deployment; reads public pages only."""
import html
import json
import pathlib
import re
import urllib.request
from datetime import datetime, timezone

out = pathlib.Path(__file__).parent
article = next(a for a in json.loads(pathlib.Path('src/data/articles.json').read_text(encoding='utf-8')) if a['slug'] == 'ai-agent-permissions-before-pilot')
base = 'https://eidos-works.com'
results = []
pages = {}
for path in [article['canonicalPath'], '/insights/', '/feed.xml', '/sitemap.xml', '/robots.txt', article['ogImage'], article['cta']['href'], '/', '/work/', '/playground/', '/work/nighttime-spectaculars/', '/work/holidays-in-hollywood/']:
    request = urllib.request.Request(base + path, headers={'User-Agent': 'EidosWorksProductionVerifier/1.0'})
    with urllib.request.urlopen(request, timeout=45) as response:
        text = response.read().decode('utf-8')
        pages[path] = text
        robots_header = response.headers.get('X-Robots-Tag', '')
        if path == article['canonicalPath']:
            assert 'noindex' not in robots_header.lower()
        results.append({'path': path, 'status': response.status, 'finalUrl': response.url, 'xRobotsTag': robots_header})
page = pages[article['canonicalPath']]
visible = ' '.join(html.unescape(re.sub(r'<[^>]+>', ' ', page)).split())
paragraphs = [p for section in article['body'] for p in [section['heading'], *section.get('paragraphs', []), *section.get('bullets', [])]]
missing = [p for p in paragraphs if ' '.join(p.split()) not in visible]
assert not missing, f'Missing {len(missing)} body paragraphs'
assert article['byline'] in visible
assert not re.search(r'<meta[^>]*name="robots"[^>]*content="[^"]*noindex', page, re.I)
assert f'href="{base + article["canonicalPath"]}"' in page
schemas = [json.loads(block) for block in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', page, re.S)]
nodes = [node for schema in schemas for node in schema.get('@graph', [schema])]
posting = next(node for node in nodes if node.get('@type') in ['Article', 'BlogPosting'])
assert posting['headline'] == article['title']
assert posting['datePublished'] == article['publishedAt']
assert posting['dateModified'] == article['updatedAt']
assert article['byline'] in json.dumps(posting['author'])
assert 'Disallow: /insights' not in pages['/robots.txt']
assert article['slug'] in pages['/insights/']
assert article['slug'] in pages['/feed.xml']
assert article['slug'] in pages['/sitemap.xml']
assert f'href="{article["cta"]["href"]}"' in page
assert '<h1' in pages[article['cta']['href']]
for source in article['sources']:
    assert html.escape(source['url'], quote=True) in page or source['url'] in page
receipt = {'time': datetime.now(timezone.utc).isoformat(), 'passed': True, 'article': article['title'], 'url': base + article['canonicalPath'], 'bodyParagraphsChecked': len(paragraphs), 'byline': article['byline'], 'sourceLinksChecked': len(article['sources']), 'ctaDestination': article['cta']['href'], 'pages': results}
(out / 'production-evidence.json').write_text(json.dumps(receipt, indent=2) + '\n', encoding='utf-8')
print(json.dumps(receipt, indent=2))
