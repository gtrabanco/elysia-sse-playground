export type SSEEvent = {
  event?: string;
  data?: unknown;
}

export type SSEOptions = {
  retry: number;
  closeOnMessageError: boolean;
  onClose: () => void;
  onMessageError: () => void;
}

function info(...args: unknown[]): void {
  console.info(...args);
}

function debug(...args: unknown[]): void {
  console.debug(...args);
}


export const sseSubscribe = (req: Request, channel: string, options: Partial<SSEOptions> = {
  retry: 1000,
  closeOnMessageError: false,
  onClose: () => { },
  onMessageError: () => { },
}): Response => {
  info(`subscribing to channel '${channel}'`);
  const bc = new BroadcastChannel(channel);
  const stream = new ReadableStream({
    type: 'direct',
    async pull(controller: ReadableStreamDirectController) {
      let id = +(req.headers.get('last-event-id') ?? 1);

      if (options.retry !== undefined) {
        await controller.write(`retry:${options.retry}\n`);
      }

      const handler = async (payload: SSEEvent): Promise<void> => {
        const { event = undefined, data = undefined } = payload as Record<string, unknown>;
        await controller.write(`id:${id}\n`)
        if (event !== undefined) {
          await controller.write(`event:${event}\n`);
        }
        console.log('emitting data', `data:${data !== undefined ? JSON.stringify(data) : ''}`)
        await controller.write(`data:${data !== undefined ? JSON.stringify(data) : ''}\n\n`);
        await controller.flush();
        id++;
      };

      function closeConnection(reason: string | undefined = 'reason unknown') {
        return () => {
          info(`unsubscribing from channel '${channel}': ${reason}`);
          options.onClose?.();
          bc.close();
          controller.close();
        }
      }

      bc.addEventListener('message', handler);
      bc.addEventListener('messageerror', closeConnection('Message error'));

      req.signal.addEventListener('abort', closeConnection('Connection aborted'));

      req.signal.addEventListener('close', closeConnection('Connection closed'));

      if (req.signal.aborted) {
        closeConnection('Connection aborted originally')();
      }
      return new Promise(() => void 0);
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  });
};

export const sseEmitter = (channel: string): ((payload?: SSEEvent) => void) => {
  const bc = new BroadcastChannel(channel);
  return (payload?: SSEEvent) => {
    debug(`emitting to channel '${channel}'`);
    bc.postMessage(payload);
  };
};