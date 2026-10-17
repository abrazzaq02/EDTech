import { z } from 'zod';
import { owner, body, getRecord, putRecord, success, failure, listRecords, database } from '@/lib/server';
import { defaultState, ExamSchema, type AppState, type Attempt, type Material } from '@/lib/contracts';
const stateSchema = z.object({ exams: z.array(ExamSchema).max(20), tasks: z.array(z.object({ id: z.string().max(120), examId: z.string().max(80), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), subject: z.string().max(100), topic: z.string().max(120), minutes: z.number().min(1).max(480), activity: z.string().max(100), reason: z.string().max(500), done: z.boolean() })).max(1000), minutes: z.number().int().min(15).max(480), knownCards: z.array(z.string().max(160)).max(500), sessions: z.array(z.string().max(120)).max(1000), timezone: z.string().max(100) });
export async function GET(req: Request) { try {
    const user = await owner(req);
    const saved = await getRecord<Partial<AppState>>(`state:${user}`, user, 'state');
    const attempts = await listRecords<Attempt>(user, 'attempt');
    const materials = await listRecords<Material>(user, 'material');
    return success({ state: { ...defaultState, ...saved, attempts: attempts.reverse() }, materials });
}
catch (e) {
    return failure(e);
} }
export async function POST(req: Request) { try {
    const user = await owner(req);
    const data = stateSchema.parse(await body(req));
    new Intl.DateTimeFormat('en', { timeZone: data.timezone });
    await putRecord(`state:${user}`, user, 'state', data);
    return success(data);
}
catch (e) {
    return failure(e);
} }
export async function DELETE(req: Request) { try {
    const user = await owner(req);
    const data = await body(req);
    if (data.confirm !== 'DELETE')
        return Response.json({ success: false, error: { code: 'CONFIRM', message: 'Deletion needs confirmation.', retryable: false } }, { status: 400 });
    await database().prepare('DELETE FROM records WHERE owner = ?').bind(user).run();
    return success({ deleted: true });
}
catch (e) {
    return failure(e);
} }
