import {NextResponse} from 'next/server';
import {oidcConfig} from '@/lib/oidc';
export const runtime='nodejs';

/** Set only after a proven IdP → /cabinet browser path. Clear to reclaim honesty. */
function browserE2eVerified(){
 return process.env.RAGA_OIDC_BROWSER_E2E_VERIFIED==='1';
}

export async function GET(){
 const cfg=oidcConfig();
 if(!cfg)return NextResponse.json({
  enabled:false,identity_provider:'keycloak',core_bridge_ready:false,
  browser_e2e_verified:false,
 },{headers:{'Cache-Control':'no-store'}});
 try{
  const r=await fetch(cfg.core+'/api/auth/oidc/status',{
   cache:'no-store',signal:AbortSignal.timeout(5000)
  });
  const core=await r.json() as {
   enabled?:boolean;identity_mapping_table_ready?:boolean;browser_e2e_verified?:boolean;
  };
  // Honest AND: cabinet env flag + Core flag (both must be set after proof).
  const verified=browserE2eVerified()&&core.browser_e2e_verified===true;
  return NextResponse.json({
   enabled:r.ok&&core.enabled===true&&core.identity_mapping_table_ready===true,
   identity_provider:'keycloak',
   core_bridge_ready:core.enabled===true&&core.identity_mapping_table_ready===true,
   browser_e2e_verified:verified,
  },{headers:{'Cache-Control':'no-store'}});
 }catch{
  return NextResponse.json({
   enabled:false,identity_provider:'keycloak',core_bridge_ready:false,
   browser_e2e_verified:false,
  },{status:503,headers:{'Cache-Control':'no-store'}});
 }
}
