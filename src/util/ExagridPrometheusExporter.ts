import { Gauge, Registry } from 'prom-client';
import { GetExagridInforService } from '../services/exagrid/GetExagridInforService';


// Cria um registry específico para métricas do Exagrid
const exagridRegistry = new Registry();

// Define todas as métricas que você quer exportar
const metrics = {
  siteInfo: new Gauge({
    name: 'exagrid_site_info',
    help: 'Informações básicas do site Exagrid',
    labelNames: ['name', 'adminStatus', 'operStatus', 'exagridUuid', 'veeamEnabled'],
    registers: [exagridRegistry],
  }),
  siteUp: new Gauge({
    name: 'exagrid_site_up',
    help: 'Status de disponibilidade do site (1 = up, 0 = down)',
    labelNames: ['name'],
    registers: [exagridRegistry],
  }),
  maxPooledShares: new Gauge({
    name: 'exagrid_max_pooled_shares',
    help: 'Número máximo de shares agrupados',
    labelNames: ['name'],
    registers: [exagridRegistry],
  }),
  dedupRatio: new Gauge({
    name: 'exagrid_dedup_ratio',
    help: 'Taxa de deduplicação do site',
    labelNames: ['name'],
    registers: [exagridRegistry],
  }),
  serversCount: new Gauge({
    name: 'exagrid_servers_count',
    help: 'Quantidade de servidores no site',
    labelNames: ['name'],
    registers: [exagridRegistry],
  }),
  sharesCount: new Gauge({
    name: 'exagrid_shares_count',
    help: 'Quantidade de shares no site',
    labelNames: ['name'],
    registers: [exagridRegistry],
  }),
};

// Função para atualizar as métricas
export async function updateExagridMetrics() {
  try {
    const sites = await GetExagridInforService();

    // Reset todas as métricas antes de atualizar
    Object.values(metrics).forEach(metric => metric.reset());

    // Atualiza cada métrica para cada site
    sites.forEach(site => {
      metrics.siteInfo.set(
        {
          name: site.name,
          adminStatus: site.adminStatus,
          operStatus: site.operStatus,
          exagridUuid: site.exagridUuid,
          veeamEnabled: String(site.veeamEnabled)
        },
        1 // Valor fixo pois as informações estão nas labels
      );

      metrics.siteUp.set({ name: site.name }, site.isUp ? 1 : 0);
      metrics.maxPooledShares.set({ name: site.name }, site.maxPooledShares);
      metrics.dedupRatio.set({ name: site.name }, site.dedupRatio);
      metrics.serversCount.set({ name: site.name }, site.serversCount);
      metrics.sharesCount.set({ name: site.name }, site.sharesCount);
    });
  } catch (error) {
    console.error('Erro ao atualizar métricas do Exagrid:', error);
  }
}

// Função para obter as métricas no formato do Prometheus
export function getExagridMetrics() {
  return exagridRegistry.metrics();
}

// Atualiza as métricas periodicamente (opcional)
const UPDATE_INTERVAL = 60000; // 1 minuto
setInterval(updateExagridMetrics, UPDATE_INTERVAL);

// Atualiza imediatamente na inicialização
updateExagridMetrics().catch(console.error);