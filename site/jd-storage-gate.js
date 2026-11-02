/* COLORA JD: non-destructive account-scoped local browser drafts.
 * This separates normal Senior UI state by an opaque account record ID.
 * IMPORTANT: same-origin localStorage is NOT a security boundary. Authorized
 * scripts, browser profiles and extensions can still access stored drafts.
 * The old shared keys remain untouched until the owner deliberately clears
 * browser site data after exporting and validating a backup.
 */
'use strict';
window.COLORA_JD_STORAGE=(()=>{
  const LEGACY_ROLES='colora_jd_library_v1';
  const LEGACY_SETTINGS='colora_jd_settings_v1';
  const scoped=(kind,id)=>'colora_jd_'+kind+'_v2_'+id;
  const validId=id=>typeof id==='string'&&/^[a-f0-9]{32}$/.test(id);
  const getScope=()=>validId(window.COLORA_ACCOUNT_SCOPE)?window.COLORA_ACCOUNT_SCOPE:null;
  let downloadedFor=null;

  function safeRead(key){try{return localStorage.getItem(key)}catch{return null}}
  function decodeDrafts(rawRoles,rawSettings){
    let roles,settings;
    if(rawRoles!==null){
      roles=JSON.parse(rawRoles);
      if(!Array.isArray(roles)||roles.length>500 ||
         !roles.every(r=>r && typeof r==='object' && typeof r.id==='string' && typeof r.title==='string'))
        throw Error('Thư viện JD cũ không đúng định dạng.');
    }
    if(rawSettings!==null){
      settings=JSON.parse(rawSettings);
      if(!settings || Array.isArray(settings) || typeof settings!=='object')
        throw Error('Brand settings cũ không đúng định dạng.');
    }
    return {roles,settings};
  }
  function downloadJSON(payload,name){
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});
    const href=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=href;a.download=name;document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(href),5000);
  }
  function uiButton(text,action,kind=''){
    const button=document.createElement('button');
    button.type='button';button.textContent=text;button.className='outline-button';
    if(kind)button.dataset.jdTransferAction=kind;
    button.addEventListener('click',action);
    return button;
  }
  function beforeMount(onRetry){
    document.getElementById('jd-migration-gate')?.remove();
    const frame=document.getElementById('module-frame');
    frame.hidden=false;
    const id=getScope();
    if(!id && window.parent===window && document.body.dataset.staffRole==='senior'){
      // Deliberately preserve the manual legacy StatiCrypt rollback, which
      // cannot provide an individual five-account scope.
      return true;
    }
    if(!id) {
      // Fail closed in the modern, five-person account portal. Do not mount
      // unscoped JD using the old shared storage key.
      const message=document.createElement('p');
      message.id='jd-migration-gate';
      message.textContent='Không xác định được tài khoản Senior. Vui lòng đăng xuất và đăng nhập lại.';
      frame.before(message);frame.hidden=true;
      return false;
    }
    if(safeRead(scoped('library',id))!==null || safeRead(scoped('settings',id))!==null)
      return true;
    const skipKey='colora-jd-start-fresh-'+id;
    if(sessionStorage.getItem(skipKey)==='1'){
      sessionStorage.removeItem(skipKey);
      return true;
    }

    const rawRoles=safeRead(LEGACY_ROLES),rawSettings=safeRead(LEGACY_SETTINGS);
    if(rawRoles===null&&rawSettings===null)return true;

    // Show the legacy transfer gate only on the first open of a scoped
    // library. Never silently copy shared data to whichever Senior logs in.
    const gate=document.createElement('section');
    gate.id='jd-migration-gate';
    gate.setAttribute('aria-label','Sao lưu JD cũ trước khi chuyển dữ liệu');
    gate.style.cssText='margin:18px 0 28px;padding:23px;border:1px solid #cdbb9c;background:#fffaf3;max-width:780px;';
    const heading=document.createElement('h3');
    heading.textContent='Có dữ liệu JD từ phiên bản trước trên trình duyệt này';
    heading.style.cssText='font:500 30px/1.12 "Cormorant Garamond",Georgia,serif;color:#002451;margin:0 0 12px';
    const info=document.createElement('p');
    info.textContent='Để tránh lẫn bản nháp giữa các tài khoản Senior, JD mới sử dụng thư viện riêng trên thiết bị. Dữ liệu cũ chưa bị xóa hoặc chuyển tự động. Hãy tải bản sao lưu trước khi nhập vào tài khoản hiện tại.';
    info.style.cssText='font:400 13px/1.8 "Open Sans",Arial,sans-serif;color:#43556a;margin:0 0 16px';
    const actions=document.createElement('div');
    actions.style.cssText='display:flex;flex-wrap:wrap;gap:10px';
    const status=document.createElement('p');
    status.setAttribute('role','status');
    status.style.cssText='font:400 12px/1.7 "Open Sans",Arial,sans-serif;color:#43556a;margin:14px 0 0';
    const backup=uiButton('1. Tải bản sao lưu JD cũ',()=>{
      try{
        // Include exact original values in the backup, even if older formats
        // cannot be migrated automatically. Nothing is deleted on download.
        const raw={roles:rawRoles,settings:rawSettings};
        let parsed={};
        try{parsed=decodeDrafts(rawRoles,rawSettings)}catch{}
        downloadJSON({format:'COLORA-JD-LEGACY-BACKUP-v1',
          exportedAt:new Date().toISOString(),roles:parsed.roles||[],
          settings:parsed.settings||{},raw},
          'COLORA-JD-legacy-backup-'+new Date().toISOString().slice(0,10)+'.json');
        downloadedFor=id;copy.disabled=false;
        status.textContent='Đã khởi tạo tải bản sao lưu. Hãy kiểm tra file trong Downloads trước khi chọn chuyển dữ liệu.';
      }catch{status.textContent='Không thể xuất bản sao lưu. Dữ liệu cũ chưa thay đổi.'}
    },'backup');
    const copy=uiButton('2. Chuyển bản sao vào tài khoản này',()=>{
      if(downloadedFor!==id){status.textContent='Hãy tải bản sao lưu trước khi chuyển.';return}
      try{
        const values=decodeDrafts(rawRoles,rawSettings);
        if(!confirm('Bạn đã mở và lưu file sao lưu JD cũ? Sao chép bản nháp vào tài khoản Senior đang đăng nhập? Dữ liệu cũ sẽ được giữ nguyên.'))return;
        // Refuse overwrites. If a partial quota failure occurs, rollback the
        // newly created scoped values, but NEVER touch legacy shared drafts.
        if(safeRead(scoped('library',id))!==null||safeRead(scoped('settings',id))!==null)
          throw Error('Tài khoản này đã có bản nháp riêng; không được ghi đè.');
        const written=[];
        try{
          if(rawRoles!==null){localStorage.setItem(scoped('library',id),JSON.stringify(values.roles));written.push(scoped('library',id))}
          if(rawSettings!==null){localStorage.setItem(scoped('settings',id),JSON.stringify(values.settings));written.push(scoped('settings',id))}
        }catch(error){for(const key of written)localStorage.removeItem(key);throw error}
        downloadedFor=null;onRetry();
      }catch(error){status.textContent='Chưa chuyển dữ liệu: '+(error?.message||'Lỗi lưu trữ')+'. Bản cũ vẫn được giữ nguyên.'}
    },'import');
    copy.disabled=true;
    const fresh=uiButton('Tạo thư viện riêng, giữ bản cũ',()=>{
      if(!confirm('Bắt đầu thư viện riêng với các JD mẫu? Thư viện cũ vẫn được giữ nguyên trong trình duyệt này.'))return;
      // The JD app itself will seed and persist this account's scoped keys.
      sessionStorage.setItem('colora-jd-start-fresh-'+id,'1');
      gate.remove();frame.hidden=false;onRetry();
    },'fresh');
    actions.append(backup,copy,fresh);
    const warning=document.createElement('p');
    warning.textContent='Lưu ý: tách thư viện theo tài khoản không mã hóa hoặc bảo vệ dữ liệu trước người có quyền truy cập máy và JavaScript cùng website. Không lưu thông tin nhân sự nhạy cảm.';
    warning.style.cssText='font:400 11px/1.7 "Open Sans",Arial,sans-serif;color:#755a42;margin:15px 0 0';
    gate.append(heading,info,actions,status,warning);
    frame.before(gate);frame.hidden=true;
    return false;
  }
  return {beforeMount,getScope};
})();
