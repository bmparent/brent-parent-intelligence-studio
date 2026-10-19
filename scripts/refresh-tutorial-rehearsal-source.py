"""Refresh GET-only provenance through the existing gh authorization.
No credential files or values are requested, printed, copied or configured.
"""
import datetime,json,pathlib,re,subprocess,os
root=pathlib.Path(os.environ['REHEARSAL_EVIDENCE_DIR']).resolve()
area=root/'provenance'
supports_escape_flag=b'--allow-escape-sequences' in subprocess.run(['gh','api','--help'],capture_output=True).stdout
def api(endpoint,json_value=True):
 args=['gh','api',endpoint]
 if not json_value and supports_escape_flag:args.append('--allow-escape-sequences')
 p=subprocess.run(args,capture_output=True)
 if p.returncode:
  detail=re.sub(r'https?://\S+','[provider-url]',p.stderr.decode('utf-8','replace'))[:1000]
  raise RuntimeError('Read-only GitHub request failed: '+endpoint+'; exit '+str(p.returncode)+'; '+detail)
 # Log bytes are captured as data, never emitted as terminal control sequences.
 return json.loads(p.stdout) if json_value else re.sub(r'\x1b\[[0-?]*[ -/]*[@-~]','',p.stdout.decode('utf-8'))
repo='repos/bmparent/brent-parent-intelligence-studio'
front=api(repo+'/pulls/128');back=api('repos/bmparent/eidos/pulls/83')
head=api(repo+'/git/commits/3c09fa425f3f41f40ae89d9ea6116cf3200a91d7')
build=api(repo+'/git/commits/d6acd7e094f2ba6bf3bb6b396685caf46b9525bf')
workflow=api(repo+'/contents/.github/workflows/playground-editor-release.yml?ref=d6acd7e094f2ba6bf3bb6b396685caf46b9525bf')
run=api(repo+'/actions/runs/39196752070');artifact=api(repo+'/actions/artifacts/12163006075')
job=api(repo+'/actions/jobs/117881075137')
logs=api(repo+'/actions/jobs/117881075137/logs?fresh='+datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d%H%M%S'),False)
excerpt='\n'.join(l for l in logs.splitlines() if re.search(r'refs/remotes/pull/128/merge|HEAD is now at d6acd7e|git log -1 --format=%H|^\S+ d6acd7e094f2ba6bf3bb6b396685caf46b9525bf$',l))+'\n'
gates={'.github/workflows/playground-editor-release.yml':('local-editor',39196752070),'.github/workflows/quality.yml':('verify',39196752062),'.github/workflows/playground-purchase-readiness.yml':('purchase-fixtures',39196752057),'.github/workflows/wellway.yml':('wellway',39196752059)}
workflow_runs=api(repo+'/actions/runs?head_sha=3c09fa425f3f41f40ae89d9ea6116cf3200a91d7&per_page=100')['workflow_runs']
checks=[]
for workflow_path,(name,expected_id) in gates.items():
 records=[r for r in workflow_runs if r['path']==workflow_path and r['id']==expected_id]
 assert len(records)==1,'Exact required workflow run missing: '+name
 r=records[0]
 checks.append({'name':name,'kind':'authenticated Actions workflow gate','status':r['status'].upper(),'conclusion':str(r['conclusion']).upper(),'headSha':r['head_sha'],'runId':r['id'],'runAttempt':r['run_attempt'],'workflowPath':workflow_path,'url':r['html_url']})
comparison=api(repo+'/compare/4505148c71dc06e17c3cc5359fc628d836d20410...3c09fa425f3f41f40ae89d9ea6116cf3200a91d7')
assert comparison['base_commit']['sha']=='4505148c71dc06e17c3cc5359fc628d836d20410' and comparison['merge_base_commit']['sha']=='4505148c71dc06e17c3cc5359fc628d836d20410'
functions={}
for label,sha in [('base','4505148c71dc06e17c3cc5359fc628d836d20410'),('current','3c09fa425f3f41f40ae89d9ea6116cf3200a91d7')]:
 functions[label]=next(x['sha'] for x in api(repo+'/git/trees/'+sha)['tree'] if x['path']=='functions' and x['type']=='tree')
now=datetime.datetime.now(datetime.timezone.utc)
proof={'schemaVersion':1,'observedAt':now.isoformat(),'frontendPR':front,'backendPR':back,'headCommit':head,'buildCommit':build,'producerWorkflow':{'path':workflow['path'],'sha':workflow['sha']},'job':job,'checkoutLogExcerpt':excerpt,'checks':checks,'functions':functions,'comparison':{'base':'4505148c71dc06e17c3cc5359fc628d836d20410','head':'3c09fa425f3f41f40ae89d9ea6116cf3200a91d7','files':[x['filename'] for x in comparison['files']]}}
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
