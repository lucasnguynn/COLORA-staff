import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
const read=name=>JSON.parse(fs.readFileSync(new URL('../data/'+name,import.meta.url),'utf8'));
const base=read('questions.json');
const gem=['13','14','15','16'].flatMap(x=>read('gem-'+x+'.json'));
const care=read('care-17.json');
const applied=read('applied-cases.json');
const lessons=read('lessons.json');
const config=read('curriculum.json');
const reviewManifest=read('essentials-review.json');
const facts=read('brand-facts.json');
const questions=[...base,...gem,...care,...applied];
assert.equal(base.length,206);
assert.equal(gem.length,53);
assert.equal(care.length,32);
assert.equal(applied.length,12);
assert.equal(questions.length,303);
assert.equal(lessons.length,17);
assert.equal(new Set(lessons.map(l=>l.id)).size,17);
const chapters=new Set(lessons.map(l=>l.id));
const pillars=['THƯƠNG HIỆU','SẢN PHẨM','KHÁCH HÀNG','HÀNH TRÌNH'];
const counts={CORE:0,BASIC:0,CARE:0,MKT:0,APPLIED:0};
const seen=new Set();let multi=0;
for(const q of questions){
 assert(!seen.has(q.id),'Duplicate id '+q.id);seen.add(q.id);
 assert(Object.hasOwn(counts,q.role),'Unknown role '+q.id);counts[q.role]++;
 assert(pillars.includes(q.pillar),'Wrong pillar '+q.id);
 assert(q.role==='APPLIED'?q.chapter==='A':chapters.has(q.chapter),'Wrong chapter '+q.id);
 assert(q.a.length===4&&new Set(q.a).size===4,'Choices '+q.id);
 assert(q.key.length>=1&&q.key.length<=3&&new Set(q.key).size===q.key.length,'Keys '+q.id);
 assert(q.key.every(i=>Number.isInteger(i)&&i>=0&&i<=3),'Key range '+q.id);
 assert(q.q.length>25&&q.why.length>20&&q.apply.length>20,'Content missing '+q.id);
 assert(!JSON.stringify(q).includes('https://'),'No embedded URL '+q.id);
 if(q.key.length>1)multi++;
}
assert.deepEqual(counts,{CORE:216,BASIC:18,CARE:32,MKT:25,APPLIED:12});
assert.equal(multi,12);
assert.equal(config.essential_ids.length,86);
assert.equal(new Set(config.essential_ids).size,86);
const core=questions.filter(q=>q.role==='CORE'),essential=core.filter(q=>config.essential_ids.includes(q.id));
assert.equal(essential.length,86);
assert.equal(reviewManifest.items.length,86);
assert.equal(new Set(reviewManifest.items.map(x=>x.id)).size,86);
assert(reviewManifest.items.every(x=>x.review_status==='PENDING_HUMAN_REVIEW'),'No question is officially signed off without reviewer');
for(const x of reviewManifest.items)assert(config.essential_ids.includes(x.id),'Review item not Essential '+x.id);
const exclusions=config.assessment_excluded_ids||[];
assert.deepEqual(exclusions.slice().sort(),['FN-033','FN-034','FN-035','GM-048','GM-053'].sort());
assert(exclusions.every(id=>reviewManifest.items.some(x=>x.id===id&&!x.assessment_eligible)),'Unapproved claims cannot enter exams');
const eligible=essential.filter(q=>!exclusions.includes(q.id));
assert.equal(eligible.length,81);
for(const chapter of chapters)assert(eligible.some(q=>q.chapter===chapter),'Exam lost chapter due to approval gate '+chapter);
for(const ch of chapters)assert(essential.some(q=>q.chapter===ch),'Essential coverage '+ch);
assert.deepEqual(config.critical_ids,['FN-062','FN-067','PC-022']);
for(const id of config.critical_ids)assert(config.essential_ids.includes(id),'Critical absent from Essentials');
assert.equal(applied.filter(q=>q.role==='APPLIED').length,12);
for(const p of pillars)assert.equal(applied.filter(q=>q.pillar===p).length,3);
assert.equal(config.exam.total,48);
assert.equal(Object.values(config.exam.pillar_quota).reduce((a,b)=>a+b,0),32);
assert.equal(config.exam.minimum_total,80);
assert.equal(config.exam.minimum_pillar,70);
assert.equal(facts.positioning.price_range_expected_vnd.min,2300000);
assert.equal(facts.positioning.price_range_expected_vnd.max,8000000);
assert.equal(facts.metal_system.brand_name,'COLORA SILVER');
assert.equal(facts.metal_system.silver_fineness_permille,930);
assert(facts.metal_system.launch_all_products_use_genia276_ag930);
const photos=new Set();
for(const l of lessons){
 assert(l.title&&l.points.length>=8&&l.visual?.cards?.length>=3,'Lesson incomplete '+l.id);
 assert(Array.isArray(l.essential_point_indices)&&l.essential_point_indices.length>=4&&l.essential_point_indices.length<l.points.length,'Essential/Advanced content needs distinct scope '+l.id);
 assert(new Set(l.essential_point_indices).size===l.essential_point_indices.length,'Duplicate essential point '+l.id);
 assert(l.essential_point_indices.every(i=>Number.isInteger(i)&&i>=0&&i<l.points.length),'Out-of-range lesson index '+l.id);
 assert(l.learning_objective?.length>25,'Missing learning objective '+l.id);
 assert(l.teachback?.prompt?.length>25&&l.teachback?.sample?.length>25,'Teachback incomplete '+l.id);
 for(const p of l.visual.photos||[]){
  assert(p.src.startsWith('assets/')&&!p.src.includes('..'),'Unsafe image path');
  assert(fs.existsSync(new URL('../'+p.src,import.meta.url)),'Missing image '+p.src);
  photos.add(p.src);
 }
}
assert(photos.size>=4);
assert.equal(new Set(lessons.map(l=>l.learning_objective)).size,17,'All 17 chapters need distinct observable objectives');
assert.equal(lessons.reduce((n,l)=>n+l.essential_point_indices.length,0),117,'V10.2 Essentials lesson scope');
assert(lessons.find(l=>l.id==='09').essential_point_indices.includes(4),'Self-reward in Essentials');
assert(lessons.find(l=>l.id==='11').essential_point_indices.includes(1),'Desire in Essentials');
assert(lessons.find(l=>l.id==='11').essential_point_indices.includes(7),'Relationship in Essentials');
assert.equal(lessons.reduce((n,l)=>n+(l.practice_lab?.length||0),0),4,'Four CUG simulations required');
for(const l of lessons)for(const x of (l.practice_lab||[]))assert(x.scenario?.length>80&&x.task?.length>50&&x.guide?.length>90,'Weak learning simulation '+l.id);
assert(!lessons.find(l=>l.id==='12').points.some(p=>p.includes('100% post-consumer recycled')),'Unverified post-consumer claim');
assert(lessons.find(l=>l.id==='01').title.includes('DEMI-FINE'));
assert(lessons.find(l=>l.id==='07').points.some(p=>p.includes('100%')&&p.includes('launch')));
assert(lessons.find(l=>l.id==='04').points[0].includes('CHỜ DUYỆT'));
assert(lessons.find(l=>l.id==='17').points.some(p=>p.includes('COLORA SILVER')));
assert(!JSON.stringify(questions).includes('2,3–5 triệu'));
const originalFN=questions.filter(q=>q.id.startsWith('FN-'));
const longest=originalFN.filter(q=>q.key.length===1&&q.a[q.key[0]].length===Math.max(...q.a.map(x=>x.length))).length;
assert(longest/originalFN.length<=0.42,'Answer-length cues');
const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
execFileSync('node',['--check',new URL('../app.js',import.meta.url).pathname],{stdio:'inherit'});
assert(app.includes('track-panel')&&app.includes('save-teachback'),'Learning UI missing');
assert(app.includes('essential_point_indices')&&app.includes('learningPoints.map'),'V10 Essentials must not display all advanced points');
assert(app.includes('role_advanced_chapters')&&app.includes('GỢI Ý CHO VỊ TRÍ'),'Role-focused advanced path not active');
assert(app.includes('optionOrders')&&app.includes('order.map((i,shown)'),'Exam option randomization missing');
assert(app.includes('LEGACY_KEY')&&app.includes('legacyAttempts'),'V9 migration missing');
assert(app.includes('countRecheck')&&app.includes('reviewedAfterWeek'),'7-day review not implemented');
assert(app.includes('countNeedReview')&&app.includes('firstCorrect'),'Progress states missing');
assert(app.includes("ASSESSMENT_VERSION='10.2'")&&app.includes('ASSESSMENT_BANK_ID'),'Version-aware assessments missing');
assert(app.includes('latestCurrentAttempt')&&app.includes('latestHistoricalAttempt'),'Historical/current results mixed');
assert(app.includes('practiceKey(q.id)')&&app.includes("CORE_PROGRESS_PREFIX='CORE:'"),'CORE progress not shared');
assert(app.includes('TÌNH HUỐNG CUG MÔ PHỎNG'),'Simulated customer learning cases not visible');
assert(app.includes('criticalMiss')&&app.includes('weakPillars'),'Mastery gates missing');
assert(app.includes('applied-cases.json'),'Applied cases not loaded');
const appliedLong=applied.filter(q=>q.a[q.key[0]].length===Math.max(...q.a.map(x=>x.length)));
const appliedShort=applied.filter(q=>q.a[q.key[0]].length===Math.min(...q.a.map(x=>x.length)));
assert(appliedLong.length<=3,'Applied cases leak the correct answer through length');
assert(appliedShort.length<=4,'Applied cases leak shortest-answer rule');
const notAbsolute=/mọi|luôn|chắc chắn|tuyệt đối|vĩnh viễn|không bao giờ|không thể/i;
const eWrong=essential.flatMap(q=>q.a.filter((_,i)=>!q.key.includes(i)));
assert(eWrong.filter(s=>notAbsolute.test(s)).length/eWrong.length<.25,'Essentials contain too many implausible absolute distractors');
// Behavioral test: generate 40 complete exams for each role and validate quotas, chapter spread and critical inclusion.
const suffix=`\nglobalThis.__audit={state,examBase,essentials,choiceHtml,modules,examRole,submitExam,practiceUpdate,reviewDue,markAssessmentVersion,saveObj,answered,practiceKey,latestCurrentAttempt,latestHistoricalAttempt,isCurrentAttempt};`;
const ctx={console,Math,Date,setInterval:()=>{},clearInterval:()=>{},scrollTo:()=>{},localStorage:{getItem:()=>null,setItem:()=>{}},document:{},window:{}};
vm.createContext(ctx);
vm.runInContext(app.replace(/boot\(\);\s*$/,'')+suffix,ctx,{timeout:5000});
vm.runInContext('render=function(){}',ctx);
const audit=ctx.__audit;
audit.state.bank=questions; audit.state.lessons=lessons;audit.state.curriculum=config;
for(const role of ['BASIC','CARE','MKT']){
 audit.state.role=role;
 for(let k=0;k<40;k++){
  const selection=audit.examBase();
  assert.equal(selection.length,48,'48 questions required '+role);
  assert.equal(new Set(selection.map(q=>q.id)).size,48,'Duplicate in exam');
  for(const chapter of chapters)assert(selection.some(q=>q.chapter===chapter),'Exam missed chapter '+chapter);
  for(const id of config.critical_ids)assert(selection.some(q=>q.id===id),'Exam missed safety gate '+id);
  for(const id of exclusions)assert(!selection.some(q=>q.id===id),'Unapproved question in exam '+id);
  assert.equal(selection.filter(q=>q.role==='CORE').length,32);
  assert.equal(selection.filter(q=>q.role==='APPLIED').length,8);
  assert.equal(selection.filter(q=>q.role===role).length,8);
  for(const p of pillars)assert.equal(selection.filter(q=>q.role==='APPLIED'&&q.pillar===p).length,2);
 }
}
for(const q of applied){const order=[2,0,3,1];const html=audit.choiceHtml(q,[],false,false,order);
 const opts=[...html.matchAll(/data-opt="(\d+)"/g)].map(x=>Number(x[1]));
 assert.deepEqual(opts,order,'Shuffled answer mapping mismatch '+q.id);
 const correctDisplayIndex=order.indexOf(q.key[0]);
 assert(correctDisplayIndex>=0&&opts[correctDisplayIndex]===q.key[0],'Wrong answer mapping '+q.id);
}
for(const role of ['BASIC','CARE','MKT']){
 audit.state.role=role;
 const advanced=audit.modules().filter(m=>m.role==='ADVANCED');
 const recommended=new Set(config.role_advanced_chapters[role]);
 assert(advanced.some(m=>recommended.has(m.chapter)),'No role advanced recommendations '+role);
}
// Behavioral regression: V10.1 results are history only; CORE progress follows the learner across roles.
const epochMigration=1800000000000;
audit.saveObj.attempts=[{role:'BASIC',score:92,passed:true,date:new Date(epochMigration).toISOString()}];
audit.saveObj.practice={
 'BASIC:FN-001':{correct:false,at:epochMigration,firstCorrect:false,attempts:1},
 'CARE:FN-001':{correct:true,at:epochMigration+86400000,firstCorrect:true,attempts:1},
 'CARE:ON-041':{correct:true,at:epochMigration,firstCorrect:true,attempts:1},
 'CARE:ON-045':{correct:true,at:epochMigration,firstCorrect:true,attempts:1},
 'MKT:ON-074':{correct:true,at:epochMigration,firstCorrect:true,attempts:1},
 'BASIC:AC-001':{correct:true,at:epochMigration,firstCorrect:true,attempts:1}
};
audit.saveObj.contentVersion='10.1';
audit.markAssessmentVersion();
assert.equal(audit.saveObj.contentVersion,'10.2');
assert.equal(audit.saveObj.practice['CORE:FN-001'].correct,true,'Shared CORE result should come from latest prior response');
assert.equal(audit.saveObj.practice['CORE:FN-001'].firstCorrect,false,'Known prior incorrect first attempt must remain');
assert(!audit.saveObj.practice['BASIC:AC-001'],'Revised Applied Cases must not inherit old responses');
assert(!audit.saveObj.practice['CARE:ON-045']&&!audit.saveObj.practice['MKT:ON-074'],'Reworded role questions must not inherit stale scores');
assert(audit.saveObj.legacyPractice['CARE:ON-045']&&audit.saveObj.legacyPractice['MKT:ON-074'],'Preserve prior answers for historical review');
assert(audit.saveObj.practice['CARE:ON-041'],'Role-specific results must remain');
audit.state.role='BASIC';assert.equal(audit.answered('FN-001').correct,true);
audit.state.role='CARE';assert.equal(audit.answered('FN-001').correct,true);
assert.equal(audit.answered('ON-041').correct,true);
assert.equal(audit.latestCurrentAttempt('BASIC'),undefined,'Old attempts cannot pass V10.2');
assert.equal(audit.latestHistoricalAttempt('BASIC').score,92,'Historical attempts preserved');
// Behavioral regression: the exam records the role frozen at creation, not the profile role after navigation.
audit.state.role='BASIC';
const sample=audit.examBase();
audit.state.exam={role:'BASIC',contentVersion:'10.2',bankId:'colora-v10.2-20261031',ids:sample.map(q=>q.id),answers:Object.fromEntries(sample.map(q=>[q.id,q.key])),started:Date.now(),deadline:Date.now()+55000,optionOrders:{}};
audit.state.role='MKT';
audit.submitExam(false);
assert.equal(audit.state.attempt.role,'BASIC','Exam must not be recorded for a switched profile');
assert.equal(audit.state.attempt.score,100,'Fully correct exam scoring');
assert.equal(audit.state.attempt.passed,true,'Fully correct exam passes');
assert.equal(audit.state.attempt.assessmentVersion,'10.2');
assert.equal(audit.state.attempt.bankId,'colora-v10.2-20261031');
assert.equal(audit.latestCurrentAttempt('BASIC').assessmentVersion,'10.2');
assert.equal(audit.latestHistoricalAttempt('BASIC').score,92);
assert.equal(audit.isCurrentAttempt({role:'BASIC',assessmentVersion:'10.2',bankId:'invalid'}),false);
assert.equal(audit.examRole({role:'CARE'}),'CARE');
assert.equal(audit.examRole({role:'INVALID'}),null);
// Behavioral regression: preserve the first attempt and schedule 7-day and 30-day retrieval.
const day=86400000,epoch=1800000000000;
let row=audit.practiceUpdate(null,false,epoch);
assert.equal(row.firstCorrect,false);
row=audit.practiceUpdate(row,true,epoch+day);
assert.equal(row.firstCorrect,false,'Retried answer is not correct on first attempt');
assert.equal(audit.reviewDue(row,epoch+6*day),false);
assert.equal(audit.reviewDue(row,epoch+8*day),true);
row=audit.practiceUpdate(row,true,epoch+8*day);
assert.equal(row.reviewStage,1,'7-day review stage');
assert.equal(audit.reviewDue(row,epoch+37*day),false);
assert.equal(audit.reviewDue(row,epoch+38*day),true);
row=audit.practiceUpdate(row,true,epoch+38*day);
assert.equal(row.reviewStage,2,'30-day review stage');
assert.equal(audit.reviewDue(row,epoch+150*day),false,'Completed schedule stays complete');
const migrated=audit.practiceUpdate({correct:true,at:epoch,firstCorrect:null,attempts:2},true,epoch+8*day);
assert.equal(migrated.firstCorrect,null,'Do not claim first attempt for legacy data');
console.log('V10.2 QA pass: 303 questions, 86 Essentials, 117 core learning points, 4 CUG labs, 17 objectives, 120 exams, shared CORE migration and versioned results.');
