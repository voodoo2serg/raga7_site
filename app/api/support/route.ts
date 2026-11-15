import {NextRequest,NextResponse} from 'next/server';
import {core,isDemo,sessionToken} from '@/lib/core';
import {verifiedOrigin} from '@/lib/security';

export async function POST(req:NextRequest){
 if(isDemo||!verifiedOrigin(req))return NextResponse.json({error:'forbidden'},{status:403});
 const token=await sessionToken();
 if(!token)return NextResponse.redirect(new URL('/login',req.url),303);
 const form=await req.formData();
 const subject=String(form.get('subject')||'').trim();
 const category=String(form.get('category')||'other');
 const body=String(form.get('body')||'').trim();
 if(!subject||!body)return NextResponse.redirect(new URL('/support?error=1',req.url),303);
 try{
  await core('/api/support/threads',{method:'POST',body:JSON.stringify({subject,category,body})},token);
  return NextResponse.redirect(new URL('/support',req.url),303);
 }catch{
  return NextResponse.redirect(new URL('/support?error=1',req.url),303);
 }
}
