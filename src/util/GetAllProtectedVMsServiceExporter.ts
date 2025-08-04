// import { Gauge, Registry } from 'prom-client';
// import { GetAllProtectedVMsService } from '../services/veeamOne/GetAllProtectedVMsService';

// const protectedVMRegistry = new Registry();

// const vmMetrics = {
//   usedSize: new Gauge({
//     name: 'veeam_vm_used_size_bytes',
//     help: 'Tamanho real em uso na VM (em bytes)',
//     labelNames: ['name', 'jobName'],
//     registers: [protectedVMRegistry],
//   }),
//   provisionedSize: new Gauge({
//     name: 'veeam_vm_provisioned_size_bytes',
//     help: 'Tamanho provisionado da VM (em bytes)',
//     labelNames: ['name', 'jobName'],
//     registers: [protectedVMRegistry],
//   }),
//   lastProtected: new Gauge({
//     name: 'veeam_vm_last_protected_timestamp',
//     help: 'Timestamp da última proteção da VM',
//     labelNames: ['name', 'jobName'],
//     registers: [protectedVMRegistry],
//   }),
// };

// let metricsInitialized = false;

// export async function protectedVMMetrics(): Promise<string> {
//   try {
//     const vms = await GetAllProtectedVMsService();

//     // Reset métricas antes de atualizar
//     Object.values(vmMetrics).forEach(metric => metric.reset());

//     vms.forEach(vm => {
//       const {
//         name,
//         jobName,
//         usedSourceSizeBytes,
//         provisionedSourceSizeBytes,
//         lastProtectedDate,
//       } = vm;

//       const labels = { name, jobName };

//       vmMetrics.usedSize.set(labels, usedSourceSizeBytes || 0);
//       vmMetrics.provisionedSize.set(labels, provisionedSourceSizeBytes || 0);

//       if (lastProtectedDate) {
//         const timestamp = Math.floor(new Date(lastProtectedDate).getTime() / 1000);
//         vmMetrics.lastProtected.set(labels, timestamp);
//       }
//     });

//     metricsInitialized = true;
//     return protectedVMRegistry.metrics();
//   } catch (error) {
//     console.error('Erro ao atualizar métricas de VMs protegidas:', error);
//     return '# erro ao gerar métricas de VMs protegidas\n';
//   }
// }

// export async function getProtectedVMMetrics(): Promise<string> {
//   if (!metricsInitialized) return '# Protected VM metrics not ready yet\n';
//   return await protectedVMRegistry.metrics();
// }

// // Atualização periódica a cada 60 segundos
// setInterval(() => {
//   protectedVMMetrics().catch(console.error);
// }, 60_000);

// // Atualização imediata ao carregar
// protectedVMMetrics().catch(console.error);


// import { Registry, Gauge } from 'prom-client';
// import { GetAllProtectedVMsService } from '../services/veeamOne/GetAllProtectedVMsService';


// const protectedVMRegistry = new Registry();

// // Função utilitária para sanitizar valores de labels (remover caracteres inválidos)
// function sanitizeLabel(value: string): string {
//   return value.replace(/[^\w\-.:]/g, '_');
// }

// const vmMetrics = {
//   usedSize: new Gauge({
//     name: 'veeam_vm_used_size_bytes',
//     help: 'Tamanho real em uso na VM (em bytes)',
//     labelNames: ['name', 'jobName'],
//     registers: [protectedVMRegistry],
//   }),
//   provisionedSize: new Gauge({
//     name: 'veeam_vm_provisioned_size_bytes',
//     help: 'Tamanho provisionado da VM (em bytes)',
//     labelNames: ['name', 'jobName'],
//     registers: [protectedVMRegistry],
//   }),
//   lastProtected: new Gauge({
//     name: 'veeam_vm_last_protected_timestamp',
//     help: 'Timestamp da última proteção da VM',
//     labelNames: ['name', 'jobName'],
//     registers: [protectedVMRegistry],
//   }),
// };

// export async function protectedVMMetrics(): Promise<void> {
//   try {
//     const vms = await GetAllProtectedVMsService();

//     // Resetar as métricas antes de atualizar (evita acúmulo de valores obsoletos)
//     protectedVMRegistry.resetMetrics();

//     vms.forEach(vm => {
//       const {
//         name,
//         jobName,
//         usedSourceSizeBytes,
//         provisionedSourceSizeBytes,
//         lastProtectedDate,
//       } = vm;

//       const labels = {
//         name: sanitizeLabel(name),
//         jobName: sanitizeLabel(jobName),
//       };

//       if (usedSourceSizeBytes != null) {
//         vmMetrics.usedSize.set(labels, usedSourceSizeBytes);
//       }

