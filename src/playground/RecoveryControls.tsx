import { useState } from 'react';
import { download } from './export';
import type { useProject } from './useProject';

export function RecoveryControls({ workspace: w }: {workspace: ReturnType<typeof useProject>}) {
  const [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  if (!w.storageError && !w.listError && !w.recovery.length) return null;
  return <section className="pg-storage-recovery" aria-label="Project recovery">
    {w.storageError && <p role="alert">{w.storageError}</p>}
    {w.listError && <p role="status">{w.listError}</p>}
    {!!w.recovery.length && <p role="status">Some saved data could not be opened. The original data is kept. Download a recovery copy for help restoring it.</p>}
    <button disabled={busy} onClick={async () => {setBusy(true);try {await w.retryStorage();} finally {setBusy(false);}}}>{busy ? 'Checking saving…' : 'Retry device saving'}</button>
    {w.hasSavedProject && <button onClick={() => {download(JSON.stringify(w.project,null,2),'project.json','application/json');setMessage('Project backup download started. Keep this file to resume editing.');}}>Download project backup</button>}
    {!!w.recovery.length && <button onClick={() => {download(JSON.stringify({records:w.recovery},null,2),'playground-recovery.json','application/json');setMessage('Recovery download started. Original records remain on this device.');}}>Download recovery data</button>}
    {message && <p role="status">{message}</p>}
  </section>;
}
