import { Context } from "elysia";
import { sseEmitter } from "../sse-broadcast-channel";

function myWorker() {
  const bc = new BroadcastChannel('bbc');
  const tser = sseEmitter("timestamp");

  const int1 = setInterval(() => {
    tser({
      event: "timestamp",
      data: Date.now()
    });
  }, 1000);

  return () => {
    clearInterval(int1);
  }
}

export function bbc(ctx: Context) {

  return () => { }
}