'use strict';
/**
 * COLORA module host: integrated workspace experience.
 * Original sub-app engines remain independent, but their chrome/sidebar is
 * removed at build time. Content gets its own scroll-free section of Staff.
 * Blob URLs avoid the about:srcdoc/hash-routing race that produced 404 pages.
 * Never calls other GitHub sites; all assets are on staff.colora.vn.
 */
window.COLORA_MODULE_HOST=(()=>{
  const NAV={
    learning:[
      ['home','Tổng quan'],['learn','Chương trình học'],['review','Ôn tập'],
      ['exam','Kiểm tra'],['profile','Tiến độ & cá nhân']
    ],
    'client-care':[
      ['home','Tổng quan'],['learn','Thư viện học tập'],
      ['intelligence','Product Intelligence'],['catalog','Hồ sơ sản phẩm'],
      ['scripts','Kịch bản tư vấn'],['cases','Case Lab'],
      ['practice','Luyện tập'],['exam','Kiểm tra'],['progress','Tiến độ']
    ]
  };
  let current=null;
  const $$=(selector,root)=>[...root.querySelectorAll(selector)];
  function cleanup(){
    if(!current)return;
    current.closed=true;
    if(current.poll)clearInterval(current.poll);
    if(current.resizeObserver)current.resizeObserver.disconnect();
    if(current.mutationObserver)current.mutationObserver.disconnect();
    if(current.frame&&current.listener)current.frame.removeEventListener('load',current.listener);
    if(current.url)URL.revokeObjectURL(current.url);
    current=null;
  }
  function mount(view,frame,markup,nav,track,status){
    cleanup();
    // Blob documents cannot resolve relative <base href="/apps/.../"> URLs.
    // Rewrite the build-time base to this *same* Staff origin before mounting
    // so JS, CSS, images and the QnA JSON fetches all resolve correctly.
    // The decrypted Staff shell is shown inside <iframe srcdoc>. Its
    // location is about:srcdoc, so location.origin can be the string "null"
    // even though its document inherits the trusted parent origin.
    // Resolve from the actual gateway document instead, and verify origin.
    const hostOrigin=window.parent.location.origin;
    if(!/^https?:$/.test(new URL(hostOrigin).protocol) ||
       document.referrer && new URL(document.referrer).origin!==hostOrigin) {
      throw Error('Unexpected workspace host origin');
    }
    const baseURL=new URL('/apps/'+view+'/',hostOrigin).href;
    const docMarkup=markup.replace(/<base href="\/apps\/[a-z-]+\/">/i,'<base href="'+baseURL+'">');
    if(docMarkup===markup)throw Error('Missing expected internal app base: '+view);
    const url=URL.createObjectURL(new Blob([docMarkup],{type:'text/html;charset=utf-8'}));
    const data={view,frame,url,closed:false,listener:null,resizeObserver:null,mutationObserver:null};
    current=data;
    nav.replaceChildren();
    nav.hidden=!NAV[view];
    track.hidden=true;
    track.innerHTML='';
    status.hidden=false;
    status.textContent='Đang chuẩn bị nội dung…';

    function updateHeight(){
      if(data.closed)return;
      try{
        const doc=frame.contentDocument;
        if(!doc)return;
        const target=view==='learning'?doc.querySelector('#app .content'):
          view==='client-care'?doc.getElementById('main-content'):
          doc.querySelector('.page .shell');
        if(!target)return;
        const height=Math.max(430,Math.ceil(target.scrollHeight+36));
        if(Math.abs(parseFloat(frame.style.height||0)-height)>3)frame.style.height=height+'px';
      }catch{}
    }
    function schedule(){if(!data.closed)requestAnimationFrame(updateHeight);}
    function selectedRoute(){
      try{
        const doc=frame.contentDocument;
        if(view==='client-care')return (frame.contentWindow.location.hash||'#/learn').replace(/^#\//,'').split('/')[0];
        if(view==='learning')return doc.querySelector('#app .sidebar [data-nav].active')?.dataset.nav||'learn';
      }catch{}
      return 'home';
    }
    function syncNav(){
      if(data.closed||!NAV[view])return;
      const selected=selectedRoute();
      $$('.workspace-subnav-btn',nav).forEach(btn=>{
        const active=btn.dataset.subroute===selected;
        btn.classList.toggle('active',active);
        if(active)btn.setAttribute('aria-current','page');
        else btn.removeAttribute('aria-current');
      });
      schedule();
    }
    function goTo(route){
      try{
        const win=frame.contentWindow;
        if(view==='learning'){
          if(typeof win.nav==='function')win.nav(route);
          else{
            const original=win.document.querySelector('[data-nav="'+route+'"]');
            original?.click();
          }
        } else if(view==='client-care'){
          // Blob's own fragment navigation never requests a missing GitHub
          // Pages sub-app index.html. Original app hash-based router works.
          win.location.hash='#/'+route;
        }
        syncNav();
        setTimeout(syncNav,90);
      }catch(err){status.textContent='Không thể mở mục này. Hãy thử mở lại từ thanh điều hướng Staff.';status.hidden=false;}
    }
    for(const [route,label] of NAV[view]||[]){
      const button=document.createElement('button');
      button.type='button';
      button.className='workspace-subnav-btn';
      button.dataset.subroute=route;
      button.textContent=label;
      button.addEventListener('click',()=>goTo(route));
      nav.appendChild(button);
    }
    data.listener=()=>{
      if(data.closed)return;
      // Newly inserted iframes may dispatch an initial about:blank load.
      // Do not mistake that empty document for our actual app Blob URL.
      const href=frame.contentWindow?.location?.href||'';
      if(!href.startsWith('blob:'))return;
      const doc=frame.contentDocument;
      if(!doc)return;
      frame.removeEventListener('load',data.listener);
      status.hidden=true;
      if(view==='client-care'){
        const original=doc.getElementById('role-select');
        if(original){
          track.innerHTML=original.innerHTML;
          track.value=original.value;
          track.hidden=false;
          track.onchange=()=>{
            const choice=frame.contentDocument?.getElementById('role-select');
            if(choice){
              choice.value=track.value;
              choice.dispatchEvent(new Event('change',{bubbles:true}));
              schedule();
            }
          };
        }
      }
      // Internal apps are still functional; only their own outer website shell
      // is hidden. The parent navigation controls their existing routers.
      if(view==='client-care'){
        if(!frame.contentWindow.location.hash||frame.contentWindow.location.hash==='#'){
          frame.contentWindow.location.hash='#/learn';
        }
        frame.contentWindow.addEventListener('hashchange',syncNav);
      }else if(view==='learning'){
        const currentNav=doc.querySelector('#app .sidebar [data-nav].active')?.dataset.nav;
        if(currentNav==='home')goTo('learn');
      }
      const target=view==='learning'?doc.getElementById('app'):
        view==='client-care'?doc.getElementById('main-content'):
        doc.querySelector('.page .shell');
      if(target){
        data.resizeObserver=new ResizeObserver(schedule);
        data.resizeObserver.observe(target);
        data.mutationObserver=new MutationObserver(()=>{
          if(view==='learning'&&!data.defaultOpened){
            const first=doc.querySelector('#app .sidebar [data-nav].active');
            if(first){
              data.defaultOpened=true;
              if(first.dataset.nav==='home')goTo('learn');
            }
          }
          syncNav();
          schedule();
        });
        data.mutationObserver.observe(target,{childList:true,subtree:true,attributes:false});
      }
      schedule();
      setTimeout(schedule,120);
      setTimeout(schedule,400);
      syncNav();
    };
    frame.addEventListener('load',data.listener);
    // Browser load/ResizeObserver ordering varies, especially in Cốc Cốc.
    // Keep an inexpensive, same-origin height synchronization as a safety
    // fallback so longer lessons never get a second scroll area.
    data.poll=setInterval(updateHeight,300);
    frame.removeAttribute('srcdoc');
    frame.src=url;
    return data;
  }
  return {mount,cleanup};
})();
