'use strict';
(function () {
  const modules = {
    learning: {title: 'Learning Studio', eyebrow: '01 / LEARNING', description: 'Kiến thức thương hiệu, sản phẩm, khách hàng và bộ câu hỏi thực hành.', url: './apps/learning/index.html'},
    'client-care': {title: 'Client Care Academy', eyebrow: '02 / CLIENT EXPERIENCE', description: 'Quy trình tư vấn, kỹ năng dịch vụ, kiến thức đá quý và tình huống thực tế mô phỏng.', url: './apps/client-care/index.html'},
    qr: {title: 'QR Generator', eyebrow: '03 / CREATIVE TOOL', description: 'Tạo QR, xem trước và xuất PNG/SVG theo mẫu COLORA.', url: './apps/qr/index.html'},
    jd: {title: 'JD Library', eyebrow: '06 / SENIOR ACCESS', description: 'Chỉ dành cho người được cung cấp mật khẩu quản lý riêng. Mã nguồn cũ đang public, không lưu dữ liệu mật tại đây.', url: './apps/jd/index.html'}
  };
  const labels = {home:'Staff Workspace',learning:'Learning Studio','client-care':'Client Care Academy',qr:'QR Generator',signature:'Email Signature',web:'Website Generator',jd:'JD Library'};
  const $$ = s => [...document.querySelectorAll(s)];
  const $ = id => document.getElementById(id);
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const escapeAttribute = escapeHTML;
  const safeURL = raw => {try {const u = new URL(String(raw), 'https://colora.vn/');return u.protocol === 'https:' ? u.href : 'https://colora.vn/';}catch {return 'https://colora.vn/';}};
  const sidebar=$('sidebar'), menuButton=$('mobile-menu'), frame=$('module-frame');

  function navigate(view) {
    if (!Object.prototype.hasOwnProperty.call(labels,view)) view = 'home';
    ['dashboard','module','signature-tool','web-tool'].forEach(id=>$(id).hidden=true);
    const isModule=Object.prototype.hasOwnProperty.call(modules,view);
    if (isModule) {
      const data=modules[view];
      $('module').hidden=false;
      $('module-title').textContent=data.title;
      $('module-eyebrow').textContent=data.eyebrow;
      $('module-description').textContent=data.description;
      $('module-open').href=data.url;
      if (frame.getAttribute('src')!==data.url) frame.src=data.url;
      frame.title=data.title;
    } else {
      // Stop background module execution when using local tools.
      frame.removeAttribute('src');
      $(view==='home'?'dashboard':view==='signature'?'signature-tool':'web-tool').hidden=false;
    }
    $('path-label').textContent=labels[view];
    $$('.nav-btn').forEach(btn=>{const selected=btn.dataset.view===view;btn.classList.toggle('active',selected);if(selected)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current')});
    sidebar.classList.remove('open');menuButton.setAttribute('aria-expanded','false');
    document.title=labels[view]+' | COLORA Staff';
    window.scrollTo({top:0,behavior:'instant'});
  }
  function applyRoute(){navigate(decodeURIComponent(location.hash.slice(1)||'home'))}
  $$('.feature-card,.nav-btn').forEach(btn=>btn.addEventListener('click',()=>{location.hash=btn.dataset.view; if(location.hash==='#'+btn.dataset.view) applyRoute();}));
  menuButton.addEventListener('click',()=>{sidebar.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(sidebar.classList.contains('open')))});
  window.addEventListener('hashchange',applyRoute);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){sidebar.classList.remove('open');menuButton.setAttribute('aria-expanded','false')}});

  let signatureHTML = '';
  function formatSignature(values) {
    const name=escapeHTML(values.get('name')).trim();
    const role=escapeHTML(values.get('role')).trim();
    const email=String(values.get('email')||'').trim();
    const phone=String(values.get('phone')||'').trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw Error('Vui lòng nhập email công việc hợp lệ.');
    const emailHref='mailto:'+encodeURIComponent(email);
    const phoneHref='tel:'+encodeURIComponent(phone.replace(/[^+\d]/g,''));
    const phoneCell=phone?'<span style="color:#53647a"> · </span><a style="color:#53647a;text-decoration:none" href="'+phoneHref+'">'+escapeHTML(phone)+'</a>':'';
    return [
      '<table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;color:#002451;border-collapse:collapse;max-width:520px"><tr><td style="border-left:3px solid #B08A5B;padding:5px 0 5px 17px">',
      '<div style="font-family:Georgia,serif;font-weight:bold;font-size:24px;letter-spacing:2px;color:#002451">COLORA</div>',
      '<div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:2.1px;color:#B08A5B;margin-top:2px">COLOR YOUR AURA</div>',
      '<div style="font-weight:bold;font-size:14px;margin-top:16px">'+name+'</div>',
      '<div style="font-size:11px;color:#53647a;margin:4px 0 12px">'+role+'</div>',
      '<div style="font-size:11px"><a style="color:#53647a;text-decoration:none" href="'+emailHref+'">'+escapeHTML(email)+'</a>'+phoneCell+'</div>',
      '<div style="margin-top:9px;font-size:11px"><a href="https://colora.vn/" style="text-decoration:none;color:#002451">colora.vn</a></div>',
      '</td></tr></table>'
    ].join('');
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

  function generateHTML(form) {
    const title=escapeHTML(form.get('title')).trim();
    const description=escapeHTML(form.get('description')).replace(/\n/g,'<br>');
    const cta=escapeHTML(form.get('cta')).trim()||'Discover';
    const link=safeURL(form.get('link'));
    return [
      '<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
      '<title>'+title+' | COLORA</title>',
      '<style>*{box-sizing:border-box}body{background:#F4EDE1;color:#002451;margin:0;font-family:Arial,sans-serif}main{min-height:100vh;display:flex;align-items:center;padding:8vw}section{max-width:840px}.brand{font-family:Georgia,serif;font-size:28px;letter-spacing:.16em}small{font-size:10px;letter-spacing:.2em;color:#B08A5B;font-weight:bold}h1{font-family:Georgia,serif;font-weight:normal;font-size:clamp(48px,8vw,92px);line-height:1.05;margin:36px 0 24px}p{font-size:15px;line-height:1.9;max-width:650px;color:#53647a;margin-bottom:35px}a{display:inline-block;text-decoration:none;background:#002451;color:white;padding:17px 26px;font-size:12px;letter-spacing:.06em}footer{border-top:1px solid #D3C5B1;padding:24px 8vw;font-size:10px;letter-spacing:.15em}</style>',
      '</head><body><main><section><div class="brand">COLORA</div><small>COLOR YOUR AURA</small><h1>'+title+'</h1><p>'+description+'</p><a href="'+escapeAttribute(link)+'" rel="noopener noreferrer">'+cta+'</a></section></main><footer>COLORA - COLOR YOUR AURA</footer></body></html>'
    ].join('');
  }
  $('web-form').addEventListener('submit',e=>{
    e.preventDefault();
    const html=generateHTML(new FormData(e.currentTarget));
    $('web-preview').srcdoc=html;
    const blob=new Blob([html],{type:'text/html;charset=utf-8'});
    const href=URL.createObjectURL(blob);
    const anchor=document.createElement('a');
    anchor.href=href;anchor.download='colora-landing-page.html';document.body.appendChild(anchor);anchor.click();anchor.remove();
    setTimeout(()=>URL.revokeObjectURL(href),1500);
    $('web-status').textContent='Đã tạo trang HTML và bắt đầu tải xuống.';
  });
  $('web-preview').srcdoc=generateHTML(new FormData($('web-form')));
  applyRoute();
})();
