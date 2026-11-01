/* Static security checks for the opt-in individual-account release.
 * No Supabase secrets, auth tokens or actual staff passwords are needed.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd();
const pub=path.join(root,'account-release','public');
const priv=path.join(root,'account-release','private');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const html=fs.readFileSync(path.join(pub,'index.html'),'utf8');
const staff=fs.readFileSync(path.join(priv,'staff.html'),'utf8');
const senior=fs.readFileSync(path.join(priv,'senior.html'),'utf8');
const cfg=fs.readFileSync(path.join(pub,'account-config.js'),'utf8');
assert(html.includes('id="staff-email"')&&html.includes('id="staff-password"'),'Login must collect per-account credentials');
assert(html.includes('id="staff-email"')&&html.includes('id="staff-password"'));
assert(html.includes('Content-Security-Policy'));
assert(html.includes('connect-src \'self\' https://'));
assert(!html.includes('staticryptConfig'));
assert(!html.includes('id="bundled-jd"'));
assert(!cfg.includes('sb_secret_')&&!cfg.includes('SUPABASE_SECRET_KEY'));
assert(staff.includes('data-staff-role="staff"'));
assert(!staff.includes('id="bundled-jd"')&&!staff.includes('data-view="jd"'));
assert(senior.includes('data-staff-role="senior"')&&senior.includes('id="bundled-jd"'));
assert(senior.length>staff.length);
assert(!fs.existsSync(path.join(pub,'senior-gateway.json')));
assert(!fs.existsSync(path.join(pub,'apps','jd','index.html')));
assert(!fs.existsSync(path.join(pub,'senior','index.html')));
const publicHtml=[];
function walk(dir){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const full=path.join(dir,entry.name);
  if(entry.isDirectory())walk(full);
  else if(entry.name.endsWith('.html'))publicHtml.push(path.relative(pub,full));
 }
}
walk(pub);
assert.deepEqual(publicHtml,['index.html'],'Only the account login may be public HTML');
const sql=read('supabase/migrations/202611020001_colora_staff_auth.sql');
// The public repository must not disclose individual staff email addresses.
// Owners provision exactly five secret mappings into the private DB.
assert(sql.includes('create table if not exists public.colora_staff_allowlist'));
assert(!sql.includes('@colora.vn'),'Never commit employee email identities into public SQL');
const invite=read('scripts/invite-colora-staff.mjs');
assert(invite.includes('COLORA_AUTH_ALLOWLIST_JSON'));
assert(invite.includes('users.length!==5'));
assert(invite.includes('tally.staff!==3||tally.senior!==2'));
assert(!/\b[a-z0-9._%+-]+@colora\.vn\b/.test(invite),'Never embed employee emails into public source');
assert(sql.includes("name='senior.html'"));
assert(sql.includes("m.access_role='senior'"));
assert(sql.includes("m.active=true"));
assert(sql.includes("user_id=(select auth.uid())"));
assert(!sql.includes('create policy colora_member_write'));
const loginJs=read('account-auth/account-login.js');
assert(loginJs.includes("rawDocument(role+'.html',token)"));
assert(loginJs.includes("method:'POST',body:{email,password"));
assert(loginJs.includes("session={access_token:token"));
assert(!loginJs.includes('localStorage.setItem('));
assert(loginJs.includes('storage/v1/object/authenticated'));
const uploader=read('scripts/publish-account-release.mjs');
assert(uploader.includes('if(!response.ok)')&&uploader.includes("if(resp.ok)throw Error('CRITICAL:"),'Uploader must fail both on upload errors and unexpected anonymous access');
console.log('PASS: Five allowlisted accounts, SQL role restrictions, private JD segregation, public-only login build, no stored staff passwords.');
