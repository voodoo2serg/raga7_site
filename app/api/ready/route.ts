import {NextResponse} from 'next/server';
export const runtime='nodejs';
export async function GET(){
  if(process.env.RAGA_DEMO_MODE==='true')return NextResponse.json({ready:false,reason:'demo_mode'},{status:503});
  const base=(process.env.RAGA_CORE_URL||'').replace(/\/$/,'');
  if(!base)return NextResponse.json({ready:false,reason:'core_not_configured'},{status:503});
  try{
    const response=await fetch(base+'/api/public/consent-policy',{cache:'no-store',signal:AbortSignal.timeout(5000)});
    return NextResponse.json({ready:response.ok,core:response.ok?'connected':'unavailable'},{status:response.ok?200:503,headers:{'Cache-Control':'no-store'}});
  }catch{return NextResponse.json({ready:false,core:'unavailable'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
