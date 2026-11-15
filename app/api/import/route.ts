import {NextRequest,NextResponse} from 'next/server';import {core,isDemo,sessionToken} from '@/lib/core';import {verifiedOrigin} from '@/lib/security';
export async function POST(req:NextRequest){
 if(isDemo||!verifiedOrigin(req))return NextResponse.json({error:'Action unavailable in demo mode or invalid origin'},{status:403});
 const token=await sessionToken();if(!token)return NextResponse.redirect(new URL('/login',req.url),303);
 const form=await req.formData();const project=String(form.get('project_id')||'');if(!/^[0-9a-f-]{36}$/i.test(project))return NextResponse.json({error:'Invalid project'},{status:400});
 const payload=new FormData();const files=form.getAll('files').filter(x=>x instanceof File&&x.size>0) as File[];
 if(files.length>100||files.some(x=>x.size>25*1024*1024))return NextResponse.json({error:'File limit exceeded'},{status:413});
 files.forEach(f=>payload.append('files',f));const githubUrl=String(form.get('github_url')||'');
 if(githubUrl){try{const url=new URL(githubUrl);if(url.protocol!=='https:'||url.hostname!=='github.com')throw new Error('invalid_url')}catch{return NextResponse.json({error:'Only https://github.com/ links are supported'},{status:400})}payload.append('github_url',githubUrl)}
 if(!files.length&&!githubUrl)return NextResponse.json({error:'Nothing to import'},{status:400});
 payload.append('idempotency_key',crypto.randomUUID());
 try{await core(`/api/projects/${project}/imports`,{method:'POST',body:payload},token);return NextResponse.redirect(new URL(`/context?project=${project}&submitted=1`,req.url),303)}catch{return NextResponse.redirect(new URL(`/context?project=${project}&error=import`,req.url),303)}
}
