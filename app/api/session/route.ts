import {NextRequest,NextResponse} from 'next/server';import {core,isDemo} from '@/lib/core';import {verifiedOrigin} from '@/lib/security';
export async function POST(req:NextRequest){
 if(!verifiedOrigin(req)||isDemo)return NextResponse.json({error:'forbidden'},{status:403});
 const form=await req.formData();const email=String(form.get('email')||'').trim();const password=String(form.get('password')||'');
 if(!email.includes('@')||!password)return NextResponse.redirect(new URL('/login?error=credentials',req.url),303);
 try{const auth=await core<{access_token:string}>('/api/auth/login',{method:'POST',body:JSON.stringify({email,password})});if(!auth.access_token)throw new Error('empty_token');
 const res=NextResponse.redirect(new URL('/',req.url),303);res.cookies.set('raga_session',auth.access_token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*8});return res;
 }catch{return NextResponse.redirect(new URL('/login?error=credentials',req.url),303)}
}
