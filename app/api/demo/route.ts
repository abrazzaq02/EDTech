import { z } from 'zod';
import { body, success, failure, AppError, PagesSchema, extractiveSummary, validateQuestions, publicQuestion } from '@/lib/server';
import { samplePages, sampleQuestions, sampleSummary } from '@/lib/demo-server';
import { recallQuestions } from '@/lib/recall';
import { seal, unseal } from '@/lib/demo-token';
import type { PrivateQuestion, Attempt, Diagnosis, Quiz } from '@/lib/contracts';
type DemoQuiz = Omit<Quiz, 'questions'> & {
    questions: PrivateQuestion[];
};
const materialSchema = z.object({ id: z.string().max(100), title: z.string().min(1).max(100), subject: z.string().min(1).max(100), pages: PagesSchema, pageCount: z.number().int().min(1).max(5000), demo: z.boolean().default(false), created: z.string().max(60) });
const normalize = (v: string) => v.toLowerCase().replace(/^x\s*=\s*/, '').replace(/\s+/g, '').replace(/\.$/, '');
export async function POST(req: Request) {
    try {
        const data = await body(req);
        const action = z.enum(['sample', 'upload', 'summary', 'quiz', 'grade', 'detect', 'practice', 'chat']).parse(data.action);
        const roman = data.language === 'roman';
        if (action === 'sample')
            return success({ id: crypto.randomUUID(), title: 'Algebra foundations', subject: 'Mathematics', pages: samplePages, pageCount: 2, demo: true, created: new Date().toISOString(), summary: sampleSummary(roman) });
        if (action === 'upload') {
            const value = materialSchema.parse({ ...data.material, id: crypto.randomUUID(), created: new Date().toISOString() });
            if (value.pages.map(p => p.text).join('').replace(/\s/g, '').length < 100)
                throw new AppError('OCR_REQUIRED', 'Very little readable text was found. This PDF may need OCR.');
            if (value.pages.some(p => p.page > value.pageCount))
                throw new AppError('PAGES_INVALID', 'Page number exceeds the document length.');
            value.demo = value.pages.length === samplePages.length && value.pages.every((p, i) => p.text.replace(/\s/g, '') === samplePages[i].text.replace(/\s/g, ''));
            return success(value);
        }
        if (action === 'grade') {
            const input = z.object({ receipt: z.string().max(30000), questionId: z.string().max(100), response: z.string().min(1).max(2000), working: z.string().max(3000).default(''), confidence: z.enum(['sure', 'unsure', 'guess']).default('unsure') }).parse(data);
            const qz = await unseal<DemoQuiz>(input.receipt);
            const q = qz.questions.find(q => q.id === input.questionId);
            if (!q)
                throw new AppError('QUESTION_MISSING', 'Demo question not found.', 404);
            const correct = normalize(input.response) === normalize(q.answer);
            const attempt: Attempt = { id: `demo-answer:${qz.id}:${q.id}`, quizId: qz.id, questionId: q.id, materialId: qz.materialId, prompt: q.prompt, response: input.response, working: input.working, confidence: input.confidence, feedback: { correct, answer: q.answer, explanation: q.explanation, topic: q.topic, page: q.page, likelyMistake: correct ? '' : q.misconception, followUp: correct ? '' : 'Can you show your first step? Your answer alone cannot confirm your reasoning.' }, date: new Date().toISOString(), demo: true, retry: !!qz.parentMistake };
            return success(attempt);
        }
        const material = materialSchema.parse(data.material);
        const verified = material.pages.length === samplePages.length && material.pages.every((p, i) => p.text.replace(/\s/g, '') === samplePages[i].text.replace(/\s/g, ''));
        if (action === 'summary')
            return success(verified ? sampleSummary(roman) : { ...extractiveSummary(material.pages), engine: 'Source excerpts · public demo, not AI' });
        if (action === 'quiz' || action === 'practice') {
            const count = action === 'practice' ? 1 : z.number().int().min(3).max(10).parse(data.count);
            let questions: PrivateQuestion[];
            const attempt = action === 'practice' ? z.object({ id: z.string().max(200), prompt: z.string().max(1200), feedback: z.object({ topic: z.string().max(100) }) }).parse(data.attempt) : null;
            if (verified)
                questions = action === 'practice' ? sampleQuestions(attempt!.feedback.topic) : sampleQuestions().slice(0, Math.min(count, 5));
            else
                questions = recallQuestions(material.pages, action === 'practice' ? 10 : count).filter(q => !attempt || q.prompt !== attempt.prompt).slice(0, count);
            if (questions.length < (action === 'practice' ? 1 : 3))
                throw new AppError('RECALL_TOO_SHORT', 'Add longer notes to create enough source-recall questions. The verified sample is ready to try.');
            validateQuestions(questions, material.pages);
            const quiz: DemoQuiz = { id: crypto.randomUUID(), materialId: material.id, title: action === 'practice' ? `Retry: ${attempt!.feedback.topic}` : `${material.subject} practice`, questions, engine: verified ? 'Verified sample lesson · not live AI' : 'Rule-based source recall · not AI', demo: true, ...(attempt ? { parentMistake: attempt.id } : {}) };
            return success({ ...quiz, questions: questions.map(publicQuestion), receipt: await seal(quiz) });
        }
        if (action === 'detect') {
            const a = z.object({ response: z.string().max(2000), working: z.string().max(3000), feedback: z.object({ likelyMistake: z.string().max(1800), explanation: z.string().max(1800), topic: z.string().max(100) }) }).parse(data.attempt);
            const d: Diagnosis = { likelyMistake: roman ? 'Rule ka ek step miss hua ho sakta hai. Sirf final answer se wajah confirm nahi hoti.' : a.feedback.likelyMistake, steps: roman ? ['Source page ka relevant rule dekho.', a.feedback.explanation, 'Ab naye sawaal ko bina answer dekhe solve karo.'] : ['Compare your attempt with the rule in your notes.', a.feedback.explanation, 'Try a changed question without looking at its answer.'], followUp: roman ? 'Apni working samjhao: tumhara pehla step kya tha?' : 'What was your first step? Share your working before concluding why the error occurred.', engine: verified ? 'Verified sample guidance · not live AI' : 'Rule-based review · not AI' };
            return success(d);
        }
        if (action === 'chat') {
            const question = z.string().min(3).max(1500).parse(data.question);
            const words = question.toLowerCase().match(/[a-z]{4,}/g) || [];
            const ranked = material.pages.map(p => ({ ...p, score: words.filter(w => p.text.toLowerCase().includes(w)).length })).sort((a, b) => b.score - a.score);
            return success(ranked[0]?.score ? { answer: ranked[0].text, pages: [ranked[0].page], engine: 'Source search · exact excerpt, not AI' } : { answer: roman ? 'Uploaded notes mein is sawal ka jawab nahi mila.' : 'I could not locate support for this question in the uploaded notes.', pages: [], engine: 'Source search · not AI' });
        }
        throw new AppError('ACTION', 'Unknown demo action.');
    }
    catch (e) {
        return failure(e);
    }
}
