import Link from 'next/link';
import {SectionPage} from '@/components/SectionPage';
import {listPresets} from '@/lib/core';
import {FolderOpen,Plus,ArrowRight,Sparkles} from '@/components/Icons';

export default async function Page({searchParams}:{searchParams:Promise<{project?:string}>}){
 const {project}=await searchParams;
 const presets=await listPresets();
 return <SectionPage active="/projects" projectId={project}>{data=><>
  <div className="detail-heading"><span className="eyebrow">ОРГАНИЗАЦИЯ ЗНАНИЙ</span><h1>Ваши проекты</h1><p>Каждый проект сохраняет свою историю, правила и накопленные решения.</p></div>
  <div className="project-list">{data.projects.map(p=><Link className="project-line" key={p.id} href={'/context?project='+encodeURIComponent(p.id)}><FolderOpen size={22}/><span><b>{p.name}</b><small>{p.description||'Перейти к знаниям проекта'}</small></span><ArrowRight size={18}/></Link>)}{data.projects.length===0&&<div className="empty">У вас пока нет проектов. Создайте первый.</div>}</div>
  <form className="create-form" action="/api/create-project" method="post"><h2>Новый проект</h2><div className="horizontal-form"><input name="name" required maxLength={120} placeholder="Название проекта"/><button className="blue-button"><Plus size={16}/> Создать</button></div></form>
  <form className="create-form" action="/api/from-preset" method="post">
   <h2>Из пресета (5‑минутный старт)</h2>
   <div className="horizontal-form">
    <select name="preset_id" required style={{flex:1,padding:'12px 14px',border:'1px solid #cad9e9',borderRadius:8}}>
     {presets.length===0?<option value="general">general</option>:null}
     {presets.map((p)=>{const id=String(p.preset_id||p.id||'');return <option key={id} value={id}>{String(p.name||p.title||id)}</option>})}
    </select>
    <input name="name" maxLength={120} placeholder="Название (опционально)"/>
    <button className="blue-button" type="submit">Из пресета</button>
   </div>
   <p>Пресет копируется в ваш tenant — без Enterprise Lab.</p>
  </form>
  <div className="callout"><Sparkles size={20}/><span>RAGA может обнаруживать новые гипотезы и проектные связи при анализе документов. Подтверждайте предложения перед использованием.</span></div>
 </>}</SectionPage>
}
