'use strict';
/*
 * COLORA mobile UI: text-first controls with no decorative symbols on phones.
 * Decorative glyphs are wrapped, not deleted, so desktop stays unchanged.
 * Text of lessons, editable fields, images, QR and gem diagrams is preserved.
 */
(function(){
  const DECO=/[↗↖↘↪↩↻→←⤢⤡⌂⌄⌕◈◇✧▤▦▣♢✉⚙◷✓ⓘ]/u;
  const PARTS=/([↗↖↘↪↩↻→←⤢⤡⌂⌄⌕◈◇✧▤▦▣♢✉⚙◷✓ⓘ])/u;
  const UI='button,a,[role="button"],.nav-ico,.nav-symbol,.card-mark,.stat-line,.role-arrow,.avatar-mark,.gem-learning-plus,.email-template-option-arrow,.quick-search-source,.search-field';
  const tracked=new WeakSet();
  function eligible(t){
    const p=t.parentElement;
    return p && !p.closest('script,style,noscript,svg,textarea,pre,code,.mobile-decoration') && p.closest(UI);
  }
  function scrub(node,doc){
    if(node.nodeType===3){
      if(!DECO.test(node.data)||!eligible(node))return;
      const fr=doc.createDocumentFragment();
      for(const piece of node.data.split(PARTS)){
        if(!piece)continue;
        if(DECO.test(piece)){
          const span=doc.createElement('span');
          span.className='mobile-decoration';
          span.setAttribute('aria-hidden','true');
          span.textContent=piece;
          fr.appendChild(span);
        }else fr.appendChild(doc.createTextNode(piece));
      }
      node.replaceWith(fr);
      return;
    }
    if(node.nodeType!==1&&node.nodeType!==9&&node.nodeType!==11)return;
    if(node.nodeType===1&&node.matches('script,style,noscript,svg,textarea,pre,code,.mobile-decoration'))return;
    const walk=doc.createTreeWalker(node,NodeFilter.SHOW_TEXT);
    const texts=[];
    while(walk.nextNode())texts.push(walk.currentNode);
    for(const t of texts)scrub(t,doc);
  }
  const embeddedCSS='@media(max-width:760px){.mobile-decoration,.nav-ico,.nav-symbol,.card-mark,.stat-line,.gem-learning-plus,.avatar-mark,.email-template-option-arrow,svg[aria-hidden="true"],.hero-art,.facet-a,.facet-b,.status-dot{display:none!important}.mobile-nav b{display:none!important}.mobile-nav button{min-height:44px;font-size:11px!important}.gem-learning-profile summary{gap:5px}}';
  function watch(doc){
    if(!doc||!doc.body||tracked.has(doc))return;
    tracked.add(doc);
    if(doc!==document){
      const style=doc.createElement('style');
      style.id='colora-mobile-text-only';
      style.textContent=embeddedCSS;
      doc.head?.appendChild(style);
    }
    scrub(doc.body,doc);
    const observer=new MutationObserver(records=>{
      for(const r of records)for(const added of r.addedNodes)scrub(added,doc);
    });
    observer.observe(doc.body,{childList:true,subtree:true});
  }
  window.COLORA_MOBILE_MINIMAL={watch};
  function start(){
    watch(document);
    const frame=document.getElementById('module-frame');
    if(frame)frame.addEventListener('load',()=>{
      try{watch(frame.contentDocument)}catch(_){}
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();