import type { ReactNode } from 'react';
export function IconBox({ children, color = 'purple' }: {
    children: ReactNode;
    color?: string;
}) { return <span className={`icon-box ${color}`}>{children}</span>; }
export function Empty({ icon, title, text, action }: {
    icon: ReactNode;
    title: string;
    text: string;
    action?: ReactNode;
}) { return <div className="empty"><span className="empty-icon">{icon}</span><h3>{title}</h3><p>{text}</p>{action}</div>; }
export function Badge({ children, tone = 'neutral' }: {
    children: ReactNode;
    tone?: string;
}) { return <span className={`badge ${tone}`}>{children}</span>; }
export function Card({ children, className = '' }: {
    children: ReactNode;
    className?: string;
}) { return <section className={`panel ${className}`}>{children}</section>; }
export function SectionTitle({ eyebrow, title: heading, text, actions }: {
    eyebrow: string;
    title: string;
    text: string;
    actions?: ReactNode;
}) { return <div className="section-title"><div><div className="eyebrow">{eyebrow}</div><h1>{heading}</h1><p>{text}</p></div>{actions && <div className="title-actions">{actions}</div>}</div>; }
