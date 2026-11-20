import 'server-only';
import {adminFetch,core,sessionToken} from './core';

export type AdminUser={
 id:string;
 email:string;
 name?:string|null;
 plan?:string|null;
 has_access?:boolean;
 is_superadmin?:boolean;
 created_at?:string|null;
};

export type AdminThread={
 id:string;
 subject:string;
 status:string;
 category?:string|null;
 user_id?:string|null;
 project_id?:string|null;
 assignee_id?:string|null;
 priority?:string|null;
 updated_at?:string|null;
 created_at?:string|null;
};

export type AdminMessage={
 id:string;
 body:string;
 author_role:string;
 author_user_id?:string;
 created_at?:string|null;
};

export type AdminSub={
 id:string;
 user_id:string;
 plan:string;
 status:string;
 starts_at?:string|null;
 expires_at?:string|null;
 source?:string|null;
 promo_code?:string|null;
};

export type AdminPayment={
 id:string;
 provider?:string|null;
 plan?:string|null;
 amount_rub?:number|null;
 status?:string|null;
 external_id?:string|null;
 created_at?:string|null;
 confirmed_at?:string|null;
};

export type SecurityEvent={
 id:string;
 event_type:string;
 severity?:string|null;
 actor_user_id?:string|null;
 detail?:string|null;
 created_at?:string|null;
};

export function fmtWhen(iso?:string|null):string{
 if(!iso)return '—';
 try{
  const d=new Date(iso);
  if(Number.isNaN(d.getTime()))return iso;
  return d.toLocaleString('ru-RU',{dateStyle:'short',timeStyle:'short'});
 }catch{return iso}
}

export async function adminUsers(email?:string){
 const q=email?`?email=${encodeURIComponent(email)}`:'';
 return adminFetch<{items:AdminUser[];count?:number}>(`/internal/admin/users${q}`);
}

export async function adminUserProjects(userId:string){
 return adminFetch<{items:Array<{id:string;name:string;slug?:string;status?:string;is_preset?:boolean}>;note?:string}>(
  `/internal/admin/users/${encodeURIComponent(userId)}/projects`
 );
}

export async function adminOverview(){
 return adminFetch<Record<string,unknown>>('/internal/admin/overview');
}

export async function adminOpsHealth(){
 return adminFetch<Record<string,unknown>>('/internal/admin/ops/health');
}

export async function adminSubscriptions(){
 return adminFetch<{items:AdminSub[]}>('/internal/admin/subscriptions');
}

export async function adminPayments(){
 return adminFetch<{items:AdminPayment[]}>('/internal/admin/payments');
}

export async function adminSupportThreads(status?:string){
 const q=status?`?status=${encodeURIComponent(status)}`:'';
 return adminFetch<{items:AdminThread[]}>(`/internal/admin/support/threads${q}`);
}

export async function adminSupportThread(id:string){
 return adminFetch<{thread:AdminThread;messages:AdminMessage[];content_policy?:string}>(
  `/internal/admin/support/threads/${encodeURIComponent(id)}`
 );
}

export async function adminSecurityEvents(){
 return adminFetch<{items:SecurityEvent[]}>('/internal/admin/security/events');
}

/** Server-side POST to Core admin (mutations). Optional MFA reauth header. */
export async function adminMutate<T>(path:string,body:Record<string,unknown>,mfa?:string):Promise<{ok:true;data:T}|{ok:false;error:string}>{
 const token=await sessionToken();
 if(!token)return{ok:false,error:'not_authorized'};
 try{
  const headers:Record<string,string>={};
  if(mfa)headers['x-admin-mfa']=mfa;
  const data=await core<T>(path,{method:'POST',body:JSON.stringify(body),headers},token);
  return{ok:true,data};
 }catch(e){
  return{ok:false,error:e instanceof Error?e.message:'core_error'};
 }
}
