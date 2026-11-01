import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
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
  await page.locator('#staff-email').fill(user.email);
  await page.locator('#staff-password').fill(user.password);
  await page.locator('#signin-submit').click();
  await page.locator('#workspace:not([hidden])').waitFor({state:'visible',timeout:60000});
  const wrapper=page.frameLocator('#workspace-frame');
  await wrapper.locator('body[data-staff-role="'+role+'"][data-staff-ready="true"]').waitFor({state:'attached',timeout:20000});
  const jd=await wrapper.locator('[data-view="jd"]').count();
  assert.equal(jd>0,role==='senior','Staff role must never see JD navigation');
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
  await page.locator('#workspace-signout').click();
  await page.locator('#signin-form').waitFor({state:'visible'});
  assert.equal(await page.locator('#workspace').isVisible(),false);
  await context.close();
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
 console.log('PASS: Chrome decrypted one Staff and one Senior account; Staff cannot navigate JD, Senior can; logout and incorrect email tested.');
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
