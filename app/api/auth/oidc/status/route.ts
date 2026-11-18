import {NextResponse} from 'next/server';
import {oidcConfig} from '@/lib/oidc';
export const runtime='nodejs';
export async function GET(){
 const cfg=oidcConfig();
 if(!cfg)return NextResponse.json({enabled:false,identity_provider:'keycloak',core_bridge_ready:false},
  {headers:{'Cache-Control':'no-store'}});
 try{
  const r=await fetch(cfg.core+'/api/auth/oidc/status',{
   cache:'no-store',signal:AbortSignal.timeout(5000)
  });
  const core=await r.json() as {enabled?:boolean;identity_mapping_table_ready?:boolean};
  return NextResponse.json({
   enabled:r.ok&&core.enabled===true&&core.identity_mapping_table_ready===true,
   identity_provider:'keycloak',
   core_bridge_ready:core.enabled===true&&core.identity_mapping_table_ready===true,
   browser_e2e_verified:false,
  },{headers:{'Cache-Control':'no-store'}});
 }catch{
  return NextResponse.json({enabled:false,identity_provider:'keycloak',core_bridge_ready:false},
   {status:503,headers:{'Cache-Control':'no-store'}});
 }
}
