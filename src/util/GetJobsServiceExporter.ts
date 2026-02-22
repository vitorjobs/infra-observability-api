import { Gauge, Registry } from 'prom-client';
import { listBackupJobs } from '../services/veeamOne/jobs/GetJobsService';


const veeamRegistry = new Registry();

// Métricas agrupadas por status
const metrics = {
  jobInfo: new Gauge({
    name: 'veeam_job_info',
    help: 'Informações básicas do job de backup Veeam',
    labelNames: ['name', 'status', 'lastRun'],
    registers: [veeamRegistry],
  }),
  jobSuccess: new Gauge({
    name: 'veeam_job_success',
    help: 'Jobs com status Success',
    labelNames: ['name'],
    registers: [veeamRegistry],
  }),
  jobRunning: new Gauge({
    name: 'veeam_job_running',
    help: 'Jobs em execução (Running)',
    labelNames: ['name'],
    registers: [veeamRegistry],
  }),
  jobFailed: new Gauge({
    name: 'veeam_job_failed',
    help: 'Jobs com falha (Failed)',
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
let lastMetrics = '# Métricas ainda não carregadas\n';

export async function updateVeeamMetrics(): Promise<void> {
  try {
    const jobs = await listBackupJobs();

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

      metrics.jobInfo.set({ name, status, lastRun }, 1);

      // Classificação por status em métricas distintas
      if (status === 'Success') {
        metrics.jobSuccess.set({ name }, 1);
      } else if (status === 'Running') {
        metrics.jobRunning.set({ name }, 1);
      } else if (status === 'Failed') {
        metrics.jobFailed.set({ name }, 1);
      }

      if (lastRunDurationSec !== null) {
        metrics.jobLastRunDuration.set({ name }, lastRunDurationSec);
      }

      if (avgDurationSec !== null) {
        metrics.jobAvgDuration.set({ name }, avgDurationSec);
      }

      if (lastTransferredDataBytes !== null) {
        metrics.jobLastTransferred.set({ name }, lastTransferredDataBytes);
      }
    }

    metricsInitialized = true;
    lastMetrics = await veeamRegistry.metrics();
  } catch (error) {
    console.error('Erro ao atualizar métricas do Veeam Backup:', error);
    lastMetrics = '# erro ao atualizar métricas do Veeam\n';
  }
}

export function getVeeamMetrics(): string {
  if (!metricsInitialized) {
    return '# Veeam metrics not ready yet\n';
  }
  return lastMetrics;
}

// Atualiza periodicamente a cada 5 minutos
setInterval(() => {
  updateVeeamMetrics().catch(console.error);
}, 5 * 60 * 1000);

updateVeeamMetrics().catch(console.error);
