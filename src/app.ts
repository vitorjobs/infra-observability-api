import 'dotenv/config';
import fastify from "fastify";
import { appRoutes } from "./routes"
// import { PrometheusExporter } from "./services/monitoring/PrometheusExporterService";
import fastifyCors from "@fastify/cors";
import { PrometheusExporter } from './services/monitoring/PrometheusExporter';


export const app = fastify()
app.register(fastifyCors, {
  origin: '*' // ou especifique seus domínios
});

app.register(appRoutes)
app.register(PrometheusExporter)

app.get('/about', async (request, reply) => {
  return {
    nome: "API Veeam",
    descricao: "Este projeto coleta informações da API do Veeam One, produto da Veeam Backup, para monitoramento e automação.",
    tecnologias: [
      "Node.js",
      "TypeScript",
      "Fastify",
      "Prom-Client",
      "Prometheus",
      "Grafana",
      "Veeam Backup & Replication",
      "Veeam One",
      "Monitoramento de Jobs de Backup",
      "Monitoramento de Repositórios de Backup",
      "Monitoramento de Scale-Out Backup Repositories",
      "Monitoramento de VMs Protegidas",
      "Monitoramento de Tape Libraries",
      "Monitoramento de Exagrid",
      "Monitoramento de Compliance de VMs",
      "Monitoramento de Versão do Veeam One"
    ],
    fonte: "https://www.veeam.com/pt/products/veeam-one.html",
    status: "Em desenvolvimento"
  };
});
