import { Gauge, Registry } from 'prom-client';
import { GetVeeamOneAboutService } from '../services/veeamOne/about/GetVeeamOneAboutService';

const veeamAboutRegistry = new Registry();

const metrics = {
  veeamAboutInfo: new Gauge({
    name: 'veeam_one_info',
    help: 'Informações sobre o serviço Veeam ONE',
    labelNames: ['name', 'version'],
    registers: [veeamAboutRegistry],
  })
};

export async function updateVeeamAboutMetrics() {
  try {
    const aboutData = await GetVeeamOneAboutService();
    metrics.veeamAboutInfo.reset();

    metrics.veeamAboutInfo.set(
      {
        name: aboutData.name || 'unknown',
        version: aboutData.version || 'unknown'
      },
      1
    );

    // return veeamAboutRegistry.metrics();
  } catch (error) {
    console.error('Erro ao atualizar métricas do Veeam About:', error);
    return '# HELP veeam_one_info Informações sobre o serviço Veeam ONE\n' +
      '# TYPE veeam_one_info gauge\n';
  }
}

export async function getVeeamAboutMetrics() {
  // return await updateVeeamAboutMetrics();
  return veeamAboutRegistry.metrics();
}
// Atualiza as métricas periodicamente (opcional)
const UPDATE_INTERVAL = 130000; // 1 minuto
setInterval(updateVeeamAboutMetrics, UPDATE_INTERVAL);

// Atualiza imediatamente na inicialização
updateVeeamAboutMetrics().catch(console.error);