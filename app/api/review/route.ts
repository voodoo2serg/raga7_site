import {NextRequest,NextResponse} from 'next/server';
import {core,isDemo,sessionToken} from '@/lib/core';
import {verifiedOrigin} from '@/lib/security';

export async function POST(req:NextRequest){
 if(isDemo||!verifiedOrigin(req))return NextResponse.json({error:'forbidden'},{status:403});
 const token=await sessionToken();
 if(!token)return NextResponse.redirect(new URL('/login',req.url),303);
 const form=await req.formData();
 const project=String(form.get('project_id')||'');
 const item=String(form.get('item_id')||'');
 const action=String(form.get('action')||'');
 if(!/^[0-9a-f-]{36}$/i.test(project)||!item||!['approve','reject'].includes(action)){
  return NextResponse.json({error:'invalid'},{status:400});
 }
 try{
  await core(`/api/projects/${project}/knowledge/items/${encodeURIComponent(item)}/review`,{
   method:'POST',
   body:JSON.stringify({action,idempotency_key:`review-${item}-${action}`}),
  },token);
  return NextResponse.redirect(new URL(`/context?project=${project}`,req.url),303);
 }catch{
  return NextResponse.redirect(new URL(`/context?project=${project}&error=review`,req.url),303);
 }
}
