import { getSnapshotStore } from '../../_shared/snapshot/storage'
import { checksum } from '../../_shared/snapshot/generation'
import { isValidResultToken } from '../../_shared/snapshot/validation'
import type { PagesFunctionContext } from '../../_shared/snapshot/types'
export async function onRequestGet({request,env}:PagesFunctionContext) {
  const token=new URL(request.url).searchParams.get('token')
  if(!isValidResultToken(token)) return new Response(null,{status:404})
  const record=await getSnapshotStore(env,request)?.getByResultToken(token)
  if(record?.status!=='complete' || !record.imageKey || !env.SNAPSHOT_OBJECTS) return new Response(null,{status:404})
  const object=await env.SNAPSHOT_OBJECTS.get(record.imageKey)
  if(!object) return new Response(null,{status:503})
  const bytes=new Uint8Array(await object.arrayBuffer())
  if(await checksum(bytes)!==record.imageSha256) return new Response(null,{status:503})
  return new Response(bytes,{headers:{'content-type':'image/jpeg','cache-control':'private, no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'}})
}
