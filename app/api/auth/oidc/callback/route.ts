import {NextRequest,NextResponse} from 'next/server';
import {
  CANONICAL_ORIGIN,
  codeExchange,
  consumeLogin,
  coreExchange,
  OIDC_COOKIE_PATH,
  PENDING_COOKIE,
  sealPending,
  STATE_COOKIE,
  verifyIdToken,
} from '@/lib/oidc';
import {notifyVerifiedIdentity} from '@/lib/signal-events';
export const runtime='nodejs';

const MARKETING='https://raga.vodopetov.ru';

export async function GET(req:NextRequest){
 const code=req.nextUrl.searchParams.get('code')||'';
 const state=req.nextUrl.searchParams.get('state')||'';
 if(!code||!state||req.nextUrl.searchParams.has('error'))
  return NextResponse.redirect(`${MARKETING}/login?error=oidc_failed`,302);
 try{
  const sealed=req.cookies.get(STATE_COOKIE)?.value||'';
  const {nonce,verifier,promo,registrationProof,next}=consumeLogin(sealed,state);
  const token=await codeExchange(code,verifier);
  const identity=await verifyIdToken(token,nonce);
  const reply=await coreExchange(token,undefined,promo,registrationProof);
  console.error("AUTH210_REPLY", reply.status);
  if(reply.status===409){
   const response=NextResponse.redirect(`${MARKETING}/login?error=link_required`,302);
   response.cookies.set(PENDING_COOKIE,sealPending(token),{
    secure:true,httpOnly:true,sameSite:'lax',path:OIDC_COOKIE_PATH,maxAge:600
   });
   response.cookies.set(STATE_COOKIE,'',{httpOnly:true,secure:true,sameSite:'lax',path:OIDC_COOKIE_PATH,maxAge:0});
   return response;
  }
  // New Keycloak identity without dual-consent proof → short marketing gate.
  if(reply.status===403){
   const response=NextResponse.redirect(`${MARKETING}/complete-registration`,302);
   response.cookies.set(PENDING_COOKIE,sealPending(token),{
    secure:true,httpOnly:true,sameSite:'lax',path:OIDC_COOKIE_PATH,maxAge:600
   });
   response.cookies.set(STATE_COOKIE,'',{httpOnly:true,secure:true,sameSite:'lax',path:OIDC_COOKIE_PATH,maxAge:0});
   return response;
  }
  if(!reply.ok)throw new Error('RAGA Core identity bridge failed');
  const session=await reply.json() as {access_token?:string};
  if(!session.access_token)throw new Error('RAGA Core session missing');
  if(registrationProof)await notifyVerifiedIdentity(String(identity.email),String(identity.sub));
  // Honor sealed next (e.g. /cabinet/admin) when safe; else cabinet home.
  const response=NextResponse.redirect(next||CANONICAL_ORIGIN,302);
  response.cookies.set('raga_session',session.access_token,{
   httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:8*3600
  });
  response.cookies.set(STATE_COOKIE,'',{httpOnly:true,secure:true,sameSite:'lax',path:OIDC_COOKIE_PATH,maxAge:0});
  response.cookies.set(PENDING_COOKIE,'',{httpOnly:true,secure:true,sameSite:'lax',path:OIDC_COOKIE_PATH,maxAge:0});
  response.headers.set('Cache-Control','no-store');
  return response;
 }catch(err){
  console.error('AUTH210_OIDC_CALLBACK', err instanceof Error ? err.message : String(err));
  return NextResponse.redirect(`${MARKETING}/login?error=oidc_failed`,302);
 }
}
