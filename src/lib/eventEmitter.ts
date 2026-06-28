import { EventEmitter } from "events";

// Create a singleton event emitter to be shared across API routes in Next.js development/production.
// Note: In a serverless environment (like Vercel), this only works if connections hit the same lambda instance.
// For true serverless scaling, Redis PubSub or Pusher is recommended.
// Since we are running on a persistent Node server (next start/dev), this memory emitter works perfectly.

declare global {
  var globalEventEmitter: EventEmitter | undefined;
}

export const liveEmitter = global.globalEventEmitter || new EventEmitter();

if (process.env.NODE_ENV !== "production") {
  global.globalEventEmitter = liveEmitter;
}

// Increase max listeners since many users could be connected
liveEmitter.setMaxListeners(100);
