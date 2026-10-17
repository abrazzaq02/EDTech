import { settings, success } from '@/lib/server';
export async function GET() { return success({ aiConfigured: !!settings().key, storage: 'Private server history', version: '1.0.0' }); }
