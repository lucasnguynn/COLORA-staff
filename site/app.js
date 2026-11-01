'use strict';
(function () {
  const modules = {
    learning: {title: 'Learning Studio', eyebrow: '01 / LEARNING', description: 'Thư viện học tập nội bộ. Một số nội dung còn chờ duyệt; kết quả bài thi hiện không phải chứng nhận năng lực chính thức.', url: './apps/learning/index.html'},
    'client-care': {title: 'Client Care Academy', eyebrow: '02 / CLIENT EXPERIENCE', description: 'Kiến thức và tình huống tư vấn mô phỏng. Khi tư vấn thật, đối chiếu chính sách và hồ sơ SKU đã được phê duyệt.', url: './apps/client-care/index.html'},
    qr: {title: 'QR Generator', eyebrow: '04 / CREATIVE TOOL', description: 'Tạo QR, xem trước và xuất PNG/SVG theo mẫu COLORA.', url: './apps/qr/index.html'},
    jd: {title: 'JD Library', eyebrow: '07 / SENIOR ACCESS', description: 'Soạn, quản lý và xuất mô tả công việc theo chuẩn COLORA. Dữ liệu được lưu trên chính trình duyệt này.', url: './apps/jd/index.html'}
  };
  // Role is part of the encrypted shell, not an access-control flag by
  // itself. Only Senior-encrypted HTML includes the actual bundled JD app.
  const isSenior=document.body.dataset.staffRole==='senior';
  const labels = {home:'Staff Workspace',library:'Resource Library',learning:'Learning Studio','client-care':'Client Care Academy',qr:'QR Generator',signature:'Email Signature','mail-setup':'Cài đặt Email',jd:'JD Library'};
  const $$ = s => [...document.querySelectorAll(s)];
  const $ = id => document.getElementById(id);
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sidebar=$('sidebar'), menuButton=$('mobile-menu'), shade=$('mobile-shade');
  let frame=$('module-frame');
  function freshModuleFrame(){
    // Switching from srcdoc to a normal src on the same iframe can leave
    // Chromium at about:blank due to overlapping navigation. Use a fresh
    // browsing context for each module to prevent that race.
    const next=document.createElement('iframe');
    next.id='module-frame';
    next.title='COLORA Application';
    next.setAttribute('referrerpolicy','no-referrer');
    next.setAttribute('loading','eager');
    frame.replaceWith(next);
    frame=next;
  }
  function closeMobile(){sidebar.classList.remove('open');shade.hidden=true;document.body.classList.remove('menu-open');menuButton.setAttribute('aria-expanded','false');}

  function isModuleName(view){return Object.prototype.hasOwnProperty.call(modules,view)}

  function navigate(view) {
    if (!Object.prototype.hasOwnProperty.call(labels,view) || (view==='jd'&&!isSenior)) view = 'home';
    window.COLORA_MODULE_HOST?.cleanup();
    window.COLORA_JD_WORKSPACE?.dispose();
    $('jd-workspace-controls').hidden=true;
    $('module').dataset.activeModule=isModuleName(view)?view:'';
    ['dashboard','library-view','module','signature-tool','mail-guide'].forEach(id=>$(id).hidden=true);
    const isModule=Object.prototype.hasOwnProperty.call(modules,view);
    if (isModule) {
      const data=modules[view];
      freshModuleFrame();
      $('module').hidden=false;
      $('module-title').textContent=data.title;
      $('module-eyebrow').textContent=data.eyebrow;
      $('module-description').textContent=data.description;
      frame.title=data.title;
      const controls=$('module-controls');
      const trackLabel=$('module-track-label');
      const expand=$('module-expand');
      if(view==='jd'){
        const packed=document.getElementById('bundled-jd');
        if(!isSenior || !packed)throw Error('JD is available only inside the encrypted Senior workspace');
        const markup=JSON.parse(packed.textContent);
        controls.hidden=true;
        trackLabel.hidden=true;
        expand.hidden=true;
        // The Senior envelope already decrypted JD source during the outer
        // login. srcdoc shares the Staff origin and retains local JD drafts.
        // No secret is placed into the URL, web storage, iframe, or logs.
        frame.removeAttribute('src');
        window.COLORA_JD_WORKSPACE?.mount(frame);
        frame.srcdoc=markup.replace('<base href="/apps/jd/">',
          '<base href="'+new URL('/apps/jd/',window.parent.location.origin).href+'">').trim();
        $('module-open').hidden=true;
        $('module-hint').hidden=true;
        // A missing/delayed JD bridge should never leave a silent blank.
        // A late bridge self-mounts and clears this notice when ready.
        $('module-status').textContent='Đang khởi tạo JD Library… Nếu nội dung chưa xuất hiện, hãy tải lại trang.';
        $('module-status').hidden=!!window.COLORA_JD_WORKSPACE?.mount;
      } else {
        const packed=document.getElementById('bundled-'+view);
        if(!packed)throw Error('Missing integrated Staff section: '+view);
        const childHTML=JSON.parse(packed.textContent);
        controls.hidden=view==='qr';
        trackLabel.hidden=view!=='client-care';
        expand.hidden=true;
        $('module-open').hidden=true;
        $('module-hint').hidden=true;
        // Each section uses one continuous Staff layout: no duplicate
        // sidebar, 2nd masthead, nested scroll area or external site URL.
        try{
          if(!window.COLORA_MODULE_HOST?.mount)throw Error('Module host unavailable');
          window.COLORA_MODULE_HOST.mount(
            view,frame,childHTML,
            $('module-subnav'),$('module-track'),$('module-status')
          );
        }catch(_error){
          // A runtime/URL error must not leave a seemingly successful but
          // empty page, or abort the rest of Staff navigation and breadcrumbs.
          $('module-subnav').replaceChildren();
          $('module-subnav').hidden=true;
          $('module-track').hidden=true;
          $('module-status').hidden=false;
          $('module-status').textContent='Không thể tải công cụ này. Vui lòng tải lại trang hoặc liên hệ quản trị COLORA.';
        }
      }
    } else {
      // Stop background module execution when using local tools.
      frame.removeAttribute('srcdoc');
      frame.removeAttribute('src');
      $('module-status').hidden=true;
      $(view==='home'?'dashboard':view==='library'?'library-view':view==='mail-setup'?'mail-guide':'signature-tool').hidden=false;
    }
    document.body.classList.remove('module-immersive');
    $('module-expand').setAttribute('aria-pressed','false');
    $('module-expand').textContent='Mở rộng ⤢';
    $('path-label').textContent=labels[view];
    $$('.nav-btn').forEach(btn=>{const selected=btn.dataset.view===view;btn.classList.toggle('active',selected);if(selected)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current')});
    closeMobile();
    document.title=labels[view]+' | COLORA Staff';
    window.scrollTo({top:0,behavior:'instant'});
  }
  function applyRoute(){const route=decodeURIComponent(location.hash.slice(1)||'home');const [view,detail]=route.split('/');navigate(view);if(view==='library'&&typeof window.COLORA_LIBRARY_OPEN==='function')window.COLORA_LIBRARY_OPEN(detail||'');if(view==='mail-setup'&&typeof window.COLORA_MAIL_GUIDE_SHOW==='function')window.COLORA_MAIL_GUIDE_SHOW(detail||'outlook');}
  // An explicit switch-account action clears only the Staff remember-me
  // credentials, so a remembered Staff session cannot trap Senior users.
  const switchAccount=$('switch-account');
  switchAccount?.addEventListener('click',()=>{
    try {
      localStorage.removeItem('staticrypt_passphrase');
      localStorage.removeItem('staticrypt_expiration');
    } catch (_) {}
    if(window.parent!==window){
      // Secure account-based portal owns the session in the parent document.
      // The encrypted legacy Staff login still uses the existing path.
      window.parent.postMessage({type:'colora-workspace-logout'},location.origin);
      return;
    }
    location.assign('/?staticrypt_logout=1');
  });
    document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>{
    const route=btn.dataset.view+(btn.dataset.article?'/'+btn.dataset.article:'');
    if(location.hash==='#'+route) applyRoute(); else location.hash=route;
  }));
  $('quick-library').addEventListener('click',()=>{
    location.hash='library';
    setTimeout(()=>{const input=$('library-search');input?.focus();},0);
  });
  $('module-expand').addEventListener('click',()=>{
    const enabled=document.body.classList.toggle('module-immersive');
    $('module-expand').setAttribute('aria-pressed',String(enabled));
    $('module-expand').textContent=enabled?'Thu nhỏ ⤡':'Mở rộng ⤢';
  });
  menuButton.addEventListener('click',()=>{
    const opened=sidebar.classList.toggle('open');
    shade.hidden=!opened;document.body.classList.toggle('menu-open',opened);
    menuButton.setAttribute('aria-expanded',String(opened));
    if(opened)sidebar.scrollTop=0;
  });
  shade.addEventListener('click',closeMobile);
  window.addEventListener('hashchange',applyRoute);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMobile();document.body.classList.remove('module-immersive');$('module-expand').textContent='Mở rộng ⤢';$('module-expand').setAttribute('aria-pressed','false')}});

  let signatureHTML = '';
  // Email clients handle table rows + inline pixel line-heights more consistently
  // than div margins (especially Gmail and desktop Outlook).
  function formatSignature(values) {
    const name=escapeHTML(values.get('name')).trim();
    const role=escapeHTML(values.get('role')).trim();
    const email=String(values.get('email')||'').trim();
    const phone=String(values.get('phone')||'').trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw Error('Vui lòng nhập email công việc hợp lệ.');
    const emailHref='mailto:'+encodeURIComponent(email);
    const phoneHref='tel:'+encodeURIComponent(phone.replace(/[^+\d]/g,''));
    const rowStyle='font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:18px;mso-line-height-rule:exactly;padding:0;vertical-align:top;';
    const roleRow=role?'<tr><td style="'+rowStyle+'padding-bottom:4px;color:#53647a;">'+role+'</td></tr>':'';
    const phoneRow=phone?'<tr><td style="'+rowStyle+'"><a href="'+phoneHref+'" style="color:#53647a;text-decoration:none;">'+escapeHTML(phone)+'</a></td></tr>':'';
    return [
      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;color:#002451;border-collapse:collapse;max-width:520px;">',
      '<tr><td style="padding:5px 0 18px 0;border:0;vertical-align:top;">',
      // A concise bilingual closing leads into the COLORA lockup. Keep styles
      // inline so preview, rich clipboard and exported email HTML all match.
      '<p style="margin:0 0 11px 0;padding:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;mso-line-height-rule:exactly;color:#002451;"><strong style="font-weight:700;"><em style="font-style:italic;">Kính thư / Best regards,</em></strong></p>',
      '<p aria-hidden="true" style="margin:0 0 17px 0;padding:0;width:55px;height:0;font-size:0;line-height:0;border-top:1px solid #B08A5B;"></p>',
      '<img src="https://staff.colora.vn/apps/qr/assets/colora-lettermark.png" alt="COLORA" width="148" style="display:block;border:0;width:148px;height:auto;max-width:100%;">',
      // The PNG wordmark contains a small transparent inset before its first C.
      // Offset the tagline by the same inset so both visible Cs align.
      '<div style="padding:1px 0 0 5px;margin:0;font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:600;line-height:13px;mso-line-height-rule:exactly;letter-spacing:1.6px;white-space:nowrap;color:#B08A5B;">COLOR YOUR AURA</div>',
      '</td></tr><tr><td style="border-left:3px solid #B08A5B;padding:2px 0 5px 17px;vertical-align:top;">',
      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">',
      '<tr><td style="font-size:14px;font-weight:bold;line-height:20px;mso-line-height-rule:exactly;padding:0 0 6px;color:#002451;">'+name+'</td></tr>',
      roleRow,
      '<tr><td style="'+rowStyle+'"><a href="'+emailHref+'" style="color:#53647a;text-decoration:none;">'+escapeHTML(email)+'</a></td></tr>',
      phoneRow,
      '<tr><td style="'+rowStyle+'"><a href="https://colora.vn/" style="color:#002451;text-decoration:none;">colora.vn</a></td></tr>',
      '</table></td></tr></table>'
    ].join('');
  }
  function downloadText(text,filename,mime='text/html;charset=utf-8'){
    const url=URL.createObjectURL(new Blob([text],{type:mime}));
    const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);
  }
  const signatureForm=$('signature-form');
  function renderSignature() {
    const values=new FormData(signatureForm);
    const email=String(values.get('email')||'');
    if(!values.get('name')&&!values.get('role')&&!email)return;
    try {signatureHTML=formatSignature(values);$('signature-preview').innerHTML=signatureHTML;$('signature-status').textContent='';}
    catch(err){$('signature-status').textContent=err.message;}
  }
  signatureForm.addEventListener('input',renderSignature);
  $('signature-download').addEventListener('click',()=>{
    if(!signatureForm.reportValidity())return;
    try{const html=formatSignature(new FormData(signatureForm));downloadText('<!doctype html><html><head><meta charset="utf-8"><title>COLORA Email Signature</title></head><body>'+html+'</body></html>','colora-email-signature.html');$('signature-status').textContent='Đã tải file chữ ký HTML.';}catch(err){$('signature-status').textContent=err.message;}
  });
  signatureForm.addEventListener('submit',async e=>{
    e.preventDefault();
    try {
      signatureHTML=formatSignature(new FormData(signatureForm));
      $('signature-preview').innerHTML=signatureHTML;
      if(navigator.clipboard && window.ClipboardItem && navigator.clipboard.write){
        await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([signatureHTML],{type:'text/html'}),'text/plain':new Blob([$('signature-preview').innerText],{type:'text/plain'})})]);
        $('signature-status').textContent='Đã sao chép chữ ký định dạng HTML. Bạn có thể dán vào phần chữ ký email.';
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText($('signature-preview').innerText);
        $('signature-status').textContent='Đã sao chép văn bản. Hãy chọn và sao chép phần xem trước nếu muốn giữ định dạng.';
      } else {
        $('signature-status').textContent='Hãy chọn nội dung trong khung xem trước và sao chép thủ công.';
      }
    } catch(err){$('signature-status').textContent='Không thể tự động sao chép. Chọn nội dung ở phần xem trước và sao chép thủ công.';}
  });

  applyRoute();
  // StatiCrypt replaces the whole document after a successful decrypt.
  // Keep the first-paint guard (inline in <head>) until stylesheet loading,
  // Staff app initialization, and a paint with brand fonts have completed.
  // Never reveal unformatted content when a required CSS asset fails.
  function finishStaffFirstPaint(){
    const fonts=document.fonts?.ready||Promise.resolve();
    const timeout=new Promise(resolve=>setTimeout(resolve,2800));
    Promise.race([fonts,timeout]).then(()=>{
      const sidebar=document.getElementById('sidebar');
      const themed=sidebar&&getComputedStyle(sidebar).backgroundColor==='rgb(0, 36, 81)';
      if(!themed){
        document.documentElement.dataset.coloraLoadError='true';
        return;
      }
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        // Clear the synchronous body guard only after CSS, fonts and route setup.
        document.body.style.removeProperty('visibility');
        document.body.dataset.staffReady='true';
        document.documentElement.dataset.coloraReady='true';
      }));
    }).catch(()=>{
      document.documentElement.dataset.coloraLoadError='true';
    });
  }
  if(document.readyState==='complete')finishStaffFirstPaint();
  else window.addEventListener('load',finishStaffFirstPaint,{once:true});
})();
