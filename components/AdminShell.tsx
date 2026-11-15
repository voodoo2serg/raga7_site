import Image from 'next/image';
import Link from 'next/link';
import type {User} from '@/lib/types';
import {PanelsTopLeft,Users,Wallet,LifeBuoy,ShieldCheck,LogOut,Settings2} from './Icons';

const links=[
 {href:'/admin',label:'Overview',icon:PanelsTopLeft},
 {href:'/admin/clients',label:'Clients',icon:Users},
 {href:'/admin/billing',label:'Billing',icon:Wallet},
 {href:'/admin/support',label:'Support',icon:LifeBuoy},
 {href:'/admin/security',label:'Security',icon:ShieldCheck},
];

export function AdminShell({children,user,active}:{children:React.ReactNode;user:User;active:string}){
 return (
  <div className="app">
   <header className="topbar shell-width">
    <Link href="/admin" className="brand" aria-label="RAGA 7 Admin">
     <span className="brand-label">RAGA<span>7</span></span>
     <span className="brand-line"/>
     <span className="brand-note">Admin · metadata only</span>
    </Link>
    <div className="top-actions">
     <span className="account-chip"><span className="account-dot"/>{user.email}</span>
     <Link className="ghost-btn" href="/"><Settings2 size={16}/> Кабинет</Link>
     <form action="/api/logout" method="post"><button className="icon-action" title="Выйти"><LogOut size={18}/></button></form>
    </div>
   </header>
   <nav className="nav shell-width" aria-label="Admin">
    {links.map(x=>(
     <Link key={x.href} href={x.href} className={`nav-link ${active===x.href?'selected':''}`}>
      <x.icon size={17}/>{x.label}
     </Link>
    ))}
   </nav>
   <main className="shell-width page-content">{children}</main>
   <footer className="footer shell-width">
    <div className="footer-left">
     <Image src="/brand/raga-7.png" alt="RAGA 7" width={40} height={40} className="footer-logo"/>
     <span>RAGA 7 Admin · контент только по grant + audit</span>
    </div>
    <div className="footer-links"><Link href="/">RAGA 5 кабинет</Link></div>
   </footer>
  </div>
 );
}
