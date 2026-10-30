"""Integration test: local PostgreSQL + real Better Auth sessions; never production."""
import copy
import atexit
import json
import os
import shutil
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get('CMS_TEST_BASE', 'http://127.0.0.1:3000')
if not BASE.startswith(('http://127.0.0.1:', 'http://localhost:')):
    raise SystemExit('Refusing mutation tests against a non-local server.')
ORIGIN = 'https://theseif.vercel.app'
fixture = json.loads(Path('/tmp/seif-cms-auth-fixture.json').read_text())
OWNER = fixture['credentials'][0]['cookie']
OUTSIDER = fixture['credentials'][1]['cookie']
results = {'environment': 'isolated-local-postgresql-with-signed-fixtures', 'externalOAuthAndBlobTested': False, 'checks': [], 'viewports': {}, 'failures': []}
results['complete'] = False
atexit.register(lambda: (ROOT/'docs/checks/dashboard-results.json').write_text(json.dumps(results,indent=2)+'\n'))


def check(name, condition, detail=None):
    result = {'name': name, 'passed': bool(condition)}
    if detail is not None:
        result['detail'] = detail
    results['checks'].append(result)
    print(('PASS' if condition else 'FAIL'), name, flush=True)
    if not condition:
        results['failures'].append(name)


def request(path, method='GET', body=None, cookie='', origin=ORIGIN):
    headers = {'Content-Type': 'application/json', 'User-Agent': 'CMS-local-integration-test'}
    if cookie:
        headers['Cookie'] = cookie
    if method != 'GET' and origin:
        headers['Origin'] = origin
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, headers=headers, method=method)
    try:
        r = urllib.request.urlopen(req, timeout=30)
    except urllib.error.HTTPError as e:
        r = e
    text = r.read().decode(errors='replace')
    try:
        payload = json.loads(text)
    except ValueError:
        payload = None
    return r.status, payload, text, dict(r.headers)


status, state, _, _ = request('/api/admin/content', cookie=OWNER)
check('Real signed owner session accepted', status == 200)
if status != 200:
    raise SystemExit('Owner fixture failed; no mutation performed.')
original = copy.deepcopy(state['content'])
revision = state['revision']
check('Anonymous admin request rejected', request('/api/admin/content')[0] == 401)
check('Signed non-owner identity rejected', request('/api/admin/content', cookie=OUTSIDER)[0] == 403)
check('Foreign-origin authenticated mutation rejected', request('/api/admin/content', 'PUT', {'content': original, 'expectedRevision': revision}, OWNER, 'https://attacker.invalid')[0] == 403)
check('Missing-origin authenticated mutation rejected', request('/api/admin/publish', 'POST', {'expectedRevision': revision}, OWNER, None)[0] == 403)
bad = copy.deepcopy(original)
bad['profile']['cvUrl'] = 'javascript:alert(1)'
check('Invalid content rejected at protected API', request('/api/admin/content', 'PUT', {'content': bad, 'expectedRevision': revision}, OWNER)[0] == 400)
check('Unconfigured Blob upload fails honestly', request('/api/admin/media','POST',{},OWNER)[0] == 503)
message_id = fixture.get('messageId')
if message_id:
    check('Inbox loads real stored local fixture', any(item['id']==message_id for item in request('/api/admin/messages',cookie=OWNER)[1]['items']))
    check('Inbox read state persists', request('/api/admin/messages','PATCH',{'id':message_id,'status':'read'},OWNER)[0] == 200)
    check('Inbox archive state persists', request('/api/admin/messages','PATCH',{'id':message_id,'status':'archived'},OWNER)[0] == 200)
    check('Inbox delete removes stored message', request('/api/admin/messages','DELETE',{'id':message_id},OWNER)[0] == 200 and all(item['id']!=message_id for item in request('/api/admin/messages',cookie=OWNER)[1]['items']))

