type Envelope<T> = {
    success: boolean;
    data?: T;
    error?: {
        message?: string;
    };
};
export async function request<T>(path: string, body?: unknown, method?: string): Promise<T> { const response = await fetch(path, { method: method || (body ? 'POST' : 'GET'), headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined }); let json: Envelope<T>; try {
    json = await response.json() as Envelope<T>;
}
catch {
    throw new Error('The server returned an unreadable response. Please refresh and retry.');
} if (!response.ok || !json.success)
    throw new Error(json.error?.message || 'The request failed. Please retry.'); return json.data as T; }
