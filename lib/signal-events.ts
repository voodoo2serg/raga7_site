import 'server-only';
import {createHash,createHmac} from 'node:crypto';

const SIGNAL='https://signal.vodopetov.ru/api/v1/communications/events';

/** Best-effort signal for an ALREADY verified Keycloak identity.
 * SIGNAL owns the content; this module never constructs an email template.
 * Never pass OIDC JWTs or registration proofs to SIGNAL.
 */
export async function notifyVerifiedIdentity(email:string,sub:string):Promise<void>{
 const secret=process.env.SIGNAL_EVENT_SOURCE_KEY||'';
 if(secret.length<32||!email.includes('@')||!sub)return;
 const eventId='verified:'+createHash('sha256').update(sub).digest('hex');
 const body=JSON.stringify({event_id:eventId,event_type:'identity.email_verified',email});
 const timestamp=String(Math.floor(Date.now()/1000));
 const signature=createHmac('sha256',secret).update(timestamp+'.'+body).digest('hex');
 try{
  await fetch(SIGNAL,{method:'POST',headers:{
   'Content-Type':'application/json',
   'X-Signal-Source':'raga7',
   'X-Signal-Timestamp':timestamp,
   'X-Signal-Signature':signature
  },body,cache:'no-store',signal:AbortSignal.timeout(2500)});
 }catch{
  // Communication failures must never invalidate a verified OIDC login.
 }
}
