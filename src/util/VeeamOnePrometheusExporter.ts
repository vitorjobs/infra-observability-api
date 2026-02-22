// import { Gauge, Registry } from 'prom-client';
// import { listBackupJobs } from '../services/veeamOne/JobService';


// // Cria um registry específico para métricas do Veeam
// const veeamRegistry = new Registry();

// // Define todas as métricas exportadas NO SERVIÇO VEEAM
// const metrics = {
//   jobInfo: new Gauge({
//     name: 'veeam_backup_job_info',
//     help: 'Informações básicas do job de backup',
//     labelNames: ['name', 'status', 'lastRun'],
//     registers: [veeamRegistry],
//   }),
//   jobLastRunDuration: new Gauge({
//     name: 'veeam_backup_job_last_run_duration_seconds',
//     help: 'Duração da última execução do job de backup (em segundos)',
//     labelNames: ['name'],
//     registers: [veeamRegistry],
//   }),
//   jobAvgDuration: new Gauge({
//     name: 'veeam_backup_job_avg_duration_seconds',
//     help: 'Duração média das execuções do job de backup (em segundos)',
//     labelNames: ['name'],
//     registers: [veeamRegistry],
//   }),
//   jobLastTransferredBytes: new Gauge({
//     name: 'veeam_backup_job_last_transferred_data_bytes',
//     help: 'Volume de dados transferido na última execução (em bytes)',
//     labelNames: ['name'],
//     registers: [veeamRegistry],
//   }),
// };

// // Função que atualiza as métricas
// export async function updateVeeamMetrics() {
//   try {
//     const jobs = await listBackupJobs();

//     // Limpa as métricas anteriores
//     Object.values(metrics).forEach(metric => metric.reset());

//     // Atualiza métricas para cada job
//     jobs.forEach(job => {
//       const { name, status, lastRun, lastRunDurationSec, avgDurationSec, lastTransferredDataBytes } = job;

//       metrics.jobInfo.set(
//         { name, status, lastRun },
//         1 // Informação carregada via labels
//       );

//       metrics.jobLastRunDuration.set({ name }, lastRunDurationSec);
//       metrics.jobAvgDuration.set({ name }, avgDurationSec);
//       metrics.jobLastTransferredBytes.set({ name }, lastTransferredDataBytes);
//     });
//   } catch (error) {
//     console.error('Erro ao atualizar métricas do Veeam Backup:', error);
//   }
// }

// // Exportador no formato Prometheus
// export function getVeeamMetrics() {
//   return veeamRegistry.metrics();
// }

// // Atualização periódica (opcional)
// const UPDATE_INTERVAL = 60000; // 1 minuto
// setInterval(updateVeeamMetrics, UPDATE_INTERVAL);

// // Atualização imediata na inicialização
// updateVeeamMetrics().catch(console.error);

/** */
// import { Gauge, Registry } from 'prom-client';
// import { listBackupJobs } from '../services/veeamOne/JobService';


// // // Cria um registry exclusivo para as métricas dos jobs Veeam
// const veeamRegistry = new Registry();

// // Define as métricas para os jobs
// const metrics = {
//   jobInfo: new Gauge({
//     name: 'veeam_job_info',
//     help: 'Informações básicas do job de backup Veeam',
//     labelNames: ['name', 'status', 'lastRun'],
//     registers: [veeamRegistry],
//   }),
//   jobUp: new Gauge({
//     name: 'veeam_job_up',
//     help: 'Status do job de backup (1 = Success/Running, 0 = Failed)',
//     labelNames: ['name'],
//     registers: [veeamRegistry],
//   }),
//   jobLastRunDuration: new Gauge({
//     name: 'veeam_job_last_run_duration_seconds',
//     help: 'Duração da última execução do job (em segundos)',
//     labelNames: ['name'],
//     registers: [veeamRegistry],
//   }),
//   jobAvgDuration: new Gauge({
//     name: 'veeam_job_avg_duration_seconds',
//     help: 'Duração média das execuções do job (em segundos)',
//     labelNames: ['name'],
//     registers: [veeamRegistry],
//   }),
//   jobLastTransferred: new Gauge({
//     name: 'veeam_job_last_transferred_data_bytes',
//     help: 'Dados transferidos na última execução do job (em bytes)',
//     labelNames: ['name'],
//     registers: [veeamRegistry],
//   }),
// };

// //  Atualiza as métricas com base na API do Veeam
// export async function updateVeeamMetrics() {
//   try {
//     const jobs = await listBackupJobs();

//     // Limpa todas as métricas antes de atualizar
//     Object.values(metrics).forEach(metric => metric.reset());

//     jobs.forEach(job => {
//       const {
//         name,
//         status,
//         lastRun,
//         lastRunDurationSec,
//         avgDurationSec,
//         lastTransferredDataBytes
//       } = job;

