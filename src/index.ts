import staticPlugin from "@elysiajs/static";
import { Context, Elysia } from "elysia";
import { join } from "node:path";
import { sseBCSubscribe } from "./sse-broadcast-channel";
import { sseEmit, sseSubscribe } from "./sse-event-emitter";
import { WORKER_CHANNEL_NAME } from "./sse-worker/channel";



const app = new Elysia()
  .use(staticPlugin({
    prefix: '',

  }))
  .get("static-file.html", () => {
    const rw = new HTMLRewriter();
    rw.on("h1", {
      element: (element) => {
        // element.append(" with something more", { html: false });
        // element.replace("<h1>Another title</h1>", { html: true });
        element.setInnerContent("Inner title");
      },
      // text: (text) => {
      //   const trimmed = text.text.trim();
      //   if (trimmed.length > 0)
      //     text.replace("Another new title", {
      //       html: true,
      //     });
      // },
    });
    const file = Bun.file(join("public", "static-file.html"));
    return rw.transform(
      new Response(file, {
        headers: new Headers({
          accept: "text/html",
        }),
      }),
    );
  })
  .get("/stream-worker", (ctx: Context) => {
    const { request } = ctx;
    // const worker = runWorkerAsSingleton(myWorker);
    const worker = new Worker(new URL('./sse-worker/my-worker.ts', import.meta.url));
    worker.postMessage({ payload: 'hello' });
    const response = sseBCSubscribe(request, WORKER_CHANNEL_NAME, {
      onClose: () => {
        worker.terminate();
      }
    })

    return response;
  })
  .get("/stream-bc", (ctx: Context) => {
    const req = ctx.request;
    const bc = new BroadcastChannel("timestamp");
    bc.addEventListener('close', () => {
      console.log('close')
    })

    const int1 = setInterval(() => {
      bc.postMessage({
        event: "timestamp",
        data: Date.now()
      });
    }, 1000);


    const int2 = setInterval(() => {
      bc.postMessage({
        event: "title",
        data: 'A new title ' + Date.now().toString().substring(7)
      });
    }, 5000);

    const response = sseBCSubscribe(req, "timestamp", {
      onClose: () => {
        clearInterval(int1);
        clearInterval(int2);
        bc.close()
      }
    });
    return response;
  })
  .get("/stream-ee", (ctx: Context) => {
    const req = ctx.request;

    const int1 = setInterval(() => {
      sseEmit("timestamp", {
        event: "timestamp",
        data: Date.now()
      });
    }, 1000);


    const int2 = setInterval(() => {
      sseEmit("timestamp", {
        event: "title",
        data: 'A new title ' + Date.now().toString().substring(7)
      });
    }, 5000);

    const response = sseSubscribe(req, "timestamp", {
      onClose: () => {
        clearInterval(int1);
        clearInterval(int2);
      }
    });
    return response;
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);


