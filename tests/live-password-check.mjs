import {chromium} from 'playwright';

// Post-deployment smoke test for the CURRENT five-user static AES-GCM gateway.
// Only runs after a successful production Pages deployment, or by explicit
// workflow_dispatch. Neither credentials nor personal data are logged.
const base='https://staff.colora.vn';
let users;
try{users=JSON.parse(process.env.COLORA_ACCOUNT_CREDENTIALS_JSON||'null')}catch{}
if(!Array.isArray(users)||users.length!==5||
   users.filter(u=>u.role==='staff').length!==3||
   users.filter(u=>u.role==='senior').length!==2){
  throw Error('The protected five-account production roster is unavailable.');
}
const selected=['staff','senior'].map(role=>users.find(u=>u.role===role));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let failures=0;
const sleep=ms=>new Promise(ok=>setTimeout(ok,ms));
try{
  // Cloudflare/GitHub Pages may briefly serve the previous release after a
  // deployment is marked complete. Retry with isolated fresh browser contexts.
  for(const role of ['staff','senior']){
    const member=selected.find(u=>u.role===role);
    let passed=false,lastCategory='Unavailable';
    for(let attempt=0;attempt<3&&!passed;attempt++){
      const context=await browser.newContext({ignoreHTTPSErrors:false,acceptDownloads:false});
      const page=await context.newPage();
      try{
        const res=await page.goto(base+'/?verify='+Date.now(),{waitUntil:'domcontentloaded',timeout:20000});
        if(res?.status()!==200)throw Error('Unexpected HTTP status');
        if(!(await page.evaluate(()=>window.isSecureContext&&!!crypto.subtle)))throw Error('Secure context unavailable');
        await page.locator('#staff-email').waitFor({state:'visible',timeout:10000});
        await page.locator('#staff-email').fill(member.email);
        await page.locator('#staff-password').fill(member.password);
        // Never opt in to device remembrance in CI.
        if(await page.locator('#remember-device').isChecked())throw Error('Remember default must be off');
        await page.locator('#signin-submit').click();
        await page.locator('#workspace:not([hidden])').waitFor({state:'visible',timeout:45000});
        const frame=page.frameLocator('#workspace-frame');
        await frame.locator('body[data-staff-role="'+role+'"][data-staff-ready="true"]')
          .waitFor({state:'attached',timeout:20000});
        const jd=await frame.locator('[data-view="jd"]').count();
        if((jd>0)!==(role==='senior'))throw Error('Role isolation mismatch');
        await frame.locator('.nav-btn[data-view="brand-guide"]').click();
        await frame.locator('#brand-guide:not([hidden])').waitFor({state:'visible',timeout:10000});
        if(role==='senior'){
          await frame.locator('.nav-btn[data-view="jd"]').click();
          await frame.frameLocator('#module-frame').locator('#editorPanel').waitFor({state:'visible',timeout:15000});
        }else{
          await frame.locator('.nav-btn[data-view="qr"]').click();
          await frame.frameLocator('#module-frame').locator('#downloadPng').waitFor({state:'visible',timeout:14000});
        }
        await page.locator('#workspace-signout').click();
        await page.locator('#signin-form').waitFor({state:'visible',timeout:10000});
        passed=true;
        console.log('PASS: production '+role+' login, module access and logout.');
      }catch(error){
        // Intentionally report ONLY failure categories, never user-supplied
        // strings, URLs, selector traces, or any credentials.
        lastCategory=String(error?.name||'CheckFailed').replace(/[^A-Za-z]/g,'').slice(0,48);
      }finally{await context.close()}
      if(!passed&&attempt<2)await sleep(5500);
    }
    if(!passed){failures++;console.error('FAIL: production '+role+' smoke check ('+lastCategory+').');}
  }
}finally{await browser.close()}
if(failures)process.exitCode=1;
