'use strict';
(function () {
  const modules = {
    learning: {title: 'Learning Studio', eyebrow: '01 / LEARNING', description: 'Kiến thức thương hiệu, sản phẩm, khách hàng và bộ câu hỏi thực hành.', url: './apps/learning/index.html'},
    'client-care': {title: 'Client Care Academy', eyebrow: '02 / CLIENT EXPERIENCE', description: 'Quy trình tư vấn, kỹ năng dịch vụ, kiến thức đá quý và tình huống thực tế mô phỏng.', url: './apps/client-care/index.html'},
    qr: {title: 'QR Generator', eyebrow: '03 / CREATIVE TOOL', description: 'Tạo QR, xem trước và xuất PNG/SVG theo mẫu COLORA.', url: './apps/qr/index.html'},
    jd: {title: 'JD Library', eyebrow: '06 / SENIOR ACCESS', description: 'Chỉ dành cho người được cung cấp mật khẩu quản lý riêng. Mã nguồn cũ đang public, không lưu dữ liệu mật tại đây.', url: './apps/jd/index.html'}
  };
  const labels = {home:'Staff Workspace',library:'Resource Library',learning:'Learning Studio','client-care':'Client Care Academy',qr:'QR Generator',signature:'Email Signature',web:'Website Generator',jd:'JD Library'};
  const $$ = s => [...document.querySelectorAll(s)];
  const $ = id => document.getElementById(id);
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const escapeAttribute = escapeHTML;
  const safeURL = raw => {try {const u = new URL(String(raw), 'https://colora.vn/');return u.protocol === 'https:' ? u.href : 'https://colora.vn/';}catch {return 'https://colora.vn/';}};
  const sidebar=$('sidebar'), menuButton=$('mobile-menu'), frame=$('module-frame');

  function navigate(view) {
    if (!Object.prototype.hasOwnProperty.call(labels,view)) view = 'home';
    ['dashboard','library-view','module','signature-tool','web-tool'].forEach(id=>$(id).hidden=true);
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
      $(view==='home'?'dashboard':view==='library'?'library-view':view==='signature'?'signature-tool':'web-tool').hidden=false;
    }
    document.body.classList.remove('module-immersive');
    $('module-expand').setAttribute('aria-pressed','false');
    $('module-expand').textContent='Mở rộng ⤢';
    $('path-label').textContent=labels[view];
    $$('.nav-btn').forEach(btn=>{const selected=btn.dataset.view===view;btn.classList.toggle('active',selected);if(selected)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current')});
    sidebar.classList.remove('open');menuButton.setAttribute('aria-expanded','false');
    document.title=labels[view]+' | COLORA Staff';
    window.scrollTo({top:0,behavior:'instant'});
  }
  function applyRoute(){const route=decodeURIComponent(location.hash.slice(1)||'home');const [view,detail]=route.split('/');navigate(view);if(view==='library'&&typeof window.COLORA_LIBRARY_OPEN==='function')window.COLORA_LIBRARY_OPEN(detail||'');}
  $('[data-view]').forEach(btn=>btn.addEventListener('click',()=>{
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
  menuButton.addEventListener('click',()=>{sidebar.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(sidebar.classList.contains('open')))});
  window.addEventListener('hashchange',applyRoute);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){sidebar.classList.remove('open');menuButton.setAttribute('aria-expanded','false');document.body.classList.remove('module-immersive');$('module-expand').textContent='Mở rộng ⤢';$('module-expand').setAttribute('aria-pressed','false')}});

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

  function generateHTML(form) {
    const title=escapeHTML(form.get('title')).trim()||'COLORA';
    const eyebrow=escapeHTML(form.get('eyebrow')).trim()||'COLORA';
    const description=escapeHTML(form.get('description')).replace(/\n/g,'<br>');
    const cta=escapeHTML(form.get('cta')).trim()||'Discover COLORA';
    const link=safeURL(form.get('link'));
    const template=['editorial','announcement','minimal'].includes(form.get('template'))?form.get('template'):'editorial';
    const options={
      editorial: {background:'#F4EDE1',ink:'#002451',align:'left',accent:'#B08A5B',contentWidth:'780px',border:'transparent'},
      announcement: {background:'#002451',ink:'#F4EDE1',align:'center',accent:'#D9B98E',contentWidth:'820px',border:'#B08A5B'},
      minimal: {background:'#FFFCF8',ink:'#002451',align:'left',accent:'#B08A5B',contentWidth:'700px',border:'#D9C9B5'}
    };
    const t=options[template];
    const css='*{box-sizing:border-box}body{margin:0;background:'+t.background+';color:'+t.ink+';font-family:Arial,Helvetica,sans-serif}main{min-height:85vh;display:flex;align-items:center;justify-content:'+ (template==='announcement'?'center':'flex-start') +';padding:clamp(40px,9vw,145px) clamp(23px,8vw,135px)}section{max-width:'+t.contentWidth+';text-align:'+t.align+'}.brand{font-family:Georgia,serif;font-size:27px;letter-spacing:.15em;margin-bottom:16px}.eyebrow{font-size:10px;letter-spacing:.22em;color:'+t.accent+';font-weight:bold;text-transform:uppercase}h1{font-family:Georgia,serif;font-weight:normal;font-size:clamp(44px,7vw,94px);line-height:1.07;letter-spacing:-.03em;margin:32px 0 24px}p{font-size:15px;line-height:1.9;max-width:640px;margin:0 auto 35px;opacity:.8}section{text-align:'+t.align+'}section p{margin-left:'+(t.align==='left'?'0':'auto')+'}a{display:inline-block;text-decoration:none;background:'+(template==='announcement'?'#F4EDE1':'#002451')+';color:'+(template==='announcement'?'#002451':'#F4EDE1')+';padding:16px 26px;font-size:12px;letter-spacing:.06em}footer{border-top:1px solid '+t.border+';padding:25px 8vw;font-size:10px;letter-spacing:.15em;opacity:.7}';
    return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+' | COLORA</title><style>'+css+'</style></head><body><main><section><div class="brand">COLORA</div><div class="eyebrow">'+eyebrow+'</div><h1>'+title+'</h1><p>'+description+'</p><a href="'+escapeAttribute(link)+'" target="_blank" rel="noopener noreferrer">'+cta+'</a></section></main><footer>COLORA - COLOR YOUR AURA</footer></body></html>';
  }
  const webForm=$('web-form');
  const updateWebPreview=()=>{$('web-preview').srcdoc=generateHTML(new FormData(webForm));};
  webForm.addEventListener('input',updateWebPreview);
  webForm.addEventListener('change',updateWebPreview);
  $('web-copy').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(generateHTML(new FormData(webForm)));$('web-status').textContent='Đã sao chép mã HTML.';}
    catch{$('web-status').textContent='Trình duyệt không cho phép sao chép tự động; hãy dùng “Tải trang HTML”.';}
  });
  $('web-form').addEventListener('submit',e=>{
    e.preventDefault();
    const html=generateHTML(new FormData(e.currentTarget));
    $('web-preview').srcdoc=html;
    downloadText(html,'colora-landing-page.html');
    $('web-status').textContent='Đã tạo trang HTML và bắt đầu tải xuống.';
  });
  updateWebPreview();
  applyRoute();
})();
