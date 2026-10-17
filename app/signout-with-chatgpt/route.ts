export async function GET(request: Request) {
  const url = new URL(request.url);
  const destination = url.searchParams.get("return_to")?.startsWith("/") && !url.searchParams.get("return_to")?.startsWith("//")
    ? url.searchParams.get("return_to")!
    : "/";
  return new Response(null, {
    status: 303,
    headers: {
      Location: destination,
      "Cache-Control": "private, no-store",
      "Set-Cookie": "edtech_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
    },
  });
}
