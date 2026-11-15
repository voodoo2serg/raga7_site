import {NextRequest,NextResponse} from 'next/server';
import {core,isDemo,sessionToken} from '@/lib/core';
import {verifiedOrigin} from '@/lib/security';

export async function POST(req:NextRequest){
 if(isDemo||!verifiedOrigin(req))return NextResponse.json({error:'forbidden'},{status:403});
 const token=await sessionToken();
 if(!token)return NextResponse.redirect(new URL('/login',req.url),303);
 const form=await req.formData();
 const preset_id=String(form.get('preset_id')||'');
 const name=String(form.get('name')||'').trim()||undefined;
 try{
  const out=await core<{project?:{id:string};id?:string}>('/api/simple/projects/from-preset',{
   method:'POST',body:JSON.stringify({preset_id,name}),
  },token);
  const id=out.project?.id||out.id;
  return NextResponse.redirect(new URL(id?`/context?project=${id}`:'/projects',req.url),303);
 }catch{
  return NextResponse.redirect(new URL('/projects?error=preset',req.url),303);
 }
}
