export type Project={id:string;name:string;slug?:string;status?:string;description?:string;is_preset?:boolean;created_at?:string};
export type User={id:string;email:string;name?:string;is_superadmin?:boolean};
export type KnowledgeType='fact'|'decision'|'hypothesis'|'prompt_or_skill'|'task'|'technical';
export type KnowledgeItem={id:string;type:KnowledgeType|string;title:string;review_state:'proposed'|'trusted'|'rejected';source_refs?:Array<{label?:string;object_type?:string;object_id?:string}>};
export type Integration={id:string;status:string;clients?:Array<{name:string;status:string;reason?:string}>;setup_hint?:string};
export type SupportThread={id:string;subject:string;status:string;category?:string;updated_at?:string};
export type CatalogProduct={sku:string;name:string;price_rub:number;period_days:number;storage_gb?:number|null;kind:string;active?:boolean};
export type DashboardStats={
 project_id:string;
 projects_count:number;
 knowledge:{by_type:Record<string,number>;total:number;pending_review:number;trusted?:number;sample_limit?:number;note?:string};
 storage:{files_bytes:number|null;vectors_bytes:number|null;quota_bytes:number|null};
 imports:{latest_run_at:string|null;running:number;status:string};
 discoveries?:Record<string,unknown>;
};
export type ProjectSnapshot={
 project:Project|null;
 projects:Project[];
 knowledge:KnowledgeItem[];
 summary:Record<string,unknown>|null;
 integrations:Integration[];
 compatibility:Array<{client:string;status:string;evidence_level?:string}>;
 usage:Record<string,unknown>|null;
 billing:Record<string,unknown>|null;
 dashboard:DashboardStats|null;
 error?:string;
};
export const SIX_TYPES:[KnowledgeType,string,string][]=[
 ['fact','Факты','Подтверждённые сведения'],
 ['decision','Решения','Зафиксированный выбор'],
 ['hypothesis','Гипотезы','Предложения к проверке'],
 ['prompt_or_skill','Промпты и навыки','Правила выполнения'],
 ['task','Задачи','Текущие действия'],
 ['technical','Технический','Код, API, архитектура'],
];
