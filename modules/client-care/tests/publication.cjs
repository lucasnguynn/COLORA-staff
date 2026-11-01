/* Publish-time checks for the PUBLIC projection only. Does not prove QC authenticity. */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../data/approved-public.js"),"utf8");
const ctx={window:{}};
vm.runInNewContext(source,ctx,{timeout:2500});
const r=ctx.window.COLORA_PUBLIC_RELEASES;
assert.ok(r && r.schemaVersion==="1.0");
assert.ok(Array.isArray(r.products)&&Array.isArray(r.policies));
const own=(obj,k)=>Object.prototype.hasOwnProperty.call(obj,k);
const allowedProduct=new Set(["sku","name","category","status","revision","approvedOn","reviewerRole","summary","gemstone","metal","finish","wearability","care","claims"]);
const allowedClaim=new Set(["text","verified","approvedOn"]);
const allowedPolicy=new Set(["id","title","version","effectiveOn","approvedOn","reviewerRole","url","summary","status"]);
const validDate=(s)=>typeof s==="string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s).valueOf()) && new Date(s).toISOString().slice(0,10)===s;
const banned=/(\b(cccd|cmnd|passport|phone|mobile|telephone|email|customer|client.?id|supplier|purchase.?cost|unit.?cost|bank|token|api.?key|private.?note|invoice|contract|bom|qc.?report|personal.?data)\b)/i;
const seen=new Set();
for(const p of r.products){
  assert.ok(p && typeof p==="object");
  for(const key of Object.keys(p)){assert.ok(allowedProduct.has(key),"Product forbidden/private field: "+key);assert.ok(!banned.test(key),"Product risky field: "+key);}
  for(const key of ["sku","name","category","revision","reviewerRole","gemstone","metal","finish","wearability","care"]){
    assert.ok(typeof p[key]==="string"&&p[key].trim().length>=2,"Missing public SKU field: "+key);
  }
  assert.ok(["ring","earring","necklace","bracelet"].includes(p.category),"Invalid category");
  assert.equal(p.status,"approved","Not-approved SKU must not be published");
  assert.ok(validDate(p.approvedOn),"Approved date invalid");
  assert.ok(!seen.has(p.sku),"Duplicate public SKU");
  seen.add(p.sku);
  assert.ok(Array.isArray(p.claims)&&p.claims.length>0,"Claims require explicit approval");
  for(const c of p.claims){
    for(const key of Object.keys(c))assert.ok(allowedClaim.has(key),"Claim forbidden field: "+key);
    assert.ok(typeof c.text==="string"&&c.text.trim().length>=6);
    assert.equal(c.verified,true,"Cannot release unverified public claim");
    assert.ok(validDate(c.approvedOn),"Invalid claim approval date");
  }
}
const policyIds=new Set();
for(const p of r.policies){
  assert.ok(p&&typeof p==="object");
  for(const key of Object.keys(p))assert.ok(allowedPolicy.has(key),"Policy forbidden field: "+key);
  for(const key of ["id","title","version","reviewerRole","summary"]){
    assert.ok(typeof p[key]==="string"&&p[key].trim().length>=2,"Missing policy field: "+key);
  }
  assert.equal(p.status,"approved");
  assert.ok(validDate(p.approvedOn)&&validDate(p.effectiveOn));
  const u=new URL(p.url);
  assert.equal(u.protocol,"https:");
  assert.ok(!policyIds.has(p.id),"Duplicate policy ID");
  policyIds.add(p.id);
}
assert.match(source,/PUBLIC RELEASE ONLY/);
console.log("PASS publication gate: "+r.products.length+" approved public SKUs, "+r.policies.length+" approved public policies");
console.log("IMPORTANT CI verifies shape only; approval authenticity requires real human review of private source records.");
