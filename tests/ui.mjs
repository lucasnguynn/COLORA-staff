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
  const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('BROWSER PAGE ERROR',e.message)});
  page.on('requestfailed',r=>console.error('FAILED RESOURCE',r.url(),r.failure()?.errorText));
  await page.goto('http://127.0.0.1:'+server.address().port+'/');
  await page.locator('#dashboard').waitFor();
  assert.equal(await page.locator('.feature-card').count(),6);
  assert.equal(await page.locator('[data-view="web"]').count(),0,'Website Generator links must be removed');
  assert.equal(await page.locator('#web-tool,#web-form,#web-preview').count(),0,'Website Generator DOM must be removed');
  assert.equal(await page.locator('.hero-art,.hero-facet,.hero-symbol').count(),0,'Decorative diagonal hero illustration must be removed');
  assert.equal(await page.locator('.hero-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns==='none'),true,'Homepage hero must not reserve empty illustration column');
  const logo=page.locator('.brand-logo');
  assert.equal(await logo.isVisible(),true,'Official COLORA logo should be visible');
  assert.equal(await logo.evaluate(el=>el.complete&&el.naturalWidth>0),true,'Official COLORA logo must load correctly');
  assert.equal(await page.locator('.sidebar').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(0, 36, 81)','Sidebar must use COLORA deep navy');
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
  await page.locator('#signature-form [name="phone"]').fill('+84912345678');
  assert((await page.locator('#signature-preview').innerText()).includes('Minh An'));
  assert.equal(await page.locator('#signature-preview img[alt="COLORA"]').count(),1,'Signature must use official COLORA logo');
  const signatureRows=page.locator('#signature-preview > table > tbody > tr');
  assert.equal(await signatureRows.count(),2,'Signature should separate brand header from employee details');
  assert.equal(await signatureRows.nth(0).locator('img[alt="COLORA"]').count(),1,'Official logo belongs in the unbordered header');
  const closing=signatureRows.nth(0).locator('p').first();
  assert.equal(await closing.innerText(),'Kính thư / Best regards,','Bilingual sign-off should appear before logo');
  assert.equal(await closing.locator('strong em').count(),1,'Bilingual sign-off must be bold and italic');
  const closingBottom=await closing.evaluate(el=>el.getBoundingClientRect().bottom);
  const logoTop=await signatureRows.nth(0).locator('img[alt="COLORA"]').evaluate(el=>el.getBoundingClientRect().top);
  assert(logoTop>closingBottom+15,'Fine gold divider must keep breathing room above logo');
  const separator=signatureRows.nth(0).locator('p[aria-hidden="true"]');
  assert.equal(await separator.evaluate(el=>getComputedStyle(el).borderTopColor),'rgb(176, 138, 91)','Sign-off divider should use COLORA gold');
  assert.equal(await separator.evaluate(el=>getComputedStyle(el).borderTopWidth),'1px','Sign-off divider should be a quiet hairline');
  assert((await signatureRows.nth(0).innerText()).includes('COLOR YOUR AURA'),'Tagline belongs above the gold line');
  assert.equal(await signatureRows.nth(0).locator('td').evaluate(el=>getComputedStyle(el).borderLeftWidth),'0px','No decorative bar next to logo and tagline');
  assert.equal(await signatureRows.nth(0).locator('td').evaluate(el=>getComputedStyle(el).paddingLeft),'0px','Logo and tagline should move closer to the left edge');
  const tagline=signatureRows.nth(0).locator('div');
  assert.equal(await tagline.evaluate(el=>getComputedStyle(el).paddingLeft),'5px','Tagline C must align with visible logo C despite PNG inset');
  const detailRows=signatureRows.nth(1).locator('table[role="presentation"] > tbody > tr');
  assert.equal(await detailRows.count(),5,'Name, role, email, phone and website need separate rows');
  const contactTops=await Promise.all([2,3,4].map(i=>detailRows.nth(i).evaluate(el=>el.getBoundingClientRect().top)));
  assert(Math.abs((contactTops[1]-contactTops[0])-18)<1,'Email and phone must use one 18px line rhythm');
  assert(Math.abs((contactTops[2]-contactTops[1])-18)<1,'Phone and website must use the same 18px line rhythm');
  assert((await signatureRows.nth(1).innerText()).includes('Minh An'),'Employee name belongs at start of bordered details');
  assert.equal(await signatureRows.nth(1).locator('td').first().evaluate(el=>getComputedStyle(el).borderLeftWidth),'3px','Gold line must start at employee name');
  assert.equal(await signatureRows.nth(1).locator('td').first().evaluate(el=>getComputedStyle(el).borderLeftColor),'rgb(176, 138, 91)','Signature border must use COLORA gold');
  const emailNode=signatureRows.nth(1).locator('a[href="mailto:example%40colora.vn"]');
  const phoneNode=signatureRows.nth(1).locator('a[href^="tel:"]');
  assert.equal(await emailNode.count(),1,'Email link is missing');
  assert.equal(await phoneNode.count(),1,'Phone link must appear when provided');
  assert.equal(decodeURIComponent(await phoneNode.getAttribute('href')),'tel:+84912345678','Phone link should contain the correct number');
  const emailTop=await emailNode.evaluate(el=>el.getBoundingClientRect().top);
  const phoneTop=await phoneNode.evaluate(el=>el.getBoundingClientRect().top);
  assert(phoneTop>emailTop+5,'Phone number must be on its own line below email');
  const signature=page.waitForEvent('download');
  await page.locator('#signature-download').click();
  const downloadedSignature=await signature;
  assert.equal(downloadedSignature.suggestedFilename(),'colora-email-signature.html');
  const exportedHTML=fs.readFileSync(await downloadedSignature.path(),'utf8');
  assert(exportedHTML.includes('padding:5px 0 18px 0'),'Exported signature must keep left-aligned logo');
  assert(exportedHTML.includes('mso-line-height-rule:exactly'),'Exported signature needs Outlook-safe line spacing');
  assert(exportedHTML.includes('<strong style="font-weight:700;"><em style="font-style:italic;">Kính thư / Best regards,</em></strong>'),'Exported signature must keep the bold italic bilingual sign-off');
  assert(exportedHTML.includes('border-top:1px solid #B08A5B'),'Exported signature must keep gold separator');
  assert(exportedHTML.includes('padding:1px 0 0 5px'),'Exported tagline must retain the wordmark inset adjustment');
  await page.locator('#signature-form [name="role"]').fill('');
  assert.equal(await detailRows.count(),4,'Empty role must not leave a phantom spacer row');
  await page.locator('#signature-form [name="role"]').fill('Client Advisor');
  // BKNS mailbox setup guides use one protected Staff route with 12 SVG
  // interface illustrations and never ask users to enter their password.
  await page.locator('.nav-btn[data-view="mail-setup"]').click();
  await page.locator('#mail-guide').waitFor({state:'visible'});
  assert.equal(await page.locator('#mail-guide-steps .mail-guide-step').count(),6);
  assert.equal(await page.locator('#mail-guide-steps svg[role="img"]').count(),6,'Outlook guide must have an illustration for every step');
  assert((await page.locator('#mail-guide-settings').innerText()).includes('smtp81065.bkns.com.vn'));
  assert((await page.locator('#mail-guide-settings').innerText()).includes('993'));
  assert((await page.locator('#mail-guide-settings').innerText()).includes('465'));
  assert.equal(await page.locator('#mail-guide input[type="password"]').count(),0,'Never request or save BKNS mailbox password');
  await page.locator('#mail-guide-email').fill('dat.ndq@colora.vn');
  assert((await page.locator('#mail-guide-settings').innerText()).includes('dat.ndq@colora.vn'),'Guide must reflect staff member mailbox');
  await page.locator('[data-mail-platform="apple"]').click();
  assert.equal(new URL(page.url()).hash,'#mail-setup/apple','Apple Mail guide should have a deep link');
  assert.equal(await page.locator('#mail-guide-steps .mail-guide-step').count(),6);
  assert((await page.locator('#mail-guide-steps').innerText()).includes('Other Mail Account'),'Apple Mail provider choice is missing');
  await page.locator('[data-mail-zoom="3"]').click();
  assert.equal(await page.locator('#mail-guide-dialog').evaluate(el=>el.open),true,'Detailed illustration must be zoomable');
  assert((await page.locator('.mail-guide-modal-art').innerHTML()).includes('svg'));
  await page.locator('#mail-guide-dialog-close').click();
  assert.equal(await page.locator('#mail-guide-dialog').evaluate(el=>el.open),false);
  await page.locator('[data-mail-platform="outlook"]').click();
  assert.equal(new URL(page.url()).hash,'#mail-setup/outlook');
  assert((await page.locator('#mail-guide-steps').innerText()).includes('Microsoft 365/Exchange'));
  // Existing signature page retains a direct contextual link to setup guide.
  await page.locator('.nav-btn[data-view="signature"]').click();
  await page.locator('.mail-guide-inline-link').click();
  await page.locator('#mail-guide').waitFor({state:'visible'});
  assert.equal(await page.locator('#mail-guide').isVisible(),true);
  // Removed routes should safely resolve to dashboard; no orphaned generator.
  await page.evaluate(()=>location.hash='#web');
  await page.locator('#dashboard').waitFor({state:'visible'});
  assert.equal(await page.locator('#path-label').innerText(),'Staff Workspace');
    for(const [view,selector] of [['learning','#app'],['client-care','#main-content'],['qr','#downloadPng'],['jd','#workspaceTitle']]){
    await page.locator('.nav-btn[data-view="'+view+'"]').click();
    const embedded=page.frameLocator('#module-frame');
    try{await embedded.locator(selector).waitFor({timeout:12000});}
    catch(error){
      console.error('MODULE DEBUG',view,await page.locator('#module-frame').evaluate(e=>({src:e.getAttribute('src'),srcdoc:e.hasAttribute('srcdoc'),href:e.contentWindow?.location?.href,body:e.contentDocument?.body?.innerText?.slice(0,250)})).catch(e=>String(e)));
      throw error;
    }
    if(view==='qr'){
      await embedded.locator('#qrPreview canvas, #qrPreview svg').first().waitFor({state:'attached',timeout:16000});
      assert.equal(await embedded.locator('script[src*="unpkg.com"]').count(),0,'QR engine must be self-hosted');
      assert.equal(await embedded.locator('script[src*="vendor/qr-code-styling.js"]').count(),1,'Local QR library missing');
    }
    if(view!=='jd'){
      assert.equal(await embedded.locator('#staticrypt-password').count(),0,'No second Staff login in '+view);
      const frameSrc=await page.locator('#module-frame').getAttribute('src');
      assert(frameSrc?.startsWith('blob:'),'Module content must be mounted locally, no GitHub URL: '+view);
      assert.equal(await embedded.locator('html').getAttribute('data-colora-embed'),view,'Integrated content variant missing');
      assert.equal(await page.locator('#module-open').isVisible(),false,'Old app window access button must be removed');
      assert.equal(await page.locator('#module-frame').evaluate(el=>getComputedStyle(el).borderTopWidth),'0px','App must sit flush, not within a framed card');
      if(view==='learning'){
        try{await embedded.locator('#app .content').waitFor({state:'visible',timeout:10000});}
        catch(error){
          const details=await page.locator('#module-frame').evaluate(e=>{
            let d=e.contentDocument;
            return {src:e.getAttribute('src'),frameURL:e.contentWindow?.location?.href,title:d?.title,body:d?.body?.innerText?.slice(0,800),baseURI:d?.baseURI,scripts:[...(d?.scripts||[])].map(x=>x.src),nav:typeof e.contentWindow?.nav,boot:typeof e.contentWindow?.boot,head:d?.head?.innerHTML?.slice(0,600),root:d?.documentElement?.outerHTML?.slice(0,400)};
          }).catch(e=>({error:String(e)}));
          console.error('LEARNING MODULE DIAGNOSTIC:',JSON.stringify(details));
          throw error;
        }
        assert.equal(await embedded.locator('#app .sidebar').isVisible(),false,'Learning has a duplicate sidebar');
        assert(await page.locator('.workspace-subnav-btn').count()>=5,'Missing integrated Learning navigation');
        await page.locator('.workspace-subnav-btn[data-subroute="review"]').click();
        await page.locator('.workspace-subnav-btn[data-subroute="learn"]').click();
      }
      if(view==='client-care'){
        assert.equal(await embedded.locator('.app-shell > .sidebar').isVisible(),false,'Client Care has a duplicate sidebar');
        assert.equal(await embedded.locator('.workspace > .topbar').isVisible(),false,'Client Care has a second header');
        await page.locator('.workspace-subnav-btn[data-subroute="scripts"]').click();
        await page.waitForTimeout(450);
        const careState=await page.locator('#module-frame').evaluate(el=>({
          href:el.contentWindow?.location?.href,
          hash:el.contentWindow?.location?.hash,
          title:el.contentDocument?.title,
          content:el.contentDocument?.getElementById('main-content')?.innerText?.slice(0,450),
          active:el.contentDocument?.querySelector('.nav-link.active')?.getAttribute('data-page')
        }));
        console.log('CARE NAV DIAGNOSTIC',JSON.stringify(careState));
        assert((await embedded.locator('#main-content').innerText()).toLowerCase().includes('kịch bản'),'Client Care scripts failed to navigate');
        assert.equal((await embedded.locator('body').innerText()).includes('File not found'),false,'GitHub 404 inside Client Care');
        await page.locator('.workspace-subnav-btn[data-subroute="learn"]').click();
      }
      if(view==='qr'){
        assert.equal(await embedded.locator('.shell > .topbar').isVisible(),false,'QR has duplicate branding header');
        assert.equal(await embedded.locator('.shell > .hero').isVisible(),false,'QR has duplicate landing hero');
      }
      // The host resizes section content asynchronously (ResizeObserver plus
      // 300ms fallback). Check the settled layout, not the first frame tick.
      await page.waitForFunction(()=>{
        const el=document.getElementById('module-frame');
        if(!el?.contentDocument)return false;
        return el.contentDocument.documentElement.scrollHeight<=el.getBoundingClientRect().height+110;
      },null,{timeout:8000,polling:180});
      const sizes=await page.locator('#module-frame').evaluate(el=>({frame:el.getBoundingClientRect().height,scroll:el.contentDocument?.documentElement.scrollHeight}));
      assert(sizes.frame>=430,'Frame should expand as a continuous document section');
      if(sizes.scroll>sizes.frame+110){
        const deep=await page.locator('#module-frame').evaluate(el=>{
          const d=el.contentDocument;
          const target=el.contentDocument?.querySelector('#app .content,#main-content,.page .shell');
          return {view:el.title,body:d?.body?.scrollHeight,html:d?.documentElement?.scrollHeight,
            targetScroll:target?.scrollHeight,targetRect:target?.getBoundingClientRect().toJSON(),
            appScroll:d?.querySelector('#app')?.scrollHeight,
            shellScroll:d?.querySelector('.shell')?.scrollHeight,src:el.getAttribute('src'),frameStyle:el.style.cssText,frameComputed:getComputedStyle(el).height,moduleComputed:getComputedStyle(el.parentElement).display,embedStylesheet:[...document.styleSheets].some(st=>{try{return [...st.cssRules].some(rule=>rule.selectorText?.includes('#module #module-frame'))}catch{return false}})};
        });
        console.error('SCROLL DEBUG',JSON.stringify(deep));
      }
      assert(sizes.scroll<=sizes.frame+110,'Nested scroll detected ('+view+'): '+JSON.stringify(sizes));
      fs.mkdirSync('test-results',{recursive:true});
      await page.screenshot({path:'test-results/'+view+'-integrated-desktop.png',fullPage:false});
    }
  }
  await page.locator('#module-expand').click();
  assert(await page.locator('body').evaluate(x=>x.classList.contains('module-immersive')));
  await page.keyboard.press('Escape');
  await page.setViewportSize({width:390,height:844});
  await page.locator('#mobile-menu').click();
  await page.locator('.nav-btn[data-view="client-care"]').click();
  await page.frameLocator('#module-frame').locator('#main-content').waitFor({state:'visible',timeout:14000});
  await page.waitForTimeout(650);
  assert.equal(await page.frameLocator('#module-frame').locator('.app-shell > .sidebar').isVisible(),false,'Client Care mobile should use Staff sidebar only');
  assert.equal(await page.locator('#module-frame').evaluate(el=>el.contentDocument.documentElement.scrollWidth <= el.clientWidth+2),true,'Client Care has horizontal overflow on mobile');
  fs.mkdirSync('test-results',{recursive:true});
  await page.screenshot({path:'test-results/client-care-integrated-mobile.png',fullPage:false});
  await page.locator('#mobile-menu').click();
  assert(await page.locator('#sidebar').evaluate(x=>x.classList.contains('open')));
  assert(await page.locator('#mobile-shade').isVisible());
  await page.locator('[data-view="mail-setup"].nav-btn').click();
  await page.locator('#mail-guide').waitFor({state:'visible'});
  assert.equal(await page.locator('#mail-guide-steps .mail-guide-step').count(),6);
  const mailWidth=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);
  assert(mailWidth[0]<=mailWidth[1]+2,'Mobile mailbox guide overflow: '+mailWidth);
  await page.locator('#mobile-menu').click();
  await page.locator('[data-view="library"].nav-btn').click();
  await page.locator('#mobile-shade').waitFor({state:'hidden'});
  await page.waitForTimeout(300);
  const sizes=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);
  assert(sizes[0]<=sizes[1]+2,'Mobile overflow: '+sizes);
  fs.mkdirSync('test-results',{recursive:true});
  await page.screenshot({path:'test-results/colora-staff-mobile.png',fullPage:true});
  await page.setViewportSize({width:1440,height:900});
  await page.locator('[data-view="home"].nav-btn').click();
  await page.screenshot({path:'test-results/colora-staff-desktop.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('PASS: Staff UI desktop/mobile, library, signatures, HTML export and 4 embedded modules and mailbox setup walkthrough');
}finally{await browser.close();await new Promise(done=>server.close(done));}
