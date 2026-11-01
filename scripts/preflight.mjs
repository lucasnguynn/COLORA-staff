/* Validate GitHub Actions secret availability without ever logging secret values.
   Supports both repository secrets and the github-pages environment secrets
   when the build job references that environment. */
const names=['STAFF_PORTAL_PASSWORD','SENIOR_JD_PASSWORD'];
const values=names.map(name=>process.env[name]||'');
let invalid=false;
for(let i=0;i<names.length;i++){
  const name=names[i],value=values[i];
  if(value.length===0){
    console.error('::error title=Missing '+name+'::'+name+' is empty or not available to this build job. Add it as an Actions repository secret or a github-pages environment secret (NOT an Actions variable).');
    invalid=true;
  }else if(Array.from(value).length<8){
    console.error('::error title=Invalid '+name+'::'+name+' is shorter than the required 8 characters. Replace it with a unique, strong password.');
    invalid=true;
  }else{
    console.log(name+' is available (value hidden).');
  }
}
if(values[0] && values[1] && values[0]===values[1]){
  console.error('::error title=Passwords are not distinct::STAFF_PORTAL_PASSWORD and SENIOR_JD_PASSWORD must be different.');
  invalid=true;
}
if(invalid){
  console.error('Fix in COLORA-staff > Settings > Secrets and variables > Actions, then manually re-run Deploy COLORA Staff Portal. Never put passwords in code, PR comments, or chat.');
  process.exitCode=1;
}else{
  console.log('Password prerequisites passed. Starting verified encryption workflow.');
}
