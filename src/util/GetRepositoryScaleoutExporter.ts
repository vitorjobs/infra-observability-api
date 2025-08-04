import { Gauge, Registry } from 'prom-client';
import { RepositoryScaleoutService } from '../services/veeamOne/repositories/GetRepositoryScaleoutService';



// Cria um registry específico para as métricas do Scale-Out Backup Repository
const scaleOutRepositoryRegistry = new Registry();

// Define as métricas para os repositórios Scale-Out
const metrics = {
  // Metricas para cada instância do job de backup
  repositoryInfo: new Gauge({
    name: 'veeam_sobr_repository_info',
    help: 'Informações sobre o Scale-Out Backup Repository do Veeam',
    labelNames: ['name', 'state', 'policy', 'copyPolicy', 'encryptArchivedData'],
    registers: [scaleOutRepositoryRegistry],
  }),
  capacityBytes: new Gauge({
    name: 'veeam_sobr_capacity_bytes',
    help: 'Capacidade total do repositório em bytes',
    labelNames: ['name'],
    registers: [scaleOutRepositoryRegistry],
  }),
  freeSpaceBytes: new Gauge({
    name: 'veeam_sobr_free_space_bytes',
    help: 'Espaço livre do repositório em bytes',
    labelNames: ['name'],
    registers: [scaleOutRepositoryRegistry],
  }),
  runningTasks: new Gauge({
    name: 'veeam_sobr_running_tasks',
    help: 'Número de tarefas em execução no repositório',
    labelNames: ['name'],
    registers: [scaleOutRepositoryRegistry],
  }),
  outOfSpaceInDays: new Gauge({
    name: 'veeam_sobr_out_of_space_in_days',
    help: 'Estimativa de dias para o repositório ficar sem espaço',
    labelNames: ['name'],
    registers: [scaleOutRepositoryRegistry],
  }),
  movePolicyInDays: new Gauge({
    name: 'veeam_sobr_move_policy_in_days',
    help: 'Dias para a política de mover dados ser aplicada',
    labelNames: ['name'],
    registers: [scaleOutRepositoryRegistry],
  }),
  archivingPolicyInDays: new Gauge({
    name: 'veeam_sobr_archiving_policy_in_days',
    help: 'Dias para a política de arquivamento ser aplicada',
    labelNames: ['name'],
    registers: [scaleOutRepositoryRegistry],
  }),
};

// Função para atualizar as métricas
export async function updateScaleOutRepositoryMetrics() {
  try {
    const apiResponse = await RepositoryScaleoutService();
    const scaleOutRepositories = apiResponse.items; // Acessa a propriedade 'items'

    // Resetar todas as métricas antes de atualizar
    Object.values(metrics).forEach(metric => metric.reset());

    // Itera sobre os dados e atualiza as métricas
    if (scaleOutRepositories && Array.isArray(scaleOutRepositories)) {
      scaleOutRepositories.forEach((repo: any) => {
        // Métrica de informação
        metrics.repositoryInfo.set(
          {
            name: repo.name,
            state: repo.state,
            policy: repo.scaleoutRepositoryPolicy,
            copyPolicy: String(repo.copyPolicy),
            encryptArchivedData: String(repo.encryptArchivedData)
          },
          1
        );

        // Métricas de capacidade e tarefas
        metrics.capacityBytes.set({ name: repo.name }, repo.capacityBytes);
        metrics.freeSpaceBytes.set({ name: repo.name }, repo.freeSpaceBytes);
        metrics.runningTasks.set({ name: repo.name }, repo.runningTasks);
        metrics.outOfSpaceInDays.set({ name: repo.name }, repo.outOfSpaceInDays);
        metrics.movePolicyInDays.set({ name: repo.name }, repo.movePolicyInDays);
        metrics.archivingPolicyInDays.set({ name: repo.name }, repo.archivingPolicyInDays);
      });
    } else {
      console.warn('A resposta da API para repositórios não contém a propriedade "items" ou ela não é um array.');
    }
  } catch (error) {
    console.error('Erro ao atualizar métricas do Scale-Out Backup Repository:', error);
  }
}

// Função para obter as métricas no formato do Prometheus
export function getScaleOutRepositoryMetrics() {
  return scaleOutRepositoryRegistry.metrics();
}

// Atualiza as métricas periodicamente (opcional)
const UPDATE_INTERVAL = 120000; // x minutos
setInterval(updateScaleOutRepositoryMetrics, UPDATE_INTERVAL);

// Atualiza imediatamente na inicialização
updateScaleOutRepositoryMetrics().catch(console.error);