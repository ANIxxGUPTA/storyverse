export const dynamic = 'force-dynamic';

import { liveEmitter } from "@/lib/eventEmitter";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const communityGenre = url.searchParams.get("genre");

  if (!communityGenre) {
    return new Response("Missing genre", { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      // Send initial heartbeat to keep connection alive
      controller.enqueue(new TextEncoder().encode(`:\n\n`));

      const sendEvent = (data: any) => {
        try {
          // SSE format: "data: {json}\n\n"
          const payload = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(new TextEncoder().encode(payload));
        } catch (e) {
          // Stream might be closed
        }
      };

      const eventName = `chat:${communityGenre.toLowerCase()}`;
      liveEmitter.on(eventName, sendEvent);

      // Keepalive interval
      const interval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(`:\n\n`));
        } catch (e) {
          clearInterval(interval);
        }
      }, 15000); // 15 seconds

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        liveEmitter.off(eventName, sendEvent);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
