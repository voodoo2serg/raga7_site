import {NextResponse} from 'next/server';
import {makeLogin,OIDC_COOKIE_PATH,STATE_COOKIE} from '@/lib/oidc';
export const runtime='nodejs';

const MARKETING_LOGIN='https://raga.vodopetov.ru/login';

export async function GET(req:Request){
 try{
  const query=new URL(req.url).searchParams;
  const {url,sealed}=makeLogin({
   email:query.get('login_hint')||'',
   promo:query.get('promo')||'',
   register:query.get('register')==='1',
   registrationProof:query.get('registration_proof')||'',
   next:query.get('next')||'',
  });
  const response=NextResponse.redirect(url,302);
  response.cookies.set(STATE_COOKIE,sealed,{
   httpOnly:true,secure:true,sameSite:'lax',path:OIDC_COOKIE_PATH,maxAge:3600
  });
  response.headers.set('Cache-Control','no-store');
  return response;
 }catch{
  return NextResponse.redirect(`${MARKETING_LOGIN}?error=oidc_unavailable`,302);
 }
}
