import Workspace from '@/components/workspace';
import { requireChatGPTUser } from '@/app/chatgpt-auth';
export default async function Learn() { await requireChatGPTUser('/learn'); return <Workspace />; }
