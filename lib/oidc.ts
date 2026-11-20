import 'server-only';
import {createCipheriv,createDecipheriv,createHash,createHmac,randomBytes,timingSafeEqual} from 'node:crypto';
import {createRemoteJWKSet,jwtVerify} from 'jose';

export const ISSUER='https://auth.solo-pr.ru/realms/solo-pr';
export const STATE_COOKIE='raga_oidc_state';
export const PENDING_COOKIE='raga_oidc_pending';
/** Canonical host + cabinet basePath (raga7.* redirects away). */
export const CANONICAL_ORIGIN='https://raga.vodopetov.ru/cabinet';
export const OIDC_COOKIE_PATH='/cabinet/api/auth/oidc';
const REDIRECT=`${CANONICAL_ORIGIN}/api/auth/oidc/callback`;
const TTL=3600;

export function oidcConfig(){
 const client=process.env.RAGA_OIDC_CLIENT_ID||'';
 const secret=process.env.RAGA_OIDC_STATE_SECRET||'';
 const bridge=process.env.RAGA_OIDC_BRIDGE_SECRET||'';
 const redirect=(process.env.RAGA_OIDC_REDIRECT_URI||REDIRECT).replace(/\/$/,'');
 const core=process.env.RAGA_CORE_URL||'';
 if(process.env.RAGA_KEYCLOAK_ENABLED!=='1'||!client||
    secret.length<32||bridge.length<32||redirect!==REDIRECT||!core.startsWith('http'))
   return null;
 return {client,secret,bridge,redirect,core:core.replace(/\/$/,'')};
}
function b64(buf:Buffer){return buf.toString('base64url');}
function sign(data:string,secret:string){return b64(createHmac('sha256',secret).update(data).digest());}
function constantTime(a:string,b:string){
 const x=Buffer.from(a),y=Buffer.from(b);
 return x.length===y.length&&timingSafeEqual(x,y);
}

/** Only allow post-login return into the canonical cabinet tree. */
export function safeCabinetNext(raw:string|null|undefined):string{
 if(!raw)return CANONICAL_ORIGIN;
 let decoded=raw;
 try{decoded=decodeURIComponent(raw);}catch{/* keep raw */}
 if(!decoded.startsWith(CANONICAL_ORIGIN))return CANONICAL_ORIGIN;
 if(decoded.includes('\\')||decoded.includes('\n')||decoded.includes('\r'))return CANONICAL_ORIGIN;
 // Block open redirects / path tricks past the cabinet origin.
 try{
  const u=new URL(decoded);
  if(u.origin!=='https://raga.vodopetov.ru')return CANONICAL_ORIGIN;
  if(!u.pathname.startsWith('/cabinet'))return CANONICAL_ORIGIN;
  return `${u.origin}${u.pathname}${u.search}`;
 }catch{return CANONICAL_ORIGIN;}
}

