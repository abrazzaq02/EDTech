import { env } from "cloudflare:workers";
import { createGuestSession } from "@/lib/guest-session";

function safeReturn(value: string | null) {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/learn";
  try {
    const url = new URL(value, "https://edtech.local");
    if (url.origin !== "https://edtech.local" || url.pathname.startsWith("/signin-with-chatgpt")) return "/learn";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/learn";
  }
}

export async function GET(request: Request) {
  const vars = env as unknown as Record<string, string | undefined>;
  const secret = vars.DEMO_SIGNING_SECRET || process.env.DEMO_SIGNING_SECRET;
  if (!secret) return new Response("Workspace sign-in is not configured.", { status: 503 });

  const id = crypto.randomUUID();
  const { token, maxAge } = await createGuestSession(secret, id);
  const destination = safeReturn(new URL(request.url).searchParams.get("return_to"));
  return new Response(null, {
    status: 303,
    headers: {
      Location: destination,
      "Cache-Control": "private, no-store",
      "Set-Cookie": `edtech_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`,
    },
  });
}
