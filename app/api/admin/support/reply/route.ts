import {NextRequest,NextResponse} from 'next/server';
import {isDemo} from '@/lib/core';
import {adminMutate} from '@/lib/admin';
import {verifiedOrigin} from '@/lib/security';

export async function POST(req:NextRequest){
 if(isDemo||!verifiedOrigin(req))return NextResponse.json({error:'forbidden'},{status:403});
 const form=await req.formData();
 const threadId=String(form.get('thread_id')||'').trim();
 const body=String(form.get('body')||'').trim();
 if(!threadId||!body){
  return NextResponse.redirect(new URL('/admin/support?error=reply',req.url),303);
 }
 const out=await adminMutate(`/internal/admin/support/threads/${encodeURIComponent(threadId)}/messages`,{body});
 const dest=new URL(`/admin/support/${encodeURIComponent(threadId)}`,req.url);
 if(!out.ok){
  dest.searchParams.set('error','reply');
  return NextResponse.redirect(dest,303);
 }
 dest.searchParams.set('ok','reply');
 return NextResponse.redirect(dest,303);
}
