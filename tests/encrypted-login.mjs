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
  await page.locator('#staticrypt_content').waitFor({state:'visible',timeout:15000});
  assert.equal(await page.locator('#staticrypt-password').isVisible(),true,'Staff login form missing');
  const logo=page.locator('.login-panel .brand-logo');
  assert.equal(await logo.evaluate(el=>el.complete&&el.naturalWidth>0),true,'Official COLORA login logo must load');
  assert.equal(await page.locator('.staticrypt-title').innerText(),'Staff Workspace','Staff title missing');
  assert.equal(await page.locator('.login-panel').evaluate(el=>getComputedStyle(el).fontFamily.includes('Open Sans')),true,'Login body font must be Open Sans');
  assert.equal(await page.locator('.staticrypt-title').evaluate(el=>getComputedStyle(el).fontFamily.includes('Cormorant Garamond')),true,'Login heading must be Cormorant Garamond');
  assert.equal(await page.locator('#staticrypt-remember-label').isVisible(),true,'Staff Remember me option missing');
  assert.equal(await page.locator('.login-panel').count(),1,'Exactly one COLORA access form expected');
  assert.equal(await page.locator('.identity-panel,.identity-copy,.site-topbar,.site-footer,.staticrypt-hr').count(),0,'Decorative or redundant login chrome must be removed');
  assert.equal(await page.locator('.staticrypt-content').innerText().then(t=>/A place to|Facets of Feeling|Every feeling|Made for our people/i.test(t)),false,'Remove sentimental and repeated brand copy');
  assert.equal(await page.locator('.brand-line').innerText(),'COLOR YOUR AURA','One concise brand line should appear');
  assert.equal(await page.locator('.brand-side').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(0, 36, 81)','COLORA Navy brand panel missing');
  assert.equal(await page.locator('.staticrypt-content .brand-logo').count(),1,'Only one COLORA logo should appear');
  assert.equal(await page.locator('.staticrypt-decrypt-button').getAttribute('value'),'Đăng nhập');
  assert.equal(await page.locator('.login-panel').evaluate(el=>getComputedStyle(el).fontFamily.includes('Open Sans')),true,'Use COLORA body typography');
  const panelWidth=await page.locator('.login-panel').evaluate(el=>el.getBoundingClientRect().width);
  assert(panelWidth>=800&&panelWidth<=940,'Desktop should render a compact two-tone panel, not a tiny card: '+panelWidth);
  assert.equal(await page.locator('.login-panel').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),2,'Desktop should show two balanced columns');
  if(process.env.LOGIN_QA_SCREENSHOTS==='1'){
    fs.mkdirSync('test-results',{recursive:true});
    await page.screenshot({path:'test-results/login-staff-desktop.png',fullPage:true});
    await page.setViewportSize({width:390,height:844});
    const widths=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);
    assert(widths[0]<=widths[1]+2,'Login mobile horizontal overflow '+widths);
    assert.equal(await logo.evaluate(el=>el.complete&&el.naturalWidth>0),true,'Mobile login logo failed to load');
    assert((await page.locator('.brand-side').boundingBox()).height<165,'Compact brand header expected on mobile');
    await page.screenshot({path:'test-results/login-staff-mobile.png',fullPage:true});
    await page.setViewportSize({width:1280,height:800});
  }
  await unlock(page,staff);
  await page.locator('#dashboard h1').waitFor({state:'visible',timeout:15000});
  await page.locator('body[data-staff-ready="true"]').waitFor({state:'attached',timeout:15000});
  assert((await page.locator('#dashboard').innerText()).includes('learn'),'Dashboard did not decrypt');

  // ONE staff login: navigate three copied apps inside the encrypted
  // dashboard without encountering another StatiCrypt form.
  const modules=[
    ['learning','#app'],
    ['client-care','#main-content'],
    ['qr','#downloadPng']
  ];
  for(const [view,selector] of modules){
    await page.locator('.nav-btn[data-view="'+view+'"]').click();
    const frame=page.frameLocator('#module-frame');
    try{await frame.locator(selector).waitFor({state:'attached',timeout:20000});}
    catch(error){
      // Report only structural diagnostics, NEVER user secrets or decrypted
      // page contents.
      const state=await page.locator('#module-frame').evaluate(el=>({
        src:el.getAttribute('src'),
        hasSrcdoc:el.hasAttribute('srcdoc'),
        frameURL:el.contentWindow?.location?.href,
        appFound:!!el.contentDocument?.querySelector('#app'),
        ready:document.body.dataset.staffReady
      })).catch(()=>({inaccessible:true}));
      console.error('Encrypted module load state',view,JSON.stringify(state));
      throw error;
    }
    if(await frame.locator('#staticrypt-password').count()>0)throw Error('Unexpected second Staff password form in '+view);
    console.log('PASS: '+view+' opened directly after the single Staff login.');
  }
  // No standalone public child HTML pages should be deployed.
  for(const route of ['apps/learning/index.html','apps/client-care/index.html','apps/qr/index.html']){
    const response=await context.request.get(base+'/'+route);
    assert.equal(response.status(),404,'Unexpected unprotected HTML URL: '+route);
  }

  // The JD module must NOT accept the standard staff secret.
  await page.goto(base+'/apps/jd/',{waitUntil:'domcontentloaded'});
  await page.locator('#staticrypt_content').waitFor({state:'visible',timeout:15000});
  assert.equal(await page.locator('.staticrypt-title').innerText(),'Management Access','Senior branded title missing');
  assert.equal(await page.locator('#staticrypt-remember-label').isVisible(),false,'Senior login must not offer Remember me');
  assert.equal(await page.locator('.login-panel .brand-logo').evaluate(el=>el.complete&&el.naturalWidth>0),true,'Senior logo missing');
  if(process.env.LOGIN_QA_SCREENSHOTS==='1') await page.screenshot({path:'test-results/login-senior-desktop.png',fullPage:true});
  await page.locator('#staticrypt-password').waitFor();
  await unlock(page,staff);
  await page.locator('#staticrypt-password').waitFor({state:'visible'});
  assert.equal(await page.locator('#workspaceTitle').count(),0,'JD incorrectly unlocked with staff secret');
  await unlock(page,senior);
  await page.locator('#workspaceTitle').waitFor({state:'attached',timeout:15000});

  console.log('PASS: single-login Staff portal with 3 internally bundled apps and separately protected senior JD decrypted using Actions secrets. No secret values logged.');
}finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
