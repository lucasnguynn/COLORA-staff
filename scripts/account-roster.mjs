/* Secrets live only in the protected GitHub environment at build time.
 * The original five-person JSON stays untouched; a sixth Staff member is
 * supplied independently in COLORA_ADDITIONAL_STAFF_CREDENTIALS_JSON.
 * Never print, persist, or commit credential contents. */
export function readAccountRoster(env=process.env){
  let original;
  try{original=JSON.parse(env.COLORA_ACCOUNT_CREDENTIALS_JSON||'null')}catch{}
  if(!Array.isArray(original)||original.length!==5)
    throw Error('Exactly five base employee credentials are required');
  const extraRaw=env.COLORA_ADDITIONAL_STAFF_CREDENTIALS_JSON;
  if(!extraRaw||!extraRaw.trim())return original;
  let extra;
  try{extra=JSON.parse(extraRaw)}catch{
    throw Error('Additional Staff account secret must contain a valid JSON object');
  }
  if(!extra||typeof extra!=='object'||Array.isArray(extra)||extra.role!=='staff')
    throw Error('Additional account must be a single Staff object');
  return [...original,extra];
}
