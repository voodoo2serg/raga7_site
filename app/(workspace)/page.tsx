import {currentUser,getSnapshot,isDemo} from '@/lib/core';
import {Shell} from '@/components/Shell';
import {Dashboard} from '@/components/Dashboard';
export default async function Home({searchParams}:{searchParams:Promise<{project?:string}>}){const user=(await currentUser())!;const {project}=await searchParams;const data=await getSnapshot(project);return <Shell user={user} active="/" projectId={data.project?.id}><Dashboard data={data} demo={isDemo}/></Shell>}
