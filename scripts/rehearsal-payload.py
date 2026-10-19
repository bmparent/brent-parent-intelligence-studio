"""Hash and safely extract the retained payload; never rebuild or relabel it."""
from pathlib import Path
import sys,hashlib,json,zipfile
archive=Path(sys.argv[1]);destination=Path(sys.argv[2]).resolve();receipt=Path(sys.argv[3])
raw=archive.read_bytes()
assert len(raw)==10105195
assert hashlib.sha256(raw).hexdigest()=='46d7288502a784383d56897f967af35888a12d916e1732acf94b512cadef262f'
rows=[]
with zipfile.ZipFile(archive) as source:
    members=[i for i in source.infolist() if not i.is_dir()]
    assert len(members)==274
    assert len(set(i.filename for i in members))==274
    for item in members:
        name=item.filename;target=(destination/name).resolve()
        assert not name.startswith(('/','\\')) and '\\' not in name and '..' not in Path(name).parts
        assert destination in target.parents
        assert not any(p.startswith('.env') or p in ['private','.vercel','node_modules'] for p in Path(name).parts)
        assert item.file_size<25*1024*1024 and not ((item.external_attr>>16)&0o170000)==0o120000
        data=source.read(item);digest=hashlib.sha256(data).hexdigest()
        if name=='_worker.js':assert digest=='faacb7b43371e3e081259be78ce29401e99364cce96ff6d5185121d4a02b5bb2'
        assert not target.exists(),'Refusing to overwrite an extracted payload'
        target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
        rows.append({'path':name,'bytes':len(data),'sha256':digest})
assert any(x['path']=='_worker.js' for x in rows)
receipt.write_text(json.dumps({'originalZipSha256':hashlib.sha256(raw).hexdigest(),'buildCommit':'8e3ed6c0470fa696452380a9981b794eacc02c5b','reviewedHead':'4505148c71dc06e17c3cc5359fc628d836d20410','files':rows},indent=2))
print('Original payload and all 274 extracted member hashes verified.')
