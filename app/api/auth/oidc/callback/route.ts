import {NextRequest,NextResponse} from 'next/server';
import {codeExchange,consumeLogin,coreExchange,PENDING_COOKIE,sealPending,STATE_COOKIE,verifyIdToken} from '@/lib/oidc';
export const runtime='nodejs';
const ORIGIN='https://raga7.vodopetov.ru';
export async function GET(req:NextRequest){
 const code=req.nextUrl.searchParams.get('code')||'';
 const state=req.nextUrl.searchParams.get('state')||'';
 if(!code||!state||req.nextUrl.searchParams.has('error'))
  return NextResponse.redirect(ORIGIN+'/login?error=oidc_failed',302);
 try{
  const sealed=req.cookies.get(STATE_COOKIE)?.value||'';
  const {nonce,verifier,promo,registrationProof}=consumeLogin(sealed,state);
  const token=await codeExchange(code,verifier);
  await verifyIdToken(token,nonce);
  const reply=await coreExchange(token,undefined,promo,registrationProof);
  if(reply.status===409){
   const response=NextResponse.redirect(ORIGIN+'/login?error=link_required',302);
   response.cookies.set(PENDING_COOKIE,sealPending(token),{
    secure:true,httpOnly:true,sameSite:'lax',path:'/api/auth/oidc',maxAge:600
   });
   response.cookies.delete(STATE_COOKIE);
   return response;
  }
  if(!reply.ok)throw new Error('RAGA Core identity bridge failed');
  const session=await reply.json() as {access_token?:string};
  if(!session.access_token)throw new Error('RAGA Core session missing');
  const response=NextResponse.redirect(ORIGIN+'/',302);
  response.cookies.set('raga_session',session.access_token,{
   httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:8*3600
  });
  response.cookies.delete(STATE_COOKIE);
  response.cookies.delete(PENDING_COOKIE);
  response.headers.set('Cache-Control','no-store');
  return response;
 }catch{
  return NextResponse.redirect(ORIGIN+'/login?error=oidc_failed',302);
 }
}
