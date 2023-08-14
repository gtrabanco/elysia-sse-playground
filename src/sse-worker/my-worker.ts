import { WORKER_CHANNEL_NAME } from "./channel";

const sse = new BroadcastChannel(WORKER_CHANNEL_NAME);

console.log('Worker')

const int1 = setInterval(() => {
  sse({
    event: "timestamp",
    data: `worker: ${Date.now()}`
  });
}, 1000);

onmessage = function (e: MessageEvent) {
  console.info('worker received message', e.data);
  console.log({
    e,
    self,
    this,
    global,
    globalThis,
  })
}
