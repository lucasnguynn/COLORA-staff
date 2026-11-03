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
  assert.equal(await page.locator('.feature-card').count(),7,'Staff dashboard should include Operations and Email Templates but not Senior JD');
  assert.equal(await page.locator('[data-view="jd"]').count(),0,'Staff role must not show JD links');
  assert.equal(await page.locator('#bundled-jd').count(),0,'No decrypted JD source may be bundled in Staff content');
  assert.equal(await page.locator('[data-view="web"]').count(),0,'Website Generator links must be removed');
  assert.equal(await page.locator('#web-tool,#web-form,#web-preview').count(),0,'Website Generator DOM must be removed');
  assert.equal(await page.locator('.hero-art,.hero-facet,.hero-symbol').count(),0,'Decorative diagonal hero illustration must be removed');
  assert.equal(await page.locator('.hero-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns==='none'),true,'Homepage hero must not reserve empty illustration column');
  // Operations Playbook: staff choose their own comparison rows and keep SOPs practical.
  await page.locator('.nav-btn[data-view="operations"]').click();
  await page.locator('#operations').waitFor({state:'visible'});
  assert.equal(await page.locator('#operations .ops-card').count(),13,'Keep all 13 practical procedures');
  assert((await page.locator('#operations .ops-important').innerText()).includes('phê duyệt'),'Draft approval status remains clear');
  assert.equal(await page.locator('#operations .ops-score-table').count(),0,'Remove evaluation scorecards entirely');
  assert.equal(await page.locator('#operations .ops-mini-grid').count(),0,'Remove scoring formulas and hard gates');
  await page.locator('#operations-search').fill('đàm phán');
  assert(await page.locator('#operations .ops-card').count()>=1,'Negotiation procedure remains searchable');
  await page.locator('#operations-search').fill('');
  await page.locator('#operations [data-ops-filter="Mua hàng"]').click();
  assert(await page.locator('#operations .ops-card').count()>=5,'Buying-related tasks must stay accessible');
  await page.locator('#operations [data-ops-filter="all"]').click();
  await page.locator('#operations [data-ops-open="budget-overrun"]').click();
  assert((await page.locator('#operations .ops-detail h2').innerText()).includes('ngân sách'));
  assert.equal(await page.locator('#operations .ops-steps li').count(),5,'Budget steps simplified');
  assert((await page.locator('#operations .ops-risk').innerText()).includes('chia nhỏ'),'Keep important anti-fraud warning');
  await page.locator('#operations [data-ops-back]').first().click();
  await page.locator('#operations [data-ops-download]').waitFor({state:'visible'});
  assert.equal(await page.evaluate(()=>window.COLORA_OPS_PLAYBOOK?.templateColumns),7,'Blank grid: one employee-defined item, five suppliers, notes');
  const dlPromise=page.waitForEvent('download');
  await page.locator('#operations [data-ops-download]').click();
  const dl=await dlPromise;
  assert(dl.suggestedFilename().includes('So_sanh_5_nha_cung_cap_MAU_TRONG'),'Blank comparison CSV download');
  const csv=fs.readFileSync(await dl.path(),'utf8');
  assert(csv.includes('Nội dung tự chọn')&&csv.includes('Nhà cung cấp 5'),'All five suppliers and flexible row labels are present');
  assert(!/SUMPRODUCT|Trọng số|Weighted score|Hard gates|Chất lượng \/ phù hợp spec/.test(csv),'No assigned criteria or scoring formulas');
  const trackerPromise=page.waitForEvent('download');
  await page.locator('#operations [data-ops-tracker]').click();
  const tracker=await trackerPromise;
  assert(tracker.suggestedFilename().includes('Theo_doi_mua_hang_MAU_TRONG'),'Blank follow-up tracker download');
  const trackerCsv=fs.readFileSync(await tracker.path(),'utf8');
  assert(trackerCsv.includes('Hạn xử lý')&&trackerCsv.includes('Việc tiếp theo'),'Simple task tracking fields');
  await page.locator('#operations .ops-collapsible summary').first().click();
  assert(await page.locator('#operations .ops-template-grid').isVisible(),'Optional email templates can expand');
  await page.locator('#operations .ops-collapsible summary').first().click();
  await page.setViewportSize({width:390,height:844});
  const opsWidths=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);
  assert(opsWidths[0]<=opsWidths[1]+2,'Simplified Operations overflows phone: '+opsWidths);
  assert.equal(await page.locator('#operations .ops-card').first().isVisible(),true,'Operations mobile cards remain visible');
  fs.mkdirSync('test-results',{recursive:true});
  await page.screenshot({path:'test-results/operations-mobile.png',fullPage:true});
  await page.setViewportSize({width:1440,height:900});
  await page.screenshot({path:'test-results/operations-desktop.png',fullPage:true});
  await page.locator('.nav-btn[data-view="home"]').click();
  const logo=page.locator('.brand-logo');
  assert.equal(await logo.isVisible(),true,'Official COLORA logo should be visible');
  assert.equal(await logo.evaluate(el=>el.complete&&el.naturalWidth>0),true,'Official COLORA logo must load correctly');
  assert.equal(await page.locator('.sidebar').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(0, 36, 81)','Sidebar must use COLORA deep navy');
  // Search all educational sources without opening multiple sections.
  await page.locator('#quick-library').click();
  await page.locator('#quick-search-overlay').waitFor({state:'visible'});
  assert.equal(await page.locator('.quick-search-answer').count(),6);
  await page.locator('#quick-search-input').fill('da long');
  assert(await page.locator('.quick-search-answer').count()>0,'Accent-insensitive search failed');
  assert((await page.locator('.quick-search-answer').first().innerText()).includes('Đá lỏng'));
  assert.equal(await page.locator('[data-quick-filter="all"]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-quick-filter="urgent"]').click();
  assert.equal(await page.locator('.quick-search-doc').count(),0,'Urgent filter must hide general learning references');
  assert(await page.locator('.quick-search-answer.is-urgent').count()>0,'Urgent filter must retain safe next steps');
  await page.locator('[data-quick-filter="all"]').click();
  await page.locator('.quick-search-answer').first().locator('summary').click();
  assert.equal(await page.locator('[data-copy-answer="help-01"]').count(),1);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#quick-search-overlay').isVisible(),false);
  await page.keyboard.press('Control+k');
  assert.equal(await page.locator('#quick-search-overlay').isVisible(),true);
  await page.locator('#quick-search-input').fill('peridot');
  assert(await page.locator('.quick-search-doc').count()>0);
  assert(await page.locator('[data-quick-route="learning/portfolio"]').count()>0);
  await page.locator('[data-quick-route="learning/portfolio"]').first().click();
  await page.frameLocator('#module-frame').locator('.gem-learning-profile').first().waitFor({state:'visible',timeout:12000});
  assert.equal(await page.frameLocator('#module-frame').locator('.gem-learning-profile').count(),9);
  await page.locator('.workspace-subnav-btn[data-subroute="gem-value"]').click();
  const rubric=page.frameLocator('#module-frame');
  await rubric.locator('#gem-value-page').waitFor({state:'visible',timeout:12000});
  assert.equal(await rubric.locator('.gem-value-tiers article').count(),3,'Gem color tiers must show three comparative bands');
  await rubric.locator('#gem-value-select').selectOption('topaz');
  assert((await rubric.locator('#gem-value-profile').innerText()).includes('Imperial'),'Topaz must explain Imperial premium and treated blue');
  assert.equal(await rubric.locator('[data-gem-score]').count(),9,'Nine weighted rubric criteria required');
  const scoreInputs=rubric.locator('[data-gem-score]');
  for(let i=0;i<9;i++)await scoreInputs.nth(i).selectOption('5');
  assert.equal(await rubric.locator('#gem-value-score').innerText(),'100 / 100');
  assert((await rubric.locator('#gem-value-decision').innerText()).includes('CHỜ XÁC MINH'),'High score cannot bypass evidence gates');
  const gates=rubric.locator('[data-gem-gate]');
  for(let i=0;i<3;i++)await gates.nth(i).check();
  assert((await rubric.locator('#gem-value-decision').innerText()).includes('QC'),'Even checked gates should defer to QC');
  await rubric.locator('#gem-value-reset').click();
  assert.equal(await rubric.locator('#gem-value-score').innerText(),'- / 100','Reset must not retain assessment');
  await page.setViewportSize({width:390,height:844});
  const gemMobile=await rubric.locator('#gem-value-page').evaluate(el=>({width:el.scrollWidth,client:el.clientWidth}));
  assert(gemMobile.width<=gemMobile.client+1,'Gem guide must not overflow phone: '+JSON.stringify(gemMobile));
  await page.setViewportSize({width:1440,height:900});
  await page.locator('#quick-library').click();
  await page.locator('#quick-search-input').fill('ruby');
  assert(await page.locator('[data-quick-route="client-care/stone/ruby"]').count()>0);
  await page.locator('[data-quick-route="client-care/stone/ruby"]').first().click();
  await page.frameLocator('#module-frame').locator('.detail-hero h1').waitFor({state:'visible',timeout:12000});
  assert.equal(await page.frameLocator('#module-frame').locator('.detail-hero h1').innerText(),'Ruby');
  // Mobile header, cards and navigation remain usable without icon-only buttons.
  await page.setViewportSize({width:390,height:844});
  await page.locator('#dashboard').evaluate(()=>{location.hash='home'});
  await page.locator('#dashboard').waitFor({state:'visible'});
  assert.equal((await page.locator('#mobile-menu').innerText()).trim(),'Menu','Mobile menu needs a readable text label');
  assert.equal(await page.locator('.nav-symbol').first().isVisible(),false,'Mobile sidebar decorative glyph must be hidden');
  assert.equal(await page.locator('.card-mark').first().isVisible(),false,'Mobile card decorative glyph must be hidden');
  assert.equal(await page.locator('#quick-library svg').isVisible(),false,'Mobile search icon must be hidden');
  assert.equal(await page.locator('#quick-library').isVisible(),true,'Text search control must remain usable');
  assert.equal(await page.locator('#switch-account').isVisible(),true,'Text account-switch control must remain usable');
  await page.locator('#mobile-menu').click();
  assert((await page.locator('#sidebar').getAttribute('class')).includes('open'),'Text menu must open the sidebar');
  await page.locator('#mobile-shade').click({position:{x:300,y:70}});
  assert(!(await page.locator('#sidebar').getAttribute('class')).includes('open'),'Backdrop must close the mobile sidebar');
  const mobileTop=await page.locator('.topbar').evaluate(el=>({scroll:el.scrollWidth,client:el.clientWidth}));
  assert(mobileTop.scroll<=mobileTop.client+1,'Mobile header must not overflow: '+JSON.stringify(mobileTop));
  await page.setViewportSize({width:1440,height:900});
  await page.setViewportSize({width:390,height:844});
  await page.locator('#quick-library').click();
  const rapidLayout=await page.locator('#quick-search-overlay').evaluate(el=>({
    width:el.scrollWidth,screen:innerWidth,panel:el.querySelector('.quick-search-panel').scrollWidth
  }));
  assert(rapidLayout.width<=rapidLayout.screen+1,'Search overflows phone: '+JSON.stringify(rapidLayout));
  await page.keyboard.press('Escape');
  await page.setViewportSize({width:1440,height:900});
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
  // New copy-only email templates: normal Staff must never see the
  // Senior onboarding cards, and mobile must have no horizontal overflow.
  await page.locator('.nav-btn[data-view="email-templates"]').click();
  await page.locator('#email-templates:not([hidden])').waitFor({state:'visible'});
  assert.equal(await page.locator('.email-template-option').count(),7);
  assert.equal(await page.locator('[data-template-filter="people"]').isVisible(),false);
  assert((await page.locator('#email-template-body').inputValue()).includes('COLORA'));
  await page.locator('#email-template-search').fill('bàn giao');
  assert.equal(await page.locator('.email-template-option').count(),1);
  await page.locator('#email-template-search').fill('');
  await page.locator('[data-template-filter="internal"]').click();
  assert.equal(await page.locator('.email-template-option').count(),3);
  await page.locator('[data-template-filter="all"]').click();
  await page.locator('#email-template-body').fill('Bản nháp thử nghiệm, không gửi');
  await page.locator('#email-template-reset').click();
  assert.notEqual(await page.locator('#email-template-body').inputValue(),'Bản nháp thử nghiệm, không gửi');
  await page.setViewportSize({width:390,height:844});
  await page.locator('#email-templates:not([hidden])').waitFor({state:'visible'});
  const templateMobile=await page.evaluate(()=>({
    scroll:document.documentElement.scrollWidth,screen:innerWidth,
    layout:getComputedStyle(document.querySelector('.email-template-grid')).gridTemplateColumns
  }));
  assert(templateMobile.scroll<=templateMobile.screen+1,
    'Email Templates mobile page must not overflow: '+JSON.stringify(templateMobile));
  await page.setViewportSize({width:1440,height:900});
  await page.locator('[data-view="signature"].nav-btn').click();
  await page.locator('#signature-form [name="name"]').fill('Minh An');
  await page.locator('#signature-form [name="role"]').fill('Client Advisor');
  await page.locator('#signature-form [name="email"]').fill('example@colora.vn');
  await page.locator('#signature-form [name="phone"]').fill('+84912345678');
  assert((await page.locator('#signature-preview').innerText()).includes('Minh An'));
  assert.equal(await page.locator('#signature-preview img[alt="COLORA"]').count(),1,'Signature must use official COLORA logo');
  const signatureRows=page.locator('#signature-preview > table > tbody > tr');
  assert.equal(await signatureRows.count(),3,'Signature needs brand header, employee details and final legal/environmental footer');
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
  assert.equal(await detailRows.count(),5,'Name, role/company, T, E and W must be five rows');
  assert((await detailRows.nth(1).innerText()).includes('Client Advisor | COLORA JEWELRY CO., LTD'),'Role must include company name');
  assert.equal((await detailRows.nth(2).locator('td').first().innerText()),'T');
  assert.equal((await detailRows.nth(3).locator('td').first().innerText()),'E');
  assert.equal((await detailRows.nth(4).locator('td').first().innerText()),'W');
  assert((await signatureRows.nth(1).innerText()).includes('Minh An'));
  assert.equal(await signatureRows.nth(1).locator('td').first().evaluate(el=>getComputedStyle(el).borderLeftWidth),'3px','Gold line must begin at employee name');
  assert.equal(await signatureRows.nth(1).locator('td').first().evaluate(el=>getComputedStyle(el).borderLeftColor),'rgb(176, 138, 91)','Gold line must use COLORA gold');
  const emailNode=signatureRows.nth(1).locator('a[href="mailto:example%40colora.vn"]');
  const phoneNode=signatureRows.nth(1).locator('a[href^="tel:"]');
  assert.equal(await emailNode.count(),1);
  assert.equal(await phoneNode.count(),1);
  assert.equal(decodeURIComponent(await phoneNode.getAttribute('href')),'tel:+84912345678');
  const footer=signatureRows.nth(2);
  const legalBlocks=footer.locator('p');
  assert.equal(await legalBlocks.count(),2,'Legal and environmental text must be separate paragraphs');
  const environmentText='Please consider your environmental responsibilities before printing emails and documents.';
  const disclaimerText='This email and any attachments may contain confidential or privileged information and are intended solely for the named recipient(s). If you have received this email in error, please notify the sender and delete it. You should not copy, distribute, disclose, or act on the contents of this email without authorization.';
  assert.equal(await legalBlocks.nth(0).innerText(),environmentText);
  assert.equal(await legalBlocks.nth(0).locator('strong').innerText(),environmentText);
  assert.equal(await legalBlocks.nth(1).locator('strong').innerText(),'(!) Disclaimer:');
  assert.equal(await legalBlocks.nth(1).locator('em').innerText(),disclaimerText);
  assert((await page.locator('#signature-preview').innerText()).endsWith(disclaimerText));
  assert.equal(await legalBlocks.nth(0).evaluate(el=>getComputedStyle(el).fontSize),'10px');
  assert.equal(await legalBlocks.nth(1).evaluate(el=>getComputedStyle(el).fontSize),'10px');
  const signature=page.waitForEvent('download');
  await page.locator('#signature-download').click();
  const downloadedSignature=await signature;
  assert.equal(downloadedSignature.suggestedFilename(),'colora-email-signature.html');
  const exportedHTML=fs.readFileSync(await downloadedSignature.path(),'utf8');
  assert(exportedHTML.includes('padding:5px 0 18px 0'));
  assert(exportedHTML.includes('mso-line-height-rule:exactly'));
  assert(exportedHTML.includes('<strong style="font-weight:700;"><em style="font-style:italic;">Kính thư / Best regards,</em></strong>'));
  assert(exportedHTML.includes('border-top:1px solid #B08A5B'));
  assert(exportedHTML.includes('padding:1px 0 0 5px'));
  assert(exportedHTML.includes('COLORA JEWELRY CO., LTD'));
  assert(exportedHTML.includes('<strong style="font-weight:700;">'+environmentText+'</strong>'));
  assert(exportedHTML.includes('<strong style="font-weight:700;">(!) Disclaimer:</strong> <em style="font-style:italic;">'+disclaimerText+'</em>'));
  assert(exportedHTML.indexOf(environmentText)>exportedHTML.indexOf('colora.vn</a>'));
  assert(exportedHTML.indexOf(disclaimerText)>exportedHTML.indexOf(environmentText));
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
  await page.waitForFunction(()=>document.getElementById('mail-guide-current-app')?.textContent==='Apple Mail');
  assert.equal(await page.locator('#mail-guide-steps .mail-guide-step').count(),6);
  assert((await page.locator('#mail-guide-steps').innerText()).includes('Other Mail Account'),'Apple Mail provider choice is missing');
  await page.locator('[data-mail-zoom="3"]').click();
  assert.equal(await page.locator('#mail-guide-dialog').evaluate(el=>el.open),true,'Detailed illustration must be zoomable');
  assert((await page.locator('.mail-guide-modal-art').innerHTML()).includes('svg'));
  await page.locator('#mail-guide-dialog-close').click();
  assert.equal(await page.locator('#mail-guide-dialog').evaluate(el=>el.open),false);
  await page.locator('[data-mail-platform="outlook"]').click();
  assert.equal(new URL(page.url()).hash,'#mail-setup/outlook');
  await page.waitForFunction(()=>document.getElementById('mail-guide-current-app')?.textContent==='Microsoft Outlook');
  assert((await page.locator('#mail-guide-steps').innerText()).includes('Microsoft 365/Exchange'));
  // Existing signature page retains a direct contextual link to setup guide.
  await page.locator('.nav-btn[data-view="signature"]').click();
  await page.locator('.mail-guide-inline-link').click();
  await page.locator('#mail-guide').waitFor({state:'visible'});
  assert.equal(await page.locator('#mail-guide').isVisible(),true);
  // The new illustrated Brand & Packaging field guide is a native Staff
  // section, not a standalone login or an external embedded app.
  await page.locator('.nav-btn[data-view="brand-guide"]').click();
  await page.locator('#brand-guide').waitFor({state:'visible'});
  assert.equal(await page.locator('#brand-guide .identity-swatch').count(),7);
  assert.equal(await page.locator('#brand-guide .identity-package-card').count(),4);
  assert((await page.locator('#brand-guide').innerText()).includes('Túi giấy Ivory'));
  // Removed routes should safely resolve to dashboard; no orphaned generator.
  await page.evaluate(()=>location.hash='#web');
  await page.locator('#dashboard').waitFor({state:'visible'});
  assert.equal(await page.locator('#path-label').innerText(),'Staff Workspace');
    for(const [view,selector] of [['learning','#app'],['client-care','#main-content'],['qr','#downloadPng']]){
    await page.locator('.nav-btn[data-view="'+view+'"]').click();
    const embedded=page.frameLocator('#module-frame');
    try{await embedded.locator(selector).waitFor({timeout:12000});}
    catch(error){
      console.error('MODULE DEBUG',view,await page.locator('#module-frame').evaluate(e=>({src:e.getAttribute('src'),srcdoc:e.hasAttribute('srcdoc'),href:e.contentWindow?.location?.href,body:e.contentDocument?.body?.innerText?.slice(0,250)})).catch(e=>String(e)));
      throw error;
    }
    if(view==='qr'){
      await embedded.locator('#qrPreview canvas, #qrPreview svg').first().waitFor({state:'attached',timeout:16000});
      await embedded.locator('#qrPreview svg image').first().waitFor({state:'attached',timeout:16000});
      assert((await embedded.locator('#logoThumb').getAttribute('src'))?.startsWith('data:image/png;base64,'),'COLORA default mark absent from QR preview');
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
  // Staff deep links must never elevate privileges.
  await page.evaluate(()=>location.hash='#jd');
  await page.locator('#dashboard').waitFor({state:'visible'});
  assert.equal(await page.locator('#bundled-jd').count(),0,'Staff deep-link may not expose JD payload');

  // The Senior shell is a second plaintext staging artifact only in local
  // CI; production distributes it as a separate encrypted gateway payload.
  // Cold deep-link should initialize the JD integration before routing.
  // The plaintext Senior page exists ONLY in local CI staging. The real
  // encrypted login adds a validated opaque account scope before this page
  // runs; reproduce that context here without weakening production checks.
  await page.addInitScript(()=>{
    if(location.pathname.startsWith('/senior/'))
      Object.defineProperty(window,'COLORA_ACCOUNT_SCOPE',{
        value:'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        writable:false,configurable:false
      });
  });
  await page.goto('http://127.0.0.1:'+server.address().port+'/senior/index.html#jd');
  await page.locator('#module[data-active-module="jd"]').waitFor({state:'visible',timeout:15000});
  assert.equal(await page.locator('.feature-card').count(),8,'Senior workspace should show Operations, Email Templates and JD card');
  assert.equal(await page.locator('body').getAttribute('data-staff-role'),'senior');
  await page.locator('#jd-workspace-controls').waitFor({state:'visible',timeout:15000});
  await page.frameLocator('#module-frame').locator('#editorPanel').waitFor({state:'visible',timeout:15000});
  assert.equal(await page.locator('#module-frame').getAttribute('data-jd-loaded'),'true','Direct #jd must initialize bridge before app route');
  await page.locator('.nav-btn[data-view="home"]').click();
  await page.locator('#dashboard').waitFor({state:'visible'});
  await page.locator('.nav-btn[data-view="jd"]').click();
  await page.frameLocator('#module-frame').locator('#editorPanel').waitFor({state:'visible',timeout:15000});
  await page.locator('#jd-workspace-controls').waitFor({state:'visible'});
  const jdFrame=page.frameLocator('#module-frame');
  assert.equal(await jdFrame.locator('.app-shell > .sidebar').isVisible(),false,'JD must not duplicate Staff sidebar');
  assert.equal(await jdFrame.locator('.workspace > .topbar').isVisible(),false,'JD must not duplicate Staff topbar');
  assert.equal(await jdFrame.locator('.workspace > .toolbar').isVisible(),false,'JD must not duplicate Staff mode switch');
  assert.equal(await page.locator('#module-open').isVisible(),false,'No secondary JD website link');
  const originalJDs=await page.locator('#jd-role-select option').count();
  assert(originalJDs>0,'Native JD dropdown must show saved roles');
  await page.locator('#jd-create').click();
  await page.waitForFunction(n=>document.getElementById('jd-role-select')?.options.length===n+1,originalJDs,{timeout:8000});
  await page.locator('[data-jd-mode="preview"]').click();
  await page.waitForFunction(()=>document.getElementById('module-frame')?.contentDocument?.body.classList.contains('preview-only'));
  assert.equal(await jdFrame.locator('#previewPanel').isVisible(),true,'Native preview must show JD print sheet');
  await page.locator('[data-jd-mode="edit"]').click();
  await jdFrame.locator('#editorPanel').waitFor({state:'visible'});
  const jdHeights=await page.locator('#module-frame').evaluate(el=>({frame:el.getBoundingClientRect().height,scroll:el.contentDocument.documentElement.scrollHeight}));
  assert(jdHeights.frame+50>=jdHeights.scroll,'JD must expand to one scrollable Staff page, no nested website viewport: '+JSON.stringify(jdHeights));
  // Brand settings remain backed by the original JD app, not a parallel
  // localStorage schema created by the Staff wrapper.
  await page.locator('.jd-workspace-more summary').click();
  await page.locator('#jd-settings').click();
  await jdFrame.locator('#settingsModal').waitFor({state:'visible'});
  await jdFrame.locator('#closeSettingsBtn').click();
  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(350);
  const jdMobile=await page.evaluate(()=>({
    width:document.documentElement.scrollWidth,
    viewport:window.innerWidth,
    columns:getComputedStyle(document.querySelector('#jd-workspace-controls .jd-position-field')).gridTemplateColumns
  }));
  assert(jdMobile.width<=jdMobile.viewport+2,'JD controls must not overflow mobile width: '+JSON.stringify(jdMobile));
  assert.equal(await jdFrame.locator('.app-shell > .sidebar').isVisible(),false,'JD duplicate sidebar must remain hidden on mobile');
  await page.setViewportSize({width:1440,height:900});
  // Regression: escaped backslash-n written into <head> is parsed as visible
  // text before the JD interface, producing an ugly seam in Senior Workspace.
  const jdEscapedText=await page.frameLocator('#module-frame').locator('body').evaluate(el=>
    [...el.childNodes].filter(n=>n.nodeType===3).some(n=>n.textContent.includes('\\n')));
  assert.equal(jdEscapedText,false,'JD frame must not render a literal backslash-n before content');
  const seniorShellEscapedText=await page.locator('body').evaluate(el=>
    [...el.childNodes].filter(n=>n.nodeType===3).some(n=>n.textContent.includes('\\n')));
  assert.equal(seniorShellEscapedText,false,'Senior shell must not contain a visible literal backslash-n');
  assert.equal(await page.frameLocator('#module-frame').locator('#staticrypt-password').count(),0,'Senior must not see a second JD password prompt');
  assert.equal(await page.locator('#module-open').isVisible(),false,'Senior JD should be integrated instead of opening another login');
  assert.equal(await page.locator('#module-expand').isVisible(),false,'Integrated JD has no nested fullscreen mode');
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
  // Simulate mixed CDN caches: the Staff router executes before the JD
  // bridge even though the intended HTML order is now corrected. A Senior
  // bookmarked #jd must still recover and never remain a blank section.
  const lateBridge=await browser.newPage({viewport:{width:1280,height:800}});
  await lateBridge.addInitScript(()=>{
    if(location.pathname.startsWith('/senior/'))
      Object.defineProperty(window,'COLORA_ACCOUNT_SCOPE',{
        value:'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        writable:false,configurable:false
      });
  });
  await lateBridge.route('**/senior/index.html',async route=>{
    const response=await route.fetch();
    const html=await response.text();
    const bridgeTag=html.match(/<script src="\.\.\/jd-workspace\.js\?v=[^"]+" defer><\/script>/)?.[0];
    const appTag=html.match(/<script src="\.\.\/app\.js\?v=[^"]+" defer><\/script>/)?.[0];
    assert(bridgeTag&&appTag,'Mixed-cache test requires versioned scripts');
    const reversed=html.replace(bridgeTag,'').replace(appTag,appTag+'\n'+bridgeTag);
    await route.fulfill({response,body:reversed});
  });
  await lateBridge.goto('http://127.0.0.1:'+server.address().port+'/senior/index.html#jd');
  await lateBridge.locator('#jd-workspace-controls').waitFor({state:'visible',timeout:12000});
  await lateBridge.locator('#module-frame[data-jd-loaded="true"]').waitFor({state:'attached',timeout:12000});
  await lateBridge.frameLocator('#module-frame').locator('#editorPanel').waitFor({state:'visible',timeout:12000});
  await lateBridge.close();
  assert.deepEqual(errors,[]);
  console.log('PASS: Staff UI desktop/mobile, library, signatures, HTML export and 4 embedded modules and mailbox setup walkthrough');
}finally{await browser.close();await new Promise(done=>server.close(done));}
