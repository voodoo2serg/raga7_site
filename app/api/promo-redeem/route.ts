import {NextRequest,NextResponse} from 'next/server';
import {core,isDemo,sessionToken} from '@/lib/core';
import {verifiedOrigin} from '@/lib/security';

export async function POST(req:NextRequest){
 if(isDemo||!verifiedOrigin(req))return NextResponse.json({error:'forbidden'},{status:403});
 const token=await sessionToken();
 if(!token)return NextResponse.redirect(new URL('/login',req.url),303);
 const form=await req.formData();
 const code=String(form.get('code')||'').trim();
 if(!code)return NextResponse.redirect(new URL('/billing?error=promo',req.url),303);
 try{
  await core('/api/billing/promo/redeem',{
   method:'POST',
   body:JSON.stringify({code,source:'raga7-cabinet'}),
  },token);
  return NextResponse.redirect(new URL('/billing?promo=ok',req.url),303);
 }catch{
  return NextResponse.redirect(new URL('/billing?error=promo',req.url),303);
 }
}
