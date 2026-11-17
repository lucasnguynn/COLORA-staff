'use strict';
/* COLORA Learning Studio: treatment education is public self-study content, not SKU approval or price appraisal. */
function treatmentGuide(){
  const d=state.treatments;if(!d){nav('portfolio');return;}
  const src=u=>'<a href="'+esc(u)+'" target="_blank" rel="noopener noreferrer">Nguồn kiểm chứng ↗</a>';
  const memo=d.mnemonic.map(x=>'<article class="treat-memory-card"><span>'+esc(x.short)+'</span><h3>'+esc(x.title)+'</h3><p>'+esc(x.detail)+'</p></article>').join('');
  const methods=d.methods.map(m=>'<details class="treat-method" data-treatment-type="'+esc(m.status)+'"><summary><span class="treat-method-title"><b>'+esc(m.title)+'</b><small>'+esc(m.term)+'</small></span><span class="treat-policy '+(m.status==='allowed-conditional'?'treat-policy-conditional':'treat-policy-no')+'">'+(m.status==='allowed-conditional'?'Có điều kiện':'Không sử dụng')+'</span></summary><div class="treat-method-inner"><p><strong>Cách xử lý:</strong> '+esc(m.what)+'</p><p><strong>Gặp ở:</strong> '+esc(m.examples)+'</p><p><strong>Độ bền / chăm sóc:</strong> '+esc(m.effect)+'</p><p><strong>Ảnh hưởng lên giá:</strong> '+esc(m.price)+'</p><div class="treat-memory-line">Nhớ nhanh: '+esc(m.memory)+'</div>'+src(m.source)+'</div></details>').join('');
  const gemCards=d.stoneProfiles.map(g=>'<details class="treat-stone"><summary><strong>'+esc(g.name)+'</strong><span>Chọn xem ›</span></summary><div><p><strong>Xử lý thường gặp trên thị trường:</strong> '+esc(g.common)+'</p><p><strong>Giá trị thị trường:</strong> '+esc(g.price)+'</p><p><strong>Quy tắc COLORA:</strong> '+esc(g.colora)+'</p><p><strong>Nhân viên cần xác minh:</strong> '+esc(g.verify)+'</p>'+src(g.source)+'</div></details>').join('');
  const cases=d.scenarios.map(x=>'<details class="treat-case"><summary><span class="treat-case-label">'+esc(x.id)+'</span>'+esc(x.ask)+'</summary><div><span class="treat-memory-line">'+esc(x.rule)+'</span><p>'+esc(x.reply)+'</p></div></details>').join('');
  const cites=d.sources.map(x=>'<li><a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">'+esc(x.title)+' ↗</a></li>').join('');
  chrome('<div class="kicker">BÀI 14D / TREATMENTS & VALUE</div><h1 class="h1">'+esc(d.title)+'</h1><p class="lead">'+esc(d.subtitle)+'</p>'
    +'<div class="callout treat-intro"><strong>Chính sách COLORA:</strong> '+esc(d.policy.allowed)+'</div>'
    +'<div class="treat-section-head"><span class="eyebrow">HỌC TRONG 1 PHÚT</span><h2 class="h2">4 câu hỏi phải nhớ</h2><p>Gốc - Cách - Giá - Chứng. Nguồn gốc tự nhiên và trạng thái xử lý là hai thuộc tính tách biệt.</p></div>'
    +'<div class="treat-memory-grid">'+memo+'</div>'
    +'<section class="treat-panel"><span class="eyebrow">QUY TẮC PHÊ DUYỆT</span><h2 class="h2">Không phải loại xử lý nào cũng được COLORA sử dụng</h2><p>'+esc(d.policy.notAllowed)+'</p><p><strong>Khi chưa rõ:</strong> '+esc(d.policy.evidence)+'</p><p class="mini-label">'+esc(d.policy.nuance)+'</p></section>'
    +'<div class="treat-section-head"><span class="eyebrow">01 / CÁC PHƯƠNG PHÁP</span><h2 class="h2">12 phương thức xử lý phổ biến</h2><p>Mở từng thẻ để xem cơ chế, loại đá gặp, độ bền và ảnh hưởng đến giá trị. Chữ “không sử dụng” là chính sách COLORA, không phải phán xét đạo đức về ngành.</p></div>'
    +'<div class="treat-filters" role="group" aria-label="Lọc loại xử lý"><button class="treat-filter active" data-treat-filter="all" aria-pressed="true">Tất cả 12</button><button class="treat-filter" data-treat-filter="allowed-conditional" aria-pressed="false">Có thể chấp nhận</button><button class="treat-filter" data-treat-filter="not-allowed" aria-pressed="false">COLORA không sử dụng</button></div>'
    +'<div class="treat-method-list">'+methods+'</div>'
    +'<div class="treat-section-head"><span class="eyebrow">02 / ĐỌC GIÁ TRỊ</span><h2 class="h2">Xử lý ảnh hưởng giá như thế nào?</h2><p>Giá trị phụ thuộc nhiều yếu tố. Hãy so sánh các viên đá tương đương, không đoán giá từ tên phương pháp xử lý.</p></div>'
    +'<section class="treat-panel treat-price-panel"><div class="eyebrow">MINH HỌA RIÊNG: RUBY & SAPPHIRE</div><h3 class="h3">'+esc(d.comparison.title)+'</h3><p>'+esc(d.comparison.note)+'</p><div class="treat-price-track">'+d.comparison.steps.map((x,i)=>'<div class="treat-price-stage"><span class="treat-price-index">0'+(i+1)+'</span><div><strong>'+esc(x.name)+'</strong><p>'+esc(x.note)+'</p></div></div>').join('')+'</div></section>'
    +'<div class="treat-rule-list">'+d.priceRules.map((x,i)=>'<div class="treat-rule"><span>'+String(i+1).padStart(2,'0')+'</span><p>'+esc(x)+'</p></div>').join('')+'</div>'
    +'<div class="treat-section-head"><span class="eyebrow">03 / THEO CHỦNG LOẠI</span><h2 class="h2">Tra cứu nhanh 9 dòng đá COLORA</h2><p>Chọn một loại để biết xử lý phổ biến, bối cảnh giá và thông tin phải hỏi nhà cung cấp.</p></div>'
    +'<div class="treat-stone-grid">'+gemCards+'</div>'
    +'<div class="treat-section-head"><span class="eyebrow">04 / TƯ VẤN TÌNH HUỐNG</span><h2 class="h2">Khách hỏi, nhân viên trả lời</h2><p>Thử tự trả lời trước khi mở hướng dẫn. Chỉ áp dụng lời tư vấn theo thông tin đã duyệt của từng SKU.</p></div>'
    +'<div class="treat-case-list">'+cases+'</div>'
    +'<section class="treat-panel treat-quiz-cta"><div><span class="eyebrow">05 / SELF CHECK</span><h2 class="h2">12 câu kiểm tra kiến thức</h2><p>Tự luyện có phản hồi ngay, không tính vào bài thi V10.2 hoặc chứng nhận nhân sự.</p></div><button class="btn" id="treatment-start">Luyện 12 câu →</button></section>'
    +'<details class="treat-references"><summary>9 tài liệu chuyên môn và nguyên tắc công bố nguồn</summary><p>'+esc(d.scope)+'. Thông tin ngành dựa trên GIA, chuẩn công bố tham khảo CIBJO; tình trạng SKU của COLORA phải được xác minh riêng.</p><ol>'+cites+'</ol></details>'
    +'<div class="actions"><button class="btn secondary" id="treatment-back">Quay lại 9 dòng đá</button></div>');
  document.querySelectorAll('[data-treat-filter]').forEach(b=>b.onclick=()=>{
    const filter=b.dataset.treatFilter;
    document.querySelectorAll('[data-treat-filter]').forEach(x=>{const active=x===b;x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active));});
    document.querySelectorAll('[data-treatment-type]').forEach(x=>{x.hidden=filter!=='all'&&x.dataset.treatmentType!==filter;});
  });
  $('#treatment-start').onclick=()=>{state.treatmentTest={at:0,answers:{}};nav('treatment-quiz');};
  $('#treatment-back').onclick=()=>nav('portfolio');
}
function treatmentQuiz(){
  const d=state.treatments,t=state.treatmentTest;if(!d||!t){nav('treatment');return;}
  const q=d.quiz[t.at],chosen=t.answers[q.id],complete=chosen!==undefined;
  const buttons=q.options.map((x,i)=>'<button class="choice '+(complete?(i===q.correct?'correct':i===chosen?'wrong':'disabled'):'')+'" data-treat-choice="'+i+'" '+(complete?'disabled':'')+' aria-pressed="'+(chosen===i)+'"><span class="choice-letter">'+('ABCD'[i])+'</span><span>'+esc(x)+'</span></button>').join('');
  chrome('<div class="kicker">BÀI 14D / SELF CHECK</div><h1 class="h1">Kiểm tra xử lý đá quý</h1><div class="progress-line"><small>Câu '+(t.at+1)+' / '+d.quiz.length+'</small><div class="bar"><span style="width:'+Math.round((t.at+1)/d.quiz.length*100)+'%"></span></div></div><div class="question-box"><h2 class="question">'+esc(q.q)+'</h2><div class="options">'+buttons+'</div>'+(complete?'<div class="feedback '+(chosen===q.correct?'':'bad')+'"><h4>'+(chosen===q.correct?'Chính xác.':'Chưa đúng.')+'</h4><p><strong>Đáp án:</strong> '+esc(q.options[q.correct])+'</p><p><strong>Giải thích:</strong> '+esc(q.why)+'</p></div><div class="actions"><button class="btn" id="treatment-next">'+(t.at===d.quiz.length-1?'Xem kết quả':'Câu tiếp theo →')+'</button></div>':'<p class="mini-label">Chọn một đáp án để xem giải thích.</p>')+'</div><div class="actions"><button class="btn secondary" id="treatment-exit">Trở lại bài học</button></div>');
  document.querySelectorAll('[data-treat-choice]').forEach(b=>b.onclick=()=>{t.answers[q.id]=Number(b.dataset.treatChoice);render();});
  const next=$('#treatment-next');if(next)next.onclick=()=>{if(t.at===d.quiz.length-1)nav('treatment-result');else{t.at++;render();scrollTo(0,0);}};
  $('#treatment-exit').onclick=()=>nav('treatment');
}
function treatmentResult(){
  const d=state.treatments,t=state.treatmentTest;if(!d||!t){nav('treatment');return;}
  const correct=d.quiz.filter(q=>t.answers[q.id]===q.correct).length;
  const wrong=d.quiz.filter(q=>t.answers[q.id]!==q.correct);
  chrome('<div class="kicker">BÀI 14D / KẾT QUẢ TỰ HỌC</div><h1 class="h1">Những điều đã nắm và cần ôn</h1><div class="card" style="margin-top:22px"><div class="eyebrow">KẾT QUẢ 12 CÂU</div><div class="metric">'+correct+' / '+d.quiz.length+'</div><p>'+(correct>=10?'Bạn đã nắm tốt kiến thức cốt lõi.':'Hãy xem lại các điểm còn nhầm trước khi tư vấn.')+' Đây không phải điểm kiểm tra năng lực chính thức.</p></div>'+(wrong.length?'<div class="treat-section-head"><h2 class="h2">Những câu cần học lại</h2></div>'+wrong.map(q=>'<article class="card" style="margin-bottom:10px"><h3 class="h3">'+esc(q.q)+'</h3><p><strong>Đáp án:</strong> '+esc(q.options[q.correct])+'</p><p>'+esc(q.why)+'</p></article>').join(''):'')+'<div class="actions"><button class="btn" id="treatment-retry">Làm lại 12 câu</button><button class="btn secondary" id="treatment-return">Xem bài 14D</button></div>');
  $('#treatment-retry').onclick=()=>{state.treatmentTest={at:0,answers:{}};nav('treatment-quiz');};
  $('#treatment-return').onclick=()=>nav('treatment');
}
