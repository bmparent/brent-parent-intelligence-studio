import hashlib, json, pathlib, urllib.request, zipfile, datetime

from runtime_args import arguments
root, _ = arguments()
version = '10.11.19'
name = f'mariadb-{version}-winx64.zip'
url = 'https://dlm.mariadb.com/4800088/MariaDB/mariadb-10.11.19/winx64-packages/' + name
sums_url = 'https://dlm.mariadb.com/4800090/MariaDB/mariadb-10.11.19/winx64-packages/sha256sums.txt'
expected = '398ea30e5036010bbebe01d2b1804280424dcc2626e36d8e95155c04d25a0490'
sums = urllib.request.urlopen(sums_url, timeout=60).read().decode('utf-8')
metadata = {line.split()[1].removeprefix('./'): line.split()[0] for line in sums.splitlines() if line.strip()}
assert metadata.get(name) == expected, 'Official checksum metadata differs from pinned expectation'
(root / 'mariadb-sha256sums.txt').write_text(sums, encoding='utf-8')
target = root / name
if not target.exists():
    with urllib.request.urlopen(url, timeout=120) as response, target.open('xb') as dest:
        while chunk := response.read(1024 * 1024):
            dest.write(chunk)
actual = hashlib.file_digest(target.open('rb'), 'sha256').hexdigest()
assert actual == expected, 'MariaDB ZIP checksum mismatch'
extract = root / 'mariadb'
if not extract.exists():
    extract.mkdir()
    with zipfile.ZipFile(target) as archive:
        for info in archive.infolist():
            resolved = (extract / info.filename).resolve()
            assert resolved.is_relative_to(extract.resolve()), 'Unsafe ZIP path'
        archive.extractall(extract)
receipt = {'timestamp_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'product': 'MariaDB Server', 'version': version, 'source_url': url, 'checksum_source_url': sums_url, 'archive_filename': name, 'bytes': target.stat().st_size, 'sha256': actual, 'sha256_verified': True, 'signature_verified': False, 'scope': 'Official Windows ZIP; no Windows service or administrator installation'}
(root / 'mariadb-download-receipt.json').write_text(json.dumps(receipt, indent=2), encoding='utf-8')
print(json.dumps(receipt), flush=True)
