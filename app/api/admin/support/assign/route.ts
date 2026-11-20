import {NextRequest,NextResponse} from 'next/server';
import {isDemo} from '@/lib/core';
import {adminMutate} from '@/lib/admin';
import {verifiedOrigin} from '@/lib/security';

export async function POST(req:NextRequest){
 if(isDemo||!verifiedOrigin(req))return NextResponse.json({error:'forbidden'},{status:403});
 const form=await req.formData();
 const threadId=String(form.get('thread_id')||'').trim();
 const assigneeId=String(form.get('assignee_id')||'').trim();
 if(!threadId||!assigneeId){
  return NextResponse.redirect(new URL('/admin/support?error=assign',req.url),303);
 }
 const out=await adminMutate(`/internal/admin/support/threads/${encodeURIComponent(threadId)}/assign`,{assignee_id:assigneeId});
 const dest=new URL(`/admin/support/${encodeURIComponent(threadId)}`,req.url);
 if(!out.ok){
  dest.searchParams.set('error','assign');
  return NextResponse.redirect(dest,303);
 }
 dest.searchParams.set('ok','assign');
 return NextResponse.redirect(dest,303);
}
