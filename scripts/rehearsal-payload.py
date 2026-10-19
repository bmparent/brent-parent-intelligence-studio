"""Recover exact retained members from their two original sources; never rebuild."""
from pathlib import Path
import sys,hashlib,json,zipfile
archive=Path(sys.argv[1]);destination=Path(sys.argv[2]).resolve();receipt=Path(sys.argv[3])
raw=archive.read_bytes();assert len(raw)==62120784
assert hashlib.sha256(raw).hexdigest()=='c1950dd2a20922bd9738f5a5ec4ec8628bae815dc358e9c6cae9cdb9b04ec913'
config=Path(__file__).resolve().parent.parent/'config'
manifest_bytes=(config/'rehearsal-retained-payload.json').read_bytes()
assert hashlib.sha256(manifest_bytes).hexdigest()=='0c121d83d32c7c3710af49e3cf01bfb99db677f1963aa4b8d30ea3dbfb03a596'
manifest=json.loads(manifest_bytes)
overlay=config/'rehearsal-retained-overlay.zip'
assert hashlib.sha256(overlay.read_bytes()).hexdigest()==manifest['retainedOverlaySha256']=='37d51e48c43b43abc6c39cbced0d3084031104db81759e27fe7e907bc6b49c61'
assert manifest['originalPreparedZipSha256']=='46d7288502a784383d56897f967af35888a12d916e1732acf94b512cadef262f'
members=manifest['files'];assert len(members)==len(set(i['path'] for i in members))==274
required_overlay={'_headers','_routes.json','_worker.js','robots.txt'}
rows=[];verified=[]
with zipfile.ZipFile(archive) as original,zipfile.ZipFile(overlay) as retained:
    assert set(retained.namelist())==required_overlay
    for item in members:
        name=item['path'];target=(destination/name).resolve()
        assert not name.startswith(('/','\\')) and '\\' not in name and '..' not in Path(name).parts
        assert destination in target.parents
        assert not any(p.startswith('.env') or p in ['private','.vercel','node_modules'] for p in Path(name).parts)
        if item['source']=='retained-deployment-overlay':
            assert name in required_overlay
            info=retained.getinfo(name);data=retained.read(info)
        else:
            assert item['source']=='original-ci-artifact' and name not in required_overlay
            info=original.getinfo(manifest['originalArtifactPrefix']+name);data=original.read(info)
        assert info.file_size<25*1024*1024 and not ((info.external_attr>>16)&0o170000)==0o120000
        digest=hashlib.sha256(data).hexdigest();assert digest==item['sha256'];assert len(data)==item['bytes']
        if name=='_worker.js':assert digest=='faacb7b43371e3e081259be78ce29401e99364cce96ff6d5185121d4a02b5bb2'
        assert not target.exists(),'Refusing to overwrite an extracted payload'
        verified.append((target,data))
        rows.append({'path':name,'bytes':len(data),'sha256':digest})
assert any(x['path']=='_worker.js' for x in rows)
for target,data in verified:target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
receipt.write_text(json.dumps({'originalArtifactSha256':hashlib.sha256(raw).hexdigest(),'originalPreparedZipSha256':manifest['originalPreparedZipSha256'],'retainedManifestSha256':hashlib.sha256(manifest_bytes).hexdigest(),'retainedOverlaySha256':manifest['retainedOverlaySha256'],'kind':'Exact prepared payload members assembled; original archives unchanged; no source rebuild','buildCommit':'8e3ed6c0470fa696452380a9981b794eacc02c5b','reviewedHead':'4505148c71dc06e17c3cc5359fc628d836d20410','files':rows},indent=2))
print('Original artifact, four retained overlay files and all 274 prepared member hashes verified.')
