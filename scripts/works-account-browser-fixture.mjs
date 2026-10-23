// Loopback fixture only: exercise the still-supported legacy account format.
// Seeding a local document does not establish hosted/cloud/provider acceptance.
import {createProject} from '../src/playground/model.ts';
export async function openLegacyAccountDocument(page, base='http://localhost:4788') {
  if(base!=='http://localhost:4788')throw Error('Account fixture refuses non-loopback origins.');
  await page.goto(base+'/playground/');
  await page.evaluate(async project=>new Promise((resolve,reject)=>{
    const open=indexedDB.open('eidos-playground-v1',1);
    open.onupgradeneeded=()=>open.result.createObjectStore('workspace');
    open.onerror=()=>reject(open.error);
    open.onsuccess=()=>{const db=open.result,tx=db.transaction('workspace','readwrite');tx.objectStore('workspace').put({project,snapshots:[]},'current');tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};
  }),createProject());
  await page.reload();
  await page.getByRole('button',{name:/Continue project/}).click();
  await page.locator('.pg-app').waitFor();
}

export async function openAccountProjects(page) {
  await page.getByRole('button',{name:'Project',exact:true}).click();
  const advanced=page.locator('details.pg-project-tools').filter({has:page.locator(':scope > summary',{hasText:'Advanced'})});
  if(!await advanced.evaluate(e=>e.open))await advanced.locator(':scope > summary').click();
  const details=page.locator('details.pg-project-tools').filter({has:page.locator(':scope > summary',{hasText:'Account projects'})});
  if(!await details.evaluate(e=>e.open))await details.locator(':scope > summary').click();
  return details;
}
