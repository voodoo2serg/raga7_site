import 'server-only';
import {cookies} from 'next/headers';
import type {Project,ProjectSnapshot,KnowledgeItem,Integration,User} from './types';

const base=process.env.RAGA_CORE_URL?.replace(/\/$/,'')||'http://backend:8000';
export const isDemo=process.env.RAGA_DEMO_MODE==='true';
const demoProjects:Project[]=[{id:'demo-001',name:'Запуск нового продукта',status:'active',description:'Демонстрационный проект'},{id:'demo-002',name:'Исследование аудитории',status:'active'},{id:'demo-003',name:'Разработка сайта',status:'active'}];
const demoItems:KnowledgeItem[]=[
{id:'f1',type:'fact',title:'Продукт использует PostgreSQL и pgvector',review_state:'trusted'},
{id:'f2',type:'fact',title:'Клиенты обращаются к модели через API',review_state:'trusted'},
{id:'d1',type:'decision',title:'Использовать один реестр клиентов и платежей',review_state:'trusted'},
{id:'h1',type:'hypothesis',title:'Сократить время первого запуска до пяти минут',review_state:'proposed'},
{id:'s1',type:'prompt_or_skill',title:'Проверять выводы по исходным источникам',review_state:'trusted'},
{id:'t1',type:'task',title:'Проверить мобильный интерфейс',review_state:'proposed'},
{id:'tc1',type:'technical',title:'Подключить защищённый BFF вместо прямого API',review_state:'trusted'}
];

export async function core<T>(path:string,options:RequestInit={},token?:string):Promise<T>{
 if(!path.startsWith('/api/') || path.includes('..'))throw new Error('path_not_allowed');
 const res=await fetch(base+path,{...options,headers:{...((options.body instanceof FormData)?{}:{'Content-Type':'application/json'}),...(token?{Authorization:`Bearer ${token}`}:{}) ,...(options.headers||{})},cache:'no-store',signal:AbortSignal.timeout(12000)});
 if(!res.ok)throw new Error(`Core ${res.status} ${path}`);
 return res.json() as Promise<T>;
}
export async function sessionToken(){return (await cookies()).get('raga_session')?.value||null}
export async function currentUser():Promise<User|null>{
 if(isDemo)return {id:'demo',email:'demo@raga.local',name:'Демонстрация'};
 const token=await sessionToken();if(!token)return null;
 try{return await core<User>('/api/auth/me',{},token)}catch{return null}
}
const attempt=async <T,>(job:()=>Promise<T>,fallback:T):Promise<T>=>{try{return await job()}catch{return fallback}};
export async function getSnapshot(projectId?:string):Promise<ProjectSnapshot>{
 if(isDemo)return{project:demoProjects.find(p=>p.id===projectId)||demoProjects[0],projects:demoProjects,knowledge:demoItems,summary:null,usage:null,billing:{subscription:{plan:'demo'}},compatibility:[{client:'MCP Inspector',status:'verified'},{client:'ChatGPT',status:'blocked'},{client:'Claude',status:'blocked'}],integrations:[{id:'mcp_inbound',status:'staging',clients:[]}],error:undefined};
 const token=await sessionToken();if(!token)return{project:null,projects:[],knowledge:[],summary:null,usage:null,billing:null,compatibility:[],integrations:[],error:'not_authorized'};
 const projects=await attempt(()=>core<Project[]>('/api/auth/me/projects',{},token),[]);
 const project=projects.find(p=>p.id===projectId)||projects[0]||null;
 const billing=await attempt(()=>core<Record<string,unknown>>('/api/billing/me',{},token),null);
 const compat=await attempt(()=>core<{clients:ProjectSnapshot['compatibility']}>('/api/public/client-compatibility',{},token),{clients:[]});
 if(!project)return{project:null,projects,knowledge:[],summary:null,usage:null,billing,compatibility:compat.clients,integrations:[]};
 const p=encodeURIComponent(project.id);
 const [items,summary,integrations,usage]=await Promise.all([
 attempt(()=>core<{items:KnowledgeItem[];next_cursor?:string}>(`/api/projects/${p}/knowledge/items?limit=200`,{},token),{items:[]}),
 attempt(()=>core<Record<string,unknown>>(`/api/projects/${p}/knowledge/summary`,{},token),null),
 attempt(()=>core<{integrations:Integration[]}>(`/api/projects/${p}/integrations/status`,{},token),{integrations:[]}),
 attempt(()=>core<Record<string,unknown>>(`/api/projects/${p}/usage`,{},token),null)
 ]);
 return{project,projects,knowledge:items.items,summary,integrations:integrations.integrations,usage,billing,compatibility:compat.clients};
}
