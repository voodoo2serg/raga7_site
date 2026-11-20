import {redirect} from 'next/navigation';
import {currentUser} from '@/lib/core';

const MARKETING_LOGIN = 'https://raga.vodopetov.ru/login';
const CABINET_ADMIN = 'https://raga.vodopetov.ru/cabinet/admin';

/**
 * Staff shell under /cabinet/admin only.
 * Guests → marketing IdP with next=cabinet/admin (not a stray /admin UI).
 */
export default async function AdminLayout({children}:{children:React.ReactNode}){
 const user=await currentUser();
 if(!user){
  const url=new URL(MARKETING_LOGIN);
  url.searchParams.set('next',CABINET_ADMIN);
  redirect(url.toString());
 }
 return <>{children}</>;
}
