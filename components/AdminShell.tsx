import Image from 'next/image';
import AppLauncher from './AppLauncher';
import Link from 'next/link';
import type {User} from '@/lib/types';
import {PanelsTopLeft,Users,Wallet,LifeBuoy,ShieldCheck,LogOut} from './Icons';

const links=[
 {href:'/admin',label:'Обзор',icon:PanelsTopLeft},
 {href:'/admin/clients',label:'Клиенты',icon:Users},
 {href:'/admin/billing',label:'Биллинг',icon:Wallet},
 {href:'/admin/support',label:'Поддержка',icon:LifeBuoy},
 {href:'/admin/security',label:'Безопасность',icon:ShieldCheck},
];

export function AdminShell({children,user,active}:{children:React.ReactNode;user:User;active:string}){
 return (
  <div className="app">
   <header className="topbar shell-width">
    <Link href="/admin" className="brand" aria-label="RAGA staff admin">
     <span className="brand-label">RAGA<span>7</span></span>
     <span className="brand-line"/>
     <span className="brand-note">Staff · metadata only</span>
    </Link>
    <div className="top-actions">
     <AppLauncher/>
     <span className="account-chip"><span className="account-dot"/>{user.email}</span>
     <Link className="ghost-btn admin-work-today" href="/admin/support">Работа сегодня</Link>
     <Link className="ghost-btn" href="/">Кабинет</Link>
     <form action="/api/logout" method="post"><button className="icon-action" title="Выйти"><LogOut size={18}/></button></form>
    </div>
   </header>
   <nav className="nav shell-width" aria-label="Staff admin">
    {links.map(x=>(
     <Link key={x.href} href={x.href} className={`nav-link ${active===x.href||(x.href!=='/admin'&&active.startsWith(x.href))?'selected':''}`}>
      <x.icon size={17}/>{x.label}
     </Link>
    ))}
   </nav>
   <main className="shell-width page-content">{children}</main>
   <footer className="footer shell-width">
    <div className="footer-left">
     <Image src="/brand/raga-7.png" alt="RAGA 7" width={40} height={40} className="footer-logo"/>
     <span>RAGA staff · контент только по grant + audit · Brand Voice отдельно</span>
    </div>
    <div className="footer-links"><Link href="/">RAGA 5 кабинет</Link></div>
   </footer>
  </div>
 );
}
