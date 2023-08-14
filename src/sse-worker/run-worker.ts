import { Worker } from "node:worker_threads";

export function runWorker(fn: Function, workerOpts: WorkerOptions = {
  ref: true,
  smol: true
}) {
  if (!(fn instanceof Function)) {
    throw new Error('Argument must be a function');
  }

  const fnData = new Blob(['(' + fn.toString() + ')()'], {
    type: 'text/javascript',
  });

  const worker = new Worker(URL.createObjectURL(fnData), workerOpts);

  return worker;
}