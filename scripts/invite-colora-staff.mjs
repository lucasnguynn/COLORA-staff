/* Owner-only private allowlist provisioning and Supabase Auth invitations.
 * Email addresses are NOT committed to this public GitHub repository.
 * Configure COLORA_AUTH_ALLOWLIST_JSON securely in your admin terminal.
 * Never print the JSON, invitations, secrets, or auth tokens.
 */
const url=String(process.env.SUPABASE_URL||'').replace(/\/+$/,'');
const key=String(process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY||'');
if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)||key.length<30){
 throw Error('Set project SUPABASE_URL and server-only SUPABASE_SECRET_KEY');
}
let users;
try{users=JSON.parse(process.env.COLORA_AUTH_ALLOWLIST_JSON||'null')}catch{}
if(!Array.isArray(users)||users.length!==5)throw Error('Private allowlist must contain exactly five [email,role] entries');
const seen=new Set(),tally={staff:0,senior:0};
for(const item of users){
 if(!Array.isArray(item)||item.length!==2)throw Error('Each private entry must be [email,role]');
 const [email,role]=item;
 if(typeof email!=='string'||email!==email.toLowerCase()||!/^[a-z0-9._%+-]+@colora\.vn$/.test(email)||seen.has(email)){
  throw Error('Invalid/duplicate approved corporate email');
 }
 if(role!=='staff'&&role!=='senior')throw Error('Invalid staff role');
 seen.add(email);tally[role]++;
}
if(tally.staff!==3||tally.senior!==2)throw Error('Expected exactly 3 Staff and 2 Senior accounts');
const headers={apikey:key,...(/^eyJ/.test(key)?{Authorization:'Bearer '+key}:{}),'Content-Type':'application/json'};
const rows=users.map(([email,access_role])=>({email,access_role}));
const provision=await fetch(url+'/rest/v1/colora_staff_allowlist?on_conflict=email',{
 method:'POST',headers:{...headers,Prefer:'resolution=merge-duplicates'},body:JSON.stringify(rows)
});
if(!provision.ok)throw Error('Could not provision private approved allowlist (HTTP '+provision.status+'). Apply SQL migration first.');
console.log('Private allowlist provisioned: '+tally.staff+' Staff, '+tally.senior+' Senior. Employee addresses not logged.');
for(const [email,role] of users){
 const resp=await fetch(url+'/auth/v1/invite',{method:'POST',headers,body:JSON.stringify({email})});
 if(!resp.ok){
   console.error('Invitation request failed for an approved '+role+' account (HTTP '+resp.status+'). Check custom SMTP, Auth config and existing users.');
   process.exitCode=1;continue;
 }
 console.log('Invitation requested for an approved '+role+' account.');
}
