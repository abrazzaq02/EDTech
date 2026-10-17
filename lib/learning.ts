import type { AppState, Attempt, Exam, Task, TopicStat } from './contracts';
export function dayKey(date = new Date(), timezone = 'Asia/Karachi') { return new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date); }
export function dateGap(a: string, b: string) { return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000); }
export function addDays(day: string, n: number) { return new Date(Date.parse(day + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10); }
export function topicStats(attempts: Attempt[]): TopicStat[] { const map = new Map<string, TopicStat>(); for (const a of attempts) {
    const k = a.feedback.topic;
    const s = map.get(k) || { topic: k, correct: 0, total: 0, wrong: 0, confidentWrong: 0 };
    s.total++;
    if (a.feedback.correct)
        s.correct++;
    else {
        s.wrong++;
        if (a.confidence === 'sure')
            s.confidentWrong++;
    }
    map.set(k, s);
} return [...map.values()].sort((a, b) => b.wrong - a.wrong); }
export function makePlan(exams: Exam[], daily: number, attempts: Attempt[], previous: Task[], today: string) {
    const done = previous.filter(t => t.done);
    const tasks: Task[] = [...done];
    const stats = topicStats(attempts);
    const upcoming = exams.filter(e => dateGap(today, e.date) > 0).sort((a, b) => a.date.localeCompare(b.date));
    const units = upcoming.flatMap(e => e.topics.flatMap(topic => { const s = stats.find(v => v.topic.toLowerCase() === topic.toLowerCase()); const completed = done.filter(t => t.examId === e.id && t.topic === topic); return ['Understand & recall', 'Practice & retry'].filter(activity => !completed.some(t => t.activity === activity)).map(activity => ({ e, topic, activity, priority: (s?.wrong || 0) * 3 + (e.confidence === 'low' ? 1 : 0), reason: s?.wrong ? `${s.wrong} recorded mistake(s); review before ${e.date}.` : s ? `Revisit after ${s.total} recorded attempt(s).` : 'Not assessed yet; begin with a short check.' })); }));
    let index = 0;
    let remaining = units.length;
    const last = upcoming.at(-1)?.date || today;
    const maxDays = Math.min(90, Math.max(0, dateGap(today, last)));
    for (let d = 0; d < maxDays; d++) {
        const date = addDays(today, d);
        let available = daily - done.filter(t => t.date === date).reduce((s, t) => s + t.minutes, 0);
        while (available >= 15) {
            const candidates = units.filter(u => date < u.e.date).sort((a, b) => a.e.date.localeCompare(b.e.date) || b.priority - a.priority);
            const next = candidates[0];
            if (!next)
                break;
            const minutes = Math.min(30, available);
            tasks.push({ id: `plan-${today}-${index++}`, examId: next.e.id, date, subject: next.e.subject, topic: next.topic, minutes, activity: next.activity, reason: next.reason, done: false });
            available -= minutes;
            units.splice(units.indexOf(next), 1);
            remaining--;
        }
    }
    return { tasks: tasks.sort((a, b) => a.date.localeCompare(b.date)), shortfall: remaining, overdue: exams.filter(e => e.date <= today).length };
}
export function scoreHistory(state: AppState) { const groups = new Map<string, {
    correct: number;
    total: number;
}>(); for (const a of state.attempts.filter(a => !a.demo && !a.retry)) {
    const k = a.date.slice(0, 10);
    const g = groups.get(k) || { correct: 0, total: 0 };
    g.total++;
    if (a.feedback.correct)
        g.correct++;
    groups.set(k, g);
} return [...groups].slice(-7).map(([date, g]) => ({ date: date.slice(5), score: Math.round(g.correct / g.total * 100) })); }
