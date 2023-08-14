# Server Sent Events

This is playground to check server sent events.

## Run

```bash
git clone https://github.com/gtrabanco/elysia-sse-playground
cd elysia-sse-playground
bun install
bun --watch .
```

## HTML Samples

### bc.html

This check how works consuming the endpoint `/stream-bc` which a sample of SSE that use `BroadcastChannel` to send the message to all clients.

### ee.html

This check how works consuming the endpoint `/stream-ee` which a sample of SSE that use `EventEmitter` to send the message to all clients.

### server-worker.html (TODO)

**TODO**

This check how works consuming the endpoint `/stream-worker` which a sample of SSE that use `BroadcastChannel` to send the message to all clients. The difference is that the server messages are sent from a worker.
