import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const js=fs.readFileSync('site/email-templates.js','utf8');
const htmlShell=fs.readFileSync('site/index.html','utf8');
const styles=fs.readFileSync('site/email-templates.css','utf8');

// Exercise the actual in-browser source without a login or network request.
// Exit after capturing the pure template renderer; no DOM or clipboard I/O.
const instrumented=js
  .replace('  const doc=document, $=id=>doc.getElementById(id);',
    '  globalThis.__qaTemplates = TEMPLATES;\n  const doc=document, $=id=>doc.getElementById(id);')
  .replace('  function refreshDesigned(){',
    '  globalThis.__qaRender = designHTML;\n  return;\n  function refreshDesigned(){');

assert.notEqual(instrumented,js,'test instrument anchors must still exist');
const ctx={document:{
  body:{dataset:{staffRole:'senior'}},
  getElementById:()=>({})
}};
vm.runInNewContext(instrumented,ctx,{timeout:1000});
const templates=ctx.__qaTemplates;
const render=ctx.__qaRender;
assert(Array.isArray(templates)&&typeof render==='function');

const staff=templates.filter(t=>t.audience!=='senior');
const seniors=templates.filter(t=>t.audience==='senior');
assert.equal(staff.length,7,'Staff must retain exactly seven accessible templates');
assert.equal(seniors.length,8,'Senior must have three original + five people templates');
assert(templates.filter(t=>t.design).length>=5,'Designed milestone email coverage');
for(const id of ['welcome','onboarding','announcement','role-change','recognition']){
  const t=templates.find(t=>t.id===id);
  assert(t?.design, id+' has editorial design');
  const output=render(t,t.body);
  assert(output.includes('COLOR YOUR AURA'),id+' keeps the slogan');
  assert.equal((output.match(/<img /g)||[]).length,2,id+' uses real logos in header and footer');
  assert(output.includes('https://staff.colora.vn/apps/qr/assets/colora-lettermark.png'),
    id+' uses the published COLORA wordmark');
  assert(!output.includes('>COLORA</div>'),'No font-rendered imitation of the logo');
  assert(output.includes('#F4EDE1')&&output.includes('#002451'),id+' uses brand palette');
  assert(output.includes('width="600"'),id+' is table-based for email clients');
  assert.equal((output.match(/margin-left:6px/g)||[]).length,2,
    id+' must align the header and footer slogans to the logo C');
}
// Every email, not only milestone templates, has a matching logo-bearing HTML version.
for(const t of templates){
  const out=render(t,t.body);
  assert.equal((out.match(/<img /g)||[]).length,2,'Missing header/footer logo in '+t.id);
  assert(out.includes('src="https://staff.colora.vn/apps/qr/assets/colora-lettermark.png"'));
  assert(out.includes('alt="COLORA"'),'The logo needs accessible alternative text');
}
const staffClient=render(templates.find(t=>t.id==='inquiry'),'Chào bạn');
assert(staffClient.includes('A personal note from our team'),
  'Client emails must not be labelled internal');

const welcome=templates.find(t=>t.id==='welcome');
assert(welcome.body.includes('cứ hỏi nhé'),'Welcome should have natural, human voice');
assert(!welcome.body.includes('Mật khẩu: ['),'Credentials must never be included');
assert(templates.find(t=>t.id==='deadline').body.includes('plot twist'),
  'Light humor should stay in everyday reminders, not official notices');
assert(!templates.find(t=>t.id==='announcement').body.includes('plot twist'),
  'Official notices should stay professional');

const safe=render(welcome,'Chào <img src=x onerror=alert(1)> & "mọi người"');
assert(safe.includes('&lt;img')&&!safe.includes('<img src=x'),
  'Editable content must escape injected markup without blocking approved brand images');
assert(safe.includes('&amp;'),'Ampersands must escape');

assert(/id="email-template-preview"[^>]*sandbox=""/.test(htmlShell),
  'Preview must have a sandboxed iframe');
assert(htmlShell.includes('id="email-template-copy-rich"'),
  'Designed email must be copyable in rich format');
assert(styles.includes('.email-template-designed[hidden]'),
  'HTML section must respect hidden state');
console.log('COLORA editorial email QA passed (roles, voice, HTML, security, branding).');
