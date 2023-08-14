import { Worker } from "node:worker_threads";

export function setupWorker(fn: () => any) {
  if (!(fn instanceof Function)) {
    throw new Error('Argument must be a function');
  }

  const fnData = new Blob(['(' + fn.toString() + ')()'], {
    type: 'text/javascript',
  });

  const worker = new Worker(URL.createObjectURL(fnData), {
    ref: true,
    smol: true
  });

  return worker;
}