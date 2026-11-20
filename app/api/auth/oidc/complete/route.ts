import {NextRequest,NextResponse} from 'next/server';
import {createRemoteJWKSet,jwtVerify} from 'jose';
import {
  CANONICAL_ORIGIN,
  coreExchange,
  ISSUER,
  OIDC_COOKIE_PATH,
  oidcConfig,
  openPending,
  PENDING_COOKIE,
  signRegistrationProof,
} from '@/lib/oidc';
import {notifyVerifiedIdentity} from '@/lib/signal-events';
import {verifiedOrigin} from '@/lib/security';

export const runtime='nodejs';

const MARKETING='https://raga.vodopetov.ru';

/**
 * After IdP auth, new RAGA workspaces need dual-consent proof.
 * Marketing /complete-registration posts here with checkboxes checked.
 */
export async function POST(req:NextRequest){
 if(!verifiedOrigin(req))return NextResponse.json({error:'origin_invalid'},{status:403});
 try{
  const body=await req.json() as {
   processing?:boolean;marketing?:boolean;promo?:string;
  };
  if(body.processing!==true||body.marketing!==true){
   return NextResponse.json({message:'Нужны оба согласия.'},{status:400});
  }
  const pending=openPending(req.cookies.get(PENDING_COOKIE)?.value||'');
  const cfg=oidcConfig();
  if(!cfg)throw new Error('oidc_unavailable');
  const jwks=createRemoteJWKSet(new URL(ISSUER+'/protocol/openid-connect/certs'));
  const {payload}=await jwtVerify(pending,jwks,{
   issuer:ISSUER,audience:cfg.client,clockTolerance:30,
   requiredClaims:['exp','iat','sub'],
  });
  const email=String(payload.email||'').trim().toLowerCase();
  if(!email.includes('@')||payload.email_verified!==true)throw new Error('unverified');
  const proof=signRegistrationProof(email);
  const promo=/^[A-Z0-9_-]{3,40}$/.test(String(body.promo||'').toUpperCase())
   ?String(body.promo).toUpperCase():'';
  const reply=await coreExchange(pending,undefined,promo,proof);
  if(!reply.ok){
   const detail=await reply.text().catch(()=>'');
   if(reply.status===409){
    return NextResponse.json({message:'Аккаунт уже есть. Войдите.',need_link:true,email},{status:409});
   }
   return NextResponse.json({message:'Не удалось создать кабинет.',detail:detail.slice(0,200)},{status:502});
  }
  const session=await reply.json() as {access_token?:string};
  if(!session.access_token)throw new Error('missing_token');
  await notifyVerifiedIdentity(email,String(payload.sub));
  const response=NextResponse.json({ok:true,redirect:CANONICAL_ORIGIN,email},{headers:{'Cache-Control':'no-store'}});
  response.cookies.set('raga_session',session.access_token,{
   httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:8*3600
  });
  response.cookies.set(PENDING_COOKIE,'',{httpOnly:true,secure:true,sameSite:'lax',path:OIDC_COOKIE_PATH,maxAge:0});
  return response;
 }catch{
  return NextResponse.json({message:'Сессия истекла. Войдите снова.'},{status:401});
 }
}