//       if (provisionedSourceSizeBytes != null) {
//         vmMetrics.provisionedSize.set(labels, provisionedSourceSizeBytes);
//       }

//       if (lastProtectedDate) {
//         const timestamp = Math.floor(new Date(lastProtectedDate).getTime() / 1000);
//         vmMetrics.lastProtected.set(labels, timestamp);
//       }
//     });
//   } catch (error) {
//     console.error('Erro ao atualizar métricas de VMs protegidas:', error);
//   }
// }

// export { protectedVMRegistry };

import { Gauge, Registry } from 'prom-client';
import { GetAllProtectedVMsService } from '../services/veeamOne/compliance/GetAllProtectedVMsService';


const protectedVMRegistry = new Registry();

const vmMetrics = {
  usedSize: new Gauge({
    name: 'veeam_vm_used_size_bytes',
    help: 'Tamanho real em uso na VM (em bytes)',
    labelNames: ['name', 'jobName'],
    registers: [protectedVMRegistry],
  }),
  provisionedSize: new Gauge({
    name: 'veeam_vm_provisioned_size_bytes',
    help: 'Tamanho provisionado da VM (em bytes)',
    labelNames: ['name', 'jobName'],
    registers: [protectedVMRegistry],
  }),
  lastProtected: new Gauge({
    name: 'veeam_vm_last_protected_timestamp',
    help: 'Timestamp da última proteção da VM',
    labelNames: ['name', 'jobName'],
    registers: [protectedVMRegistry],
  }),
};

let metricsInitialized = false;

export async function protectedVMMetrics(): Promise<string> {
  try {
    const vms = await GetAllProtectedVMsService();

    // Verifica se a resposta é um array válido
    if (!Array.isArray(vms)) {
      throw new Error('Resposta da API não é um array válido');
    }

    // Reset métricas antes de atualizar
    Object.values(vmMetrics).forEach(metric => metric.reset());

    vms.forEach(vm => {
      try {
        const {
          name = 'unknown',
          jobName = 'unknown',
          usedSourceSizeBytes = 0,
          provisionedSourceSizeBytes = 0,
          lastProtectedDate = null,
        } = vm;

        const labels = { name, jobName };

        // Validação dos valores numéricos
        vmMetrics.usedSize.set(labels, Number(usedSourceSizeBytes) || 0);
        vmMetrics.provisionedSize.set(labels, Number(provisionedSourceSizeBytes) || 0);

        if (lastProtectedDate) {
          try {
            const timestamp = Math.floor(new Date(lastProtectedDate).getTime() / 1000);
            if (!isNaN(timestamp)) {
              vmMetrics.lastProtected.set(labels, timestamp);
            }
          } catch (dateError) {
            console.error(`Erro ao processar data para VM ${name}:`, dateError);
          }
        }
      } catch (vmError) {
        console.error('Erro ao processar VM:', vmError);
      }
    });

    metricsInitialized = true;
    return protectedVMRegistry.metrics();
  } catch (error) {
    console.error('Erro ao atualizar métricas de VMs protegidas:', error);
    // Retorna métricas vazias em caso de erro para evitar formato inválido
    return '# HELP veeam_vm_used_size_bytes Tamanho real em uso na VM (em bytes)\n' +
      '# TYPE veeam_vm_used_size_bytes gauge\n' +
      '# HELP veeam_vm_provisioned_size_bytes Tamanho provisionado da VM (em bytes)\n' +
      '# TYPE veeam_vm_provisioned_size_bytes gauge\n' +
      '# HELP veeam_vm_last_protected_timestamp Timestamp da última proteção da VM\n' +
      '# TYPE veeam_vm_last_protected_timestamp gauge\n';
  }
}

export async function getProtectedVMMetrics(): Promise<string> {
  if (!metricsInitialized) {
    return '# HELP veeam_vm_metrics_initialized Indica se as métricas foram inicializadas\n' +
      '# TYPE veeam_vm_metrics_initialized gauge\n' +
      'veeam_vm_metrics_initialized 0\n';
  }
  try {
    return await protectedVMRegistry.metrics();
  } catch (error) {
    console.error('Erro ao obter métricas:', error);
    return '# erro ao gerar métricas de VMs protegidas\n';
  }
}

// Atualização periódica a cada 60 segundos
const updateInterval = setInterval(() => {
  protectedVMMetrics().catch(console.error);
}, 12000000);

// Limpeza do intervalo quando necessário
process.on('SIGTERM', () => clearInterval(updateInterval));
process.on('SIGINT', () => clearInterval(updateInterval));

// Atualização imediata ao carregar
protectedVMMetrics().catch(console.error);