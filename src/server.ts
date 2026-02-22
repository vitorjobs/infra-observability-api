import 'dotenv/config';
import os from 'os';
import { app } from './app';

declare module 'fastify' {
  interface FastifyRequest {
    startTime?: number;
  }
}

const HOST = process.env.HOST;
const PORT = parseInt(process.env.PORT || '3002', 10);

app.register(async (instance) => {
  instance.get('/health', async (request, reply) => {
    return {
    status: 'healthy',
    platform: process.platform,
    nodeVersion: process.version,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuCores: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    hostname: os.hostname(),
    environment: process.env.NODE_ENV
    };
  });
});

app.get('/request-info', async (req, reply) => {
  return {
    method: req.method,
    url: req.url,
    headers: req.headers,
    ip: req.ip,
    hostname: req.hostname,
    query: req.query,
    params: req.params,
    protocol: req.protocol
  }
})
// Verificar como usar depois 
// app.addHook('onRequest', async (req, reply) => {
//   req.startTime = Date.now()
// })

// app.addHook('onResponse', async (req, reply) => {
//   const duration = typeof req.startTime === 'number' ? Date.now() - req.startTime : undefined
//   if (typeof duration === 'number') {
//     console.log(`Request levou ${duration}ms`)
//   } else {
//     console.log('Request levou tempo desconhecido')
//   }
// })

app.listen({
  host: HOST,
  port: PORT
})
  .then(() => {
    console.log(`🚀 HTTP SERVER RUNNING ON http://${HOST}:${PORT}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });

// import { app } from "./app"
// import { env } from "./env"

// app.listen({
//   host: env.HOST,
//   port: env.PORT
// }).then(() => {
//   console.log(`HTTP SERVER RUNNING ON PORT:`, process.env.PORT)
// })