export function makeLogin({email='',promo='',register=false,registrationProof='',next=''}:{email?:string;promo?:string;register?:boolean;registrationProof?:string;next?:string}={}){
 const c=oidcConfig();
 if(!c)throw new Error('Keycloak not configured for RAGA');
 const state=b64(randomBytes(32));
 const nonce=b64(randomBytes(32));
 const verifier=b64(randomBytes(48));
 const expires=String(Date.now()+TTL*1000);
 const safePromo=/^[A-Z0-9_-]{3,40}$/.test(promo.toUpperCase())?promo.toUpperCase():'';
 const safeProof=/^[A-Za-z0-9_-]{20,1500}\.[A-Za-z0-9_-]{40,90}$/.test(registrationProof)?registrationProof:'';
 const proofPart=safeProof?b64(Buffer.from(safeProof)):'-';
 const nextPart=b64(Buffer.from(safeCabinetNext(next)));
 const payload=[state,nonce,verifier,expires,safePromo,proofPart,nextPart].join('.');
 const sealed=payload+'.'+sign(payload,c.secret);
 const challenge=b64(createHash('sha256').update(verifier).digest());
 const url=new URL(ISSUER+'/protocol/openid-connect/auth');
 for(const [key,value] of Object.entries({
  response_type:'code',client_id:c.client,redirect_uri:c.redirect,
  scope:'openid email profile',state,nonce,
  code_challenge:challenge,code_challenge_method:'S256'
 }))url.searchParams.set(key,value);
 if(email.includes('@')&&!email.includes(' ')&&email.length<=254)url.searchParams.set('login_hint',email);
 if(register)url.searchParams.set('prompt','create');
 return {url:url.toString(),sealed};
}
export function consumeLogin(sealed:string,receivedState:string){
 const c=oidcConfig();
 if(!c)throw new Error('Keycloak disabled');
 const parts=sealed.split('.');
 // 7 = legacy (no next); 8 = with nextPart
 if(parts.length!==7&&parts.length!==8)throw new Error('OIDC state cookie missing');
 const mac=parts[parts.length-1];
 const body=parts.slice(0,-1);
 const [state,nonce,verifier,expires,promo,proofPart]=body;
 const nextPart=body.length>=7?body[6]:'';
 const unsigned=body.join('.');
 if(!state||!nonce||!verifier||!receivedState||!constantTime(state,receivedState)||
    Number(expires)<Date.now()||Number(expires)>Date.now()+TTL*1000||
    !constantTime(mac,sign(unsigned,c.secret)))throw new Error('OIDC state invalid');
 const registrationProof=proofPart==='-'?'':Buffer.from(proofPart,'base64url').toString('utf8');
 const next=nextPart?safeCabinetNext(Buffer.from(nextPart,'base64url').toString('utf8')):CANONICAL_ORIGIN;
 return {nonce,verifier,promo,registrationProof,next};
}
export async function verifyIdToken(token:string,nonce:string){
 const c=oidcConfig();
 if(!c)throw new Error('OIDC not configured');
 const jwks=createRemoteJWKSet(new URL(ISSUER+'/protocol/openid-connect/certs'));
 const {payload}=await jwtVerify(token,jwks,{
  issuer:ISSUER,audience:c.client,clockTolerance:30,
  requiredClaims:['exp','iat','sub','nonce']
 });
 if(payload.nonce!==nonce||payload.email_verified!==true||
    typeof payload.email!=='string'||!payload.email.includes('@'))throw new Error('identity not verified');
 return payload;
}
export async function codeExchange(code:string,verifier:string){
 const c=oidcConfig();
 if(!c)throw new Error('OIDC not configured');
 const data=new URLSearchParams({
  grant_type:'authorization_code',client_id:c.client,
  redirect_uri:c.redirect,code,code_verifier:verifier,
 });
 if(process.env.RAGA_OIDC_CLIENT_SECRET)data.set('client_secret',process.env.RAGA_OIDC_CLIENT_SECRET);
 const r=await fetch(ISSUER+'/protocol/openid-connect/token',{
  method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},
  body:data,cache:'no-store',signal:AbortSignal.timeout(10000),
 });
 if(!r.ok)throw new Error('Keycloak rejected code');
 const result=await r.json() as {id_token?:string};
 if(!result.id_token)throw new Error('id_token_missing');
 return result.id_token;
}
export async function coreExchange(idToken:string,legacyToken?:string,promoCode='',registrationProof=''){
 const c=oidcConfig();
 if(!c)throw new Error('OIDC not configured');
 const route=legacyToken?'/api/auth/oidc/link':'/api/auth/oidc/exchange';
 return fetch(c.core+route,{
  method:'POST',
  headers:{'content-type':'application/json','x-raga-bridge-secret':c.bridge,
   ...(legacyToken?{authorization:'Bearer '+legacyToken}:{})},
  body:JSON.stringify({id_token:idToken,...(promoCode?{promo_code:promoCode}:{}),...(registrationProof?{registration_proof:registrationProof}:{})}),cache:'no-store',signal:AbortSignal.timeout(15000)
 });
}
function encKey(secret:string){return createHash('sha256').update('raga-oidc-pending-v1').update(secret).digest();}
export function sealPending(token:string){
 const c=oidcConfig();if(!c)throw new Error('OIDC disabled');
 const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',encKey(c.secret),iv);
 const plaintext=JSON.stringify({token,expires:Date.now()+TTL*1000});
 const encrypted=Buffer.concat([cipher.update(plaintext,'utf8'),cipher.final()]);
 return b64(Buffer.concat([iv,cipher.getAuthTag(),encrypted]));
}
export function openPending(sealed:string){
 const c=oidcConfig();if(!c)throw new Error('OIDC disabled');
 const raw=Buffer.from(sealed,'base64url');
 if(raw.length<30||raw.length>20000)throw new Error('invalid pending token');
 const dec=createDecipheriv('aes-256-gcm',encKey(c.secret),raw.subarray(0,12));
 dec.setAuthTag(raw.subarray(12,28));
 const value=JSON.parse(Buffer.concat([dec.update(raw.subarray(28)),dec.final()]).toString('utf8')) as {token?:string;expires?:number};
 if(!value.token||!value.expires||value.expires<Date.now())throw new Error('expired pending token');
 return value.token;
}

/** Dual-consent proof required by Core before provisioning a new RAGA workspace. */
export function signRegistrationProof(email:string){
 const secret=(process.env.RAGA_REGISTRATION_SECRET||'').trim();
 if(secret.length<32)throw new Error('registration_consent_signing_not_configured');
 const normalized=email.trim().toLowerCase();
 if(!normalized.includes('@')||normalized.length>254)throw new Error('invalid_email');
 const data={
  v:1,
  email_digest:createHash('sha256').update(normalized).digest('hex'),
  iat:Math.floor(Date.now()/1000),
  processing:true,
  marketing:true,
  processing_doc:'/consent',
  marketing_doc:'/marketing-consent',
  nonce:b64(randomBytes(16)),
 };
 const encoded=Buffer.from(JSON.stringify(data)).toString('base64url');
 const signature=createHmac('sha256',secret).update(encoded).digest('base64url');
 return `${encoded}.${signature}`;
}
