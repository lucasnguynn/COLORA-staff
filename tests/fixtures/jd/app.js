'use strict';
const items=[{id:'sample-1',title:'JD Fixture — Example'}];let active='sample-1';
const roleList=document.getElementById('roleList');
function render(){
 roleList.innerHTML=items.map(r=>'<button type="button" class="role-item '+(r.id===active?'active':'')+'" data-role-id="'+r.id+'"><span class="role-item-title">'+r.title+'</span></button>').join('');
 roleList.querySelectorAll('[data-role-id]').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.roleId;render()}));
 document.getElementById('roleCount').textContent=items.length+' JD';
 document.getElementById('workspaceTitle').textContent=items.find(r=>r.id===active)?.title||'JD Fixture';
}
document.getElementById('newRoleBtn').addEventListener('click',()=>{const id='fixture-'+items.length;items.push({id,title:'JD Fixture '+items.length});active=id;render()});
document.getElementById('duplicateBtn').addEventListener('click',()=>{items.push({id:'dup-'+items.length,title:'Copy JD'});active=items[items.length-1].id;render()});
document.getElementById('deleteBtn').addEventListener('click',()=>{if(items.length>1)items.pop();active=items[0].id;render()});
document.getElementById('settingsBtn').addEventListener('click',()=>document.getElementById('settingsModal').hidden=false);
document.getElementById('closeSettingsBtn').addEventListener('click',()=>document.getElementById('settingsModal').hidden=true);
document.querySelectorAll('.seg-btn').forEach(b=>b.addEventListener('click',()=>document.body.classList.toggle('preview-only',b.dataset.mode==='preview')));
document.querySelector('#workspaceTitle').dataset.fixture='true';
render();
