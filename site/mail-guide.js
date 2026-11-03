/* COLORA Staff - mailbox onboarding; illustrations are drawn in SVG,
 * not vendor screenshots. No credentials are requested, saved or sent. */
'use strict';
(function(){
  const root=document.getElementById('mail-guide');
  if(!root)return;
  const MAIL='mail@colora.vn';
  const HOST='smtp81065.bkns.com.vn';
  const SOURCES={
    outlook:'https://support.microsoft.com/en-us/outlook/add-an-email-account-to-outlook-for-mac',
    apple:'https://support.apple.com/guide/mail/add-and-manage-email-accounts-mail35803/mac'
  };
  const data={
    outlook:[
      ['Mở Outlook','Trên Mac, mở Microsoft Outlook. Chọn Outlook > Settings (hoặc Preferences ở phiên bản cũ).','outlook-menu'],
      ['Thêm tài khoản','Chọn Accounts, sau đó nhấn + Add Account. Nếu đã có hộp thư, bạn vẫn có thể thêm tài khoản mới.','outlook-accounts'],
      ['Nhập địa chỉ email','Nhập địa chỉ mailbox BKNS của bạn và nhấn Continue.','outlook-email'],
      ['Chọn IMAP','Nếu Outlook tự nhận diện sai thành tài khoản Microsoft 365/Exchange, chuyển sang thiết lập nhà cung cấp IMAP hoặc chọn tùy chọn thiết lập thủ công nếu có.','outlook-provider'],
      ['Nhập máy chủ IMAP & SMTP','Điền chính xác máy chủ, cổng và SSL/TLS theo bảng BKNS bên trên. Bật xác thực SMTP, dùng cùng địa chỉ email và mật khẩu mailbox.','outlook-imap'],
      ['Kiểm tra gửi & nhận','Hoàn tất theo hướng dẫn của Outlook. Gửi một email thử, sau đó kiểm tra Inbox và Sent Items.','outlook-done']
    ],
    apple:[
      ['Mở Apple Mail','Trên macOS, mở Mail và chọn Mail > Add Account.','apple-menu'],
      ['Chọn loại tài khoản','Chọn Other Mail Account… (hoặc Other Account > Mail Account tùy phiên bản macOS) rồi nhấn Continue.','apple-provider'],
      ['Nhập thông tin','Tên hiển thị tùy chọn; địa chỉ email là mailbox BKNS; nhập mật khẩu mailbox và chọn Sign In.','apple-details'],
      ['Máy chủ nhận thư','Chọn Account Type: IMAP. Nhập địa chỉ email vào User Name, máy chủ BKNS vào Incoming Mail Server; dùng cổng 993 với SSL/TLS.','apple-imap'],
      ['Máy chủ gửi thư','Đặt Outgoing Mail Server là máy chủ BKNS, cổng 465 và SSL/TLS. Bật SMTP Authentication; username và password giống tài khoản mailbox.','apple-smtp'],
      ['Hoàn tất & gửi thử','Chọn Sign In hoặc Done. Nếu macOS hỏi ứng dụng được sử dụng, bật Mail; gửi/nhận một email để xác nhận.','apple-done']
    ]
  };
  let address=MAIL;
  let platform='outlook';
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const svgEsc=esc;
  function text(x,y,value,size=17,weight=400,color='#123052'){
    return '<text x="'+x+'" y="'+y+'" fill="'+color+'" font-family="Arial,Helvetica,sans-serif" font-weight="'+weight+'" font-size="'+size+'">'+svgEsc(value)+'</text>';
  }
  const rect=(x,y,w,h,fill='#FFFFFF',stroke='#D7DEEA',radius=8)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+radius+'" fill="'+fill+'" stroke="'+stroke+'"/>';
  const rule=(x1,y1,x2,y2,color='#D5DCE5')=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+color+'" stroke-width="1.5"/>';
  function dot(x,y,fill){return '<circle cx="'+x+'" cy="'+y+'" r="6" fill="'+fill+'"/>';}
  const field=(x,y,w,value,active)=>rect(x,y,w,35,active?'#F2F7FF':'#FFFFFF',active?'#3975C9':'#CDD7E2',5)+text(x+11,y+23,value,15,active?600:400);
  const blue=(x,y,w,value)=>rect(x,y,w,36,'#1165CE','#1165CE',5)+text(x+15,y+24,value,15,600,'#FFFFFF');
  function screenshot(kind){
    const isApple=kind.startsWith('apple');
    const title=isApple?'Apple Mail':'Microsoft Outlook';
    let s=rect(1,1,718,358,'#F8FAFD','#D5DBE5',16);
    s+=rect(1,1,718,40,'#EAF0F8','#EAF0F8',14)+
      dot(25,22,'#F36A65')+dot(45,22,'#FFBE49')+dot(65,22,'#54C765')+
      text(93,27,title,16,600,'#25405F')+rule(1,40,719,40);
    if(kind.endsWith('-menu')){
      s+=text(38,85,isApple?'Mail':'Outlook',19,700)+text(123,85,'File     Edit     View     Window     Help',16,400);
      s+=rect(33,104,285,220,'#FFFFFF','#CCD5E1',7);
      ['About '+(isApple?'Mail':'Outlook'),'Settings…','Accounts…','Add Account…','Hide App','Quit'].forEach((l,i)=>{
        const active=(isApple?i===3:i===1);
        if(active)s+=rect(41,144+i*31,268,30,'#1769CC','#1769CC',4);
        s+=text(57,166+i*31,l,17,active?700:400,active?'#FFF':'#203751');
      });
      s+=text(372,161,isApple?'Chọn Add Account…':'Chọn Settings…',23,600)+text(373,196,'trong thanh menu macOS',16);
      s+='<path d="M370 218 L321 212" stroke="#B08A5B" stroke-width="3" fill="none"/>';
    }else if(kind==='outlook-accounts'){
      s+=rect(26,69,216,262,'#EDF3FA','#EDF3FA',8);
      ['General','Accounts','Notifications','Email','Calendar'].forEach((v,i)=>{
        if(i===1)s+=rect(39,123,189,38,'#216BC7','#216BC7',5);
        s+=text(51,111+i*45,v,17,i===1?700:400,i===1?'#FFF':'#395068');
      });
      s+=text(284,102,'Accounts',27,700)+text(284,135,'Quản lý các tài khoản email',17);
      s+=blue(284,168,200,'+ Add Account');
      s+=rect(294,242,315,58,'#F3F7FC','#E4ECF6',5)+text(314,275,'Thêm mailbox BKNS vào Outlook',16);
    }else if(kind==='outlook-email'){
      s+=text(116,115,'Add your email address',29,700)+text(116,158,'Email address',16,600);
      s+=field(116,178,483,address,true)+blue(402,240,197,'Continue');
    }else if(kind==='outlook-provider'){
      s+=text(100,102,'Choose your email provider',27,700);
      ['Microsoft 365 / Exchange','Google','IMAP'].forEach((v,i)=>{
        if(i===2)s+=rect(100,235,505,56,'#E5F1FF','#3975C9',8);
        s+=dot(131,157+i*53,i===2?'#1967BD':'#BDC8D6')+text(157,162+i*53,v,18,i===2?700:400);
      });
      s+=text(408,316,'Chọn IMAP cho BKNS',16,600,'#9E7544');
    }else if(kind==='outlook-imap'){
      s+=text(35,76,'IMAP account settings',23,700);
      s+=text(36,111,'Email / Username',14,600)+field(36,120,309,address,false);
      s+=text(373,111,'Account type',14,600)+field(373,120,303,'IMAP',true);
      s+=text(36,184,'Incoming server',14,600)+field(36,193,310,HOST,true);
      s+=text(372,184,'Port · SSL/TLS',14,600)+field(372,193,304,'993  ·  SSL/TLS',true);
      s+=text(36,257,'Outgoing server',14,600)+field(36,266,310,HOST,true);
      s+=text(372,257,'Port · SSL/TLS',14,600)+field(372,266,304,'465  ·  SSL/TLS',true);
      s+=text(40,340,'☑ SMTP authentication · Same mailbox credentials',16,600,'#0C4C9E');
    }else if(kind==='apple-provider'){
      s+=text(112,101,'Add a Mail Account',26,700);
      ['iCloud','Microsoft Exchange','Google','Other Mail Account…'].forEach((v,i)=>{
        const y=147+i*44;
        if(i===3)s+=rect(103,y-26,498,40,'#EAF3FF','#3975C9',5);
        s+=dot(136,y-3,i===3?'#216BC7':'#FFFFFF')+text(159,y+4,v,18,i===3?700:400);
      });
      s+=blue(485,299,155,'Continue');
    }else if(kind==='apple-details'){
      s+=text(93,98,'Add a Mail Account',25,700);
      s+=text(105,145,'Name',16,600)+field(272,121,350,'COLORA',false);
      s+=text(105,207,'Email Address',16,600)+field(272,182,350,address,true);
      s+=text(105,269,'Password',16,600)+field(272,243,350,'••••••••••••',false);
      s+=blue(475,299,147,'Sign In');
    }else if(kind==='apple-imap'||kind==='apple-smtp'){
      const incoming=kind==='apple-imap';
      s+=text(47,86,incoming?'Incoming Mail Server':'Outgoing Mail Server',24,700);
      s+=text(49,129,incoming?'Account Type':'SMTP authentication',16,600);
      s+=field(268,109,399,incoming?'IMAP':'Enabled',true);
      s+=text(49,191,incoming?'Incoming Mail Server':'Outgoing Mail Server',16,600);
      s+=field(268,170,399,HOST,true);
      s+=text(49,251,'User Name',16,600)+field(268,230,399,address,false);
      s+=text(49,309,'Security / Port',16,600)+field(268,288,399,incoming?'SSL/TLS  ·  993':'SSL/TLS  ·  465',true);
    }else if(kind.endsWith('-done')){
      s+='<circle cx="358" cy="119" r="43" fill="#DDF4E5"/><path d="M335 118l17 18 30-37" fill="none" stroke="#248951" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>';
      s+=text(230,191,'Account added successfully',26,700)+text(202,231,'Gửi thử một email và kiểm tra Inbox',17);
      s+=blue(302,274,149,'Done');
    }
    return '<svg role="img" aria-label="Minh hoạ bước cài đặt '+svgEsc(title)+'" viewBox="0 0 720 360" xmlns="http://www.w3.org/2000/svg">'+s+'</svg>';
  }
  const blocks=()=>'<div class="mail-guide-settings">'+
    '<div><span>Incoming · IMAP</span><strong>'+HOST+'</strong><p><b>Port 993</b> · SSL/TLS</p></div>'+
    '<div><span>Outgoing · SMTP</span><strong>'+HOST+'</strong><p><b>Port 465</b> · SSL/TLS · Xác thực bật</p></div>'+
    '<div><span>Username / SMTP Username</span><strong class="mail-guide-current">'+esc(address)+'</strong><p>Mật khẩu: mật khẩu mailbox BKNS, dùng chung cho IMAP và SMTP</p></div>'+
    '</div>';
  function render(){
    const steps=data[platform];
    root.querySelectorAll('[data-mail-platform]').forEach(b=>{
      const selected=b.dataset.mailPlatform===platform;
      b.setAttribute('aria-selected',String(selected));
      b.tabIndex=selected?0:-1;
    });
    root.querySelector('#mail-guide-current-app').textContent=platform==='outlook'?'Microsoft Outlook':'Apple Mail';
    root.querySelector('#mail-guide-settings').innerHTML=blocks();
    root.querySelector('#mail-guide-steps').innerHTML=steps.map(([heading,description,kind],i)=>
      '<article class="mail-guide-step"><div class="mail-guide-step-top"><span class="mail-guide-num">'+String(i+1).padStart(2,'0')+'</span><div><h3>'+esc(heading)+'</h3><p>'+esc(description)+'</p></div></div>'+
      '<button type="button" class="mail-guide-image" data-mail-zoom="'+i+'" aria-label="Phóng to minh hoạ bước '+(i+1)+': '+esc(heading)+'">'+screenshot(kind)+'</button>'+
      '<div class="mail-guide-zoom-hint">Minh hoạ giao diện · Nhấn để xem lớn <span aria-hidden="true">↗</span></div></article>').join('');
    root.querySelectorAll('[data-mail-zoom]').forEach(btn=>btn.addEventListener('click',()=>{
      const index=Number(btn.dataset.mailZoom), step=steps[index];
      const dialog=root.querySelector('#mail-guide-dialog');
      dialog.querySelector('h3').textContent=(index+1)+'. '+step[0];
      dialog.querySelector('.mail-guide-modal-art').innerHTML=screenshot(step[2]);
      if(typeof dialog.showModal==='function')dialog.showModal();
    }));
  }
  window.COLORA_MAIL_GUIDE_SHOW=function(p){
    platform=p==='apple'?'apple':'outlook';
    render();
  };
  root.querySelectorAll('[data-mail-platform]').forEach(btn=>btn.addEventListener('click',()=>{
    const hash='#mail-setup/'+btn.dataset.mailPlatform;
    if(location.hash===hash){window.COLORA_MAIL_GUIDE_SHOW(btn.dataset.mailPlatform);}
    else location.hash=hash;
  }));
  const emailInput=root.querySelector('#mail-guide-email');
  emailInput.value=address;
  emailInput.addEventListener('input',()=>{
    const value=emailInput.value.trim();
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)){emailInput.setAttribute('aria-invalid','true');return;}
    emailInput.removeAttribute('aria-invalid');
    address=value;render();
  });
  root.querySelector('#mail-guide-copy').addEventListener('click',async()=>{
    const summary='BKNS mailbox\nEmail / Username: '+address+
      '\nAccount: IMAP\nIncoming: '+HOST+' | 993 | SSL/TLS\nOutgoing: '+HOST+
      ' | 465 | SSL/TLS\nSMTP authentication: Enabled, same mailbox username and password';
    try{
      await navigator.clipboard.writeText(summary);
      root.querySelector('#mail-guide-copy-status').textContent='Đã sao chép thông số (không có mật khẩu).';
    }catch{
      root.querySelector('#mail-guide-copy-status').textContent='Không thể sao chép tự động. Có thể chọn bảng thông số phía trên để sao chép.';
    }
  });
  const dialog=root.querySelector('#mail-guide-dialog');
  root.querySelector('#mail-guide-dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  root.querySelector('#mail-guide-source-outlook').href=SOURCES.outlook;
  root.querySelector('#mail-guide-source-apple').href=SOURCES.apple;
  window.COLORA_MAIL_GUIDE_SHOW(location.hash.split('/')[1]);
})();