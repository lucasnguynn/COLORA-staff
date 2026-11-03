/* COLORA CLIENT CARE ACADEMY
   Public, static, zero-backend training tool.
   No authentication and no real customer data.
*/
(function(){
  "use strict";
  var D=window.COLORA_DATA;
  var I=window.COLORA_INTELLIGENCE;
  var ROOT=document.getElementById("main-content");
  var STORE_KEY="colora-academy-v1-public";
  var state={role:"all",completed:[],results:[],quiz:null,lessonSearch:"",scriptSearch:"",scriptFilter:"Tất cả",caseStudy:null,stoneSearch:"",stoneLevel:"all",roleplayId:null,roleplayDraft:"",roleplayChecks:{},roleplayReveal:false,roleplayEvaluated:false};
  var scriptTypes=["Tất cả","Tư vấn","Đá quý","Chất liệu","Chăm sóc","Bảo hành","Đổi trả","Giao hàng","Hậu mãi","Tin cậy"];
  var labels={catalog:"Hồ sơ sản phẩm",product:"Thông tin SKU",release:"Publication Control",review:"Facilitator Review",intelligence:"Product Intelligence",stone:"Gemstone Guide",evidence:"SKU Evidence Gate",roleplay:"Advisor Role-play",home:"Tổng quan",learn:"Thư viện học tập",lesson:"Nội dung bài học",scripts:"Thư viện kịch bản",cases:"Case Lab",case:"Tình huống thực hành",practice:"Luyện tập",exam:"Kiểm tra cuối",progress:"Tiến độ của tôi",resources:"Chính sách & nguồn"};

  function esc(x){return String(x==null?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
  function load(){try{var s=JSON.parse(localStorage.getItem(STORE_KEY)||"{}");if(D.roles.some(function(r){return r.id===s.role;}))state.role=s.role;if(Array.isArray(s.completed))state.completed=s.completed.filter(function(v){return typeof v==="string" && D.lessons.some(function(l){return l.id===v;});});if(Array.isArray(s.results))state.results=s.results.filter(function(x){return x && typeof x.percent==="number";}).slice(-30);}catch(e){}}
  function save(){try{localStorage.setItem(STORE_KEY,JSON.stringify({role:state.role,completed:state.completed,results:state.results}));}catch(e){}}
  function roleObj(){return D.roles.find(function(x){return x.id===state.role;})||D.roles[0];}
  function visibleLessons(){return D.lessons.filter(function(l){return l.roles.indexOf("all")>-1||l.roles.indexOf(state.role)>-1;});}
  function completedLessons(){return visibleLessons().filter(function(l){return state.completed.indexOf(l.id)>-1;}).length;}
  function progressPct(){var ls=visibleLessons();return ls.length?Math.round(completedLessons()*100/ls.length):0;}
  function eligibleQ(){return D.questions.filter(function(q){return q.track==="all"||q.track===state.role;});}
  function href(route){return "#/"+route;}
  function toast(msg){var t=document.getElementById("toast");t.textContent=msg;t.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(function(){t.hidden=true;},2800);}
  function titleBlock(k,title,desc){return '<div class="page-intro"><p class="eyebrow">'+esc(k)+'</p><h1 class="heading-serif">'+esc(title)+'</h1><p class="page-subtitle">'+esc(desc)+'</p></div>';}
  function btn(label,url,cls){return '<a class="btn '+(cls||"btn-navy")+'" href="'+href(url)+'">'+esc(label)+'</a>';}
  function status(l){return state.completed.indexOf(l.id)>-1?'<span class="lesson-status">Đã đọc</span>':'<span class="lesson-status not-done">Chưa đọc</span>';}
  function lessonCard(l){return '<a class="lesson-card" href="'+href("lesson/"+l.id)+'"><div class="lesson-top"><span class="lesson-no">'+esc(l.no)+'</span>'+status(l)+'</div><p class="lesson-tag">'+esc(l.tag)+'</p><h3>'+esc(l.title)+'</h3><p>'+esc(l.summary)+'</p><div class="lesson-bottom"><span>◷ '+l.minutes+' phút</span><b>Khám phá &nbsp; ↗</b></div></a>';}
  function roleCard(r,index){var count=D.lessons.filter(function(l){return l.roles.indexOf("all")>-1||l.roles.indexOf(r.id)>-1;}).length;var done=D.lessons.filter(function(l){return (l.roles.indexOf("all")>-1||l.roles.indexOf(r.id)>-1)&&state.completed.indexOf(l.id)>-1;}).length;return '<button type="button" class="role-card '+(r.id===state.role?"selected":"")+'" data-role="'+esc(r.id)+'" aria-pressed="'+(r.id===state.role)+'"><span class="role-index">0'+(index+1)+'</span><h3>'+esc(r.name)+'</h3><p class="role-sub">'+esc(r.subtitle)+'</p><p class="role-desc">'+esc(r.description)+'</p><span class="role-arrow">Chọn lộ trình <span>↗</span></span><div class="mini-progress"><span style="width:'+(count?Math.round(done*100/count):0)+'%"></span></div></button>';}
  function sectionHead(title,sub,link,label){return '<div class="section-head"><div><h2>'+esc(title)+'</h2>'+(sub?'<p>'+esc(sub)+'</p>':"")+'</div>'+(link?'<a class="subtle-link" href="'+href(link)+'">'+esc(label)+' ↗</a>':"")+'</div>';}
  function heroArt(){return '<svg class="hero-art" viewBox="0 0 390 390" fill="none" aria-hidden="true"><path d="M184 12 338 138 314 283 168 374 24 232 45 103Z"/><path class="facet-bright" d="M184 12 189 156 338 138Z"/><path d="M184 12 189 156 338 138 314 283 168 374 24 232 45 103 184 12ZM45 103 189 156 24 232M338 138 189 156 314 283M24 232 189 156 168 374M314 283 168 374 189 156M184 12 45 103M45 103 168 374M338 138 168 374"/><path class="facet-bright" d="M24 232 189 156 168 374Z"/></svg>';}
  function home(){
    var role=roleObj();
    var s='<div class="page"><section class="hero"><div class="hero-content"><p class="hero-kicker">COLORA · CLIENT EXPERIENCE EDUCATION</p><h1>Care is another<br><em>facet of feeling.</em></h1><p class="hero-desc">Một không gian để hiểu thương hiệu, hiểu sản phẩm, thực hành tư vấn và mang đến sự an tâm trong suốt hành trình sở hữu COLORA.</p><div class="hero-action">'+btn("Bắt đầu học tập","learn","btn-gold")+btn("Khám phá Product Intelligence","intelligence","btn-outline-light")+'</div></div>'+heroArt()+'</section>';
    s+='<div class="stats-grid"><div class="stat-card"><div><strong>'+visibleLessons().length+'</strong><p>CHUYÊN ĐỀ TRONG LỘ TRÌNH</p></div><span class="stat-line">◈</span></div><div class="stat-card"><div><strong>'+completedLessons()+' / '+visibleLessons().length+'</strong><p>CHUYÊN ĐỀ ĐÃ ĐỌC</p></div><span class="stat-line">✓</span></div><div class="stat-card"><div><strong>'+progressPct()+'%</strong><p>TIẾN ĐỘ HỌC TẬP</p></div><span class="stat-line">↗</span></div></div>';
    s+=sectionHead("Lựa chọn lộ trình","Nội dung chung được kế thừa giữa các lộ trình; mỗi vai trò có thêm chuyên đề phù hợp.");
    s+='<div class="role-grid">'+D.roles.map(roleCard).join("")+'</div>';
    s+=sectionHead("Tiếp tục khám phá","Lộ trình hiện tại: "+role.name,"learn","Xem tất cả");
    s+='<div class="lesson-grid">'+visibleLessons().filter(function(l){return state.completed.indexOf(l.id)===-1;}).concat(visibleLessons().filter(function(l){return state.completed.indexOf(l.id)>-1;})).slice(0,3).map(lessonCard).join("")+'</div>';
    s+=sectionHead("The client journey","Một hành trình quan hệ, không chỉ một hành trình mua hàng.");
    var stages=[["Discover","Khám phá"],["Desire","Mong muốn"],["Trust","Tin tưởng"],["Experience","Trải nghiệm"],["Possess","Sở hữu"],["Return","Quay lại"],["Belong","Gắn bó"]];
    s+='<div class="timeline">'+stages.map(function(x){return '<div class="timeline-step"><strong>'+x[0]+'</strong><small>'+x[1]+'</small></div>';}).join("")+'</div>';
    s+='<div class="insight-band"><div><h3>Learning is caring.</h3><p>Học kiến thức, thực hành Case Lab rồi làm bài kiểm tra. Việc cho phép tư vấn độc lập vẫn do người quản lý đánh giá.</p></div>'+btn("Thực hành Case Lab","cases","btn-navy")+'</div></div>';
    ROOT.innerHTML=s;
  }
  function learn(){
    ROOT.innerHTML='<div class="page">'+titleBlock("KNOWLEDGE LIBRARY","Thư viện học tập","Những kiến thức nền tảng để mọi lời tư vấn đều có sự ấm áp, chính xác và trách nhiệm.")+'<div class="toolbar"><input class="searchbox" id="lesson-search" type="search" value="'+esc(state.lessonSearch)+'" placeholder="Tìm theo chủ đề, kiến thức, từ khóa..." aria-label="Tìm chuyên đề"><span class="count-label" id="lesson-count"></span></div><div class="lesson-grid" id="lesson-list"></div></div>';
    updateLessons();
  }
  function updateLessons(){
    var el=document.getElementById("lesson-list");if(!el)return;
    var term=state.lessonSearch.trim().toLocaleLowerCase("vi");
    var list=visibleLessons().filter(function(l){var all=[l.title,l.tag,l.summary].concat(l.sections.map(function(s){return s.h+" "+s.p;})).join(" ").toLocaleLowerCase("vi");return all.indexOf(term)>-1;});
    el.innerHTML=list.length?list.map(lessonCard).join(""):'<div class="empty-state"><strong>Chưa tìm thấy nội dung.</strong>Hãy thử từ khóa khác hoặc chọn lộ trình khác.</div>';
    document.getElementById("lesson-count").textContent=list.length+" chuyên đề";
  }
  function lesson(id){
    var l=D.lessons.find(function(x){return x.id===id;});if(!l){notFound();return;}
    var done=state.completed.indexOf(id)>-1;
    var s='<div class="page"><button class="detail-back" data-go="learn" type="button">← Trở lại thư viện</button><section class="detail-hero"><p class="eyebrow">MODULE '+esc(l.no)+' / '+esc(l.tag)+'</p><h1>'+esc(l.title)+'</h1><p>'+esc(l.summary)+'</p><div class="detail-meta"><span class="pill">◷ '+l.minutes+' phút đọc</span><span class="pill">'+(done?"Đã hoàn thành":"Đang học")+'</span><span class="pill">'+(l.roles.indexOf("all")>-1?"Nội dung nền tảng":l.roles.join(", "))+'</span></div></section><div class="detail-grid"><article class="lesson-article">'+l.sections.map(function(sec,i){return '<section class="article-section"><p class="eyebrow">PHẦN '+(i+1).toString().padStart(2,"0")+'</p><h2>'+esc(sec.h)+'</h2><p>'+esc(sec.p)+'</p></section>';}).join("")+'</article><aside class="aside-panel"><p class="eyebrow">QUICK TAKEAWAYS</p><h3>Điều cần nhớ</h3><ul class="check-list">'+l.checks.map(function(c){return '<li>'+esc(c)+'</li>';}).join("")+'</ul><p class="source-line">Tham khảo: '+esc(l.source)+'</p><button type="button" class="btn '+(done?"btn-ghost":"btn-navy")+'" data-complete="'+esc(l.id)+'">'+(done?"✓ Đã đọc · Bỏ đánh dấu":"Đánh dấu đã đọc")+'</button></aside></div><div class="insight-band"><div><h3>Biết đúng, tư vấn đúng.</h3><p>Đã nắm kiến thức? Kiểm tra khả năng ứng dụng vào tình huống thực tế.</p></div>'+btn("Luyện tập kiến thức","practice","btn-navy")+'</div></div>';
    ROOT.innerHTML=s;
  }
  function scripts(){
    ROOT.innerHTML='<div class="page">'+titleBlock("THE LANGUAGE OF CARE","Thư viện kịch bản","18 lời nhắn gợi ý theo cách trò chuyện hằng ngày. Hãy điều chỉnh cho đúng khách và đúng tình huống trước khi gửi.")+'<div class="notice"><strong>Lưu ý:</strong> Đây là lời nhắn để tham khảo, không phải mẫu bắt buộc gửi nguyên văn. Với thông tin sản phẩm, bảo hành, đổi trả hoặc chi phí, hãy kiểm tra hồ sơ và chính sách áp dụng trước khi xác nhận.</div><div class="toolbar"><input class="searchbox" id="script-search" type="search" value="'+esc(state.scriptSearch)+'" placeholder="Tìm theo nhu cầu hoặc tình huống..." aria-label="Tìm kịch bản"><span class="count-label" id="script-count"></span></div><div class="chips" id="script-chips">'+scriptTypes.map(function(t){return '<button type="button" data-script-filter="'+esc(t)+'" class="chip '+(state.scriptFilter===t?"active":"")+'">'+esc(t)+'</button>';}).join("")+'</div><div style="height:23px"></div><div class="script-grid" id="script-list"></div></div>';
    updateScripts();
  }
  function updateScripts(){
    var el=document.getElementById("script-list");if(!el)return;
    var term=state.scriptSearch.trim().toLocaleLowerCase("vi");
    var list=D.scripts.filter(function(x){return (state.scriptFilter==="Tất cả"||x.type===state.scriptFilter)&&[x.title,x.type,x.intent,x.reply,x.check].join(" ").toLocaleLowerCase("vi").indexOf(term)>-1;});
    el.innerHTML=list.length?list.map(function(x){return '<article class="script-card"><div class="script-top"><span class="script-type">'+esc(x.type)+'</span><span class="count-label">SCRIPT '+esc(x.id.toUpperCase())+'</span></div><h3>'+esc(x.title)+'</h3><p class="script-intent">'+esc(x.intent)+'</p><p class="script-text">'+esc(x.reply)+'</p><p class="script-warning"><strong>Nhớ kiểm tra:</strong> '+esc(x.check)+'</p><div class="script-bottom"><button type="button" class="btn btn-sm btn-ghost" data-copy-script="'+esc(x.id)+'">Sao chép lời nhắn</button></div></article>';}).join(""):'<div class="empty-state"><strong>Chưa có kịch bản phù hợp.</strong>Thử một nhóm khác hoặc thay đổi từ khóa.</div>';
    document.getElementById("script-count").textContent=list.length+" kịch bản";
    var chips=document.querySelectorAll("[data-script-filter]");chips.forEach(function(b){b.classList.toggle("active",b.dataset.scriptFilter===state.scriptFilter);});
  }

  function caseLibrary(){
    var list=D.cases.filter(function(c){return c.roles.indexOf(state.role)>-1||state.role==="all";});
    var cards=list.map(function(c){
      return '<a class="lesson-card" href="'+href("case/"+c.id)+'"><div class="lesson-top"><span class="lesson-no">◇</span><span class="lesson-status not-done">'+c.steps.length+' bước</span></div><p class="lesson-tag">'+esc(c.category)+' · '+esc(c.level)+'</p><h3>'+esc(c.title)+'</h3><p>'+esc(c.scenario)+'</p><div class="lesson-bottom"><span>◷ '+c.time+' phút</span><b>Giải tình huống ↗</b></div></a>';
    }).join("");
    ROOT.innerHTML='<div class="page">'+titleBlock("APPLIED PRACTICE","Case Lab","Mỗi tình huống gồm ba quyết định nối tiếp. Chọn phương án, nhận phản biện và xem lý do vì sao một cách xử lý an toàn hơn. Tất cả là tình huống giả định, không dùng dữ liệu khách thật.")+'<div class="notice"><strong>Giới hạn:</strong> Đây là công cụ tự học, không phải chứng nhận đủ năng lực tư vấn. Case có thể có nhiều lựa chọn hợp lý theo bối cảnh; bài tập mô phỏng giả định cụ thể.</div><div class="lesson-grid">'+cards+'</div></div>';
  }
  function caseDetail(id){
    var c=D.cases.find(function(x){return x.id===id;});
    if(!c){notFound();return;}
    if(!state.caseStudy||state.caseStudy.id!==id){state.caseStudy={id:id,index:0,answers:{},done:false,recorded:false};}
    var run=state.caseStudy,step=c.steps[run.index],has=Object.prototype.hasOwnProperty.call(run.answers,run.index),choice=has?run.answers[run.index]:null;
    var top='<div class="page"><button class="detail-back" data-go="cases" type="button">← Trở lại Case Lab</button><div class="detail-hero"><p class="eyebrow">'+esc(c.category)+' / '+esc(c.level)+'</p><h1>'+esc(c.title)+'</h1><p>'+esc(c.scenario)+'</p><div class="detail-meta"><span class="pill">◷ '+c.time+' phút</span><span class="pill">Giả định đào tạo</span></div></div>';
    if(run.done){
      var score=c.steps.reduce(function(n,st,i){return n+(run.answers[i]===st.best?1:0);},0);
      var review=c.steps.map(function(st,i){return '<div class="review-item"><h4>'+esc((i+1)+". "+st.question)+'</h4><p class="'+(run.answers[i]===st.best?"correct-label":"wrong-label")+'">Lựa chọn: '+esc(st.choices[run.answers[i]]||"Chưa trả lời")+'</p><p class="correct-label">Phương án được ưu tiên: '+esc(st.choices[st.best])+'</p><p>'+esc(st.why)+'</p></div>';}).join("");
      ROOT.innerHTML=top+'<section class="quiz-result" style="margin-top:23px;max-width:none"><p class="eyebrow">CASE REVIEW</p><div class="result-medallion">'+score+'/'+c.steps.length+'</div><h2>'+(score===c.steps.length?"Đã chọn đúng các ưu tiên trong mô phỏng.":"Cùng xem lại các quyết định.")+'</h2><p>Điểm case chỉ hỗ trợ tự đánh giá. Trường hợp thực tế vẫn cần hồ sơ SKU, chính sách và phê duyệt nghiệp vụ.</p><div class="progress-actions" style="justify-content:center">'+btn("Quay lại Case Lab","cases","btn-ghost")+'<button type="button" class="btn btn-navy" data-case-restart="'+esc(c.id)+'">Làm lại tình huống</button></div><div class="review-list">'+review+'</div></section></div>';
      return;
    }
    var progress=Math.round((run.index+1)*100/c.steps.length);
    var options=step.choices.map(function(v,i){return '<button type="button" class="option '+(choice===i?"selected "+(i===step.best?"correct":"wrong"):"")+'" data-case-option="'+i+'" '+(has?"disabled":"")+'><b>'+String.fromCharCode(65+i)+'</b><span>'+esc(v)+'</span></button>';}).join("");
    var feedback=has?'<div class="quiz-feedback"><strong>'+(choice===step.best?"Lựa chọn phù hợp.":"Cần cân nhắc thêm.")+'</strong><p>'+esc(step.why)+'</p><p><strong>Nguyên tắc bảo vệ:</strong> '+esc(step.risk)+'</p></div>':"";
    var actions='<div class="quiz-controls"><button class="btn btn-ghost" type="button" data-go="cases">← Thư viện</button><button class="btn btn-navy" type="button" data-case-next="1" '+(has?"":"disabled")+'>'+(run.index===c.steps.length-1?"Xem đánh giá":"Tiếp theo")+' ↗</button></div>';
    ROOT.innerHTML=top+'<div class="quiz-main" style="margin-top:23px"><div class="quiz-head"><span>DECISION '+(run.index+1)+' / '+c.steps.length+'</span><span>'+progress+'%</span></div><div class="quiz-bar"><span style="width:'+progress+'%"></span></div><section class="quiz-card"><p class="quiz-number">CHỌN CÁCH XỬ LÝ</p><h2>'+esc(step.question)+'</h2><div class="options">'+options+'</div>'+feedback+actions+'</section></div></div>';
  }

  // V2 is public learning reference. It contains NO verified COLORA inventory or customer data.
  function gemCard(g){
    return '<a class="gem-card" href="'+href("stone/"+g.id)+'"><span class="gem-card-top"><span class="eyebrow">'+(g.corePortfolio?'9 DÒNG CHỦ ĐẠO':'ĐÁ THAM KHẢO')+' · GIA REFERENCE</span><span class="gem-mohs">'+esc(g.mohs)+'</span></span><h3>'+esc(g.name)+'</h3><p class="gem-family">'+esc(g.family)+' · Mohs '+esc(g.mohs)+'</p><p>'+esc(g.caution)+'</p><div class="gem-card-bottom"><span>Độ dai: '+esc(g.toughness)+'</span><b>Khám phá ↗</b></div></a>';
  }
  function cutShape(id){
    var shapes={
      round:'<circle cx="60" cy="48" r="28"/>',
      oval:'<ellipse cx="60" cy="48" rx="22" ry="35"/>',
      pear:'<path d="M60 8 C44 30 33 43 35 59 C36 76 47 85 60 85 C73 85 84 76 85 59 C87 43 76 30 60 8 Z"/>',
      marquise:'<path d="M60 7 Q97 47 60 88 Q23 47 60 7Z"/>',
      emerald:'<path d="M42 10 H78 L94 26 V70 L78 86 H42 L26 70 V26 Z"/>',
      cushion:'<rect x="28" y="13" width="64" height="70" rx="21"/>',
      cabochon:'<ellipse cx="60" cy="48" rx="27" ry="35"/><path d="M33 48 Q60 10 87 48"/>'
    };
    return '<svg viewBox="0 0 120 96" class="cut-svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5">'+(shapes[id]||"")+'</svg>';
  }
  function intelligence(){
    var gems=I.gems.filter(function(g){
      var hay=[g.name,g.family,g.mohs,g.toughness,g.caution,g.wear,g.risk].join(" ").toLocaleLowerCase("vi");
      return hay.indexOf(state.stoneSearch.toLocaleLowerCase("vi").trim())>-1;
    });
    ROOT.innerHTML='<div class="page">'+titleBlock("COLORA PRODUCT INTELLIGENCE","Hiểu sản phẩm, trước khi tư vấn","Gồm chín dòng đá màu chủ đạo của COLORA và các loại đá khác để tham khảo. Kiến thức không phải hồ sơ sản phẩm đang bán.")+
      '<div class="notice"><strong>Định nghĩa nguồn:</strong> “GIA reference” = kiến thức khoáng vật học từ GIA. “Verified COLORA SKU” = hồ sơ của đúng mã hàng đã được QC xác nhận. Hiện Academy không chứa hồ sơ SKU đã phê duyệt và không chứng minh COLORA có bán các loại đá dưới đây.</div>'+
      '<div class="intelligence-actions"><a class="intelligence-link" href="'+href("evidence")+'"><span class="eyebrow">THE PROOF</span><h3>SKU Evidence Gate</h3><p>7 nhóm thông tin cần xác minh, bằng chứng và owner trước khi tư vấn.</p><span>Kiểm tra tiêu chuẩn ↗</span></a><a class="intelligence-link" href="'+href("roleplay")+'"><span class="eyebrow">THE PRACTICE</span><h3>Advisor Role-play</h3><p>Viết phản hồi cho tình huống giả định và tự chấm theo rubric.</p><span>Luyện tập ↗</span></a></div>'+
      sectionHead("Gemstone Guide - 9 dòng đá chủ đạo","Các dòng đá COLORA lựa chọn làm định hướng danh mục được hiển thị trước. Xem nhóm, độ bền, lưu ý và nguồn GIA.")+
      '<div class="toolbar"><input id="stone-search" type="search" class="searchbox" placeholder="Tìm đá, thông số hoặc rủi ro..." aria-label="Tìm kiến thức đá" value="'+esc(state.stoneSearch)+'"><span class="count-label" id="stone-count">'+gems.length+' loại đá tham khảo</span></div>'+
      '<div class="gem-grid" id="gem-list">'+(gems.length?gems.map(gemCard).join(""):'<div class="empty-state"><strong>Không có kết quả</strong>Hãy thử từ khóa khác.</div>')+'</div>'+
      sectionHead("12 tình huống tư vấn đá màu","Mở từng câu hỏi để xem cách trả lời ngắn, dễ hiểu. Ví dụ học tập, không thay hồ sơ SKU hoặc chính sách đã duyệt.")+
      '<div class="stone-talks">'+I.conversations.map(function(x,i){return '<details class="stone-talk"><summary><span class="eyebrow">TÌNH HUỐNG '+String(i+1).padStart(2,"0")+'</span><strong>'+esc(x.question)+'</strong></summary><p>'+esc(x.reply)+'</p><p class="care-note"><strong>Cần nhớ:</strong> '+esc(x.avoid)+'</p></details>';}).join("")+'</div>'+
      sectionHead("Cut & Silhouette","Hình phác thảo nguyên lý, không biểu thị độ sâu hoặc tỷ lệ kỹ thuật của viên đá thật.")+
      '<div class="cut-grid">'+I.cuts.map(function(c){return '<article class="cut-card">'+cutShape(c.shape)+'<h3>'+esc(c.name)+'</h3><p><strong>'+esc(c.focus)+'</strong></p><p>'+esc(c.tradeoff)+'</p><p class="cut-note">'+esc(c.setting)+'</p></article>';}).join("")+'</div>'+
      '<div class="insight-band"><div><h3>Hardness ≠ Toughness ≠ Stability</h3><p>Không dùng thang Mohs như chỉ số duy nhất để khẳng định đeo hằng ngày an toàn.</p></div><a class="btn btn-navy" target="_blank" rel="noopener noreferrer" href="'+esc(I.generalSources[0].url)+'">Đọc kiến thức GIA ↗</a></div></div>';
  }
  function updateGemSearch(){
    var list=document.getElementById("gem-list"),count=document.getElementById("stone-count");if(!list)return;
    var word=state.stoneSearch.toLocaleLowerCase("vi").trim();
    var arr=I.gems.filter(function(g){return [g.name,g.family,g.mohs,g.toughness,g.caution,g.wear,g.risk].join(" ").toLocaleLowerCase("vi").includes(word);});
    list.innerHTML=arr.length?arr.map(gemCard).join(""):'<div class="empty-state"><strong>Không tìm thấy</strong>Thử theo tên đá hoặc đặc tính.</div>';count.textContent=arr.length+" loại đá tham khảo";
  }
  function stoneDetail(id){
    var g=I.gems.find(function(x){return x.id===id;});
    if(!g){notFound();return;}
    var rows=[["Nhóm khoáng vật",g.family],["Mohs (độ cứng chống trầy)",g.mohs],["Toughness (độ dai)",g.toughness],["Lưu ý",g.caution]];
    ROOT.innerHTML='<div class="page"><button class="detail-back" type="button" data-go="intelligence">← Trở lại Gemstone Library</button>'+
      '<section class="detail-hero"><p class="eyebrow">'+(g.corePortfolio?'9 DÒNG ĐÁ COLORA / THAM KHẢO GIA':'ĐÁ THAM KHẢO GIA')+' / KHÔNG PHẢI HÀNG TỒN COLORA</p><h1>'+esc(g.name)+'</h1><p>'+esc(g.family)+' · Bản hướng dẫn tham khảo từ GIA. Đặc tính từng viên đá và sản phẩm hoàn thiện phải được xác minh riêng.</p><div class="detail-meta"><span class="pill">Mohs '+esc(g.mohs)+'</span><span class="pill">Toughness: '+esc(g.toughness)+'</span></div></section>'+
      '<div class="detail-grid"><article class="lesson-article">'+
      '<section class="article-section"><p class="eyebrow">01 / PROPERTY</p><h2>Thông số tham khảo</h2><div class="stone-properties">'+rows.map(function(x){return '<div><span>'+esc(x[0])+'</span><strong>'+esc(x[1])+'</strong></div>';}).join("")+'</div></section>'+
      '<section class="article-section"><p class="eyebrow">02 / WEARABILITY</p><h2>Ngữ cảnh sử dụng</h2><p>'+esc(g.wear)+'</p></section>'+
      '<section class="article-section"><p class="eyebrow">03 / CARE</p><h2>Vệ sinh & bảo quản</h2><p>'+esc(g.care)+'</p></section>'+
      '<section class="article-section"><p class="eyebrow">04 / ADVISOR RISK</p><h2>Điều không nên nói</h2><p>'+esc(g.risk)+'</p></section>'+
      '</article><aside class="aside-panel"><p class="eyebrow">EVIDENCE STATUS</p><h3>Tham khảo GIA</h3><p class="care-note">'+esc(I.gemSafetyNote)+'</p><div class="source-links">'+g.sources.map(function(u,i){return '<a href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">Nguồn GIA '+(i+1)+' ↗</a>';}).join("")+'</div><a class="btn btn-navy" href="'+href("evidence")+'">Xem SKU Evidence Gate</a></aside></div></div>';
  }
  function evidence(){
    ROOT.innerHTML='<div class="page">'+titleBlock("SINGLE SOURCE OF TRUTH","SKU Evidence Gate","Bảy lớp chứng cứ mà Product, QC, Client Care và Marketing phải đối chiếu. Đây là chuẩn để kiểm tra hồ sơ, không phải báo cáo rằng COLORA đã hoàn thành QC cho SKU nào.")+
      '<div class="notice"><strong>Không có dữ liệu SKU thật trong phiên bản public:</strong> Các mục bên dưới là checklist yêu cầu, không phải chứng nhận hàng hóa. Không điền hồ sơ nhà cung cấp, giá nhập, lô hàng mật hoặc dữ liệu khách lên GitHub Pages.</div>'+
      '<div class="proof-grid">'+I.proof.map(function(p,i){return '<article class="proof-card"><div class="proof-heading"><span class="lesson-no">0'+(i+1)+'</span><span class="proof-state">CHƯA CÓ HỒ SƠ SKU</span></div><h2>'+esc(p.title)+'</h2><p class="proof-owner">Owner đề xuất: '+esc(p.owner)+'</p><ul class="check-list">'+p.fields.map(function(k){return '<li>'+esc(k)+'</li>';}).join("")+'</ul><div class="proof-footer"><p><strong>Rủi ro:</strong> '+esc(p.risk)+'</p><p><strong>Bằng chứng cần có:</strong> '+esc(p.evidence)+'</p></div></article>';}).join("")+'</div>'+
      '<div class="insight-band"><div><h3>No evidence, no claim.</h3><p>Nguyên tắc: chứng cứ đúng SKU + người chịu trách nhiệm + phiên bản được duyệt, rồi mới tư vấn/đăng bài.</p></div>'+btn("Học chuyên đề SKU","lesson/sku-proof","btn-navy")+'</div></div>';
  }
  function roleplay(){
    var s=I.situations.find(function(x){return x.id===state.roleplayId;});
    if(!s){
      ROOT.innerHTML='<div class="page">'+titleBlock("APPLIED CLIENTELING","Advisor Role-play","Viết một câu trả lời hoàn chỉnh cho tình huống giả định, sau đó tự chấm theo rubric. Không sử dụng thông tin khách thật; hệ thống không gửi hoặc lưu bài viết lên máy chủ.")+
        '<div class="roleplay-grid">'+I.situations.map(function(x){return '<button class="roleplay-card" type="button" data-roleplay-start="'+esc(x.id)+'"><span class="eyebrow">SIMULATION / FICTIONAL</span><h2>'+esc(x.title)+'</h2><p>'+esc(x.context)+'</p><span>Bắt đầu viết phản hồi ↗</span></button>';}).join("")+'</div></div>';
      return;
    }
    var score=I.rubric.reduce(function(n,r){return n+(state.roleplayChecks[r.id]?r.weight:0);},0);
    var critical=I.rubric.filter(function(r){return r.critical&&!state.roleplayChecks[r.id];});
    var summary=state.roleplayEvaluated?'<div class="self-score"><h3>'+score+'/100 điểm tự đánh giá</h3><p>'+(critical.length?"Còn thiếu "+critical.length+" tiêu chí trọng yếu.":"Đã tự đánh dấu toàn bộ tiêu chí trọng yếu.")+' Đây chỉ là tự đánh giá, không phải đánh giá nội dung tự động hay chứng nhận của quản lý.</p></div>':"";
    ROOT.innerHTML='<div class="page"><button class="detail-back" type="button" data-roleplay-reset="1">← Các tình huống</button>'+
      titleBlock("WRITTEN PRACTICE","Advisor Role-play: "+s.title,s.objective)+
      '<div class="notice"><strong>Không nhập dữ liệu khách thật:</strong> Chỉ dùng trường hợp giả định. Bài viết và dấu tích rubric chỉ tồn tại trong bộ nhớ phiên trang hiện tại, không gửi đến máy chủ và không được lưu vào hồ sơ nhân viên.</div>'+
      '<div class="roleplay-layout"><div class="roleplay-main"><div class="roleplay-section"><p class="eyebrow">CLIENT SITUATION</p><h2>Tình huống</h2><p>'+esc(s.context)+'</p></div><div class="roleplay-section"><p class="eyebrow">WRITE YOUR RESPONSE</p><h2>Phản hồi của bạn</h2><label for="roleplay-draft" class="roleplay-label">Soạn câu trả lời cho khách theo ngôn ngữ COLORA</label><textarea id="roleplay-draft" class="roleplay-textarea" maxlength="1600" rows="8" placeholder="Chỉ nhập phản hồi giả định, không có tên, số điện thoại hoặc đơn hàng thật...">'+esc(state.roleplayDraft)+'</textarea><div class="roleplay-counter"><span id="roleplay-length">'+state.roleplayDraft.length+'</span> / 1.600 ký tự. Không lưu lên hệ thống.</div></div>'+
      '<div class="roleplay-section"><p class="eyebrow">RUBRIC / SELF CHECK</p><h2>Tiêu chí đánh giá</h2><p>Chọn ô khi phản hồi của bạn thực sự đạt tiêu chí. Tiêu chí trọng yếu được đánh dấu *.</p><div class="rubric-list">'+I.rubric.map(function(r){return '<label class="rubric-row"><input type="checkbox" data-rubric-id="'+esc(r.id)+'" '+(state.roleplayChecks[r.id]?"checked":"")+'><span class="rubric-copy"><strong>'+esc(r.name)+(r.critical?" *":"")+'</strong><small>'+esc(r.detail)+'</small></span><b>'+r.weight+'đ</b></label>';}).join("")+'</div><button type="button" class="btn btn-navy" data-roleplay-eval="1">Tự đánh giá theo rubric</button>'+summary+'</div>'+
      '<div class="roleplay-section"><p class="eyebrow">REFLECTION</p><h2>Đối chiếu phương án gợi ý</h2><button class="btn btn-ghost" data-roleplay-reveal="1" type="button">'+(state.roleplayReveal?"Ẩn gợi ý":"Hiện gợi ý sau khi tự viết")+'</button>'+(state.roleplayReveal?'<blockquote class="roleplay-example">'+esc(s.example)+'</blockquote><p class="eyebrow">NHỮNG ĐIỂM CẦN CÓ</p><ul class="check-list">'+s.must.map(function(x){return '<li>'+esc(x)+'</li>';}).join("")+'</ul><p class="eyebrow" style="margin-top:18px">DẤU HIỆU CẦN TRÁNH</p><ul class="check-list">'+s.redFlags.map(function(x){return '<li>'+esc(x)+'</li>';}).join("")+'</ul>':"")+'</div></div>'+
      '<aside class="roleplay-aside"><div class="aside-panel"><p class="eyebrow">WHY IT MATTERS</p><h3>Care is a practice.</h3><p class="care-note">Bài tập này không tự động phân tích câu chữ của bạn. Hãy tự đối chiếu trung thực theo rubric; quản lý cần đánh giá riêng nếu sử dụng để xác nhận năng lực.</p><div class="rule-line"><span>Thang rubric</span><strong>100 điểm</strong></div><div class="rule-line"><span>Tiêu chí trọng yếu</span><strong>'+I.rubric.filter(function(x){return x.critical;}).length+'</strong></div><div class="rule-line"><span>Dữ liệu cá nhân</span><strong>Không thu thập</strong></div></div></aside></div></div>';
  }

  function resources(){
    var refs=D.policy.map(function(x){return '<article class="resource-card"><p class="eyebrow">OFFICIAL POLICY</p><h3>'+esc(x.name)+'</h3><p>'+esc(x.desc)+'</p><a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">Mở đường dẫn (đang yêu cầu mật khẩu) ↗</a></article>';}).join("");
    var more=D.links.map(function(x){return '<article class="resource-card"><p class="eyebrow">REFERENCE</p><h3>'+esc(x.name)+'</h3><p>Đọc nguồn tham khảo, kiểm tra mức độ phù hợp với hồ sơ sản phẩm và quy trình thực tế.</p><a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">Mở nguồn ↗</a></article>';}).join("");
    ROOT.innerHTML='<div class="page">'+titleBlock("SOURCE OF TRUTH","Chính sách & nguồn tham khảo","Đào tạo giúp hiểu nguyên tắc. Quyền lợi khách hàng phải căn cứ chính sách có hiệu lực và pháp luật áp dụng.")+'<div class="notice"><strong>Chính sách chưa truy cập công khai:</strong> Kiểm tra ngày 31.10.2026 cho thấy cả sáu liên kết chính sách COLORA dưới đây đều chuyển đến trang Coming Soon có mật khẩu. Vì vậy Academy không xác nhận hiệu lực của bất kỳ mốc bảo hành, đổi trả hoặc sửa chữa cụ thể nào. Nhân viên cần xin bản chính sách nội bộ đã phê duyệt, có ngày hiệu lực, trước khi cam kết với khách.</div>'+sectionHead("Chính sách COLORA","Kiểm tra nội dung mới nhất trên website chính thức.")+'<div class="resource-grid">'+refs+'</div>'+sectionHead("Kiến thức & hỗ trợ","Tài liệu từ nguồn chuyên môn và các kênh chính thức.")+'<div class="resource-grid">'+more+'</div><div class="insight-band"><div><h3>Public by design, not private by password.</h3><p>Website này không có tài khoản hay hệ thống quản lý dữ liệu khách. Không nhập case, thông tin đơn hàng hoặc dữ liệu cá nhân thật vào đây.</p></div></div></div>';
  }
  function quizSetup(mode){
    var isExam=mode==="exam",n=isExam?(state.role==="all"?15:18):10;
    ROOT.innerHTML='<div class="page">'+titleBlock(isExam?"FINAL ASSESSMENT":"PRACTICE SPACE",isExam?"Kiểm tra năng lực":"Luyện tập kiến thức",isExam?"Bài kiểm tra tổng hợp cho lộ trình "+roleObj().name+". Kết quả được lưu trên thiết bị hiện tại.":"Ôn luyện bằng câu hỏi có giải thích để học cách vận dụng thay vì chỉ ghi nhớ.")+'<div class="quiz-setup"><div class="quiz-explainer"><p class="eyebrow">'+(isExam?"ASSESSMENT":"PRACTICE")+' / '+esc(roleObj().name)+'</p><h2>'+(isExam?"Clarity builds confidence.":"Learn, reflect, improve.")+'</h2><p>'+(isExam?"Bài thi chọn ngẫu nhiên "+n+" câu từ ngân hàng kiến thức phù hợp lộ trình. Bạn có thể quay lại các câu trong lúc làm. Kết quả chỉ là bài tự học, không thay thế đánh giá thực hành hoặc xác nhận năng lực từ quản lý; câu hỏi và đáp án nằm trong mã nguồn công khai.":"Mỗi lượt 10 câu hỏi ngẫu nhiên. Bạn được xem đáp án và lý giải ngay sau khi chọn, sau đó tiếp tục với câu kế tiếp.")+'</p><button type="button" class="btn btn-navy" data-start-quiz="'+esc(mode)+'">'+(isExam?"Bắt đầu kiểm tra":"Bắt đầu luyện tập")+' &nbsp; ↗</button></div><aside class="quiz-rulebox"><p class="eyebrow">EVALUATION GUIDE</p><h3>Thông tin lượt học</h3><div class="rule-line"><span>Lộ trình</span><strong>'+esc(roleObj().name)+'</strong></div><div class="rule-line"><span>Số câu</span><strong>'+n+'</strong></div><div class="rule-line"><span>Ngưỡng đạt</span><strong>'+(isExam?"80%":"Không áp dụng")+'</strong></div><div class="rule-line"><span>Câu trọng yếu</span><strong>'+(isExam?"Không sai câu được chọn":"Có giải thích")+'</strong></div><div class="rule-line"><span>Lưu kết quả</span><strong>Trên trình duyệt</strong></div></aside></div></div>';
  }
  function shuffle(arr){var a=arr.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}

  function prepareQuestion(q){
    // Rotate answer positions per attempt; public source code still contains the question bank.
    var positions=shuffle(q.options.map(function(_,i){return i;}));
    return Object.assign({},q,{options:positions.map(function(i){return q.options[i];}),correct:positions.indexOf(q.correct)});
  }
  function drawQuestions(pool,mode,n){
    if(mode!=="exam")return shuffle(pool).slice(0,n).map(prepareQuestion);
    // Every examined track includes at least one question from each of its lessons.
    var covered=visibleLessons().map(function(l){return shuffle(pool.filter(function(q){return q.lesson===l.id;}))[0];}).filter(Boolean);
    var picked=new Set(covered.map(function(q){return q.id;}));
    var rest=shuffle(pool.filter(function(q){return !picked.has(q.id);}));
    return shuffle(covered.concat(rest.slice(0,Math.max(0,n-covered.length)))).slice(0,n).map(prepareQuestion);
  }
  function startQuiz(mode){
    var pool=eligibleQ();
    var n=mode==="exam"?(state.role==="all"?15:18):10;
    state.quiz={mode:mode,role:state.role,items:drawQuestions(pool,mode,Math.min(n,pool.length)),index:0,answers:{},done:false};
    renderQuiz();window.scrollTo(0,0);
  }
  function selected(q){return Object.prototype.hasOwnProperty.call(state.quiz.answers,q.id)?state.quiz.answers[q.id]:null;}
  function renderQuiz(){
    var quiz=state.quiz;if(!quiz)return;
    if(quiz.done){renderQuizResult();return;}
    var q=quiz.items[quiz.index];var chosen=selected(q),practice=quiz.mode==="practice";
    var options=q.options.map(function(a,i){var cls="option";if(chosen===i)cls+=" selected";if(practice&&chosen!==null){if(i===q.correct)cls+=" correct";else if(i===chosen)cls+=" wrong";}return '<button class="'+cls+'" type="button" data-option-index="'+i+'" '+(practice&&chosen!==null?"disabled":"")+'><b>'+String.fromCharCode(65+i)+'</b><span>'+esc(a)+'</span></button>';}).join("");
    var feedback=practice&&chosen!==null?'<div class="quiz-feedback"><strong>'+(chosen===q.correct?"Chính xác.":"Chưa đúng, cùng xem lại nhé.")+'</strong><p>'+esc(q.why)+'</p></div>':"";
    var controls='<div class="quiz-controls"><div>'+(quiz.mode==="exam"&&quiz.index>0?'<button type="button" data-quiz-nav="-1" class="btn btn-ghost">← Câu trước</button>':'<button type="button" class="btn btn-ghost" data-quiz-exit="1">Thoát lượt học</button>')+'</div><div>'+(quiz.index===quiz.items.length-1?'<button type="button" class="btn btn-navy" data-quiz-submit="1" '+(practice&&chosen===null?"disabled":"")+'>'+(practice?"Xem kết quả":"Nộp bài kiểm tra")+' ↗</button>':'<button type="button" class="btn btn-navy" data-quiz-nav="1" '+(practice&&chosen===null?"disabled":"")+'>'+(practice?"Câu tiếp theo":"Tiếp tục")+' ↗</button>')+'</div></div>';
    var percent=Math.round((quiz.index+1)*100/quiz.items.length);
    ROOT.innerHTML='<div class="page"><div class="quiz-main"><div class="quiz-head"><span>'+(practice?"PRACTICE":"FINAL ASSESSMENT")+' / '+esc(roleObj().name)+'</span><span>Câu '+(quiz.index+1)+' / '+quiz.items.length+'</span></div><div class="quiz-bar" role="progressbar" aria-label="Tiến độ câu hỏi" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+percent+'"><span style="width:'+percent+'%"></span></div><section class="quiz-card"><p class="quiz-number">'+esc(q.lesson.toUpperCase())+' / QUESTION '+(quiz.index+1)+(q.critical?' · CÂU TRỌNG YẾU':'')+'</p><h2>'+esc(q.prompt)+'</h2><div class="options">'+options+'</div>'+feedback+controls+'</section><div class="notice" style="margin-top:19px">Khi thi, đáp án chỉ được hiển thị sau khi nộp. Các câu chưa trả lời được tính là sai. Khi luyện tập, đáp án xuất hiện ngay sau khi chọn.</div></div></div>';
  }
  function finishQuiz(){
    var quiz=state.quiz;if(!quiz)return;
    var correct=0,criticalMisses=0;
    quiz.items.forEach(function(q){if(selected(q)===q.correct)correct++;else if(q.critical)criticalMisses++;});
    quiz.done=true;quiz.score=correct;quiz.total=quiz.items.length;quiz.percent=Math.round(correct*100/quiz.total);quiz.criticalMisses=criticalMisses;quiz.passed=quiz.percent>=80&&criticalMisses===0;
    state.results.push({mode:quiz.mode,role:quiz.role,score:correct,total:quiz.total,percent:quiz.percent,criticalMisses:criticalMisses,passed:quiz.passed,at:new Date().toISOString()});
    state.results=state.results.slice(-30);save();renderQuizResult();window.scrollTo(0,0);
  }
  function renderQuizResult(){
    var quiz=state.quiz;if(!quiz)return;
    var p=quiz.mode==="practice",wrong=quiz.items.filter(function(q){return selected(q)!==q.correct;});
    var review=wrong.length?wrong.map(function(q){var a=selected(q);return '<div class="review-item"><h4>'+esc(q.prompt)+'</h4><p class="wrong-label">Bạn chọn: '+(a===null?"Chưa trả lời":esc(q.options[a]))+'</p><p class="correct-label">Đáp án đúng: '+esc(q.options[q.correct])+'</p><p>'+esc(q.why)+'</p></div>';}).join(""):'<p>Bạn đã trả lời đúng toàn bộ câu hỏi trong lượt này.</p>';
    ROOT.innerHTML='<div class="page"><div class="quiz-result"><p class="eyebrow">'+(p?"PRACTICE COMPLETE":"FINAL ASSESSMENT RESULT")+'</p><div class="result-medallion">'+quiz.percent+'%</div><h2>'+(p?"Một bước học tập đã hoàn thành.":quiz.passed?"Đã đạt yêu cầu kiến thức.":"Cần ôn tập thêm.")+'</h2><p>'+(p?"Phần luyện tập giúp bạn phát hiện điểm cần tìm hiểu sâu hơn.":quiz.passed?"Bạn đã đạt ngưỡng câu hỏi lý thuyết cho lộ trình này. Vẫn cần đánh giá thực hành trước khi tư vấn độc lập.":"Hãy xem lại những câu chưa đúng và làm lượt kiểm tra khác sau khi ôn tập.")+'</p><div class="result-meta"><span class="result-pill">'+quiz.score+'/'+quiz.total+' câu đúng</span><span class="result-pill">'+quiz.criticalMisses+' lỗi trọng yếu</span><span class="result-pill">'+(p?"Luyện tập":quiz.passed?"Đạt":"Chưa đạt")+'</span></div><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">'+btn("Trở lại thư viện","learn","btn-ghost")+'<button type="button" class="btn btn-navy" data-quiz-restart="1">Làm lượt khác ↗</button></div><div class="review-list"><p class="eyebrow">REVIEW / NHỮNG CÂU CẦN ÔN</p>'+review+'</div></div></div>';
  }
  function progress(){
    var ls=visibleLessons(),exams=state.results.filter(function(r){return r.role===state.role&&r.mode==="exam";}),latest=exams.length?exams[exams.length-1]:null;
    var card='<div class="progress-card"><h3>Lộ trình '+esc(roleObj().name)+'</h3><p class="page-subtitle" style="margin:0 0 19px">Đánh dấu những chuyên đề đã đọc. Trạng thái này là tự khai báo, không chứng minh mức độ hiểu hay năng lực.</p><div class="progress-list">'+ls.map(function(l){var done=state.completed.indexOf(l.id)>-1;return '<a class="progress-item" href="'+href("lesson/"+l.id)+'"><span class="progress-check '+(done?"done":"")+'">'+(done?"✓":"·")+'</span><span>'+esc(l.no)+' · '+esc(l.title)+'</span></a>';}).join("")+'</div><div class="rule-line"><span>Đã đọc</span><strong>'+completedLessons()+'/'+ls.length+' chuyên đề</strong></div><div class="mini-progress"><span style="width:'+progressPct()+'%"></span></div></div>';
    var history=state.results.slice().reverse().filter(function(r){return r.role===state.role;}).slice(0,10);
    var historyHtml=history.length?history.map(function(r){var date=new Date(r.at);return '<div class="progress-row"><span>'+(r.mode==="exam"?"Bài thi":r.mode==="case"?"Case Lab":"Luyện tập")+' · '+(isNaN(date.getTime())?"":date.toLocaleDateString("vi-VN"))+'</span><strong>'+r.percent+'%'+(r.mode==="exam"?(r.passed?" · Đạt":" · Chưa đạt"):"")+'</strong></div>';}).join(""):'<p class="page-subtitle">Chưa có kết quả. Bạn có thể bắt đầu từ phần luyện tập.</p>';
    ROOT.innerHTML='<div class="page">'+titleBlock("YOUR LEARNING PATH","Tiến độ của tôi","Tiến độ được lưu trên thiết bị và trình duyệt hiện tại, không đồng bộ về công ty.")+'<div class="stats-grid"><div class="stat-card"><div><strong>'+progressPct()+'%</strong><p>TIẾN ĐỘ ĐỌC</p></div><span class="stat-line">◈</span></div><div class="stat-card"><div><strong>'+completedLessons()+'</strong><p>CHUYÊN ĐỀ ĐÃ ĐỌC</p></div><span class="stat-line">✓</span></div><div class="stat-card"><div><strong>'+(latest?latest.percent+"%":"-")+'</strong><p>KẾT QUẢ THI GẦN NHẤT</p></div><span class="stat-line">✦</span></div></div><div class="progress-layout">'+card+'<div class="progress-card"><h3>Lịch sử kiểm tra</h3>'+historyHtml+'<div class="progress-actions">'+btn("Làm bài thi","exam","btn-navy")+'<button type="button" class="btn btn-ghost" data-export-progress="1">Xuất tiến độ (JSON)</button></div><p class="source-line">Dữ liệu này không xác minh danh tính, không phải chứng chỉ nhân sự và không phù hợp để quản trị hồ sơ đào tạo chính thức.</p><div class="rule-line" style="margin-top:25px"><span>Xóa dữ liệu học trên trình duyệt này</span><button type="button" class="btn btn-sm btn-ghost" data-clear-progress="1">Xóa tất cả</button></div></div></div></div>';
  }
  function notFound(){ROOT.innerHTML='<div class="page"><div class="empty-state"><strong>Không tìm thấy trang.</strong><p>Nội dung này có thể đã được di chuyển.</p>'+btn("Về tổng quan","home","btn-navy")+'</div></div>';}
  function navUpdate(page){document.querySelectorAll(".nav-link").forEach(function(a){var active=a.dataset.page===page||(page==="lesson"&&a.dataset.page==="learn")||(page==="case"&&a.dataset.page==="cases")||(page==="stone"&&a.dataset.page==="intelligence")||(page==="evidence"&&a.dataset.page==="intelligence")||(page==="product"&&a.dataset.page==="catalog");a.classList.toggle("active",active);if(active)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");});document.getElementById("breadcrumb-label").textContent=labels[page]||"Academy";document.getElementById("role-select").value=state.role;}
  function closeMenu(){document.getElementById("sidebar").classList.remove("open");var shade=document.getElementById("mobile-shade");shade.hidden=true;document.getElementById("menu-toggle").setAttribute("aria-expanded","false");}
  function render(){var parts=(location.hash||"#/home").replace(/^#\//,"").split("/");var page=parts[0]||"home";navUpdate(page);var opsView=window.COLORA_OPS?window.COLORA_OPS.render(page,parts[1]):null;if(opsView!==null&&opsView!==undefined){ROOT.innerHTML=opsView;}else if(page==="intelligence")intelligence();else if(page==="stone")stoneDetail(parts[1]);else if(page==="evidence")evidence();else if(page==="roleplay")roleplay();else if(page==="home")home();else if(page==="learn")learn();else if(page==="lesson")lesson(parts[1]);else if(page==="scripts"){var scriptId=parts[1];if(scriptId){var exactScript=D.scripts.find(function(x){return x.id===scriptId;});state.scriptSearch=exactScript?exactScript.title:"";state.scriptFilter="Tất cả";}else state.scriptSearch="";scripts();}else if(page==="cases")caseLibrary();else if(page==="case")caseDetail(parts[1]);else if(page==="resources")resources();else if(page==="progress")progress();else if(page==="practice"||page==="exam"){if(state.quiz&&state.quiz.mode===page&&!state.quiz.done&&state.quiz.role===state.role)renderQuiz();else quizSetup(page);}else notFound();closeMenu();window.scrollTo(0,0);}
  function navigate(page){location.hash=href(page);if(location.hash===href(page))render();}
  function setRole(role){if(!D.roles.some(function(r){return r.id===role;}))return;state.role=role;state.quiz=null;state.caseStudy=null;save();render();toast("Đã chuyển sang lộ trình "+roleObj().name);}
  function downloadProgress(){
    var exportObj={app:"COLORA Client Care Academy",version:D.version,role:state.role,completedLessonIds:state.completed,results:state.results,exportedAt:new Date().toISOString(),notice:"Local-only training progress, not verified employee records."};
    var b=new Blob([JSON.stringify(exportObj,null,2)],{type:"application/json"});var u=URL.createObjectURL(b);var a=document.createElement("a");a.href=u;a.download="colora-academy-progress.json";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},250);toast("Đã xuất tệp tiến độ.");
  }
  document.addEventListener("click",function(e){
    if(window.COLORA_OPS&&window.COLORA_OPS.click(e))return;

    var beginPlay=e.target.closest("[data-roleplay-start]");
    if(beginPlay){state.roleplayId=beginPlay.dataset.roleplayStart;state.roleplayDraft="";state.roleplayChecks={};state.roleplayReveal=false;state.roleplayEvaluated=false;roleplay();return;}
    var resetPlay=e.target.closest("[data-roleplay-reset]");
    if(resetPlay){state.roleplayId=null;state.roleplayDraft="";state.roleplayChecks={};state.roleplayReveal=false;state.roleplayEvaluated=false;roleplay();return;}
    if(e.target.closest("[data-roleplay-eval]")){state.roleplayEvaluated=true;roleplay();return;}
    if(e.target.closest("[data-roleplay-reveal]")){state.roleplayReveal=!state.roleplayReveal;roleplay();return;}
    var role=e.target.closest("[data-role]");if(role){setRole(role.dataset.role);return;}
    var complete=e.target.closest("[data-complete]");if(complete){var id=complete.dataset.complete;var index=state.completed.indexOf(id);if(index>-1)state.completed.splice(index,1);else state.completed.push(id);save();lesson(id);toast(index>-1?"Đã bỏ đánh dấu.":"Đã ghi nhận đã đọc.");return;}

    var casePick=e.target.closest("[data-case-option]");
    if(casePick&&state.caseStudy&&!state.caseStudy.done){
      var cRun=state.caseStudy,active=D.cases.find(function(z){return z.id===cRun.id;});
      if(active&&!Object.prototype.hasOwnProperty.call(cRun.answers,cRun.index)){
        cRun.answers[cRun.index]=Number(casePick.dataset.caseOption);caseDetail(cRun.id);
      }
      return;
    }
    var caseNext=e.target.closest("[data-case-next]");
    if(caseNext&&state.caseStudy&&!state.caseStudy.done){
      var cRun=state.caseStudy,active=D.cases.find(function(z){return z.id===cRun.id;});
      if(active&&Object.prototype.hasOwnProperty.call(cRun.answers,cRun.index)){
        if(cRun.index<active.steps.length-1){cRun.index++;caseDetail(cRun.id);}
        else{
          cRun.done=true;
          if(!cRun.recorded){
            var score=active.steps.reduce(function(n,st,i){return n+(cRun.answers[i]===st.best?1:0);},0);
            state.results.push({mode:"case",role:state.role,caseId:cRun.id,score:score,total:active.steps.length,percent:Math.round(score*100/active.steps.length),passed:score===active.steps.length,at:new Date().toISOString()});
            state.results=state.results.slice(-30);cRun.recorded=true;save();
          }
          caseDetail(cRun.id);
        }
      }
      return;
    }
    var caseRestart=e.target.closest("[data-case-restart]");
    if(caseRestart){state.caseStudy=null;caseDetail(caseRestart.dataset.caseRestart);return;}
    var f=e.target.closest("[data-script-filter]");if(f){state.scriptFilter=f.dataset.scriptFilter;updateScripts();return;}
    var copy=e.target.closest("[data-copy-script]");if(copy){var x=D.scripts.find(function(s){return s.id===copy.dataset.copyScript;});if(x){var txt=x.reply;if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(txt).then(function(){toast("Đã sao chép kịch bản.");}).catch(function(){toast("Không thể sao chép tự động.");});}else{var ta=document.createElement("textarea");ta.value=txt;document.body.appendChild(ta);ta.select();try{document.execCommand("copy");toast("Đã sao chép kịch bản.");}catch(err){toast("Không thể sao chép tự động.");}ta.remove();}}return;}
    var start=e.target.closest("[data-start-quiz]");if(start){startQuiz(start.dataset.startQuiz);return;}
    var opt=e.target.closest("[data-option-index]");if(opt&&state.quiz&&!state.quiz.done){var q=state.quiz.items[state.quiz.index];if(state.quiz.mode==="exam"||selected(q)===null){state.quiz.answers[q.id]=Number(opt.dataset.optionIndex);renderQuiz();}return;}
    var nav=e.target.closest("[data-quiz-nav]");if(nav&&state.quiz){state.quiz.index=Math.max(0,Math.min(state.quiz.items.length-1,state.quiz.index+Number(nav.dataset.quizNav)));renderQuiz();return;}
    var submit=e.target.closest("[data-quiz-submit]");if(submit){finishQuiz();return;}
    var restart=e.target.closest("[data-quiz-restart]");if(restart&&state.quiz){var m=state.quiz.mode;state.quiz=null;startQuiz(m);return;}
    var quit=e.target.closest("[data-quiz-exit]");if(quit){var page=state.quiz&&state.quiz.mode==="exam"?"exam":"practice";state.quiz=null;quizSetup(page);return;}
    var back=e.target.closest("[data-go]");if(back){navigate(back.dataset.go);return;}
    if(e.target.closest("[data-export-progress]")){downloadProgress();return;}
    if(e.target.closest("[data-clear-progress]")){if(confirm("Xóa toàn bộ kết quả học, bài thi và lộ trình đã lưu trên trình duyệt này?")){state.completed=[];state.results=[];state.quiz=null;save();progress();toast("Đã xóa dữ liệu học tập cục bộ.");}return;}
  });
  document.addEventListener("input",function(e){if(window.COLORA_OPS&&window.COLORA_OPS.input(e))return;if(e.target.id==="lesson-search"){state.lessonSearch=e.target.value;updateLessons();}else if(e.target.id==="script-search"){state.scriptSearch=e.target.value;updateScripts();}else if(e.target.id==="stone-search"){state.stoneSearch=e.target.value;updateGemSearch();}else if(e.target.id==="roleplay-draft"){state.roleplayDraft=e.target.value;var counter=document.getElementById("roleplay-length");if(counter)counter.textContent=String(e.target.value.length);}});
  document.addEventListener("change",function(e){if(window.COLORA_OPS&&window.COLORA_OPS.change(e))return;var cb=e.target.closest("[data-rubric-id]");if(cb){state.roleplayChecks[cb.dataset.rubricId]=!!cb.checked;state.roleplayEvaluated=false;}});
  document.getElementById("role-select").addEventListener("change",function(e){setRole(e.target.value);});
  document.getElementById("menu-toggle").addEventListener("click",function(){var sidebar=document.getElementById("sidebar");var open=!sidebar.classList.contains("open");sidebar.classList.toggle("open",open);document.getElementById("mobile-shade").hidden=!open;this.setAttribute("aria-expanded",String(open));});
  document.getElementById("mobile-shade").addEventListener("click",closeMenu);
  document.addEventListener("keydown",function(e){if(e.key==="Escape")closeMenu();});
  window.addEventListener("hashchange",render);
  load();render();
})();
