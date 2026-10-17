import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'EDTech — Mistake se Mastery Tak', description: 'Turn your notes into understanding, your mistakes into practice, and your exam dates into a clear plan.', icons: { icon: '/favicon.svg' } };
export default function RootLayout({ children }: {
    children: React.ReactNode;
}) { return <html lang="en"><body>{children}</body></html>; }
