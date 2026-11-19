const items=[
 {id:'solo',name:'Соло-Пиар',mark:'СП',href:'https://solo-pr.ru/'},
 // VR-206: canonical public product is raga.vodopetov.ru (not raga7).
 {id:'raga',name:'РАГА',mark:'РА',href:'https://raga.vodopetov.ru/'},
 {id:'signal',name:'СИГНАЛ',mark:'СИ',href:'https://signal.vodopetov.ru/'},
 {id:'crm',name:'CRM',mark:'CRM',href:'https://crm.solo-pr.ru/crm/'},
 {id:'voronka',name:'Воронка',mark:'ВО',href:'https://voronka.solo-pr.ru/ops/'},
 {id:'wited',name:'wi-ted',mark:'WT',href:'https://wited.familypaper.online/'},
 {id:'lms',name:'Обучение',mark:'LMS',href:'https://lms.solo-pr.ru/'},
 {id:'personal',name:'Личный сайт',mark:'СВ',href:'https://vodopetov.ru/'},
] as const;

/** Only navigation; Keycloak and destination app enforce authentication and grants. */
export default function AppLauncher(){
 return <details style={{position:'relative',zIndex:30}}>
  <summary aria-label="Все сервисы" title="Все сервисы" style={{cursor:'pointer',listStyle:'none',border:'1px solid #ddd',borderRadius:10,padding:'8px 12px'}}>▦ Сервисы</summary>
  <div style={{position:'absolute',right:0,top:'calc(100% + 10px)',width:'min(360px,90vw)',maxHeight:'70vh',overflow:'auto',padding:15,background:'var(--surface,#fff)',boxShadow:'0 12px 36px #0002',border:'1px solid #d7dde3',borderRadius:12}}>
   <strong>Приложения платформы</strong>
   <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:8,marginTop:14}}>
    {items.map(x=><a key={x.id} href={x.href} style={{display:'flex',alignItems:'center',flexDirection:'column',padding:'12px 4px',gap:8,textAlign:'center',fontSize:12,borderRadius:8,textDecoration:'none',color:'inherit'}}>
      <span aria-hidden="true" style={{display:'flex',alignItems:'center',justifyContent:'center',width:38,height:38,borderRadius:9,background:'#e8edf2',color:'#19314c',fontWeight:700}}>{x.mark}</span>{x.name}
    </a>)}
   </div>
   <p style={{fontSize:12,opacity:.7}}>Один аккаунт Keycloak. Права на каждый сервис проверяются при переходе; повторная регистрация не требуется после подключения SSO.</p>
  </div>
 </details>;
}
