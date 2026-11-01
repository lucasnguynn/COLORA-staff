import { chromium } from 'playwright';

// GitHub Actions-only check. Never log, screenshot, or export the password.
// This tests the LAST SUCCESSFULLY DEPLOYED LIVE SITE, not the new build.
const staff=process.env.STAFF_PORTAL_PASSWORD||'';
const senior=process.env.SENIOR_JD_PASSWORD||'';
const origin='https://staff.colora.vn';
if(Array.from(staff).length<8 || Array.from(senior).length<8 || staff===senior)throw Error('Missing password prerequisites (values never logged).');

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let failed=false;
try{
  // Each role needs an independent, clean browser context. Reusing one
  // context carries over StatiCrypt's remembered Staff passphrase and
  // auto-unlocks Staff on the next navigation, hiding the Senior input.
  // That used to generate a FALSE Senior timeout in LIVE verification.
  for(const [type,route,password,selector] of [
    ['staff','/',staff,'body[data-staff-role="staff"][data-staff-ready="true"]'],
    ['senior workspace','/#jd',senior,'body[data-staff-role="senior"][data-staff-ready="true"]'],
    ['senior JD direct','/apps/jd/',senior,'#workspaceTitle']
  ]){
    const context=await browser.newContext({ignoreHTTPSErrors:false});
    const page=await context.newPage();
    try{
      const response=await page.goto(origin+route,{waitUntil:'domcontentloaded',timeout:18000});
      const secure=await page.evaluate(()=>window.isSecureContext&&!!window.crypto?.subtle);
      if(!secure){console.error('FAIL: '+type+' live login requires working HTTPS/WebCrypto.');failed=true;continue;}
      await page.locator('#staticrypt-password').fill(password,{timeout:10000});
      await page.locator('#staticrypt-form input[type="submit"]').click();
      await page.locator(selector).waitFor({state:'visible',timeout:18000});
      if(type==='staff'){
        if(await page.locator('[data-view="jd"]').count())throw Error('Staff role unexpectedly exposes JD route');
      }
      if(type==='senior workspace'){
        if(await page.locator('#module').getAttribute('data-active-module')!=='jd')throw Error('Senior #jd route did not initialize');
        await page.locator('#jd-workspace-controls').waitFor({state:'visible',timeout:18000});
        if(await page.locator('#module-frame').getAttribute('data-jd-loaded')!=='true'){
          await page.locator('#module-frame[data-jd-loaded="true"]').waitFor({state:'attached',timeout:18000});
        }
        await page.frameLocator('#module-frame').locator('#editorPanel').waitFor({state:'visible',timeout:18000});
        await page.locator('#jd-workspace-controls').waitFor({state:'visible',timeout:18000});
        await page.locator('#jd-role-select option').first().waitFor({state:'attached',timeout:18000});
        if(await page.frameLocator('#module-frame').locator('.app-shell > .sidebar').isVisible())throw Error('Nested JD sidebar still visible');
        if(await page.frameLocator('#module-frame').locator('.workspace > .topbar').isVisible())throw Error('Nested JD header still visible');
        if(await page.frameLocator('#module-frame').locator('#staticrypt-password').count())throw Error('Senior JD prompted for a second password');
      }
      console.log('PASS: '+type+' secret decrypts LIVE site on HTTPS. HTTP bookmarks must be changed to HTTPS.');
    }catch(err){
      failed=true;
      console.error('FAIL: '+type+' CURRENT Actions secret does not unlock LIVE site, or live TLS/site initialization failed. Do not paste secrets into logs. Check that Pages is serving the build generated after the last secret rotation.');
      console.error('Failure category: '+(err?.name||'Unknown'));
    }finally{
      // Destroy all remembered passphrases and cookies before next role.
      await context.close();
    }
  }
}finally{await browser.close();}
if(failed)process.exit(1);
