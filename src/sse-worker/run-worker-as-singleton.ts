import { Worker } from "node:worker_threads";
import { runWorker } from "./run-worker";
// Temporary fix because BroadcastChannel has no types in bun-types
type BroadcastChannel = any;

// Commented here just to publish this code in gist
// function runWorker(fn: Function, workerOpts: WorkerOptions = {
//   ref: true,
//   smol: true
// }) {
//   if (!(fn instanceof Function)) {
//     throw new Error('Argument must be a function');
//   }
//   const fnData = new Blob(['(' + fn.toString() + ')()'], {
//     type: 'text/javascript',
//   });
//   const worker = new Worker(URL.createObjectURL(fnData), workerOpts);
//   return worker;
// }

let workers: Map<string, Worker> | undefined;

if (!workers) {
  workers = new Map<string, Worker>();
}

export function runWorkerAsSingleton(fn: Function, workerOpts: WorkerOptions = {
  ref: true,
  smol: true
}) {
  if (!(fn instanceof Function)) {
    throw new Error('Argument must be a function');
  }

  const fnStr = fn.toString();
  const storedWorker = workers!.get(fnStr);
  if (storedWorker) {
    return storedWorker;
  }

  const worker = runWorker(fn, workerOpts);

  workers!.set(fnStr, worker);
  return worker;
}

