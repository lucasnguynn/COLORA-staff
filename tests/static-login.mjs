import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import jsQR from 'jsqr';
import {PNG} from 'pngjs';

const root=path.resolve('account-release/public');
const users=JSON.parse(process.env.COLORA_ACCOUNT_CREDENTIALS_JSON||'null');
if(!Array.isArray(users)||users.length!==5)throw Error('Missing disposable five-account test roster');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 const clean=new URL(req.url,'http://127.0.0.1').pathname;
 const resolved=path.resolve(root,'.'+clean);
 if(!resolved.startsWith(root+path.sep)&&resolved!==root){res.writeHead(403).end();return}
 const target=resolved===root?path.join(root,'index.html'):resolved;
 fs.readFile(target,(error,bytes)=>{
  if(error){res.writeHead(404).end('Not Found');return;}
  res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end(bytes);
 });
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});
try{
 for(const role of ['staff','senior']){
  const user=users.find(u=>u.role===role);
  const context=await browser.newContext(),page=await context.newPage();
  page.on('pageerror',err=>console.error('Nested browser error:',String(err.message||'Unknown').slice(0,180).replace(/[a-z0-9._%+-]+@colora\.vn/gi,'[redacted]')));
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  // The logo and slogan share the true horizontal center of the page
  // on desktop and mobile, and the obsolete BKNS text is absent.
  for(const width of [1280,390]){
    await page.setViewportSize({width,height:850});
    const brandLayout=await page.evaluate(()=>{
      const image=document.querySelector('.brand img').getBoundingClientRect();
      const slogan=document.querySelector('.brand span').getBoundingClientRect();
      return {viewWidth:innerWidth,imgCenter:image.left+image.width/2,
        sloganCenter:slogan.left+slogan.width/2,
        horizontalOverflow:document.documentElement.scrollWidth>innerWidth+1,
        obsoleteText:document.body.textContent.includes('Không sử dụng mật khẩu hộp thư BKNS.')};
    });
    assert(Math.abs(brandLayout.imgCenter-brandLayout.viewWidth/2)<=2,'COLORA logo not horizontally centered: '+JSON.stringify(brandLayout));
    assert(Math.abs(brandLayout.sloganCenter-brandLayout.viewWidth/2)<=2,'COLORA slogan not horizontally centered: '+JSON.stringify(brandLayout));
    assert(!brandLayout.horizontalOverflow,'Login page overflows screen at '+width);
    assert(!brandLayout.obsoleteText,'Obsolete BKNS sentence must not appear');
  }
  await page.setViewportSize({width:1280,height:850});
  assert.equal(await page.locator('#remember-device').isChecked(),false,'Remember me must be opt-in');
  await page.locator('#staff-email').fill(user.email);
  await page.locator('#staff-password').fill(user.password);
  await page.locator('#remember-device').check();
  await page.locator('#signin-submit').click();
  await page.locator('#workspace:not([hidden])').waitFor({state:'visible',timeout:60000});
  const wrapper=page.frameLocator('#workspace-frame');
  await wrapper.locator('body[data-staff-role="'+role+'"][data-staff-ready="true"]').waitFor({state:'attached',timeout:20000});
  const jd=await wrapper.locator('[data-view="jd"]').count();
  assert.equal(jd>0,role==='senior','Staff role must never see JD navigation');
  // Verify the visual field guide survives encrypted Staff/Senior login,
  // shows official vectors from Drive, and distinguishes current/planned packs.
  await wrapper.locator('.nav-btn[data-view="brand-guide"]').click();
  await wrapper.locator('#brand-guide:not([hidden])').waitFor({state:'visible',timeout:12000});
  const guide=wrapper.locator('#brand-guide');
  assert.equal(await guide.locator('.identity-swatch').count(),7,'Brand palette must show all seven official colors');
  assert.equal(await guide.locator('.identity-package-card').count(),4,'Only four confirmed current packaging types');
  assert.equal(await guide.locator('.identity-planned-grid > div').count(),6,'Planned packaging must be separate');
  assert((await guide.innerText()).includes('Túi giấy Ivory'),'Current shopping bag must remain Ivory');
  assert((await guide.innerText()).includes('Dự kiến / đang đánh giá'),'Planned pack status label absent');
  for(const asset of ['facet-symbol.svg','facet-pattern.svg']){
    const displayed=await guide.locator('img[src*="'+asset+'"]').first().evaluate(async image=>{
      await image.decode();return {width:image.naturalWidth,height:image.naturalHeight};
    });
    assert(displayed.width>0&&displayed.height>0,'Official brand vector did not load: '+asset);
  }
  const widthStatus=await guide.evaluate(el=>({
    contentWidth:el.scrollWidth,containerWidth:el.clientWidth
  }));
  assert(widthStatus.contentWidth<=widthStatus.containerWidth+2,'Brand guide overflows its workspace container');
  await guide.locator('button[data-brand-target="identity-packaging"]').click();
  await wrapper.locator('#brand-guide:not([hidden])').waitFor({state:'visible'});
  assert.equal(await wrapper.locator('#identity-packaging').isVisible(),true,'Brand Guide deep link must remain in the guide');

  // Verify all three nested applications INSIDE the real AES-GCM
  // email/password login. Previously CI checked only the JD Library, so
  // about:srcdoc origin errors and Blob CSP violations reached production.
  for(const [view,selector] of [
   ['learning','#app .content'],
   ['client-care','#main-content'],
   ['qr','#downloadPng']
  ]){
    await wrapper.locator('.nav-btn[data-view="'+view+'"]').click();
    const app=wrapper.frameLocator('#module-frame');
    try{
      await app.locator(selector).waitFor({state:'visible',timeout:18000});
      await wrapper.locator('#module-status').waitFor({state:'hidden',timeout:15000});
      const frameURL=await wrapper.locator('#module-frame').getAttribute('src');
      assert(frameURL?.startsWith('blob:'),'Encrypted '+role+' '+view+' should open a Blob app');
      assert.equal(await app.locator('html').getAttribute('data-colora-embed'),view,'Incorrect '+view+' integration markup');
      if(view==='learning'){
        await app.locator('#app .content').waitFor({state:'visible'});
        await wrapper.locator('.workspace-subnav-btn[data-subroute="learn"]').waitFor({state:'visible'});
        await wrapper.locator('.workspace-subnav-btn[data-subroute="review"]').click();
        await wrapper.locator('.workspace-subnav-btn[data-subroute="learn"]').click();
      } else if(view==='client-care'){
        await wrapper.locator('.workspace-subnav-btn[data-subroute="scripts"]').waitFor({state:'visible'});
        await wrapper.locator('.workspace-subnav-btn[data-subroute="scripts"]').click();
        await app.locator('#main-content').getByText(/kịch bản/i).first().waitFor({state:'visible',timeout:12000});
      } else {
        await app.locator('#qrPreview canvas, #qrPreview svg').first().waitFor({state:'attached',timeout:20000});
        // A technically rendered QR is not enough: the default brand symbol
        // must be visible in the preview and included by the SVG renderer.
        try {
          await app.locator('#qrPreview svg image').first().waitFor({state:'attached',timeout:16000});
        } catch (error) {
          // No customer data here: inspect only QR rendering structure/assets.
          const diag=await app.locator('#qrPreview').evaluate(el=>({
            qrTags:[...el.children].map(n=>n.tagName), imageCount:el.querySelectorAll('image').length,
            thumbnail:document.querySelector('#logoThumb')?.getAttribute('src')?.slice(0,55),
            thumbWidth:document.querySelector('#logoThumb')?.naturalWidth,
            logoStatus:document.querySelector('#logoName')?.textContent,
            urlError:document.querySelector('#urlError')?.textContent
          })).catch(()=>({error:'QR preview inaccessible'}));
          console.error('QR SIGNATURE DIAGNOSTIC',role,JSON.stringify(diag));
          throw error;
        }
        const logo=await app.locator('#logoThumb').getAttribute('src');
        assert(logo?.startsWith('data:image/png;base64,'),'COLORA symbol must render as a normalized local PNG');
        const logoPixels=await app.locator('#logoThumb').evaluate(async el=>{
          await el.decode();
          const c=document.createElement('canvas');c.width=el.naturalWidth;c.height=el.naturalHeight;
          const ctx=c.getContext('2d');ctx.drawImage(el,0,0);
          const cornerAlpha=ctx.getImageData(0,0,1,1).data[3];
          const centerAlpha=ctx.getImageData(c.width/2|0,c.height/2|0,1,1).data[3];
          return {width:c.width,height:c.height,cornerAlpha,centerAlpha};
        });
        assert.deepEqual([logoPixels.width,logoPixels.height],[512,512],'Keep normalized transparent canvas size');
        assert.equal(logoPixels.cornerAlpha,0,'Default COLORA symbol must not contain an opaque square tile');
        assert(await app.locator('#qrPreview svg [data-colora-signature="clearance"]').count()>0,
          'QR preview must have the subtle oval symbol clearance');
        assert.equal(await app.locator('#qrPreview svg [data-colora-signature="back"]').count(),0,
          'QR preview must not have the previous square center badge');
        if(role==='staff'){
          // Changing the QR foreground must also tint the official default
          // COLORA symbol. Check real rendered PNG pixels, not just UI labels.
          const paletteColors=['#002451','#8E2F2A','#0F6857','#4A2E23'];
          for(const [index,expected] of paletteColors.entries()){
            await app.locator('.palette-btn').nth(index).click();
            const sample=await app.locator('#logoThumb').evaluate(async el=>{
              await el.decode();
              const c=document.createElement('canvas');
              c.width=el.naturalWidth;c.height=el.naturalHeight;
              const ctx=c.getContext('2d');
              ctx.drawImage(el,0,0);
              const p=ctx.getImageData(0,0,c.width,c.height).data;
              let rgb=null,visible=0;
              for(let j=0;j<p.length;j+=4){
                if(p[j+3]===255){
                  visible++;
                  if(rgb===null)rgb=[p[j],p[j+1],p[j+2]];
                }
              }
              return {rgb,visible,corner:p[3]};
            });
            const rgb=expected.slice(1).match(/../g).map(n=>parseInt(n,16));
            assert(sample.visible>50,'COLORA logo lost its visible opaque pixels');
            assert.deepEqual(sample.rgb,rgb,'Default COLORA logo must track QR color '+expected);
            assert.equal(sample.corner,0,'Recolored logo must remain transparent outside symbol');
            assert.equal(await app.locator('#fg').inputValue(),expected.toLowerCase(),
              'Palette foreground control out of sync');
          }
          // Also cover a manually selected foreground (not just presets).
          await app.locator('#fg').fill('#314159');
          const manualColor=await app.locator('#logoThumb').evaluate(async el=>{
            await el.decode();
            const c=document.createElement('canvas');c.width=el.naturalWidth;c.height=el.naturalHeight;
            const ctx=c.getContext('2d');ctx.drawImage(el,0,0);
            const p=ctx.getImageData(0,0,c.width,c.height).data;
            for(let j=0;j<p.length;j+=4)if(p[j+3]===255)return [p[j],p[j+1],p[j+2]];
            return null;
          });
          assert.deepEqual(manualColor,[49,65,89],'Manual QR foreground must tint default symbol');
          // Run PNG optical scan and SVG export on a NON-default palette.
          await app.locator('.palette-btn').nth(1).click();
          // A generated image is only useful when a DIFFERENT QR decoder can
          // recover its destination. Scan exported pixels, not the QR library's
          // own logical data, so a too-large central badge fails the release.
          const expectedURL='https://colora.vn/';
          await app.locator('#url').fill(expectedURL);
          await app.locator('#generateBtn').click();
          for(const [button,extension] of [['#downloadPng','png'],['#downloadSvg','svg']]){
            const downloaded=page.waitForEvent('download',{timeout:20000});
            await app.locator(button).click();
            const result=await downloaded;
            assert(result.suggestedFilename().endsWith('.'+extension),'QR export extension mismatch: '+extension);
            const bytes=fs.readFileSync(await result.path());
            if(extension==='png'){
              const png=PNG.sync.read(bytes);
              const decoded=jsQR(new Uint8ClampedArray(png.data),png.width,png.height,
                {inversionAttempts:'attemptBoth'});
              assert.equal(decoded?.data,expectedURL,'Exported COLORA PNG QR must be optically scannable');
            }else{
              const svg=bytes.toString('utf8');
              assert(svg.includes('data-colora-signature="logo"'),
                'SVG export must retain the embedded COLORA signature');
              const embedded=svg.match(/href="data:image\/png;base64,([^"]+)"/);
              assert(embedded,'SVG must embed a self-contained recolored symbol');
              const embeddedPng=PNG.sync.read(Buffer.from(embedded[1],'base64'));
              let symbolColor=null;
              for(let j=0;j<embeddedPng.data.length;j+=4){
                if(embeddedPng.data[j+3]===255){
                  symbolColor=Array.from(embeddedPng.data.slice(j,j+3));break;
                }
              }
              assert.deepEqual(symbolColor,[142,47,42],
                'SVG embedded COLORA symbol must match Burgundy foreground');
              assert(svg.includes('<ellipse')&&svg.includes('data-colora-signature="clearance"'),
                'SVG export must keep the slender oval clearance');
              assert(!svg.includes('data-colora-signature="back"'),
                'SVG export must not reintroduce the former square badge');
            }
            await result.delete().catch(()=>{});
          }
        }
        assert.equal(await app.locator('script[src*="unpkg.com"]').count(),0,'QR must use local vendor library');
      }
    }catch(error){
      // Do not print any user secrets, email addresses or decrypted HTML.
      const diag=await wrapper.locator('#module-frame').evaluate(el=>{
        try{return {frameSrc:el.getAttribute('src')?.startsWith('blob:')?'blob':'other',
          parentURL:el.ownerDocument.defaultView.location.protocol,
          parentOrigin:el.ownerDocument.defaultView.location.origin,
          frameHeight:el.clientHeight,childTitle:el.contentDocument?.title,
          childVisible:!!el.contentDocument?.body?.innerText?.trim(),
          childReady:el.contentDocument?.readyState};}catch{return {error:'could not inspect frame'}}
      }).catch(()=>({error:'frame missing'}));
      console.error('MODULE E2E FAILED',role,view,JSON.stringify(diag));
      throw error;
    }
  }
  if(role==='senior'){
   await wrapper.locator('.nav-btn[data-view="jd"]').click();
   try{await wrapper.frameLocator('#module-frame').locator('#editorPanel').waitFor({state:'visible',timeout:15000})}
   catch(error){
     const diag=await wrapper.locator('#module-frame').evaluate(el=>({
       frameLoaded:el.dataset.jdLoaded||'no',
       frameVisibility:getComputedStyle(el).visibility,
       moduleView:document.getElementById('module')?.dataset.activeModule,
       bridge:!!window.COLORA_JD_WORKSPACE,
       frameSrcdoc:!!el.srcdoc,
       innerBody:!!el.contentDocument?.body,
       innerEditor:!!el.contentDocument?.getElementById('editorPanel'),
       innerState:el.contentDocument?.readyState,
       jsScripts:el.contentDocument?.scripts.length,
       status:document.getElementById('module-status')?.textContent?.slice(0,90)
     }));
     console.error('JD test diagnostics (no passwords or emails):',JSON.stringify(diag));
     throw error;
   }
  }
  // Opt-in remembered sign-in must survive navigation and another tab,
  // without saving account email/password or raw AES key bytes.
  const saved=await page.evaluate(async()=>{
    const db=await new Promise((ok,bad)=>{
      const r=indexedDB.open('colora-staff-device-access-v1',1);
      r.onsuccess=()=>ok(r.result);r.onerror=()=>bad(r.error);
    });
    const record=await new Promise((ok,bad)=>{
      const t=db.transaction('sessions','readonly');
      const r=t.objectStore('sessions').get('remembered-device');
      r.onsuccess=()=>ok(r.result);r.onerror=()=>bad(r.error);
    });
    db.close();
    return {exists:!!record,version:record?.version,expiresAt:record?.expiresAt,
      id:record?.entryId,keyIsCryptoKey:record?.key instanceof CryptoKey,
      extractable:record?.key?.extractable,usages:record?.key?.usages,
      fields:record?Object.keys(record):[]};
  });
  assert(saved.exists&&saved.keyIsCryptoKey,'Device session should store an opaque browser CryptoKey');
  assert.equal(saved.extractable,false,'Persisted AES key must be nonextractable');
  assert.deepEqual(saved.usages,['decrypt']);
  assert(saved.expiresAt>Date.now()+29*86400000,'Remembered session must last about 30 days');
  assert.deepEqual(saved.fields.sort(),['entryId','expiresAt','key','version'].sort(),'Never store plaintext passwords/email or HTML');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#workspace:not([hidden])').waitFor({state:'visible',timeout:20000});
  await page.frameLocator('#workspace-frame').locator('body[data-staff-role="'+role+'"][data-staff-ready="true"]').waitFor({state:'attached',timeout:16000});
  const tab=await context.newPage();
  await tab.goto(base+'/',{waitUntil:'domcontentloaded'});
  await tab.locator('#workspace:not([hidden])').waitFor({state:'visible',timeout:20000});
  await tab.frameLocator('#workspace-frame').locator('body[data-staff-role="'+role+'"]').waitFor({state:'attached',timeout:16000});
  await tab.close();

  await page.locator('#workspace-signout').click();
  await page.locator('#signin-form').waitFor({state:'visible'});
  assert.equal(await page.locator('#workspace').isVisible(),false);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#signin-form').waitFor({state:'visible'});
  assert.equal(await page.locator('#workspace').isVisible(),false,'Manual logout must clear remembered access');
  const persistedAfterLogout=await page.evaluate(async()=>{
    const db=await new Promise((ok,bad)=>{
      const r=indexedDB.open('colora-staff-device-access-v1',1);
      r.onsuccess=()=>ok(r.result);r.onerror=()=>bad(r.error);
    });
    const value=await new Promise((ok,bad)=>{
      const r=db.transaction('sessions','readonly').objectStore('sessions').get('remembered-device');
      r.onsuccess=()=>ok(r.result);r.onerror=()=>bad(r.error);
    });
    db.close();return !!value;
  });
  assert.equal(persistedAfterLogout,false,'Logout must remove persisted device capability');
  await context.close();
 }
 // Account-scoped JD migration must never auto-claim or delete legacy
 // browser drafts. Test TWO Senior accounts in the SAME browser profile.
 {
  const seniors=users.filter(u=>u.role==='senior');
  const context=await browser.newContext({acceptDownloads:true}),page=await context.newPage();
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  const legacyRole=[{
    id:'legacy-saved-jd',title:'Original browser JD backup',
    department:'Operations',reportsTo:'Manager',level:'Junior',location:'',
    employmentType:'',summary:'Training-only synthetic JD, no employee details.',
    responsibilities:[{title:'Primary Ownership',weight:'100%',bullets:['Demonstrate safe migration.']}],
    mustHave:[],niceToHave:[],kpis:[],development:'',whatYouGet:'',
    updatedAt:'2026-11-02T00:00:00.000Z'
  }];
  await page.evaluate(role=>{
    localStorage.setItem('colora_jd_library_v1',JSON.stringify(role));
    localStorage.setItem('colora_jd_settings_v1',JSON.stringify({companyName:'COLORA'}));
  },legacyRole);
  async function enterSenior(user){
    await page.locator('#staff-email').fill(user.email);
    await page.locator('#staff-password').fill(user.password);
    await page.locator('#signin-submit').click();
    await page.locator('#workspace:not([hidden])').waitFor({state:'visible',timeout:60000});
    const frame=page.frameLocator('#workspace-frame');
    await frame.locator('body[data-staff-role="senior"][data-staff-ready="true"]')
      .waitFor({state:'attached',timeout:20000});
    const id=await frame.locator('body').evaluate(()=>window.COLORA_ACCOUNT_SCOPE);
    assert(/^[a-f0-9]{32}$/.test(id),'Senior must receive an opaque scoped browser ID');
    return {frame,id};
  }
  const first=await enterSenior(seniors[0]);
  await first.frame.locator('.nav-btn[data-view="jd"]').click();
  await first.frame.locator('#jd-migration-gate').waitFor({state:'visible',timeout:10000});
  assert.equal(await first.frame.locator('#module-frame').isVisible(),false,
    'Shared drafts cannot be automatically loaded by the first Senior account');
  const backupDownload=page.waitForEvent('download',{timeout:15000});
  await first.frame.locator('[data-jd-transfer-action="backup"]').click();
  const backup=await backupDownload;
  const bytes=fs.readFileSync(await backup.path());
  const backupData=JSON.parse(bytes.toString('utf8'));
  assert.equal(backupData.roles[0].id,'legacy-saved-jd','Legacy backup must include original saved roles');
  await backup.delete().catch(()=>{});
  page.once('dialog',dialog=>dialog.accept());
  await first.frame.locator('[data-jd-transfer-action="import"]').click();
  await first.frame.frameLocator('#module-frame').locator('#editorPanel')
    .waitFor({state:'visible',timeout:15000});
  const oldAndNew=await page.evaluate(id=>({
    old:localStorage.getItem('colora_jd_library_v1'),
    copy:localStorage.getItem('colora_jd_library_v2_'+id)
  }),first.id);
  assert.equal(oldAndNew.old,JSON.stringify(legacyRole),'Migration must not delete original data');
  assert.equal(JSON.parse(oldAndNew.copy)[0].id,'legacy-saved-jd');
  await page.locator('#workspace-signout').click();
  await page.locator('#signin-form').waitFor({state:'visible'});

  const second=await enterSenior(seniors[1]);
  assert.notEqual(second.id,first.id,'Separate Senior accounts require distinct browser libraries');
  await second.frame.locator('.nav-btn[data-view="jd"]').click();
  await second.frame.locator('#jd-migration-gate').waitFor({state:'visible',timeout:10000});
  assert.equal(await page.evaluate(id=>localStorage.getItem('colora_jd_library_v2_'+id),second.id),null,
    'Second Senior must not silently inherit the first Senior drafts');
  page.once('dialog',dialog=>dialog.accept());
  await second.frame.locator('[data-jd-transfer-action="fresh"]').click();
  await second.frame.frameLocator('#module-frame').locator('#editorPanel')
    .waitFor({state:'visible',timeout:15000});
  await page.evaluate(id=>localStorage.setItem('colora_jd_library_v2_'+id,
    JSON.stringify([{id:'second-account-only',title:'Separate draft'}])),second.id);
  const retained=await page.evaluate(id=>({
    first:JSON.parse(localStorage.getItem('colora_jd_library_v2_'+id)),
    legacy:JSON.parse(localStorage.getItem('colora_jd_library_v1'))
  }),first.id);
  assert.equal(retained.first[0].id,'legacy-saved-jd');
  assert.equal(retained.legacy[0].id,'legacy-saved-jd');
  await page.locator('#workspace-signout').click();
  await context.close();
  console.log('PASS: Separate Senior JD browser namespaces; legacy backup and explicit migration preserve originals.');
 }
 // Wrong corporate address with an otherwise valid employee password.
 const u=users[0],context=await browser.newContext(),page=await context.newPage();
 await page.goto(base+'/',{waitUntil:'domcontentloaded'});
 await page.locator('#staff-email').fill('invalid@colora.vn');
 await page.locator('#staff-password').fill(u.password);
 await page.locator('#signin-submit').click();
 await page.locator('#signin-submit:not([disabled])').waitFor({state:'attached',timeout:60000});
 assert.equal(await page.locator('#workspace').isVisible(),false,'Wrong email must not enter');
 await context.close();
 console.log('PASS: Five-account gateway: Staff/Senior tools, 30-day opt-in CryptoKey IndexedDB persistence, same-browser re-open, multi-tab auto-resume, logout revocation and incorrect email.');
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
