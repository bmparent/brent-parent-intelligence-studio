"""Refresh GET-only provenance through the existing gh authorization.
No credential files or values are requested, printed, copied or configured.
"""
import datetime,json,pathlib,re,subprocess,os
root=pathlib.Path(os.environ['REHEARSAL_EVIDENCE_DIR']).resolve()
area=root/'provenance'
def api(endpoint,json_value=True):
 p=subprocess.run(['gh','api',endpoint],capture_output=True)
 if p.returncode:raise RuntimeError('Read-only GitHub request failed: '+endpoint+'; exit '+str(p.returncode))
 return json.loads(p.stdout) if json_value else p.stdout.decode('utf-8')
repo='repos/bmparent/brent-parent-intelligence-studio'
front=api(repo+'/pulls/126');back=api('repos/bmparent/eidos/pulls/83')
head=api(repo+'/git/commits/4505148c71dc06e17c3cc5359fc628d836d20410')
build=api(repo+'/git/commits/8e3ed6c0470fa696452380a9981b794eacc02c5b')
workflow=api(repo+'/contents/.github/workflows/playground-editor-release.yml?ref=8e3ed6c0470fa696452380a9981b794eacc02c5b')
run=api(repo+'/actions/runs/39072538950');artifact=api(repo+'/actions/artifacts/12115683862')
job=api(repo+'/actions/jobs/117512941864')
logs=api(repo+'/actions/jobs/117512941864/logs',False)
excerpt='\n'.join(l for l in logs.splitlines() if re.search(r'refs/remotes/pull/126/merge|HEAD is now at 8e3ed6c|git log -1 --format=%H|^\S+ 8e3ed6c0470fa696452380a9981b794eacc02c5b$',l))+'\n'
now=datetime.datetime.now(datetime.timezone.utc)
proof={'schemaVersion':1,'observedAt':now.isoformat(),'frontendPR':front,'backendPR':back,'headCommit':head,'buildCommit':build,'producerWorkflow':{'path':workflow['path'],'sha':workflow['sha']},'job':job,'checkoutLogExcerpt':excerpt}
payloads={'source-evidence.json':proof,'run.json':run,'artifact.json':artifact}
initial=area/'captures/initial'
if not initial.exists():
 initial.mkdir(parents=True)
 for name in payloads:
  p=area/name
  if p.exists():(initial/name).write_bytes(p.read_bytes())
capture=area/'captures'/now.strftime('%Y%m%dT%H%M%S%fZ');capture.mkdir(parents=True)
for name,value in payloads.items():
 b=(json.dumps(value,indent=2)+'\n').encode()
 (capture/name).write_bytes(b);(area/name).write_bytes(b)
(capture/'checkout-log-excerpt.txt').write_text(excerpt,encoding='utf-8')
print(json.dumps({'observedAt':proof['observedAt'],'frontendHead':front['head']['sha'],'backendHead':back['head']['sha'],'headTree':head['tree']['sha'],'buildTree':build['tree']['sha'],'runAttempt':run['run_attempt'],'capture':str(capture)},indent=2))
