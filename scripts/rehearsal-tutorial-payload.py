"""Use the new CI static build with the unchanged, proven Functions overlay."""
from pathlib import Path,PurePosixPath
import hashlib,json,sys,zipfile

config=Path(__file__).resolve().parent.parent/'config'
archive=Path(sys.argv[1]); destination=Path(sys.argv[2]).resolve(); receipt=Path(sys.argv[3])
proof=json.loads(Path(sys.argv[4]).read_text())
lock=json.loads((config/'rehearsal-tutorial-artifact-lock.json').read_text())
raw=archive.read_bytes()
assert len(raw)==lock['bytes'] and 'sha256:'+hashlib.sha256(raw).hexdigest()==lock['digest']
assert proof['classification']=='new-build-provenance-check-only' and proof['sourceAndIntentChecks']=='passed'
assert proof['frontendSha']==lock['frontendSha'] and proof['buildCommit']==lock['buildCommit']
assert proof['sourceTree']==lock['sourceTree'] and proof['artifactId']==lock['artifactId']
overlay=config/'rehearsal-retained-overlay.zip'
assert hashlib.sha256(overlay.read_bytes()).hexdigest()=='37d51e48c43b43abc6c39cbced0d3084031104db81759e27fe7e907bc6b49c61'
old_bytes=(config/'rehearsal-retained-payload.json').read_bytes()
assert hashlib.sha256(old_bytes).hexdigest()=='0c121d83d32c7c3710af49e3cf01bfb99db677f1963aa4b8d30ea3dbfb03a596'
old=json.loads(old_bytes)
retained={x['path']:x for x in old['files'] if x['source']=='retained-deployment-overlay'}
assert set(retained)=={'_headers','_routes.json','_worker.js','robots.txt'}
prefix=old['originalArtifactPrefix']
rows={}; data_by_name={}
def accept(name,data,info,source):
    parts=PurePosixPath(name).parts
    assert name and not name.startswith(('/','\\')) and '\\' not in name and '..' not in parts
    assert not any(p.startswith('.env') or p in ['private','.vercel','node_modules'] for p in parts)
    assert len(data)<25*1024*1024 and not ((info.external_attr>>16)&0o170000)==0o120000
    assert name not in data_by_name,'Duplicate deployment member'
    target=(destination/name).resolve()
    assert destination in target.parents and not target.exists(),'Unsafe path or existing output'
    data_by_name[name]=data
    rows[name]={'path':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'source':source}
with zipfile.ZipFile(archive) as original,zipfile.ZipFile(overlay) as shared:
    assert len(original.namelist())==len(set(original.namelist()))
    assert original.testzip() is None and shared.testzip() is None
    for info in original.infolist():
        if info.is_dir() or not info.filename.startswith(prefix):continue
        name=info.filename[len(prefix):]
        if name in retained:continue
        accept(name,original.read(info),info,'new-verified-ci-artifact')
    assert 'playground/index.html' in rows and 'index.html' in rows and len(rows)>200
    assert set(shared.namelist())==set(retained)
    for name,expected in retained.items():
        info=shared.getinfo(name); data=shared.read(info)
        assert len(data)==expected['bytes'] and hashlib.sha256(data).hexdigest()==expected['sha256']
        accept(name,data,info,'retained-unchanged-functions-overlay')
assert rows['_worker.js']['sha256']=='faacb7b43371e3e081259be78ce29401e99364cce96ff6d5185121d4a02b5bb2'
# Validation completes before any output directory or file is written.
for name,data in data_by_name.items():
    target=destination/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
result={'kind':'New accepted frontend build; unchanged compiled Functions reused with source equality proof','reviewedHead':lock['frontendSha'],'buildCommit':lock['buildCommit'],'sourceTree':lock['sourceTree'],'artifactId':lock['artifactId'],'artifactSha256':lock['digest'],'workerSourceCommit':'4505148c71dc06e17c3cc5359fc628d836d20410','workerFunctionsTree':'842b305a5eb9a4644fa32aa22e969574cce20cbd','workerSha256':rows['_worker.js']['sha256'],'retainedOverlaySha256':'37d51e48c43b43abc6c39cbced0d3084031104db81759e27fe7e907bc6b49c61','files':sorted(rows.values(),key=lambda row:row['path'])}
receipt.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'members':len(rows),'newBuildCommit':lock['buildCommit'],'workerBytesUnchanged':True}))
