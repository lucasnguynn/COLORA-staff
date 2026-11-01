/* Unit tests for the independently rendered V2.1 pages. No network. */
"use strict";
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const read=(file)=>fs.readFileSync(path.join(__dirname,"..",file),"utf8");
const elements={};
function node(){return {innerHTML:"",value:"",dataset:{}};}
const doc={getElementById(id){return elements[id]||(elements[id]=node());},body:{appendChild(){}},createElement(){return {click(){},remove(){}}}};
const context={window:{},document:doc,location:{hash:"#/review"},URL,Blob,Date,setTimeout:()=>0};
for(const file of ["intelligence.js","data/approved-public.js","ops.js"])vm.runInNewContext(read(file),context,{timeout:5000});
const O=context.window.COLORA_OPS;
assert.ok(O);
assert.match(O.render("catalog"),/Chưa có SKU đã được phê duyệt công khai/);
assert.match(O.render("release"),/Chưa có phiên bản chính sách đã duyệt/);
assert.match(O.render("review"),/Khách phát hiện đá lỏng/);
assert.match(O.render("product","not-approved"),/Không có hồ sơ được phép hiển thị/);
const noApproval={sku:"R-01",name:"Demo",category:"ring",revision:"1",approvedOn:"2026-10-30",reviewerRole:"QC",gemstone:"Sapphire",metal:"Silver",finish:"Rh",care:"Clean",claims:[{text:"Sample only",verified:false,approvedOn:"2026-10-30"}],status:"draft"};
assert.equal(O.approved(noApproval),false);
assert.equal(O.approved(Object.assign({},noApproval,{status:"approved"})),false);
assert.equal(O.approved(Object.assign({},noApproval,{status:"approved",claims:[{text:"Sample only",verified:true,approvedOn:"2026-10-30"}]})),true);
function event(selector,dataset,value,checked){return {target:{value,checked,closest(s){return s===selector?{dataset,value,checked}:null;}}};}
assert.equal(O.click(event("[data-ops-start]",{opsStart:"stone-loose"})),true);
assert.match(elements["main-content"].innerHTML,/SCORING RUBRIC/);
for(const r of context.window.COLORA_INTELLIGENCE.rubric){
  const e=event("[data-ops-score]",{opsScore:r.id},"4");
  O.change(e);
}
O.click(event("[data-ops-evaluate]",{}));
let html=elements["main-content"].innerHTML;
assert.match(html,/100\/100/);
assert.match(html,/Đạt ngưỡng tham khảo/);
O.change(event("[data-ops-risk]",{opsRisk:"privacy"},null,true));
O.click(event("[data-ops-evaluate]",{}));
assert.match(elements["main-content"].innerHTML,/Cần coaching/);
O.click(event("[data-ops-back]",{}));
assert.match(elements["main-content"].innerHTML,/Khách phát hiện đá lỏng/);
console.log("PASS V2.1 catalog, empty policy registry, human review threshold and critical guardrails");
