import {NextResponse} from 'next/server';
import {oidcConfig} from '@/lib/oidc';
export const runtime='nodejs';
export async function GET(){
 return NextResponse.json({
  enabled:oidcConfig()!==null,
  identity_provider:'keycloak',
  core_link_verified:oidcConfig()!==null,
  note:'Runtime configuration check only. Browser SSO and identity mapping require E2E validation.'
 },{headers:{'Cache-Control':'no-store'}});
}
