import staticPlugin from "@elysiajs/static";
import { Context, Elysia } from "elysia";
import { sseEmitter as sseEmitBC, sseSubscribe as sseSubscribeBC } from "./sse-broadcast-channel";
import { sseEmit, sseSubscribe } from "./sse-event-emitter";



const app = new Elysia()
  .use(staticPlugin({
    prefix: '',

  }))
  // .get("/bcc", (ctx) => {
  //   const bbc = bbc(ctx);
  //   const response = sseSubscribe(ctx.request, "bbc", {
  //     onClose: () => {
  //       bbc?.();
  //     }
  //   });
  //   return response;
  // })
  .get("/stream-bc", (ctx: Context) => {
    const req = ctx.request;
    const tser = sseEmitBC("timestamp");

    const int1 = setInterval(() => {
      tser({
        event: "timestamp",
        data: Date.now()
      });
    }, 1000);


    const int2 = setInterval(() => {
      tser({
        event: "title",
        data: 'A new title ' + Date.now().toString().substring(7)
      });
    }, 5000);

    const response = sseSubscribeBC(req, "timestamp", {
      onClose: () => {
        clearInterval(int1);
        clearInterval(int2);
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


