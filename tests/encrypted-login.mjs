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
if(Array.from(staff).length<8||Array.from(senior).length<8||staff===senior)throw Error('Invalid login smoke test prerequisites.');
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
  // Simulate a genuinely cold stylesheet cache: suppress only the lock
  // screen's PERFORMANCE preloads in this test, not the protected HTML.
  // The production login keeps those preloads to minimize transition latency.
  await page.route(base+'/',async route=>{
    const response=await route.fetch();
    const html=await response.text();
    const cold=html.replaceAll('<link rel="preload" href="/styles.css" as="style">','').replaceAll('<link rel="preload" href="/brand-refinements.css" as="style">','');
    await route.fulfill({response,body:cold});
  });
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
  // The recovery flow must be usable when a staff member has saved an
  // older password or an old encrypted HTML document in their browser.
  const recoveryPage=await context.newPage();
  await recoveryPage.goto(base+'/',{waitUntil:'domcontentloaded'});
  await recoveryPage.locator('#staticrypt-password').waitFor({state:'visible',timeout:15000});
  await recoveryPage.locator('#staticrypt-password').fill('WrongPasswordForRecoveryTest');
  await recoveryPage.locator('#staticrypt-form input[type="submit"]').click();
  const feedback=recoveryPage.locator('#staticrypt-login-feedback');
  await feedback.waitFor({state:'visible',timeout:10000});
  assert((await feedback.innerText()).includes('Không thể mở trang'),'Login failure must be explained inline');
  assert.equal(await recoveryPage.locator('#staticrypt-password').inputValue(),'','Rejected password must not remain in the input');
  assert.equal(await recoveryPage.locator('#staticrypt-login-recover').isVisible(),true,'Staff recovery action must be accessible');
  await recoveryPage.locator('#staticrypt-login-recover').click();
  await recoveryPage.waitForURL(url=>url.searchParams.has('refresh'),{timeout:15000});
  await recoveryPage.locator('#staticrypt-password').waitFor({state:'visible',timeout:15000});
  assert.equal(await recoveryPage.locator('#staticrypt-login-feedback').isVisible(),false,'Reload must reset login error');
  await recoveryPage.close();

  // Reproduce the reported 1-second flash: decrypt the real, encrypted
  // production page while deliberately holding its main stylesheet.
  // Unstyled dashboard text must NEVER be visible during this interval.
  let releaseCSS;
  let cssRequested;
  const pendingCSS=new Promise(resolve=>{cssRequested=resolve});
  const permitCSS=new Promise(resolve=>{releaseCSS=resolve});
  await page.route('**/styles.css',async route=>{
    cssRequested();
    await permitCSS;
    await route.continue();
  });
  await page.locator('#staticrypt-password').fill(staff);
  await page.locator('#staticrypt-form input[type="submit"]').click({noWaitAfter:true});
  try{
    await Promise.race([
      pendingCSS,
      new Promise((_,reject)=>setTimeout(()=>reject(Error('Encrypted Staff never requested main stylesheet')),12000))
    ]);
    await page.waitForFunction(()=>!!document.getElementById('dashboard'),null,{timeout:12000});
    const early=await page.evaluate(()=>({
      cssGuard:!!document.getElementById('colora-first-paint'),
      bodyVisibility:getComputedStyle(document.body).visibility,
      inlineVisibility:document.body.style.visibility,
      headerContent:getComputedStyle(document.documentElement,'::before').content,
      ready:document.documentElement.dataset.coloraReady||'false'
    }));
    assert.equal(early.cssGuard,true,'Missing inline anti-FOUC guard in decrypted HTML');
    assert.equal(early.bodyVisibility,'hidden','Raw Staff text must stay hidden when stylesheet is slow');
    assert.equal(early.inlineVisibility,'hidden','Decrypted body must have an inline guard before its CSS arrives');
    assert(early.headerContent.includes('COLORA'),'Waiting state should retain COLORA branding');
    assert.notEqual(early.ready,'true','Staff must not be declared ready before CSS arrives');
  }finally{
    releaseCSS();
  }
  // Keep interception installed until its async callback finishes; page.unroute
  // would auto-handle the held request and race with route.continue().
  await page.locator('#dashboard h1').waitFor({state:'visible',timeout:20000});
  await page.locator('body[data-staff-ready="true"]').waitFor({state:'attached',timeout:20000});
  assert.equal(await page.locator('html').getAttribute('data-colora-ready'),'true','Decrypted page should reveal only after stylesheet/font readiness');
  assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).visibility),'visible','Staff UI must become visible after CSS is ready');
  assert.equal(await page.locator('body').evaluate(el=>el.style.visibility),'','Inline visibility guard must be released only when Staff is ready');
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
  // Staff password MUST NOT reveal the JD navigation or its decrypted
  // source — even when the user directly edits the route fragment.
  assert.equal(await page.locator('body').getAttribute('data-staff-role'),'staff');
  assert.equal(await page.locator('.nav-btn[data-view="jd"]').count(),0);
  assert.equal(await page.locator('#bundled-jd').count(),0);
  await page.evaluate(()=>location.hash='#jd');
  await page.locator('#dashboard').waitFor({state:'visible'});
  assert.equal(await page.locator('#bundled-jd').count(),0);

  // SAME outer form must also accept Senior password, which decrypts a
  // completely separate, Senior-only ciphertext with integrated JD source.
  const seniorPage=await context.newPage();
  await seniorPage.goto(base+'/',{waitUntil:'domcontentloaded'});
  await seniorPage.locator('#staticrypt-password').waitFor({state:'visible',timeout:15000});
  assert.equal(await seniorPage.locator('#login-role-hint').isVisible(),true);
  await seniorPage.locator('#staticrypt-password').fill(senior);
  await seniorPage.locator('#staticrypt-form input[type="submit"]').click();
  await seniorPage.locator('body[data-staff-role="senior"][data-staff-ready="true"]').waitFor({state:'attached',timeout:25000});
  assert.equal(await seniorPage.locator('.nav-btn[data-view="jd"]').isVisible(),true);
  assert.equal(await seniorPage.locator('#bundled-jd').count(),1,'Only Senior ciphertext should contain JD');
  await seniorPage.locator('.nav-btn[data-view="jd"]').click();
  await seniorPage.frameLocator('#module-frame').locator('#editorPanel').waitFor({state:'visible',timeout:20000});
  await seniorPage.locator('#jd-workspace-controls').waitFor({state:'visible'});
  assert.equal(await seniorPage.frameLocator('#module-frame').locator('.app-shell > .sidebar').isVisible(),false,'Nested JD sidebar must be hidden');
  assert.equal(await seniorPage.frameLocator('#module-frame').locator('.workspace > .topbar').isVisible(),false,'Nested JD header must be hidden');
  assert((await seniorPage.locator('#jd-role-select option').count())>0,'Native JD role selector missing');
  const visibleLiteralNewline=await seniorPage.frameLocator('#module-frame').locator('body').evaluate(el=>
    [...el.childNodes].filter(n=>n.nodeType===3).some(n=>n.textContent.includes('\\n')));
  assert.equal(visibleLiteralNewline,false,'Encrypted Senior JD must not show literal backslash-n');
  assert.equal(await seniorPage.frameLocator('#module-frame').locator('#staticrypt-password').count(),0,'Senior must not face second password');
  await seniorPage.close();

    // No standalone public child HTML pages should be deployed.
  for(const route of ['apps/learning/index.html','apps/client-care/index.html','apps/qr/index.html','senior/index.html']){
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
  if(process.env.JD_BUILD_MODE==='preserve'){
    // The unchanged JD page still requires its ORIGINAL, privately held
    // Senior password. The new Senior secret may not decrypt this archive,
    // so verify the original login is intact and rejects the Staff password
    // without incorrectly claiming that the current secret opens JD.
    assert.equal(await page.locator('#workspaceTitle').count(),0,'Protected JD must remain encrypted');
    console.log('PASS: Staff tools unlock; previously encrypted JD remains protected and rejects Staff secret. Original JD password is unchanged.');
  }else{
    await unlock(page,senior);
    await page.locator('#workspaceTitle').waitFor({state:'attached',timeout:15000});
    console.log('PASS: single-login Staff portal with 3 internally bundled apps and separately protected senior JD decrypted using Actions secrets. No secret values logged.');
  }
}finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
