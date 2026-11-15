import {NextRequest,NextResponse} from 'next/server';import {verifiedOrigin} from '@/lib/security';
export async function POST(req:NextRequest){if(!verifiedOrigin(req))return NextResponse.json({error:'forbidden'},{status:403});const res=NextResponse.redirect(new URL('/login',req.url),303);res.cookies.delete('raga_session');return res}
