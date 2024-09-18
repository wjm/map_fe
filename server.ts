import next from "next";
import { createProxyServer } from 'http-proxy';
import { createServer } from "http";
import { parse } from "url";

const port = parseInt(process.env.PORT || '3003', 10);
const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const proxy = createProxyServer({
  target: 'ws://api:8080/ws',
  changeOrigin: true,
  autoRewrite: false,
  ws: true,
  ignorePath: true,
});

const server = createServer(async (req, res) => {
  try {
    const parsedUrl = parse(req.url!, true);

    await handle(req, res, parsedUrl);
  } catch (err) {
    console.error('Error occurred handling', req.url, err);
    res.statusCode = 500;
    res.end('internal server error');
  }
});

// Proxy websocket connections to backend
server.on('upgrade', async (req, socket, head) => {
    proxy.ws(req, socket, head);
});

app.prepare().then(() => {
  server
    .once('error', (err) => {
      console.error('Error occurred starting server', err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(
        `> Server listening at http://${hostname}:${port} as ${
          dev ? 'development' : process.env.NODE_ENV
        }`,
      );
    });
});
