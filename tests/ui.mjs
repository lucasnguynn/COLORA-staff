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
  assert.equal(await page.locator('.feature-card').count(),7);
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
  assert((await page.locator('#signature-preview').innerText()).includes('Minh An'));
  assert.equal(await page.locator('#signature-preview img[alt="COLORA"]').count(),1,'Signature must use official COLORA logo');
  const signature=page.waitForEvent('download');
  await page.locator('#signature-download').click();
  assert.equal((await signature).suggestedFilename(),'colora-email-signature.html');
  await page.locator('[data-view="web"].nav-btn').click();
  await page.locator('#web-form [name="template"]').selectOption('announcement');
  await page.locator('#web-form [name="description"]').fill('<script>alert(1)</script>');
  const srcdoc=await page.locator('#web-preview').getAttribute('srcdoc');
  assert(srcdoc.includes('&lt;script&gt;'));
  assert(srcdoc.includes('background:#002451'));
  assert(srcdoc.includes('colora-lettermark.png'),'Website export should use real COLORA logo');
  const html=page.waitForEvent('download');await page.locator('#web-form button[type="submit"]').click();
  assert.equal((await html).suggestedFilename(),'colora-landing-page.html');
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
  assert(await page.locator('#sidebar').evaluate(x=>x.classList.contains('open')));
  assert(await page.locator('#mobile-shade').isVisible());
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
  console.log('PASS: Staff UI desktop/mobile, library, signatures, HTML export and 4 embedded modules');
}finally{await browser.close();await new Promise(done=>server.close(done));}