//       metrics.jobInfo.set(
//         { name, status, lastRun },
//         1 // Informações carregadas como labels
//       );

//       // Define status como "up"
//       const upStatus = status === 'Running' || status === 'Success' ? 1 : 0;
//       metrics.jobUp.set({ name }, upStatus);

//       if (lastRunDurationSec !== null)
//         metrics.jobLastRunDuration.set({ name }, lastRunDurationSec);

//       if (avgDurationSec !== null)
//         metrics.jobAvgDuration.set({ name }, avgDurationSec);

//       if (lastTransferredDataBytes !== null)
//         metrics.jobLastTransferred.set({ name }, lastTransferredDataBytes);
//     });
//   } catch (error) {
//     console.error('Erro ao atualizar métricas do Veeam Backup:', error);
//   }
// }

// // // Exporta as métricas para o endpoint Prometheus
// export function getVeeamMetrics() {
//   return veeamRegistry.metrics();
// }

// // // Atualização periódica automática
// const UPDATE_INTERVAL = 60000; // 1 minuto
// setInterval(updateVeeamMetrics, UPDATE_INTERVAL);

// // // Atualização imediata na inicialização
// updateVeeamMetrics().catch(console.error);

/** */

import { Gauge, Registry } from 'prom-client';
import { listBackupJobs } from '../services/veeamOne/jobs/GetJobsService';

// Registry dedicado para as métricas do Veeam
const veeamRegistry = new Registry();

// Métricas definidas
const metrics = {
  jobInfo: new Gauge({
    name: 'veeam_job_info',
    help: 'Informações básicas do job de backup Veeam',
    labelNames: ['name', 'status', 'lastRun'],
    registers: [veeamRegistry],
  }),
  jobUp: new Gauge({
    name: 'veeam_job_up',
    help: 'Status do job de backup (1 = Success/Running, 0 = Failed)',
    labelNames: ['name'],
    registers: [veeamRegistry],
  }),
  jobLastRunDuration: new Gauge({
    name: 'veeam_job_last_run_duration_seconds',
    help: 'Duração da última execução do job (em segundos)',
    labelNames: ['name'],
    registers: [veeamRegistry],
  }),
  jobAvgDuration: new Gauge({
    name: 'veeam_job_avg_duration_seconds',
    help: 'Duração média das execuções do job (em segundos)',
    labelNames: ['name'],
    registers: [veeamRegistry],
  }),
  jobLastTransferred: new Gauge({
    name: 'veeam_job_last_transferred_data_bytes',
    help: 'Dados transferidos na última execução do job (em bytes)',
    labelNames: ['name'],
    registers: [veeamRegistry],
  }),
};

let metricsInitialized = false;

// Atualiza as métricas com base nos dados retornados pela API
export async function updateVeeamMetrics(): Promise<string> {
  try {
    const jobs = await listBackupJobs();

    // Limpa métricas antes de atualizar
    Object.values(metrics).forEach(metric => metric.reset());

    for (const job of jobs) {
      const {
        name,
        status,
        lastRun,
        lastRunDurationSec,
        avgDurationSec,
        lastTransferredDataBytes,
      } = job;

      // Informações básicas do job
      metrics.jobInfo.set({ name, status, lastRun }, 1);

      // Status up/down
      const upStatus = status === 'Running' || status === 'Success' ? 1 : 0;
      metrics.jobUp.set({ name }, upStatus);

      // Duração da última execução
      if (lastRunDurationSec !== null) {
        metrics.jobLastRunDuration.set({ name }, lastRunDurationSec);
      }

      // Duração média das execuções
      if (avgDurationSec !== null) {
        metrics.jobAvgDuration.set({ name }, avgDurationSec);
      }

      // Dados transferidos
      if (lastTransferredDataBytes !== null) {
        metrics.jobLastTransferred.set({ name }, lastTransferredDataBytes);
      }
    }

    metricsInitialized = true;
    return veeamRegistry.metrics();
  } catch (error) {
    console.error('Erro ao atualizar métricas do Veeam Backup:', error);
    return '# erro ao gerar métricas do Veeam\n';
  }
}

// Retorna as métricas prontas (se inicializadas)
// export async function getVeeamMetrics(): Promise<string> {
//   if (!metricsInitialized) {
//     return '# Veeam metrics not ready yet\n';
//   }
//   return await veeamRegistry.metrics();
// }
export function getVeeamMetrics() {
  if (!metricsInitialized) return '# Veeam metrics not ready yet\n';
  return veeamRegistry.metrics(); // ✅ retorna string formatada
}

// Atualização automática a cada 60 segundos
setInterval(() => {
  updateVeeamMetrics().catch(console.error);
}, 1200000);

// Atualiza imediatamente ao inicializar o módulo
// updateVeeamMetrics().catch(console.error);
