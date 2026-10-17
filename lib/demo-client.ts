import { request } from './api';
import { defaultState, type AppState, type Material, type Quiz, type Attempt } from './contracts';
const KEY = 'edtech-demo-v2';
type DemoData = {
    state: AppState;
    materials: Material[];
    quizzes: Quiz[];
};
function read(): DemoData { try {
    const value = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (value && Array.isArray(value.materials) && Array.isArray(value.state?.attempts) && Array.isArray(value.quizzes))
        return value;
}
catch { } return { state: { ...defaultState, attempts: [], exams: [], tasks: [], knownCards: [], sessions: [] }, materials: [], quizzes: [] }; }
function write(data: DemoData) { try {
    localStorage.setItem(KEY, JSON.stringify(data));
}
catch {
    throw new Error('Browser demo storage is full or unavailable. Export your history, then reset the demo.');
} }
export async function demoRequest<T>(path: string, body?: unknown, method?: string): Promise<T> {
    const data = read();
    if (path === '/api/state') {
        if (method === 'DELETE') {
            localStorage.removeItem(KEY);
            return { deleted: true } as T;
        }
        if (!body)
            return { state: data.state, materials: data.materials } as T;
        data.state = { ...data.state, ...body as Partial<AppState> };
        write(data);
        return data.state as T;
    }
    if (path === '/api/status')
        return { aiConfigured: false, storage: 'Browser-local interactive demo' } as T;
    const input = body as Record<string, unknown>;
    const action = input.action as string;
    const material = data.materials.find(m => m.id === input.materialId);
    let payload: Record<string, unknown> = { ...input, material };
    if (action === 'upload')
        payload = { ...input, material: { id: 'pending', title: input.title, subject: input.subject, pages: input.pages, pageCount: input.pageCount, demo: false, created: new Date().toISOString() } };
    if (action === 'grade') {
        const quiz = data.quizzes.find(q => q.id === input.quizId);
        const existing = data.state.attempts.find(a => a.quizId === input.quizId && a.questionId === input.questionId);
        if (existing)
            return existing as T;
        if (!quiz?.receipt)
            throw new Error('This demo quiz is no longer available. Generate a fresh quiz.');
        payload = { ...payload, receipt: quiz.receipt };
    }
    if (action === 'detect' || action === 'practice') {
        const attempt = data.state.attempts.find(a => a.id === input.attemptId);
        if (!attempt)
            throw new Error('Choose a saved demo mistake first.');
        payload = { ...payload, attempt, material: data.materials.find(m => m.id === attempt.materialId) };
    }
    const result = await request<T>('/api/demo', payload);
    if (action === 'sample' || action === 'upload')
        data.materials.unshift(result as Material);
    if (action === 'summary' && material)
        material.summary = result as Material['summary'];
    if (action === 'quiz' || action === 'practice')
        data.quizzes.unshift(result as Quiz);
    if (action === 'grade') {
        const attempt = result as Attempt;
        data.state.attempts.push(attempt);
    }
    if (action === 'detect') {
        const attempt = data.state.attempts.find(a => a.id === input.attemptId);
        if (attempt)
            attempt.diagnosis = result as Attempt['diagnosis'];
    }
    if (data.quizzes.length > 30)
        data.quizzes.length = 30;
    write(data);
    return result;
}
