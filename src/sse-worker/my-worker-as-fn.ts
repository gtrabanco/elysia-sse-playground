import { WORKER_CHANNEL_NAME } from "./channel";


export function myWorkerAsFn() {
  const sse = new BroadcastChannel(WORKER_CHANNEL_NAME);

  const int1 = setInterval(() => {
    sse({
      event: "timestamp",
      data: `worker: ${Date.now()}`
    });
  }, 1000);

  return () => {
    clearInterval(int1);
  }
}
