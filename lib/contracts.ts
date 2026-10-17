import { z } from 'zod';
export const PageSchema = z.object({ page: z.number().int().min(1).max(5000), text: z.string().min(1).max(16000) });
export type Page = z.infer<typeof PageSchema>;
export const PointSchema = z.object({ title: z.string().min(1).max(180), text: z.string().min(1).max(1600), page: z.number().int().positive() });
export const SummarySchema = z.object({ overview: z.string().max(3000), concepts: z.array(PointSchema).min(1).max(12), revision: z.array(z.string().max(600)).max(12) });
export type Summary = z.infer<typeof SummarySchema> & {
    engine?: string;
};
export type Material = {
    id: string;
    title: string;
    subject: string;
    pages: Page[];
    created: string;
    demo: boolean;
    summary?: Summary;
    pageCount?: number;
};
export const PrivateQuestionSchema = z.object({ id: z.string().min(1).max(80), type: z.enum(['mcq', 'truefalse', 'short']), topic: z.string().min(1).max(100), prompt: z.string().min(1).max(1200), options: z.array(z.string().min(1).max(500)).max(6), answer: z.string().min(1).max(1000), explanation: z.string().min(1).max(1800), page: z.number().int().positive(), misconception: z.string().max(1200) });
export type PrivateQuestion = z.infer<typeof PrivateQuestionSchema>;
export type Question = Omit<PrivateQuestion, 'answer' | 'explanation' | 'misconception'>;
export type Quiz = {
    id: string;
    materialId: string;
    title: string;
    questions: Question[];
    engine: string;
    demo: boolean;
    parentMistake?: string;
    receipt?: string;
};
export type Feedback = {
    correct: boolean;
    answer: string;
    explanation: string;
    topic: string;
    page: number;
    likelyMistake: string;
    followUp: string;
};
export type Attempt = {
    id: string;
    quizId: string;
    questionId: string;
    materialId: string;
    prompt: string;
    response: string;
    working: string;
    confidence: string;
    feedback: Feedback;
    date: string;
    demo: boolean;
    retry: boolean;
    diagnosis?: Diagnosis;
};
export type Diagnosis = {
    likelyMistake: string;
    steps: string[];
    followUp: string;
    engine: string;
};
export const ExamSchema = z.object({ id: z.string().max(80), subject: z.string().min(1).max(100), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => Number.isFinite(Date.parse(v + 'T00:00:00Z')) && new Date(v + 'T00:00:00Z').toISOString().slice(0, 10) === v, 'Invalid date'), topics: z.array(z.string().min(1).max(120)).min(1).max(30), confidence: z.enum(['low', 'medium', 'high']) });
export type Exam = z.infer<typeof ExamSchema>;
export type Task = {
    id: string;
    examId: string;
    date: string;
    subject: string;
    topic: string;
    minutes: number;
    activity: string;
    reason: string;
    done: boolean;
};
export type AppState = {
    attempts: Attempt[];
    exams: Exam[];
    tasks: Task[];
    minutes: number;
    knownCards: string[];
    sessions: string[];
    timezone: string;
};
export const defaultState: AppState = { attempts: [], exams: [], tasks: [], minutes: 90, knownCards: [], sessions: [], timezone: 'Asia/Karachi' };
export type TopicStat = {
    topic: string;
    correct: number;
    total: number;
    wrong: number;
    confidentWrong: number;
};
