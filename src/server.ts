import 'dotenv/config';
import { app } from './app';

const HOST = process.env.HOST;
const PORT = parseInt(process.env.PORT || '3002', 10);

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
