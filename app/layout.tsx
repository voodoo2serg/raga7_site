import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title:'RAGA 5 — Работа с контекстом', description:'Проекты, интеграции и управляемая память для ИИ.' };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="ru"><body>{children}</body></html>}
