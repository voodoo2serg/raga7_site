import {NextRequest} from 'next/server';
export function verifiedOrigin(req:NextRequest){
 const expected=process.env.RAGA_SITE_ORIGIN;
 const origin=req.headers.get('origin');
 const host=req.headers.get('host');
 if(!origin)return false;
 try{const parsed=new URL(origin);return expected?parsed.origin===new URL(expected).origin:parsed.host===host}catch{return false}
}
export function redirectSafe(value:string|null,fallback='/'){return value?.startsWith('/')&&!value.startsWith('//')&&!value.includes('\\')?value:fallback}
