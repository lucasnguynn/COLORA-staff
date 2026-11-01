/* COLORA Staff identity gateway: independent employee Supabase Auth sessions.
 * Sensitive HTML is fetched only after auth and Storage RLS permission checks.
 * Never persist an access or refresh token to localStorage or URL. */
'use strict';
(async()=>{
  const $=id=>document.getElementById(id);
  const cfg=window.COLORA_AUTH_CONFIG||{};
  const origin=String(cfg.supabaseUrl||'').replace(/\/+$/,'');
  const publishable=String(cfg.publishableKey||'');
  const valid=/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(origin)&&
    /^(sb_publishable_|eyJ)[A-Za-z0-9_.-]{15,}$/.test(publishable);
  const form=$('signin-form'),feedback=$('signin-feedback');
  const passwordForm=$('password-form'),recoverForm=$('recover-form');
  let session=null;
  let account=null;
  const jsonHeaders=()=>({'Content-Type':'application/json',apikey:publishable});
  function showError(node,message){node.textContent=message}
  function showMode(mode){
    form.hidden=mode!=='login';
    passwordForm.hidden=mode!=='password';
    recoverForm.hidden=mode!=='recover';
    $('recover-open').hidden=mode!=='login';
  }
  async function request(path,{method='GET',token,body}={}){
    const headers={...jsonHeaders()};
    if(token)headers.Authorization='Bearer '+token;
    const resp=await fetch(origin+path,{method,headers,cache:'no-store',
      credentials:'omit',referrerPolicy:'no-referrer',
      ...(body===undefined?{}:{body:JSON.stringify(body)})});
    let data;
    try{data=await resp.json()}catch{data=null}
    if(!resp.ok)throw Object.assign(new Error('Unable to complete request'),{status:resp.status});
    return data;
  }
  async function rawDocument(name,token){
    const response=await fetch(origin+'/storage/v1/object/authenticated/colora-staff-private/'+name,{
      headers:{apikey:publishable,Authorization:'Bearer '+token},
      credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'});
    if(!response.ok)throw Object.assign(new Error('Access denied'),{status:response.status});
    const text=await response.text();
    if(!text.startsWith('<!doctype html>')||!text.includes('data-staff-role=')){
      throw new Error('Unexpected workspace payload');
    }
    return text;
  }
  async function activate(payload){
    const token=payload?.access_token;
    const userId=payload?.user?.id;
    if(!token||!userId)throw Error('Missing authenticated session');
    const rows=await request('/rest/v1/colora_staff_members?select=access_role&user_id=eq.'+encodeURIComponent(userId),{token});
    if(!Array.isArray(rows)||rows.length!==1||!['staff','senior'].includes(rows[0].access_role))throw Error('Unauthorized account');
    const role=rows[0].access_role;
    const html=await rawDocument(role+'.html',token);
    // Never use user-supplied role labels or email to select the protected
    // document. Server RLS checks auth.uid and staff_members access_role.
    session={access_token:token,refresh_token:payload.refresh_token};
    account={id:userId,role};
    $('access-page').hidden=true;
    $('workspace').hidden=false;
    $('workspace-frame').srcdoc=html;
    $('staff-password').value='';
    $('new-password').value='';
    $('new-password-confirm').value='';
    history.replaceState(null,'',location.pathname+(location.hash.startsWith('#jd')&&role==='senior'?'#jd':''));
  }
  async function logout(){
    const token=session?.access_token;
    session=null;account=null;
    $('workspace-frame').srcdoc='<!doctype html><title>Signed out</title>';
    $('workspace').hidden=true;$('access-page').hidden=false;
    $('staff-password').value='';showMode('login');showError(feedback,'');
    history.replaceState(null,'',location.pathname);
    if(token)request('/auth/v1/logout',{method:'POST',token}).catch(()=>{});
  }
  $('workspace-signout').addEventListener('click',logout);
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||event.source!==$('workspace-frame').contentWindow)return;
    if(event.data?.type==='colora-workspace-logout')logout();
  });
  $('signin-form').addEventListener('submit',async e=>{
    e.preventDefault();
    const button=$('signin-submit'),email=$('staff-email').value.trim().toLowerCase();
    if(!email.endsWith('@colora.vn')){showError(feedback,'Vui lòng sử dụng email công ty.');return}
    button.disabled=true;showError(feedback,'Đang xác thực tài khoản…');
    try{
      const result=await request('/auth/v1/token?grant_type=password',{
        method:'POST',body:{email,password:$('staff-password').value}});
      await activate(result);
    }catch{
      // Same error for bad password, unknown email and revoked role to avoid
      // exposing whether an employee account exists.
      showError(feedback,'Không thể đăng nhập. Hãy kiểm tra thông tin hoặc liên hệ quản trị COLORA.');
      $('staff-password').value='';
    }finally{button.disabled=false}
  });
  $('recover-open').addEventListener('click',()=>{showMode('recover');showError($('recover-feedback'),'')});
  $('recover-back').addEventListener('click',()=>showMode('login'));
  recoverForm.addEventListener('submit',async e=>{
    e.preventDefault();
    const email=$('recover-email').value.trim().toLowerCase();
    if(!email.endsWith('@colora.vn')){showError($('recover-feedback'),'Vui lòng dùng email công ty.');return}
    try{await request('/auth/v1/recover',{method:'POST',body:{email}})}catch{}
    // Intentionally non-enumerating.
    showError($('recover-feedback'),'Nếu tài khoản đã được cấp quyền, hãy kiểm tra email để đặt lại mật khẩu.');
  });
  passwordForm.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!session){showError($('password-feedback'),'Liên kết đã hết hiệu lực. Hãy yêu cầu lời mời mới.');return}
    const pass=$('new-password').value;
    if(pass.length<12||pass!==$('new-password-confirm').value){
      showError($('password-feedback'),'Mật khẩu cần ít nhất 12 ký tự và hai lần nhập phải trùng nhau.');return;
    }
    try{
      await request('/auth/v1/user',{method:'PUT',token:session.access_token,body:{password:pass}});
      // The invite grant is already authenticated. Check role and download
      // the payload only after the employee sets their personal password.
      const user=await request('/auth/v1/user',{token:session.access_token});
      const saved={...session,user};
      await activate(saved);
    }catch{showError($('password-feedback'),'Không thể lưu mật khẩu. Vui lòng yêu cầu lại liên kết kích hoạt.')}
  });
  if(!valid){
    showError(feedback,'Chưa cấu hình dịch vụ xác thực. Liên hệ quản trị COLORA.');
    $('signin-submit').disabled=true;return;
  }
  // Supabase invite/recovery URLs can be customized to:
  // https://staff.colora.vn/?token_hash={{ .TokenHash }}&type=invite
  // Token is removed from browser history immediately after parsing.
  const url=new URL(location.href);
  const fragment=new URLSearchParams(url.hash.startsWith('#')?url.hash.slice(1):'');
  const hash=url.searchParams.get('token_hash');
  const inviteType=url.searchParams.get('type');
  const implicit=fragment.get('access_token');
  history.replaceState(null,'',location.pathname);
  try{
    let auth=null;
    if(hash&&['invite','recovery'].includes(inviteType)){
      auth=await request('/auth/v1/verify',{method:'POST',body:{token_hash:hash,type:inviteType}});
    }else if(implicit&&['invite','recovery'].includes(fragment.get('type'))){
      // Implicit URL hash tokens are returned by standard invite links.
      auth={access_token:implicit,refresh_token:fragment.get('refresh_token')};
      auth.user=await request('/auth/v1/user',{token:implicit});
    }
    if(auth?.access_token){
      session=auth;
      showMode('password');
      showError($('password-feedback'),'Đặt mật khẩu riêng để kích hoạt tài khoản.');
    }
  }catch{showError(feedback,'Liên kết không hợp lệ hoặc hết hiệu lực. Vui lòng yêu cầu lời mời mới.')}
})();
