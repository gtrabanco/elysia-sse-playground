export type BroadcastChannelEvent = {
  type: 'message' | 'messageerror';
  data: SSEEvent;
}

export type WorkerOptions = Partial<{
  smol: boolean;
  ref: boolean;
}>;