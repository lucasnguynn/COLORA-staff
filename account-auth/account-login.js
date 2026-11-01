/* COLORA static individual encryption gateway (NO Supabase / backend).
 * All five records are individually password-encrypted with PBKDF2/SHA256
 * (600k work factor) + AES-256-GCM. A matching email AND password are needed
 * to derive the decryption key. Only the matching ciphertext is downloaded.
 *
 * This is cryptographic access to static files, NOT verification that the
 * person owns the mailbox. Never use this for sensitive HR/customer records.
 */
'use strict';
(async () => {
  const $ = id => document.getElementById(id);
  const form=$('signin-form'), feedback=$('signin-feedback'), submit=$('signin-submit');
  const frame=$('workspace-frame');
  const decoder=new TextDecoder(),encoder=new TextEncoder();
  const failure='Không thể đăng nhập. Kiểm tra email hoặc mật khẩu Workspace và thử lại.';
  let busy=false;
  const unb64=s=>Uint8Array.from(atob(s),x=>x.charCodeAt(0));
  const hexEq=(a,b)=>{
    if(a.length!==b.length)return false;
    let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0;
  };
  async function derive(email,password,salt) {
    const material=await crypto.subtle.importKey('raw',encoder.encode(JSON.stringify([email,password])),'PBKDF2',false,['deriveBits']);
    const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:600000,hash:'SHA-256'},material,384);
    const bytes=new Uint8Array(bits);
    return {check:bytes.slice(0,16),key:bytes.slice(16)};
  }
  async function login(email,password){
    const response=await fetch('/account-entries.json',{cache:'no-store',credentials:'omit'});
    if(!response.ok)throw Error('Entries unavailable');
    const manifest=await response.json();
    if(manifest.version!==1||!Array.isArray(manifest.entries)||manifest.entries.length!==5)throw Error('Invalid entries');
    let match=null,derived=null;
    // The records contain no real email addresses or plain password hashes.
    // Every login attempt pays the work factor for all five salt records.
    for(const entry of manifest.entries){
      if(!/^[a-f0-9]{32}$/.test(entry.id))throw Error('Bad opaque record ID');
      const bits=await derive(email,password,unb64(entry.salt));
      if(hexEq(bits.check,unb64(entry.verifier))){match=entry;derived=bits;}
    }
    if(!match||!derived)throw Error('Authentication rejected');
    const file=await fetch('/account-files/'+match.id+'.json',{cache:'no-store',credentials:'omit'});
    if(!file.ok)throw Error('Encrypted content unavailable');
    const sealed=await file.json();
    const key=await crypto.subtle.importKey('raw',derived.key,'AES-GCM',false,['decrypt']);
    const plaintext=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(sealed.iv),tagLength:128},key,unb64(sealed.ciphertext));
    const html=decoder.decode(plaintext);
    // Verify internal role only after cryptographic integrity verification.
    if(!html.startsWith('<!doctype html>')||!html.includes('data-staff-role="')||!html.includes('id="module-frame"'))throw Error('Invalid role content');
    $('access-page').hidden=true;$('workspace').hidden=false;
    frame.srcdoc=html;
    $('staff-password').value='';
  }
  function logout(){
    frame.srcdoc='<!doctype html><title>Signed out</title>';
    $('workspace').hidden=true;$('access-page').hidden=false;
    $('staff-password').value='';feedback.textContent='';
    history.replaceState(null,'',location.pathname);
  }
  $('workspace-signout').addEventListener('click',logout);
  window.addEventListener('message',event=>{
    if(event.origin===location.origin&&event.source===frame.contentWindow&&event.data?.type==='colora-workspace-logout')logout();
  });
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(busy)return;
    const email=$('staff-email').value.trim().toLowerCase();
    const password=$('staff-password').value;
    if(!/^[a-z0-9._%+-]+@colora\.vn$/.test(email)){feedback.textContent=failure;return;}
    busy=true;submit.disabled=true;feedback.textContent='Đang xác thực tài khoản cá nhân…';
    try{await login(email,password);feedback.textContent=''}
    catch{feedback.textContent=failure;$('staff-password').value=''}
    finally{busy=false;submit.disabled=false}
  });
})();