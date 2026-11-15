import {redirect} from 'next/navigation';
import {currentUser} from '@/lib/core';
export default async function WorkspaceLayout({children}:{children:React.ReactNode}){const user=await currentUser();if(!user)redirect('/login');return <>{children}</>}
