import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

/**
 * Verify THE PRODUCTION ENCRYPTED OUTPUT decrypts using THE REAL Actions
 * secrets. Passwords never leave the GitHub Actions runner or enter logs.
 * Uses localhost because WebCrypto is allowed in secure loopback contexts.
 */
const staff=process.env.STAFF_PORTAL_PASSWORD||'';
const senior=process.env.SENIOR_JD_PASSWORD||'';
if(staff.length<16||senior.length<16||staff===senior)throw Error('Invalid login smoke test prerequisites.');
const dist=path.resolve('dist');
const mime={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.json':'application/json;charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
  let file;
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    file=path.resolve(dist,'.'+pathname);
    if(file!==dist && !file.startsWith(dist+path.sep))throw Error('bad path');
    if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    const type=mime[path.extname(file)]||'application/octet-stream';
    res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});
    fs.createReadStream(file).pipe(res);
  }catch{res.writeHead(404);res.end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
async function unlock(page,password){
  await page.locator('#staticrypt-password').fill(password);
  await page.locator('#staticrypt-form input[type="submit"]').click();
}
try{
  const context=await browser.newContext({viewport:{width:1280,height:800}});
  const page=await context.newPage();
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('#staticrypt-password').isVisible(),true,'Staff login form missing');
  await unlock(page,staff);
  await page.locator('#dashboard h1').waitFor({state:'visible',timeout:15000});
  assert((await page.locator('#dashboard').innerText()).includes('learn'),'Dashboard did not decrypt');

  // Verify all three integrated applications decrypt with staff secret.
  const modules=[
    ['apps/learning/','#app'],
    ['apps/client-care/','#main-content'],
    ['apps/qr/','#downloadPng']
  ];
  for(const [route,selector] of modules){
    await page.goto(base+'/'+route,{waitUntil:'domcontentloaded'});
    const login=page.locator('#staticrypt-password');
    if(await login.isVisible())await unlock(page,staff);
    await page.locator(selector).waitFor({state:'attached',timeout:15000});
  }

  // The JD module must NOT accept the standard staff secret.
  await page.goto(base+'/apps/jd/',{waitUntil:'domcontentloaded'});
  await page.locator('#staticrypt-password').waitFor();
  await unlock(page,staff);
  await page.locator('#staticrypt-password').waitFor({state:'visible'});
  assert.equal(await page.locator('#workspaceTitle').count(),0,'JD incorrectly unlocked with staff secret');
  await unlock(page,senior);
  await page.locator('#workspaceTitle').waitFor({state:'attached',timeout:15000});

  console.log('PASS: production-encrypted Staff, learning, client-care, QR and separately protected JD decrypted using Actions secrets. No secret values logged.');
}finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
