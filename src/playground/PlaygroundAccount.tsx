import { useEffect, useRef, useState } from 'react';
import { AccountAccess } from '../components/AccountAccess';
import { useAccount } from '../lib/members';
import { post } from '../lib/platform';
import { CloudProjects } from './CloudProjects';
import { download } from './export';
import type { useProject } from './useProject';
import '../styles/members.css';
import './account.css';

export function PlaygroundAccount({open,close,workspace:w}:{open:boolean;close:()=>void;workspace:ReturnType<typeof useProject>}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const {account,error,refresh,clear} = useAccount();
  const [message,setMessage] = useState(''), [backupChoice,setBackupChoice] = useState(false);
  useEffect(() => {
    const element = dialog.current;
    if (open && !element?.open) element?.showModal();
    if (!open && element?.open) element.close();
  },[open]);
  async function logout() {
    try {await post('/api/members/auth',{action:'logout'});clear();refresh();setMessage('Signed out. Your project and Undo history are still here.');}
    catch (error) {setMessage((error as Error).message);}
  }
  function accountTab() {
    // OAuth completes in the established account page. This editor never leaves
    // its document or loses Undo, even if device storage cannot currently write.
    const tab = window.open('/account/','_blank','noopener,noreferrer');
    if (tab) tab.opener = null;
    setMessage('Sign in in the account tab, then return here and refresh your account. Your project stays open.');
    setBackupChoice(false);
  }
  return <dialog ref={dialog} className="pg-account-dialog ew-members" aria-labelledby="pg-account-title" onCancel={close} onClose={() => {close();document.querySelector<HTMLButtonElement>('.pg-account-entry')?.focus();}}
    onClickCapture={event => {
      const anchor = (event.target as HTMLElement).closest('a');
      if (anchor) {event.preventDefault();window.open(anchor.href,'_blank','noopener,noreferrer');}
    }}>
    <header><h2 id="pg-account-title">Your account</h2><button autoFocus onClick={close}>Back to Playground</button></header>
    <p>Your project stays open while you sign in. Signing in alone does not save it to your account.</p>
    {error && <p role="alert">{error} <button onClick={refresh}>Retry account</button></p>}
    {!account && !error && <p role="status">Checking your account…</p>}
    {account?.member ? <><p>Signed in as @{account.member.username}</p><button onClick={() => void logout()}>Sign out</button><button onClick={refresh}>Refresh account</button>
      {!w.hasSavedProject && <p>Open an account project below, or choose a starting point to create one.</p>}
      <CloudProjects project={w.project} target={w.target} documentId={w.documentId} guard={w.guard} load={w.replace} acknowledge={w.acknowledge} disabled={false} canSave={w.hasSavedProject}/>
    </> : account && <AccountAccess onSuccess={() => {refresh();setMessage('Signed in. Your local project and Undo history are unchanged.');}} onGoogle={() => {if (w.dirty || w.storageError) setBackupChoice(true);else accountTab();}}/>}
    {backupChoice && <section aria-label="Keep your work before sign-in"><p>Your latest edits may only be open in this tab. Download a backup, then continue sign-in in a separate tab.</p><button onClick={() => {if(w.hasSavedProject)download(JSON.stringify(w.project,null,2),'project.json','application/json');accountTab();}}>Download backup and open sign-in</button><button onClick={() => setBackupChoice(false)}>Keep editing</button></section>}
    <p><a href="/account/">Open full account in a new tab</a> <button onClick={refresh}>Check sign-in again</button></p>
    {message && <p role="status">{message}</p>}
  </dialog>;
}
