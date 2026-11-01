'use strict';
/* Bridge JD's existing local-only engine into COLORA Staff UI.
   Parent controls proxy the original, still-encrypted Senior app DOM.
   No authentication credentials or JD content leave the browser. */
window.COLORA_JD_WORKSPACE=(()=>{
  let active=null;
  const $=id=>document.getElementById(id);
  const area=()=>$('jd-workspace-controls');
  const actions=['jd-create','jd-duplicate','jd-delete','jd-pdf','jd-settings','jd-export'];
  function dispose(){
    if(!active)return;
    active.closed=true;
    active.observer?.disconnect();
    active.resize?.disconnect();
    active.frame.removeEventListener('load',active.onLoad);
    active.frame.removeAttribute('data-jd-loaded');
    active=null;
  }
  function useDoc(){return active?.frame?.contentDocument||null}
  function clickInside(id){
    const btn=useDoc()?.getElementById(id);
    if(!btn)throw Error('JD action missing: '+id);
    btn.click();
  }
  function syncRoles(){
    const doc=useDoc(), select=$('jd-role-select');
    if(!doc || !select)return;
    const roles=[...doc.querySelectorAll('#roleList .role-item[data-role-id]')];
    const selected=roles.find(el=>el.classList.contains('active'))?.dataset.roleId||roles[0]?.dataset.roleId||'';
    // Avoid resetting the select mid-edit when nothing actually changed.
    const existing=[...select.options].map(o=>[o.value,o.textContent]);
    const desired=roles.map(el=>[el.dataset.roleId,el.querySelector('.role-item-title')?.textContent?.trim()||'Vị trí chưa đặt tên']);
    if(JSON.stringify(existing)!==JSON.stringify(desired)){
      select.replaceChildren(...desired.map(([id,title])=>new Option(title,id)));
    }
    if(selected)select.value=selected;
    const count=doc.getElementById('roleCount')?.textContent||'';
    $('jd-workspace-status').textContent=(count?count+' · ':'')+'Dữ liệu JD được tự động lưu trên trình duyệt này.';
    const preview=doc.body.classList.contains('preview-only');
    area().querySelectorAll('[data-jd-mode]').forEach(btn=>{
      const activeMode=btn.dataset.jdMode===(preview?'preview':'edit');
      btn.setAttribute('aria-pressed',String(activeMode));
    });
  }
  let pending=false;
  function resize(){
    if(!active||active.closed||pending)return;
    pending=true;
    requestAnimationFrame(()=>{
      pending=false;
      if(!active||active.closed)return;
      try{
        const doc=useDoc();
        if(!doc)return;
        const h=Math.max(460,Math.ceil(Math.max(doc.documentElement.scrollHeight,doc.body.scrollHeight)+12));
        if(Math.abs((parseInt(active.frame.style.height,10)||0)-h)>3)active.frame.style.height=h+'px';
      }catch{}
    });
  }
  function onReady(item){
    if(item.closed||active!==item)return;
    const doc=item.frame.contentDocument;
    if(!doc?.querySelector('#editorPanel')||!doc.querySelector('#roleList'))return;
    item.frame.removeEventListener('load',item.onLoad);
    // These elements still power the original JD app and localStorage.
    // Only their outer duplicate chrome is visually suppressed by CSS.
    item.observer=new MutationObserver(()=>{syncRoles();resize();});
    item.observer.observe(doc.getElementById('roleList'),{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    item.observer.observe(doc.getElementById('editorPanel'),{childList:true,subtree:true});
    item.observer.observe(doc.body,{attributes:true,attributeFilter:['class']});
    item.resize=new ResizeObserver(resize);
    item.resize.observe(doc.body);
    item.resize.observe(doc.getElementById('editorPanel'));
    item.frame.dataset.jdLoaded='true';
    const status=$('module-status');
    if(status)status.hidden=true;
    syncRoles();
    resize();
  }
  function mount(frame){
    dispose();
    const item={frame,closed:false,observer:null,resize:null,onLoad:null};
    item.onLoad=()=>onReady(item);
    active=item;
    area().hidden=false;
    frame.addEventListener('load',item.onLoad);
    if(frame.contentDocument?.getElementById('editorPanel'))onReady(item);
  }
  $('jd-role-select')?.addEventListener('change',e=>{
    const el=[...(useDoc()?.querySelectorAll('#roleList [data-role-id]')||[])].find(b=>b.dataset.roleId===e.target.value);
    el?.click();
    syncRoles();resize();
  });
  const lookup={
    'jd-create':'newRoleBtn','jd-duplicate':'duplicateBtn','jd-delete':'deleteBtn',
    'jd-pdf':'printBtn','jd-settings':'settingsBtn','jd-export':'exportDataBtn'
  };
  for(const key of actions){
    $(key)?.addEventListener('click',()=>{
      if(!active)return;
      clickInside(lookup[key]);
      if(key==='jd-settings'){
        // Keep the original Settings modal anchored near the start of
        // the JD section rather than halfway down a tall nested iframe.
        active.frame.scrollIntoView({behavior:'instant',block:'start'});
      }
      syncRoles();resize();
      area().querySelector('details')?.removeAttribute('open');
    });
  }
  area()?.querySelectorAll('[data-jd-mode]').forEach(btn=>btn.addEventListener('click',()=>{
    const mode=btn.dataset.jdMode;
    useDoc()?.querySelector('.seg-btn[data-mode="'+mode+'"]')?.click();
    syncRoles();resize();
  }));
  $('jd-import')?.addEventListener('change',e=>{
    const inner=useDoc()?.getElementById('importDataInput');
    if(inner&&e.target.files?.length){
      inner.files=e.target.files;
      inner.dispatchEvent(new Event('change',{bubbles:true}));
      e.target.value='';
      area().querySelector('details')?.removeAttribute('open');
    }
  });
  const bridge={mount,dispose};
  // Defensive recovery for a browser/CDN that pairs a cached older Staff
  // router with a newer JD bridge. The router may have visited #jd before
  // this script became available and silently skipped its optional mount.
  // Only remount if no live JD bridge exists; never expose JD to Staff.
  queueMicrotask(()=>{
    if(active || document.body?.dataset.staffRole!=='senior')return;
    if(document.getElementById('module')?.dataset.activeModule!=='jd')return;
    const frame=document.getElementById('module-frame');
    if(frame?.isConnected && document.getElementById('bundled-jd'))mount(frame);
  });
  return bridge;
})();