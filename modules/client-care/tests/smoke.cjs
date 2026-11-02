/* Automated regression checks for COLORA Academy.
   These verify data integrity and key UI state transitions, NOT real-browser UX or exam validity.
   No personal data or external network required.
*/
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=(file)=>fs.readFileSync(path.join(root,file),"utf8");

function loadData(){
  const ctx={window:{}};
  vm.runInNewContext(read("content.js"),ctx,{timeout:2500});
  return ctx.window.COLORA_DATA;
}
const data=loadData();
const intelligence=(function(){const ctx={window:{}};vm.runInNewContext(read("intelligence.js"),ctx,{timeout:2500});return ctx.window.COLORA_INTELLIGENCE;})();
assert.equal(intelligence.gems.length,13);
assert.equal(intelligence.portfolio.ids.length,9);
assert.equal(intelligence.gems.filter(g=>g.corePortfolio).length,9);
assert.equal(intelligence.conversations.length,12);
for(const id of ['ruby','sapphire','garnet','topaz','aquamarine','citrine','peridot','spinel','tourmaline'])
 assert(intelligence.gems.some(g=>g.id===id&&g.corePortfolio),'Missing COLORA core stone: '+id);
assert.equal(intelligence.cuts.length,7);
assert.equal(intelligence.proof.length,7);
assert.equal(intelligence.situations.length,3);
assert.equal(intelligence.rubric.reduce((n,r)=>n+r.weight,0),100);
for(const g of intelligence.gems){assert.ok(g.sources.length>0);assert.ok(g.sources.every(x=>x.startsWith("https://www.gia.edu/")||x.startsWith("https://archive.gia.edu/")));}

assert.ok(data && Array.isArray(data.lessons));
assert.equal(data.lessons.length,13);
assert.equal(data.scripts.length,18);
assert.equal(data.questions.length,66);
assert.equal(data.cases.length,6);
const lessonIds=new Set(data.lessons.map(l=>l.id));
assert.equal(lessonIds.size,data.lessons.length);
const qIds=new Set();
for(const q of data.questions){
  assert.equal(qIds.has(q.id),false,"Duplicate question "+q.id);
  qIds.add(q.id);
  assert.ok(lessonIds.has(q.lesson),"Invalid lesson for "+q.id);
  assert.ok(["all","care","marketing"].includes(q.track));
  assert.equal(q.options.length,4);
  assert.ok(q.correct>=0 && q.correct<4);
  assert.ok(q.why.length>10);
}
for(const c of data.cases){
  assert.equal(c.steps.length,3,"Scenario must have three decisions: "+c.id);
  for(const st of c.steps){
    assert.ok(st.best>=0&&st.best<st.choices.length);
    assert.ok(st.why.length>10 && st.risk.length>10);
  }
}
for(const role of ["all","care","marketing"]){
  const lessons=data.lessons.filter(l=>l.roles.includes("all")||l.roles.includes(role));
  const qs=data.questions.filter(q=>q.track==="all"||q.track===role);
  for(const l of lessons){
    assert.ok(qs.some(q=>q.lesson===l.id),"Uncovered role/lesson "+role+"/"+l.id);
  }
}
console.log("PASS content structure and role coverage");