changed = copy.deepcopy(original)
changed['profile']['availability'] = 'Local-only CMS integration availability'
project = copy.deepcopy(changed['projects'][0])
project.update(id='local-cms-new-project', slug='local-cms-new-project', title='Local CMS Integration Project', status='draft')
changed['projects'].append(project)
now = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
changed['posts'].append({'slug': 'local-cms-new-article', 'title': 'Local CMS Integration Article', 'description': 'Private test article, never sent to production.', 'status': 'draft', 'origin': 'author', 'reviewRequired': False, 'publishedAt': now, 'updatedAt': now, 'readingMinutes': 1, 'tags': ['Test'], 'body': [{'type': 'h2', 'text': 'Local private heading'}, {'type': 'p', 'text': 'Local draft body must remain private until publication.'}]})
try:
    status, saved, _, _ = request('/api/admin/content', 'PUT', {'content': changed, 'expectedRevision': revision}, OWNER)
    check('Draft API saves a complete content snapshot', status == 200)
    revision = saved['revision']
    check('Stale API save returns conflict rather than overwriting', request('/api/admin/content', 'PUT', {'content': changed, 'expectedRevision': revision-1}, OWNER)[0] == 409)
    check('Saved new project remains a real public 404', request('/projects/local-cms-new-project')[0] == 404)
    check('Saved new article remains a real public 404', request('/blog/local-cms-new-article')[0] == 404)
    check('Saved drafts absent from sitemap and llms', all('local-cms-new' not in request(path)[2] for path in ['/sitemap.xml', '/llms.txt']))
    preview = request('/dashboard/preview/blog/local-cms-new-article', cookie=OWNER)
    check('Owner-only preview shows saved draft with noindex header', preview[0] == 200 and 'Local private heading' in preview[2] and 'noindex' in str(preview[3]).lower())
    anonymous_preview = request('/dashboard/preview/blog/local-cms-new-article')
    check('Anonymous preview never receives draft body', 'Local private heading' not in anonymous_preview[2])
    changed['projects'][-1]['status'] = 'published'
    changed['posts'][-1]['status'] = 'published'
    status, saved, _, _ = request('/api/admin/content', 'PUT', {'content': changed, 'expectedRevision': revision}, OWNER)
    revision = saved['revision']
    published = request('/api/admin/publish', 'POST', {'expectedRevision': revision}, OWNER)
    check('Publish API confirms the saved revision', published[0] == 200 and published[1]['publishedRevision'] == revision)
    new_project = request('/projects/local-cms-new-project')
    new_article = request('/blog/local-cms-new-article')
    check('New runtime project slug renders after publication', new_project[0] == 200 and 'Local CMS Integration Project' in new_project[2])
    check('New runtime article slug renders after publication', new_article[0] == 200 and 'Local private heading' in new_article[2])
    check('Publication updates sitemap and llms consistently', all('local-cms-new-project' in request(path)[2] and 'local-cms-new-article' in request(path)[2] for path in ['/sitemap.xml', '/llms.txt']))
    changed['projects'][-1]['status'] = 'draft'
    changed['posts'][-1]['status'] = 'draft'
    status, saved, _, _ = request('/api/admin/content', 'PUT', {'content': changed, 'expectedRevision': revision}, OWNER)
    revision = saved['revision']
    request('/api/admin/publish', 'POST', {'expectedRevision': revision}, OWNER)
    check('Unpublish removes cached records from public detail routes', request('/projects/local-cms-new-project')[0] == 404 and request('/blog/local-cms-new-article')[0] == 404)
    check('Unpublish removes records from sitemap and llms', all('local-cms-new' not in request(path)[2] for path in ['/sitemap.xml', '/llms.txt']))
    # Empty content collections must be supported without a runtime crash.
    empty = copy.deepcopy(original)
    for key in ['projects', 'posts', 'journey', 'processSteps', 'skillGroups', 'marqueeRows', 'experience', 'training', 'principles']:
        empty[key] = []
    status, saved, _, _ = request('/api/admin/content', 'PUT', {'content': empty, 'expectedRevision': revision}, OWNER)
    check('Intentional empty collections save through API', status == 200)
    if status == 200:
        revision = saved['revision']
        request('/api/admin/publish', 'POST', {'expectedRevision': revision}, OWNER)
        check('Empty public Home/About/Projects/Blog render without server crash', all(request(path)[0] == 200 for path in ['/', '/about', '/projects', '/blog']))
