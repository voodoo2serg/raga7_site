import {NextResponse} from 'next/server';
// Reserved until human-reviewed approval UX is in place. Never silently approve proposed knowledge.
export async function POST(){return NextResponse.json({error:'Review UI is not yet enabled'},{status:501})}
