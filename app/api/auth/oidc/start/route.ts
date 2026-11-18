import {NextResponse} from 'next/server';
import {makeLogin,STATE_COOKIE} from '@/lib/oidc';
export const runtime='nodejs';
export async function GET(req:Request){
 try{
  const query=new URL(req.url).searchParams;
  const {url,sealed}=makeLogin({email:query.get('login_hint')||'',promo:query.get('promo')||''});
  const response=NextResponse.redirect(url,302);
  response.cookies.set(STATE_COOKIE,sealed,{
   httpOnly:true,secure:true,sameSite:'lax',path:'/api/auth/oidc',maxAge:600
  });
  response.headers.set('Cache-Control','no-store');
  return response;
 }catch{return NextResponse.redirect('https://raga7.vodopetov.ru/login?error=oidc_unavailable',302);}
}
