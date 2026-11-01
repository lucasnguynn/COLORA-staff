import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {chromium} from 'playwright';
const root=path.resolve('dist');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
  let p=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!p.startsWith(root)){res.writeHead(403).end();return;}
  if(fs.existsSync(p)&&fs.statSync(p).isDirectory())p=path.join(p,'index.html');
  if(!fs.existsSync(p)){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream'});
  fs.createReadStream(p).pipe(res);
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
  const page=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/');
  await page.locator('#dashboard').waitFor();
  assert.equal(await page.locator('.feature-card').count(),7);
  await page.locator('[data-view="library"].nav-btn').click();
  assert.equal(await page.locator('.library-card').count(),8);
  await page.locator('#library-search').fill('giac cat');
  assert((await page.locator('.library-card').count())>0);
  await page.locator('#library-search').fill('');
  await page.locator('.filter-btn[data-filter="Sản phẩm"]').click();
  assert.equal(await page.locator('.library-card').count(),2);
  await page.locator('.filter-btn[data-filter="Tất cả"]').click();
  await page.locator('.library-card[data-resource="brand-story"]').click();
  await page.locator('#library-article').waitFor({state:'visible',timeout:5000});
  await page.locator('#library-back').click();
  await page.locator('[data-view="signature"].nav-btn').click();
  await page.locator('#signature-form [name="name"]').fill('Minh An');
  await page.locator('#signature-form [name="role"]').fill('Client Advisor');
  await page.locator('#signature-form [name="email"]').fill('example@colora.vn');
  assert((await page.locator('#signature-preview').innerText()).includes('Minh An'));
  const signature=page.waitForEvent('download');
  await page.locator('#signature-download').click();
  assert.equal((await signature).suggestedFilename(),'colora-email-signature.html');
  await page.locator('[data-view="web"].nav-btn').click();
  await page.locator('#web-form [name="template"]').selectOption('announcement');
  await page.locator('#web-form [name="description"]').fill('<script>alert(1)</script>');
  const srcdoc=await page.locator('#web-preview').getAttribute('srcdoc');
  assert(srcdoc.includes('&lt;script&gt;'));
  assert(srcdoc.includes('background:#002451'));
  const html=page.waitForEvent('download');await page.locator('#web-form button[type="submit"]').click();
  assert.equal((await html).suggestedFilename(),'colora-landing-page.html');
  for(const [view,selector] of [['learning','#app'],['client-care','#main-content'],['qr','#downloadPng'],['jd','#workspaceTitle']]){
    await page.locator('.nav-btn[data-view="'+view+'"]').click();
    await page.frameLocator('#module-frame').locator(selector).waitFor({timeout:20000});
  }
  await page.locator('#module-expand').click();
  assert(await page.locator('body').evaluate(x=>x.classList.contains('module-immersive')));
  await page.keyboard.press('Escape');
  await page.setViewportSize({width:390,height:844});
  await page.locator('#mobile-menu').click();
  assert(await page.locator('#sidebar').evaluate(x=>x.classList.contains('open')));
  await page.locator('[data-view="library"].nav-btn').click();
  const sizes=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);
  assert(sizes[0]<=sizes[1]+2,'Mobile overflow: '+sizes);
  fs.mkdirSync('test-results',{recursive:true});
  await page.screenshot({path:'test-results/colora-staff-mobile.png',fullPage:true});
  await page.setViewportSize({width:1440,height:900});
  await page.locator('[data-view="home"].nav-btn').click();
  await page.screenshot({path:'test-results/colora-staff-desktop.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('PASS: Staff UI desktop/mobile, library, signatures, HTML export and 4 embedded modules');
}finally{await browser.close();await new Promise(done=>server.close(done));}
