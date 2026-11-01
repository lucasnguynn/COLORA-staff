/* COLORA static five-person cryptographic login, no backend.
 * Opt-in local persistence stores an AES-GCM CryptoKey in IndexedDB (not a
 * plaintext password, email, exported key, browser cookie or localStorage).
 * A stored device key itself grants access to content while valid. Only use
 * "remember" on personal, trusted browser profiles. Changing account
 * ciphertext/credentials invalidates the remembered key on the next visit.
 */
'use strict';
(async () => {
  const $=id=>document.getElementById(id);
  const form=$('signin-form'),feedback=$('signin-feedback'),submit=$('signin-submit');
  const frame=$('workspace-frame'),rememberInput=$('remember-device');
  const notice=$('workspace-notice');
  const decoder=new TextDecoder(),encoder=new TextEncoder();
  const failure='Không thể đăng nhập. Kiểm tra email hoặc mật khẩu Workspace và thử lại.';
  const DB_NAME='colora-staff-device-access-v1';
  const DB_STORE='sessions',SLOT='remembered-device';
  const REMEMBER_MS=30*24*60*60*1000;
  const validEntryId=id=>typeof id==='string'&&/^[a-f0-9]{32}$/.test(id);
  let busy=false,rememberUntil=0;
  const unb64=s=>Uint8Array.from(atob(s),x=>x.charCodeAt(0));
  const hexEq=(a,b)=>{
    if(a.length!==b.length)return false;
    let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0;
  };
  const showNotice=message=>{
    notice.textContent=message;notice.hidden=!message;
  };

  // CryptoKey objects are structured-clonable. The AES decryption key is
  // imported with extractable:false, so JavaScript cannot export raw bytes.
  // This does NOT protect against a compromised browser profile or same-origin
  // malicious JS, which could ask Web Crypto to decrypt with the stored key.
  async function storedSession(mode,value){
    if(!('indexedDB' in window))throw Error('Browser persistence unavailable');
    const db=await new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB_NAME,1);
      req.onupgradeneeded=()=>{
        if(!req.result.objectStoreNames.contains(DB_STORE))
          req.result.createObjectStore(DB_STORE);
      };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||Error('Could not open local device storage'));
      req.onblocked=()=>reject(Error('Device storage blocked by another tab'));
    });
    return new Promise((resolve,reject)=>{
      let result;
      const tx=db.transaction(DB_STORE,mode);
      const store=tx.objectStore(DB_STORE);
      const req=mode==='readonly'?store.get(SLOT):value===null?store.delete(SLOT):store.put(value,SLOT);
      req.onsuccess=()=>{result=req.result};
      tx.oncomplete=()=>{db.close();resolve(result)};
      tx.onerror=()=>{db.close();reject(tx.error||Error('Device storage failed'))};
      tx.onabort=()=>{db.close();reject(tx.error||Error('Device storage aborted'))};
    });
  }
  const loadSaved=()=>storedSession('readonly');
  const saveRemembered=(entry,key)=>storedSession('readwrite',{
    version:1,entryId:entry.id,expiresAt:Date.now()+REMEMBER_MS,key
  });
  const forgetRemembered=()=>storedSession('readwrite',null);
  const safelyForget=async()=>{try{await forgetRemembered()}catch{}};

  async function getManifest(){
    const response=await fetch('/account-entries.json',{cache:'no-store',credentials:'omit'});
    if(!response.ok)throw Error('Entries unavailable');
    const manifest=await response.json();
    if(manifest.version!==1||!Array.isArray(manifest.entries)||manifest.entries.length!==5)
      throw Error('Invalid entries');
    for(const entry of manifest.entries)if(!validEntryId(entry.id))throw Error('Invalid record ID');
    return manifest;
  }
  async function openEnvelope(entry,key){
    const file=await fetch('/account-files/'+entry.id+'.json',{cache:'no-store',credentials:'omit'});
    if(!file.ok)throw Error('Encrypted content unavailable');
    const sealed=await file.json();
    const plaintext=await crypto.subtle.decrypt({
      name:'AES-GCM',iv:unb64(sealed.iv),tagLength:128
    },key,unb64(sealed.ciphertext));
    const html=decoder.decode(plaintext);
    // Verify role markup only after AES-GCM's integrity check.
    if(!html.startsWith('<!doctype html>')||
       !html.includes('data-staff-role="')||
       !html.includes('id="module-frame"'))throw Error('Invalid role content');
    return html;
  }
  function activate(html,expiresAt=0){
    rememberUntil=expiresAt;
    $('access-page').hidden=true;
    $('workspace').hidden=false;
    frame.srcdoc=html;
    $('staff-password').value='';
    feedback.textContent='';
    showNotice('');
  }
  async function derive(email,password,salt){
    const material=await crypto.subtle.importKey(
      'raw',encoder.encode(JSON.stringify([email,password])),
      'PBKDF2',false,['deriveBits']);
    const bits=await crypto.subtle.deriveBits(
      {name:'PBKDF2',salt,iterations:600000,hash:'SHA-256'},material,384);
    const bytes=new Uint8Array(bits);
    return {check:bytes.slice(0,16),key:bytes.slice(16)};
  }
  async function login(email,password,remember){
    const manifest=await getManifest();
    let match=null,derived=null;
    // The public manifest carries opaque IDs and per-user KDF salts, not
    // plaintext account emails, passwords or role flags.
    for(const entry of manifest.entries){
      const bits=await derive(email,password,unb64(entry.salt));
      if(hexEq(bits.check,unb64(entry.verifier))){
        match=entry;derived=bits;
      }
    }
    if(!match||!derived)throw Error('Authentication rejected');
    const key=await crypto.subtle.importKey('raw',derived.key,'AES-GCM',false,['decrypt']);
    const html=await openEnvelope(match,key);

    // Do not fail a valid login just because private browsing / storage
    // settings prevent IndexedDB. Inform the user if opted-in persistence
    // was unavailable; default login never stores a decrypting key.
    let rememberWarning='';
    let expiresAt=0;
    if(remember){
      try{
        expiresAt=Date.now()+REMEMBER_MS;
        await storedSession('readwrite',{
          version:1,entryId:match.id,expiresAt,key
        });
      }catch{
        rememberWarning='Trình duyệt này không thể ghi nhớ đăng nhập. Bạn vẫn có thể sử dụng Workspace bình thường.';
      }
    }else{
      await safelyForget();
    }
    activate(html,expiresAt);
    if(rememberWarning)showNotice(rememberWarning);
  }
  async function logout(broadcast=true){
    // Clear persistent browser capability BEFORE exposing the login form.
    await safelyForget();
    rememberUntil=0;
    frame.srcdoc='<!doctype html><title>Signed out</title>';
    $('workspace').hidden=true;
    $('access-page').hidden=false;
    $('staff-password').value='';
    rememberInput.checked=false;
    feedback.textContent='';
    showNotice('');
    history.replaceState(null,'',location.pathname);
    if(broadcast&&channel)channel.postMessage({type:'logout'});
  }
  // Logging out of one tab should log out other same-origin open tabs too.
  let channel=null;
  try{
    channel=new BroadcastChannel('colora-staff-device-session-v1');
    channel.addEventListener('message',event=>{
      if(event.data?.type==='logout')void logout(false);
    });
  }catch{}
  $('workspace-signout').addEventListener('click',()=>void logout());
  window.addEventListener('message',event=>{
    if(event.origin===location.origin &&
       event.source===frame.contentWindow &&
       event.data?.type==='colora-workspace-logout')void logout();
  });
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(busy)return;
    const email=$('staff-email').value.trim().toLowerCase();
    const password=$('staff-password').value;
    if(!/^[a-z0-9._%+-]+@colora\.vn$/.test(email)){
      feedback.textContent=failure;return;
    }
    busy=true;submit.disabled=true;
    feedback.textContent='Đang xác thực tài khoản cá nhân…';
    try{
      await login(email,password,rememberInput.checked);
    }catch{
      feedback.textContent=failure;$('staff-password').value='';
    }finally{busy=false;submit.disabled=false}
  });

  // Resume only with an unexpired, non-extractable CryptoKey, and ONLY if
  // its opaque record ID still appears in the current server manifest.
  // Publishing regenerated envelopes or rotating a password makes the
  // browser re-prompt instead of falling back to old decrypted content.
  async function resume(){
    let saved;
    try{saved=await loadSaved()}catch{return}
    if(!saved)return;
    const allowed=saved.version===1 &&
      validEntryId(saved.entryId) &&
      Number.isFinite(saved.expiresAt) &&
      saved.expiresAt>Date.now() &&
      saved.expiresAt<=Date.now()+REMEMBER_MS &&
      saved.key?.algorithm?.name==='AES-GCM' &&
      saved.key.extractable===false &&
      saved.key.usages?.includes('decrypt');
    if(!allowed){await safelyForget();return}
    try{
      const manifest=await getManifest();
      const entry=manifest.entries.find(e=>e.id===saved.entryId);
      if(!entry)throw Error('Account envelope was rotated');
      const html=await openEnvelope(entry,saved.key);
      activate(html,saved.expiresAt);
    }catch{await safelyForget()}
  }

  // Optional on-device storage may be wiped automatically by the browser.
  // When expiry passes while a remembered workspace stays open, sign out.
  setInterval(()=>{
    if(rememberUntil&&Date.now()>rememberUntil)void logout();
  },60000);
  busy=true;submit.disabled=true;
  feedback.textContent='Đang kiểm tra phiên đã ghi nhớ…';
  try{await resume()}finally{
    busy=false;submit.disabled=false;
    if(!$('access-page').hidden)feedback.textContent='';
  }
})();