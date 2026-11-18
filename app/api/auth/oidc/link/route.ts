import {NextRequest,NextResponse} from 'next/server';
import {coreExchange,openPending,PENDING_COOKIE} from '@/lib/oidc';
import {core} from '@/lib/core';
import {verifiedOrigin} from '@/lib/security';
export const runtime='nodejs';
export async function POST(req:NextRequest){
 if(!verifiedOrigin(req))return NextResponse.json({error:'origin_invalid'},{status:403});
 try{
  const pending=openPending(req.cookies.get(PENDING_COOKIE)?.value||'');
  const form=await req.formData();
  const email=String(form.get('email')||'').trim().toLowerCase();
  const password=String(form.get('password')||'');
  if(!email.includes('@')||!password)return NextResponse.redirect(new URL('/login?error=credentials',req.url),303);
  const legacy=await core<{access_token:string}>('/api/auth/login',{
   method:'POST',body:JSON.stringify({email,password})
  });
  if(!legacy.access_token)throw new Error('legacy proof failed');
  const result=await coreExchange(pending,legacy.access_token);
  if(!result.ok)throw new Error('link rejected');
  const exchange=await coreExchange(pending);
  if(!exchange.ok)throw new Error('exchange rejected');
  const output=await exchange.json() as {access_token?:string};
  if(!output.access_token)throw new Error('RAGA Core token missing');
  const response=NextResponse.redirect(new URL('/',req.url),303);
  response.cookies.set('raga_session',output.access_token,{
   secure:true,httpOnly:true,sameSite:'lax',path:'/',maxAge:8*3600
  });
  response.cookies.delete(PENDING_COOKIE);
  return response;
 }catch{
  return NextResponse.redirect(new URL('/login?error=link_failed',req.url),303);
 }
}
