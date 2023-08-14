import { error } from "console";
import type { BroadcastChannelEvent } from "../types";
// Temporary fix because BroadcastChannel has no types in bun-types
export type BroadcastChannel = any;

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

// Important if you want to create unique streams for each request
// Your should use unique channel name for each request. Important if you provide live data from different sources or unique for each user or group of users.
// Otherwise you will get a single stream for all requests. Useful to provide live data from a common single place.
export const sseBCSubscribe = (req: Request, channel: string, options: Partial<SSEOptions> = {
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

      const handler = async (payload: BroadcastChannelEvent): Promise<void> => {
        console.log('payload', payload);
        const { event = undefined, data = undefined } = payload.data;
        if (event !== undefined) {
          await controller.write(`event:${event}\n`);
        }
        await controller.write(`id:${id}\n`)
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

      bc.addEventListener('message', (event: BroadcastChannelEvent) => {
        debug(`emitting to channel '${channel}'`);
        handler(event);
      });
      bc.addEventListener('messageerror', (event: BroadcastChannelEvent) => {
        error(`message error on channel '${channel}'`);
        closeConnection('Message error')
      });

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
