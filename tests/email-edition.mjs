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
  assert(output.includes('COLORA - COLOR YOUR AURA'),id+' has COLORA footer');
  assert(output.includes('#F4EDE1')&&output.includes('#002451'),id+' uses brand palette');
  assert(output.includes('width="600"'),id+' is table-based for email clients');
}
const welcome=templates.find(t=>t.id==='welcome');
assert(welcome.body.includes('cứ hỏi nhé'),'Welcome should have natural, human voice');
assert(!welcome.body.includes('Mật khẩu: ['),'Credentials must never be included');
assert(templates.find(t=>t.id==='deadline').body.includes('plot twist'),
  'Light humor should stay in everyday reminders, not official notices');
assert(!templates.find(t=>t.id==='announcement').body.includes('plot twist'),
  'Official notices should stay professional');

const safe=render(welcome,'Chào <img src=x onerror=alert(1)> & "mọi người"');
assert(safe.includes('&lt;img')&&!safe.includes('<img'),'Editable content must escape HTML');
assert(safe.includes('&amp;'),'Ampersands must escape');

assert(htmlShell.includes('id="email-template-preview" sandbox=""'),
  'Preview must have a sandboxed iframe');
assert(htmlShell.includes('id="email-template-copy-rich"'),
  'Designed email must be copyable in rich format');
assert(styles.includes('.email-template-designed[hidden]'),
  'HTML section must respect hidden state');
console.log('COLORA editorial email QA passed (roles, voice, HTML, security, branding).');
