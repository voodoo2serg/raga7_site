import {NextRequest,NextResponse} from 'next/server';
import {core,isDemo,sessionToken} from '@/lib/core';
import {verifiedOrigin} from '@/lib/security';

export async function POST(req:NextRequest){
 if(isDemo||!verifiedOrigin(req))return NextResponse.json({error:'forbidden'},{status:403});
 const token=await sessionToken();
 if(!token)return NextResponse.redirect(new URL('/login',req.url),303);
 const form=await req.formData();
 const sku=String(form.get('sku')||'');
 const provider=String(form.get('provider')||'yookassa');
 const returnUrl=new URL('/billing',req.url).toString();
 try{
  const out=await core<{confirmation_url?:string;payment_url?:string;url?:string}>('/api/billing/checkout',{
   method:'POST',
   body:JSON.stringify({sku,provider,return_url:returnUrl,idempotency_key:`site-${sku}-${Date.now()}`}),
  },token);
  const url=out.confirmation_url||out.payment_url||out.url;
  if(url)return NextResponse.redirect(url,303);
  return NextResponse.redirect(new URL('/billing',req.url),303);
 }catch{
  return NextResponse.redirect(new URL('/billing?error=checkout',req.url),303);
 }
}
