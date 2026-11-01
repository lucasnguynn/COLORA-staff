'use strict';
(() => {
  const resources = Array.isArray(window.COLORA_LIBRARY) ? window.COLORA_LIBRARY : [];
  const $ = id => document.getElementById(id);
  const escape = v => String(v ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const normalize = v => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
  const categories = ['Tất cả','Thương hiệu','Sản phẩm','Khách hàng','Vận hành'];
  let activeCategory = 'Tất cả';
  const filterButtons = $('library-filters'), cards=$('library-cards');

  function render() {
    const search = normalize($('library-search').value.trim());
    const visible = resources.filter(r => {
      const matchesCategory=activeCategory === 'Tất cả' || r.category===activeCategory;
      const matchesSearch=!search||normalize([r.title,r.summary,r.category,...(r.tags||[])].join(' ')).includes(search);
      return matchesCategory&&matchesSearch;
    });
    filterButtons.innerHTML=categories.map(c=>'<button type="button" class="filter-btn'+(c===activeCategory?' active':'')+'" data-filter="'+escape(c)+'" aria-pressed="'+String(c===activeCategory)+'">'+escape(c)+'</button>').join('');
    cards.innerHTML=visible.map((r,i)=>'<button type="button" class="library-card" data-resource="'+escape(r.id)+'"><span class="library-card-top"><span>'+escape(r.category)+'</span><span>'+(String(i+1).padStart(2,'0'))+'</span></span><h3>'+escape(r.title)+'</h3><p>'+escape(r.summary)+'</p><span class="library-read">Đọc tài liệu ↗</span></button>').join('');
    $('library-count').textContent='Hiển thị '+visible.length+' / '+resources.length+' tài liệu';
    $('library-empty').hidden=visible.length>0;
  }

  function showArticle(id) {
    const resource=resources.find(r=>r.id===id);
    const opened=Boolean(resource);
    $('library-list').hidden=opened;
    $('library-article').hidden=!opened;
    if(!resource)return;
    $('article-category').textContent=resource.category.toUpperCase();
    $('article-title').textContent=resource.title;
    $('article-summary').textContent=resource.summary;
    $('article-body').innerHTML=resource.sections.map(section=>{
      const paragraphs=(section.body||[]).map(t=>'<p>'+escape(t)+'</p>').join('');
      const bullets=(section.points||[]).map(t=>'<li>'+escape(t)+'</li>').join('');
      return '<section><h3>'+escape(section.title)+'</h3>'+paragraphs+(bullets?'<ul>'+bullets+'</ul>':'')+'</section>';
    }).join('');
  }

  $('library-search').addEventListener('input',render);
  filterButtons.addEventListener('click',event=>{
    const button=event.target.closest('button[data-filter]');
    if(!button)return;
    activeCategory=button.dataset.filter;
    render();
  });
  cards.addEventListener('click',event=>{
    const button=event.target.closest('button[data-resource]');
    if(button)window.location.hash='#library/'+encodeURIComponent(button.dataset.resource);
  });
  $('library-back').addEventListener('click',()=>{window.location.hash='#library';showArticle('');});
  window.COLORA_LIBRARY_OPEN=showArticle;
  render();
  const hash=decodeURIComponent(location.hash.slice(1));
  if(hash.startsWith('library/'))showArticle(hash.split('/')[1]);
})();
