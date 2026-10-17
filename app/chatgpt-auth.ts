import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "cloudflare:workers";
import { readGuestSession } from "@/lib/guest-session";
export type ChatGPTUser = {
    userId: string;
    displayName: string;
    email: string;
    fullName: string | null;
};
const USER_ID_HEADER = "oai-authenticated-user-id";
const USER_EMAIL_HEADER = "oai-authenticated-user-email";
const USER_FULL_NAME_HEADER = "oai-authenticated-user-full-name";
const USER_FULL_NAME_ENCODING_HEADER = "oai-authenticated-user-full-name-encoding";
const PERCENT_ENCODED_UTF8 = "percent-encoded-utf-8";
const SIGN_IN_PATH = "/signin-with-chatgpt";
const SIGN_OUT_PATH = "/signout-with-chatgpt";
const CALLBACK_PATH = "/callback";
export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
    const requestHeaders = await headers();
    // Trust platform identity headers only in local development. A direct Worker
    // deployment must authenticate its own signed guest cookie instead.
    const vars = env as unknown as Record<string, string | undefined>;
    const allowPlatformHeaders = vars.EDTECH_TRUST_PLATFORM_AUTH === "true" ||
        (vars.EDTECH_TRUST_PLATFORM_AUTH !== "false" && process.env.NODE_ENV !== "production");
    if (allowPlatformHeaders) {
        const userId = requestHeaders.get(USER_ID_HEADER);
        const email = requestHeaders.get(USER_EMAIL_HEADER);
        if (userId && email) {
            const encodedFullName = requestHeaders.get(USER_FULL_NAME_HEADER);
            const fullName = encodedFullName &&
                requestHeaders.get(USER_FULL_NAME_ENCODING_HEADER) === PERCENT_ENCODED_UTF8
                ? safeDecodeURIComponent(encodedFullName)
                : null;
            return { userId, displayName: fullName ?? email, email, fullName };
        }
    }

    const secret = vars.DEMO_SIGNING_SECRET || process.env.DEMO_SIGNING_SECRET;
    if (!secret) return null;
    const session = await readGuestSession(requestHeaders.get("cookie"), secret);
    if (!session) return null;
    const email = `guest+${session.id}@local.edtech`;
    return { userId: session.id, displayName: "Guest learner", email, fullName: "Guest learner" };
}
export async function requireChatGPTUser(returnTo: string): Promise<ChatGPTUser> {
    const user = await getChatGPTUser();
    if (user)
        return user;
    redirect(chatGPTSignInPath(returnTo));
}
export function chatGPTSignInPath(returnTo: string): string {
    const safeReturnTo = safeRelativeReturnPath(returnTo);
    return `${SIGN_IN_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}
export function chatGPTSignOutPath(returnTo = "/"): string {
    const safeReturnTo = safeRelativeReturnPath(returnTo);
    return `${SIGN_OUT_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}
function safeRelativeReturnPath(value: string): string {
    if (!value.startsWith("/") || value.startsWith("//"))
        return "/";
    let url: URL;
    try {
        url = new URL(value, "https://app.local");
    }
    catch {
        return "/";
    }
    if (url.origin !== "https://app.local")
        return "/";
    if (isReservedAuthPath(url.pathname))
        return "/";
    return `${url.pathname}${url.search}${url.hash}`;
}
function isReservedAuthPath(pathname: string): boolean {
    return (pathname === SIGN_IN_PATH ||
        pathname === SIGN_OUT_PATH ||
        pathname === CALLBACK_PATH);
}
function safeDecodeURIComponent(value: string): string | null {
    try {
        return decodeURIComponent(value);
    }
    catch {
        return null;
    }
}