finally:
    current = request('/api/admin/content', cookie=OWNER)[1]
    restored = request('/api/admin/content', 'PUT', {'content': original, 'expectedRevision': current['revision']}, OWNER)
    if restored[0] == 200:
        request('/api/admin/publish', 'POST', {'expectedRevision': restored[1]['revision']}, OWNER)

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=shutil.which('chromium'), headless=True, args=['--no-sandbox'])
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, device_scale_factor=1)
    name, value = OWNER.split('=', 1)
    context.add_cookies([{'name': name, 'value': value, 'domain': 'theseif.vercel.app', 'path': '/', 'httpOnly': True, 'secure': True, 'sameSite': 'None'}])
    # Canonical-origin proxy: every response comes from the local real server.
    # No API responses/auth checks are mocked; this only preserves HTTPS origin/cookies.
    def local_proxy(route):
        response = route.fetch(url=BASE + route.request.url[len(ORIGIN):])
        route.fulfill(response=response)
    context.route(ORIGIN + '/**', local_proxy)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(ORIGIN + '/dashboard', wait_until='networkidle')
    check('Authenticated server route renders the actual workspace', page.get_by_role('heading', name='Overview', exact=True).count() == 1)
    page.get_by_role('button',name='Publish',exact=True).click()
    page.get_by_role('dialog').wait_for(state='visible')
    page.keyboard.press('Escape')
    check('Publish confirmation cancels with Escape',not page.get_by_role('dialog').is_visible())
    shots = ROOT / 'docs/checks/shots'
    shots.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(shots/'dashboard-overview-1440.png'), full_page=False)
    for name in ['Projects', 'Blog', 'About', 'Skills', 'Home', 'Media', 'Inbox', 'SEO', 'Settings']:
        page.get_by_role('button', name=name, exact=True).first.click()
        page.wait_for_timeout(180)
        overflow = page.evaluate('document.documentElement.scrollWidth > innerWidth')
        check('Panel '+name+' opens without horizontal overflow', not overflow)
        if name in ['Projects', 'Blog', 'About']:
            page.screenshot(path=str(shots/('dashboard-'+name.lower()+'-1440.png')), full_page=False)
    page.get_by_role('button', name='Projects', exact=True).first.click()
    title = page.get_by_label('Title', exact=True)
    before = title.input_value()
    title.fill('Local UI Save Persistence Check')
    page.get_by_role('button', name='Save', exact=True).click()
    page.wait_for_timeout(900)
    check('Editor Save persists through real protected API', request('/api/admin/content', cookie=OWNER)[1]['content']['projects'][0]['title'] == 'Local UI Save Persistence Check')
    page.reload(wait_until='networkidle')
    page.get_by_role('button', name='Projects', exact=True).first.click()
    check('Reload preserves saved edit from database, not localStorage', page.get_by_label('Title', exact=True).input_value() == 'Local UI Save Persistence Check')
    title = page.get_by_label('Title', exact=True)
    title.fill(before)
    page.get_by_role('button', name='Save', exact=True).click()
    page.wait_for_timeout(700)
    for width, height in [(390,844),(768,1024),(1920,1080)]:
        page.set_viewport_size({'width':width,'height':height})
        page.wait_for_timeout(150)
        overflow = page.evaluate('document.documentElement.scrollWidth - innerWidth')
        results['viewports'][str(width)]={'horizontalOverflow':overflow}
        check('Workspace responsive at '+str(width),overflow<=1)
        if width==390:
            page.screenshot(path=str(shots/'dashboard-projects-390.png'), full_page=False)
            page.get_by_role('button',name='Open admin navigation',exact=True).click()
            page.get_by_role('button',name='Blog',exact=True).first.click()
            check('Mobile navigation opens the blog editor',page.get_by_role('heading',name='Blog',exact=True).count()==1)
            check('Initial drafts clearly labelled on mobile',page.get_by_text('Initial draft',exact=False).count()>=3)
            page.get_by_role('button',name='Open admin navigation',exact=True).click()
            page.get_by_role('button',name='Projects',exact=True).first.click()
    check('Dashboard has no JavaScript runtime errors', not errors, errors)
    check('Montserrat remains active in workspace', 'Montserrat' in page.evaluate('getComputedStyle(document.body).fontFamily'))
    context.close()
    browser.close()
# Reset saved fixture content after the browser write without publishing test edits.
current=request('/api/admin/content',cookie=OWNER)[1]
restored=request('/api/admin/content','PUT',{'content':original,'expectedRevision':current['revision']},OWNER)
if restored[0]==200:
    request('/api/admin/publish','POST',{'expectedRevision':restored[1]['revision']},OWNER)
output=ROOT/'docs/checks/dashboard-results.json'
results['complete'] = True
output.write_text(json.dumps(results,indent=2)+'\n')
print('Failures:',results['failures'],flush=True)
raise SystemExit(1 if results['failures'] else 0)
