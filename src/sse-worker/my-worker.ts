import { WORKER_CHANNEL_NAME } from "./channel";

const sse = new BroadcastChannel(WORKER_CHANNEL_NAME);

const int1 = setInterval(() => {
  console.log('Sending from worker')
  sse.postMessage({
    event: "timestamp",
    data: Date.now()
  });
}, 1000);

onmessage = function (e: MessageEvent) {
  console.info('worker received message', e.data);
  close();
}
