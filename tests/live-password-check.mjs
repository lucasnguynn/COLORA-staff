import { chromium } from 'playwright';

// GitHub Actions-only check. Never log, screenshot, or export the password.
// This tests the LAST SUCCESSFULLY DEPLOYED LIVE SITE, not the new build.
const staff=process.env.STAFF_PORTAL_PASSWORD||'';
const senior=process.env.SENIOR_JD_PASSWORD||'';
const origin='https://staff.colora.vn';
if(staff.length<16 || senior.length<16 || staff===senior)throw Error('Missing password prerequisites (values never logged).');

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let failed=false;
try{
  const context=await browser.newContext({ignoreHTTPSErrors:false});
  const page=await context.newPage();
  for(const [type,route,password,selector] of [
    ['staff','/',staff,'#dashboard h1'],
    ['senior JD','/apps/jd/',senior,'#workspaceTitle']
  ]){
    try{
      const response=await page.goto(origin+route,{waitUntil:'domcontentloaded',timeout:18000});
      const secure=await page.evaluate(()=>window.isSecureContext&&!!window.crypto?.subtle);
      if(!secure){console.error('FAIL: '+type+' live login requires working HTTPS/WebCrypto.');failed=true;continue;}
      await page.locator('#staticrypt-password').fill(password,{timeout:10000});
      await page.locator('#staticrypt-form input[type="submit"]').click();
      await page.locator(selector).waitFor({state:'visible',timeout:12000});
      console.log('PASS: '+type+' secret decrypts LIVE site on HTTPS. HTTP bookmarks must be changed to HTTPS.');
    }catch(err){
      failed=true;
      console.error('FAIL: '+type+' CURRENT Actions secret does not unlock LIVE site, or live TLS/site initialization failed. Do not paste secrets into logs. Check that Pages is serving the build generated after the last secret rotation.');
      console.error('Failure category: '+(err?.name||'Unknown'));
    }
  }
}finally{await browser.close();}
if(failed)process.exit(1);
