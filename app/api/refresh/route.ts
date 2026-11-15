import {NextResponse} from 'next/server';
// No recurring/persistent scraping. Imports are initiated using /api/import.
export async function POST(){return NextResponse.json({error:'Use an explicit import source in Integrations'},{status:409})}