function fakeNode(){
  return {
    innerHTML:"",textContent:"",value:"",hidden:false,dataset:{},
    classList:{add(){},remove(){},toggle(){},contains(){return false;}},
    setAttribute(){},removeAttribute(){},addEventListener(){}
  };
}
function boot(){
  const el={};
  const listeners={};
  const loc={hash:"#/home"};
  const cache={};
  const doc={
    body:{appendChild(){}},
    getElementById(id){return el[id]||(el[id]=fakeNode());},
    querySelectorAll(){return [];},
    addEventListener(type,handler){listeners[type]=handler;}
  };
  const win={
    COLORA_DATA:data,
    COLORA_INTELLIGENCE:intelligence,
    events:{},
    isSecureContext:true,
    scrollTo(){},
    addEventListener(type,handler){this.events[type]=handler;}
  };
  const store={
    getItem(key){return cache[key]||null;},
    setItem(key,value){cache[key]=value;}
  };
  const context={
    window:win,document:doc,localStorage:store,location:loc,
    navigator:{clipboard:{}},setTimeout:()=>0,clearTimeout(){},
    confirm:()=>true,URL:{createObjectURL(){return "blob:demo";},revokeObjectURL(){}},
    Blob:function(){}
  };
  vm.runInNewContext(read("app.js"),context,{timeout:5000});
  function route(path){loc.hash="#/"+path;win.events.hashchange();return el["main-content"].innerHTML;}
  function click(selector,dataset){
    listeners.click({target:{closest(query){return query===selector?{dataset}:null;}}});
    return el["main-content"].innerHTML;
  }
  return {route,click,cache,el};
}
const app=boot();
for(const page of ["home","learn","scripts","cases","resources","progress","practice","exam","lesson/gemstone","intelligence","stone/topaz","evidence","roleplay"]){
  assert.ok(app.route(page).length>250,"Blank route "+page);
}
assert.ok(app.route("cases").includes("Viên đá có dấu hiệu lỏng"));
assert.ok(app.route("resources").includes("Coming Soon"));
assert.ok(app.route("intelligence").includes("Topaz"));
assert.ok(app.route("intelligence").includes("12 tình huống tư vấn"));
assert.ok(app.route("stone/ruby").includes("Ruby"));
assert.ok(app.route("stone/citrine").includes("Citrine"));
assert.ok(app.route("stone/peridot").includes("Peridot"));
assert.ok(app.route("stone/topaz").includes("cát khai"));
assert.ok(app.route("evidence").includes("CHƯA CÓ HỒ SƠ SKU"));
assert.ok(app.route("roleplay").includes("Khách phát hiện đá lỏng"));
assert.ok(app.route("case/loose-stone").includes("DECISION 1 / 3"));
assert.ok(app.click("[data-case-option]",{caseOption:"0"}).includes("Nguyên tắc bảo vệ"));
assert.ok(app.click("[data-case-next]",{caseNext:"1"}).includes("DECISION 2 / 3"));
app.click("[data-case-option]",{caseOption:"1"});
app.click("[data-case-next]",{caseNext:"1"});
app.click("[data-case-option]",{caseOption:"1"});
assert.ok(app.click("[data-case-next]",{caseNext:"1"}).includes("CASE REVIEW"));
assert.ok(JSON.parse(app.cache["colora-academy-v1-public"]).results.some(r=>r.mode==="case"));
console.log("PASS routes and three-step case simulation");
assert.ok(app.route("roleplay").includes("Advisor Role-play"));
assert.ok(app.click("[data-roleplay-start]",{roleplayStart:"stone-loose"}).includes("roleplay-draft"));
assert.ok(app.click("[data-roleplay-reveal]",{}).includes("roleplay-example"));
assert.ok(app.click("[data-roleplay-eval]",{}).includes("điểm tự đánh giá"));
console.log("PASS V2 product and role-play interfaces");

app.route("exam");
assert.ok(app.click("[data-start-quiz]",{startQuiz:"exam"}).includes("Câu 1 / 15"));
for(let i=0;i<15;i++){
  app.click("[data-option-index]",{optionIndex:"1"});
  if(i<14)app.click("[data-quiz-nav]",{quizNav:"1"});
}
assert.ok(app.click("[data-quiz-submit]",{quizSubmit:"1"}).includes("FINAL ASSESSMENT RESULT"));
console.log("PASS 15-question assessment flow");

const html=read("index.html");
assert.match(html,/data-page="cases"/);
assert.match(html,/data-page="intelligence"/);
assert.match(html,/data-page="roleplay"/);
assert.match(html,/intelligence\.js/);
assert.match(html,/Content-Security-Policy/);
assert.doesNotMatch(html,/class="brand-symbol"/);
console.log("PASS navigation and brand placeholder guardrails");
