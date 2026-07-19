export const dynamic = 'force-dynamic';

import { liveEmitter } from "@/lib/eventEmitter";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const chapterId = url.searchParams.get("chapterId");

  if (!chapterId) {
    return new Response("Missing chapterId", { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      // Send initial heartbeat
      controller.enqueue(new TextEncoder().encode(`:\n\n`));

      const sendEvent = (data: any) => {
        try {
          const payload = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(new TextEncoder().encode(payload));
        } catch (e) {}
      };

      const eventName = `reaction:${chapterId}`;
      liveEmitter.on(eventName, sendEvent);

      // Keepalive interval
      const interval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(`:\n\n`));
        } catch (e) {
          clearInterval(interval);
        }
      }, 15000);

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

// POST endpoint to emit a reaction
export async function POST(req: Request) {
  try {
    const { chapterId, emoji, userId } = await req.json();

    if (!chapterId || !emoji) {
      return new Response("Missing fields", { status: 400 });
    }

    liveEmitter.emit(`reaction:${chapterId}`, {
      id: Math.random().toString(36).substring(7),
      emoji,
      userId,
      timestamp: Date.now()
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response("Server error", { status: 500 });
  }
}
