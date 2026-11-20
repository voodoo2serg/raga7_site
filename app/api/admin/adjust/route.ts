import {NextRequest,NextResponse} from 'next/server';
import {isDemo} from '@/lib/core';
import {adminMutate} from '@/lib/admin';
import {verifiedOrigin} from '@/lib/security';

export async function POST(req:NextRequest){
 if(isDemo||!verifiedOrigin(req))return NextResponse.json({error:'forbidden'},{status:403});
 const form=await req.formData();
 const userId=String(form.get('user_id')||'').trim();
 const days=Number(form.get('days')||0);
 const reason=String(form.get('reason')||'').trim();
 const plan=String(form.get('plan')||'promo').trim()||'promo';
 const mfa=String(form.get('mfa')||'').trim();
 const back=new URL('/admin/billing',req.url);
 if(!userId||!reason||days<1||days>365){
  back.searchParams.set('error','adjust_invalid');
  return NextResponse.redirect(back,303);
 }
 const out=await adminMutate('/internal/admin/adjustments',{user_id:userId,days,reason,plan},mfa||undefined);
 if(!out.ok){
  back.searchParams.set('error','adjust_denied');
  return NextResponse.redirect(back,303);
 }
 back.searchParams.set('ok','adjust');
 return NextResponse.redirect(back,303);
}
