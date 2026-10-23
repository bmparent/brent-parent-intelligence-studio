import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
const preserved = {
  "migrations/0001_eidos_platform.sql": "3a0ddf7d09a70375b1f111ca532300ae4f5b311dce520cc2b3aa171e6bafd9df",
  "migrations/0002_members.sql": "2df4ca3ba7440208d571fcb7a9b4c7cf599acf732016cb252a8f2df6b7313b68",
  "migrations/0003_playground.sql": "0a174868697de5697d71e2b39b293580725e9546cefbf3e45b6589c05545eac3",
  "migrations/0004_playground_asset_quota.sql": "6b90ac432d08048b7e69eef05fb1bc44e02ed4c3f6e520237d581e7a5e46f8fd",
  "migrations/0005_playground_ai.sql": "19e752fe37aba011b25ef9cf8c05067de01cb7756e7738ae5685c06d583ed4d4",
  "migrations/0006_member_credentials.sql": "d967ae1cbe2e364452b3618aa8b6ed7b8464e1ccde60d632d3c528539109a081",
  "migrations/0007_operations.sql": "9ac380d35cbc653d944122c5ed2e49a581123622eba0c8e82dcca1ceee541010",
  "migrations/0007_owner_audit.sql": "13e1e9d3e73919b7ae715716cb9f6b882dc8c5fba674e8c8a9d7dcaffc3b2215",
  "migrations/growth/0001_growth.sql": "390ae56d08ea8c77ae831aafdae15523877e664239a31febc2a3a44d35c2c787",
  "migrations/growth/0002_owner_audit.sql": "84f4609fbd67314116d1e66380ff63b84bf5f9eb819f0b44a94d490737378431"
};
test('release integration retains every earlier migration byte and adds AI accounting without changing historical rows', () => {
  for (const [path, expected] of Object.entries(preserved)) assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),expected,path);
  const sql=new DatabaseSync(':memory:');
  try {
    sql.exec(readFileSync('migrations/0001_eidos_platform.sql','utf8'));
    sql.exec(readFileSync('migrations/0005_playground_ai.sql','utf8'));
    sql.exec("INSERT INTO eidos_pg_ai_requests(id,owner_id,project_id,request_hash,state,reserved_micro,model,pricing,kind,settings,created_at) VALUES('held-request','old-owner','old-project','old-hash','unknown',100,'old-model','{}','text','{}','2026-10-18')");
    const before=sql.prepare('SELECT * FROM eidos_pg_ai_requests').all();
    const added=readFileSync('migrations/0009_playground_ai_accounting.sql','utf8');
    sql.exec(added);sql.exec(added);
    assert.deepEqual(sql.prepare('SELECT * FROM eidos_pg_ai_requests').all(),before);
    assert.equal(sql.prepare('SELECT enabled FROM eidos_pg_ai_control WHERE id=1').get().enabled,0);
    assert.equal(sql.prepare('SELECT count(*) n FROM eidos_pg_ai_policies').get().n,0);
    assert.ok(sql.prepare("SELECT name FROM sqlite_master WHERE name='eidos_pg_ai_count_claims'").get());
  } finally {sql.close();}
});
test('the complete combined migration sequence is additive and repeatable', () => {
  const sql=new DatabaseSync(':memory:');
  try {
    const names=readdirSync('migrations').filter(name=>/^\d+.*\.sql$/.test(name)).sort();
    for(let pass=0;pass<2;pass++) for(const name of names) sql.exec(readFileSync('migrations/'+name,'utf8'));
    assert.equal(sql.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
    assert.deepEqual(sql.prepare('PRAGMA foreign_key_check').all(),[]);
    for(const table of ['eidos_pg_ai_requests','eidos_pg_ai_count_claims','eidos_template_orders'])
      assert.ok(sql.prepare("SELECT name FROM sqlite_master WHERE name=?").get(table),table);
  } finally {sql.close();}
});
