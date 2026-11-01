/* One-time authenticated content publication (trusted runner only).
 * Never invoke from browser, PR or user-facing pages.
 */
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const url=String(process.env.SUPABASE_URL||'').replace(/\/+$/,'');
const service=String(process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY||'');
const pub=String(process.env.SUPABASE_PUBLISHABLE_KEY||'');
if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url))throw Error('Bad Supabase URL');
if(service.length<30||service===pub)throw Error('Missing server-only Supabase secret');
for(const name of ['staff','senior']){
 const file=path.join(root,'account-release','private',name+'.html');
 if(!fs.existsSync(file))throw Error('Missing private '+name+' payload');
 const html=fs.readFileSync(file);
 if(html.length<10000)throw Error('Unusually small role payload: '+name);
 const endpoint=url+'/storage/v1/object/colora-staff-private/'+name+'.html';
 const response=await fetch(endpoint,{method:'POST',headers:{
  apikey:service,...(/^eyJ/.test(service)?{Authorization:'Bearer '+service}:{}),
  'Content-Type':'text/html','Cache-Control':'no-store','x-upsert':'true'
 },body:html});
 if(!response.ok)throw Error('Private upload failed for '+name+' (HTTP '+response.status+'). Ensure SQL migration and bucket are applied.');
 console.log('Uploaded '+name+' private HTML to RLS-protected storage');
}
// Assert anonymous callers cannot fetch either private document. Do not
// print private document responses under any circumstances.
for(const name of ['staff','senior']){
 const resp=await fetch(url+'/storage/v1/object/authenticated/colora-staff-private/'+name+'.html',{
  headers:{apikey:pub},cache:'no-store'});
 if(resp.ok)throw Error('CRITICAL: unauthenticated '+name+' content is readable! Aborting Pages deploy.');
}
console.log('Anonymous read denial verified for both role documents.');
