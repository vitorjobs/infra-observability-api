// import { Gauge, Counter, Registry } from 'prom-client';
// import { VBRListBackupJobs } from '../../services/VBR/JobService/JobService';

// // Registry dedicado para as métricas do Veeam
// const veeamRegistry = new Registry();

// // ============================================================================
// // MÉTRICAS PRINCIPAIS - OTIMIZADAS PARA GRAFANA
// // ============================================================================

// // 1. MÉTRICA RESUMO - Para cards e visão geral rápida
// const veeamJobSummary = new Gauge({
//   name: 'veeam_job_summary',
//   help: 'Resumo geral dos jobs de backup',
//   labelNames: ['status_type'],
//   registers: [veeamRegistry],
// });

// // 2. MÉTRICA DE CONFIGURAÇÃO - Para detalhes dos jobs
// const veeamJobConfiguration = new Gauge({
//   name: 'veeam_job_configuration',
//   help: 'Configurações detalhadas de cada job',
//   labelNames: [
//     'job_name',
//     'priority',
//     'status',
//     'schedule_type',
//     'schedule_time',
//     'retention_type',
//     'retentionQty',
//     'backup_mode',
//     'full_backup_type',
//     'compression',
//     'storage_opt'
//   ],
//   registers: [veeamRegistry],
// });

// // 3. MÉTRICA DE HORÁRIOS - Para análise de distribuição
// const veeamScheduleDistribution = new Gauge({
//   name: 'veeam_schedule_distribution',
//   help: 'Distribuição de horários de execução',
//   labelNames: ['hour_slot'],
//   registers: [veeamRegistry],
// });

// // 4. MÉTRICA DE RETENÇÃO - Para compliance
// const veeamRetentionDistribution = new Gauge({
//   name: 'veeam_retention_distribution',
//   help: 'Distribuição de políticas de retenção',
//   labelNames: ['retention_range'],
//   registers: [veeamRegistry],
// });

// // 5. MÉTRICA DE PROBLEMAS - Para alertas
// const veeamConfigurationIssues = new Counter({
//   name: 'veeam_configuration_issues',
//   help: 'Contador de problemas de configuração encontrados',
//   labelNames: ['issue_type', 'job_name'],
//   registers: [veeamRegistry],
// });

// // 6. MÉTRICA DE PERFORMANCE - Para métricas numéricas
// const veeamPerformanceMetrics = new Gauge({
//   name: 'veeam_performance_metrics',
//   help: 'Métricas de performance e configuração',
//   labelNames: ['metric_type', 'job_name'],
//   registers: [veeamRegistry],
// });

// let metricsInitialized = false;
// let lastUpdateTime = 0;

// // ============================================================================
// // FUNÇÕES AUXILIARES
// // ============================================================================

// // Categoriza horário em slots (útil para gráficos)
// function getTimeSlot(localTime: string): string {
//   if (!localTime) return 'unknown';

//   const hour = parseInt(localTime.split(':')[0]);
//   if (hour >= 0 && hour < 6) return '00-06';
//   if (hour >= 6 && hour < 12) return '06-12';
//   if (hour >= 12 && hour < 18) return '12-18';
//   if (hour >= 18 && hour < 24) return '18-24';
//   return 'unknown';
// }

// // Categoriza retenção em faixas (útil para gráficos)
// function getRetentionRange(quantity: number, type: string): string {
//   if (type !== 'Days') return type;

//   if (quantity <= 7) return '1-7 dias';
//   if (quantity <= 14) return '8-14 dias';
//   if (quantity <= 30) return '15-30 dias';
//   if (quantity <= 90) return '31-90 dias';
//   return '90+ dias';
// }

// // Determina tipo de schedule
// function getScheduleType(schedule: any): string {
//   if (!schedule?.runAutomatically) return 'Manual';
//   if (schedule?.daily?.isEnabled) return 'Diário';
//   if (schedule?.monthly?.isEnabled) return 'Mensal';
//   // return 'scheduled_no_frequency';
//   return 'Não Agendado';
// }

// // Determina tipo de full backup
// function getFullBackupType(advanced: any): string {
//   const synthetic = advanced?.synthenticFulls?.isEnabled;
//   const active = advanced?.activeFulls?.isEnabled;

//   if (synthetic && active) return 'Híbrido';
//   if (synthetic) return 'Synthetic Full';
//   if (active) return 'Active Full';
//   return 'Não Configurado';
// }

// // Valida configurações críticas
// function validateCriticalConfigurations(job: any): Array<{ type: string, severity: string }> {
//   const issues = [];
//   const jobName = job.name || 'unknown';

//   // 1. Job desativado mas com schedule ativo (inconsistência)
//   if (job.isDisabled && job.schedule?.runAutomatically) {
//     issues.push({ type: 'disabled_but_scheduled', severity: 'warning' });
//   }

//   // 2. Schedule automático mas sem frequência definida
//   if (job.schedule?.runAutomatically &&
//     !job.schedule?.daily?.isEnabled &&
//     !job.schedule?.monthly?.isEnabled) {
//     issues.push({ type: 'auto_no_frequency', severity: 'critical' });
//   }

//   // 3. Sem política de retenção
//   if (!job.retentionPolicy?.type || !job.retentionPolicy?.quantity) {
//     issues.push({ type: 'no_retention_policy', severity: 'critical' });
//   }

//   // 4. Incremental sem full backup
//   if (job.advancedSettings?.backupModeType === 'Incremental' &&
//     getFullBackupType(job.advancedSettings) === 'none') {
//     issues.push({ type: 'incremental_no_full', severity: 'high' });
//   }

//   // 5. Synthetic full no mesmo dia que backup diário (pode causar conflito)
//   const dailyTime = job.schedule?.daily?.localTime || '';
//   const syntheticDay = job.advancedSettings?.synthenticFulls?.weekly?.days || '';
//   if (dailyTime && syntheticDay && job.schedule?.daily?.isEnabled) {
//     // Lógica para detectar conflitos pode ser expandida aqui
//     issues.push({ type: 'potential_schedule_conflict', severity: 'warning' });
//   }

//   return issues;
// }

// // ============================================================================
// // FUNÇÃO PRINCIPAL DE COLETA
// // ============================================================================

// export async function updateVBRMetrics(): Promise<string> {
//   try {
//     const jobs = await VBRListBackupJobs();
//     const updateTimestamp = Date.now();

//     // Reset das métricas (exceto contadores que devem acumular)
//     veeamJobSummary.reset();
//     veeamJobConfiguration.reset();
//     veeamScheduleDistribution.reset();
//     veeamRetentionDistribution.reset();
//     veeamPerformanceMetrics.reset();

//     // Contadores para o resumo
//     let totalJobs = 0;
//     let activeJobs = 0;
//     let highPriorityJobs = 0;
//     let autoScheduledJobs = 0;
//     let jobsWithIssues = 0;

//     // Mapas para distribuições
//     const timeSlotCount: Record<string, number> = {};
//     const retentionRangeCount: Record<string, number> = {};

//     for (const job of jobs) {
//       totalJobs++;
//       const jobName = job.name || `unknown_${totalJobs}`;

//       // Status básico
//       if (!job.isDisabled) activeJobs++;
//       if (job.isHighPriority) highPriorityJobs++;

//       // Agendamento
//       const scheduleType = getScheduleType(job.schedule);
//       if (scheduleType !== 'manual') autoScheduledJobs++;

//       // Horário
//       const dailyTime = job.schedule?.daily?.localTime || '';
//       if (dailyTime) {
//         const timeSlot = getTimeSlot(dailyTime);
//         timeSlotCount[timeSlot] = (timeSlotCount[timeSlot] || 0) + 1;
//       }

//       // Retenção
//       const retentionQty = job.retentionPolicy?.quantity || 0;
//       const retentionType = job.retentionPolicy?.type || 'Não configurado';
//       const retentionRange = getRetentionRange(retentionQty, retentionType);
//       retentionRangeCount[retentionRange] = (retentionRangeCount[retentionRange] || 0) + 1;

//       // Full backup type
//       const fullBackupType = getFullBackupType(job.advancedSettings);

//       // Métrica de configuração detalhada
//       veeamJobConfiguration.set({
//         job_name: jobName,
//         priority: job.isHighPriority ? 'Alto' : 'Normal',
//         status: job.isDisabled ? 'Desabilitado' : 'Habilitado',
//         schedule_type: scheduleType,
//         schedule_time: dailyTime || 'none',
//         retention_type: retentionType,
//         retentionQty: retentionQty.toString(),
//         backup_mode: job.advancedSettings?.backupModeType || 'unknown',
//         full_backup_type: fullBackupType,
//         compression: job.advancedSettings?.storageData?.compressionLevel || 'none',
//         storage_opt: job.advancedSettings?.storageData?.storageOptimization || 'none'
//       }, 1);

//       // Métricas de performance (valores numéricos para gráficos)
//       veeamPerformanceMetrics.set(
//         { metric_type: 'retentionQty', job_name: jobName },
//         retentionQty
//       );

//       // Validação e problemas
//       const issues = validateCriticalConfigurations(job);
//       if (issues.length > 0) {
//         jobsWithIssues++;
//         issues.forEach(issue => {
//           veeamConfigurationIssues.inc({
//             issue_type: issue.type,
//             job_name: jobName
//           });
//         });
//       }

//       // Configurações booleanas como métricas
//       veeamPerformanceMetrics.set(
//         { metric_type: 'has_backup_window', job_name: jobName },
//         job.schedule?.backupWindow?.isEnabled ? 1 : 0
//       );

//       veeamPerformanceMetrics.set(
//         { metric_type: 'has_gfs_policy', job_name: jobName },
//         job.gfsPolicy?.isEnabled ? 1 : 0
//       );

//       veeamPerformanceMetrics.set(
//         { metric_type: 'has_health_check', job_name: jobName },
//         job.advancedSettings?.backupHealth?.isEnabled ? 1 : 0
//       );
//     }

//     // ============================================================================
//     // ATUALIZA MÉTRICAS RESUMO (para cards no Grafana)
//     // ============================================================================

//     // Cards principais
//     veeamJobSummary.set({ status_type: 'total_jobs' }, totalJobs);
//     veeamJobSummary.set({ status_type: 'active_jobs' }, activeJobs);
//     veeamJobSummary.set({ status_type: 'disabled_jobs' }, totalJobs - activeJobs);
//     veeamJobSummary.set({ status_type: 'high_priority_jobs' }, highPriorityJobs);
//     veeamJobSummary.set({ status_type: 'auto_scheduled_jobs' }, autoScheduledJobs);
//     veeamJobSummary.set({ status_type: 'manual_jobs' }, totalJobs - autoScheduledJobs);
//     veeamJobSummary.set({ status_type: 'jobs_with_issues' }, jobsWithIssues);

//     // Taxas (úteis para gauges)
//     // Essa métrica é calculada após processar todos os jobs para garantir que as taxas sejam precisas e mostradas corretamente nos dashboards. Ela reflete a proporção de jobs ativos, agendados automaticamente e com problemas em relação ao total, oferecendo uma visão rápida da saúde geral do ambiente de backup.
//     // Representa a porcentagem de jobs ativos, agendados automaticamente e com problemas, facilitando a visualização rápida da saúde do ambiente de backup em dashboards.  

//     veeamJobSummary.set(
//       { status_type: 'active_rate' },
//       totalJobs > 0 ? (activeJobs / totalJobs) * 100 : 0
//     );

//     // Representa a porcentagem de jobs agendados automaticamente, permitindo identificar rapidamente a proporção de automação no ambiente de backup. Essa métrica é crucial para avaliar o nível de automação e eficiência operacional, ajudando a identificar oportunidades para reduzir a intervenção manual e melhorar a consistência das execuções de backup.  
//     // A base do calculo é o total de Jobs Processados x a quantidade de Jobs Agendados Automaticamente, dividido pelo total de Jobs Processados. O resultado é multiplicado por 100 para converter em porcentagem, facilitando a interpretação e visualização em dashboards.
//     veeamJobSummary.set(
//       { status_type: 'auto_schedule_rate' },
//       totalJobs > 0 ? (autoScheduledJobs / totalJobs) * 100 : 0
//     );


//     // Representa a porcentagem de jobs que apresentam problemas de configuração, permitindo identificar rapidamente a proporção de jobs que podem estar em risco ou não otimizados. Essa métrica é essencial para monitorar a saúde do ambiente de backup, ajudando a priorizar ações corretivas e garantir que os backups sejam realizados de forma confiável e eficiente.
//     // A base do calculo é o total de Jobs Processados x a quantidade de Jobs com Problemas, dividido pelo total de Jobs Processados. O resultado é multiplicado por 100 para converter em porcentagem, facilitando a interpretação e visualização em dashboards.
//     veeamJobSummary.set(
//       { status_type: 'issue_rate' },
//       totalJobs > 0 ? (jobsWithIssues / totalJobs) * 100 : 0
//     );

//     // ============================================================================
//     // ATUALIZA DISTRIBUIÇÕES (para gráficos no Grafana)
//     // ============================================================================

//     // Distribuição por horário
//     Object.entries(timeSlotCount).forEach(([slot, count]) => {
//       veeamScheduleDistribution.set({ hour_slot: slot }, count);
//     });

//     // Distribuição por retenção
//     Object.entries(retentionRangeCount).forEach(([range, count]) => {
//       veeamRetentionDistribution.set({ retention_range: range }, count);
//     });

//     // ============================================================================
//     // MÉTRICAS DE SISTEMA
//     // ============================================================================

//     veeamPerformanceMetrics.set(
//       { metric_type: 'collection_duration_ms', job_name: 'system' },
//       Date.now() - updateTimestamp
//     );

//     veeamPerformanceMetrics.set(
//       { metric_type: 'last_update_timestamp', job_name: 'system' },
//       updateTimestamp
//     );

//     metricsInitialized = true;
//     lastUpdateTime = updateTimestamp;

//     console.log(`✅ Métricas Veeam atualizadas: ${totalJobs} jobs processados, ${jobsWithIssues} com issues`);
//     return veeamRegistry.metrics();

//   } catch (error) {
//     console.error('❌ Erro ao atualizar métricas Veeam:', error);

//     // Métrica de erro
//     const errorGauge = new Gauge({
//       name: 'veeam_collection_error',
//       help: 'Indica erro na coleta de métricas',
//       registers: [veeamRegistry],
//     });

//     errorGauge.set(1);
//     return veeamRegistry.metrics();
//   }
// }

// // ============================================================================
// // FUNÇÕES DE EXPORTAÇÃO
// // ============================================================================

// export async function getVBRMetrics(): Promise<string> {
//   if (!metricsInitialized) {
//     const notReadyGauge = new Gauge({
//       name: 'veeam_metrics_not_ready',
//       help: 'Métricas não inicializadas',
//       registers: [veeamRegistry],
//     });
//     notReadyGauge.set(1);
//   }
//   return veeamRegistry.metrics();
// }

// export function getMetricsAsJSON() {
//   return veeamRegistry.getMetricsAsJSON();
// }

// export function getLastUpdateTime(): number {
//   return lastUpdateTime;
// }

// // ============================================================================
// // INICIALIZAÇÃO AUTOMÁTICA
// // ============================================================================

// // Configura intervalo de atualização (5 minutos padrão)
// const DEFAULT_UPDATE_INTERVAL = parseInt(process.env.VEEAM_UPDATE_INTERVAL || '300000');
// let updateInterval: NodeJS.Timeout;

// export function startAutoUpdate(intervalMs: number = DEFAULT_UPDATE_INTERVAL) {
//   if (updateInterval) {
//     clearInterval(updateInterval);
//   }

//   updateInterval = setInterval(async () => {
//     try {
//       await updateVBRMetrics();
//     } catch (error) {
//       console.error('Erro na atualização automática:', error);
//     }
//   }, intervalMs);

//   console.log(`🔄 Atualização automática configurada a cada ${intervalMs / 1000} segundos`);
// }

// export function stopAutoUpdate() {
//   if (updateInterval) {
//     clearInterval(updateInterval);
//     console.log('⏹️ Atualização automática parada');
//   }
// }

// // Inicializa na importação
// if (process.env.NODE_ENV !== 'test') {
//   setTimeout(() => {
//     updateVBRMetrics().then(() => {
//       startAutoUpdate();
//     }).catch(error => {
//       console.error('Falha na inicialização das métricas Veeam:', error);
//     });
//   }, 5000); // Delay inicial de 5 segundos
// }

// // ============================================================================
// // EXPORTAÇÕES PARA PROMETHEUS
// // ============================================================================

// export default {
//   updateVBRMetrics,
//   getVBRMetrics,
//   getMetricsAsJSON,
//   getLastUpdateTime,
//   startAutoUpdate,
//   stopAutoUpdate,
//   register: veeamRegistry
// };

/** NOVO 19 MAR */

import { Gauge, Counter, Registry } from 'prom-client';
import { VBRListBackupJobs } from '../../services/VBR/JobService/JobService';

// Registry dedicado para as métricas do Veeam
const veeamRegistry = new Registry();

// ============================================================================
// MÉTRICAS PRINCIPAIS - OTIMIZADAS PARA GRAFANA
// ============================================================================

// 1. MÉTRICA RESUMO - Para cards e visão geral rápida
const veeamJobSummary = new Gauge({
  name: 'veeam_job_summary',
  help: 'Resumo geral dos jobs de backup',
  labelNames: ['status_type'],
  registers: [veeamRegistry],
});

// 2. MÉTRICA DE CONFIGURAÇÃO - Para detalhes dos jobs
const veeamJobConfiguration = new Gauge({
  name: 'veeam_job_configuration',
  help: 'Configurações detalhadas de cada job',
  labelNames: [
    'job_name',
    'priority',
    'status',
    'schedule_type',
    'schedule_time',
    'retention_type',
    'retentionQty',
    'backup_mode',
    'full_backup_type',
    'compression',
    'storage_opt'
  ],
  registers: [veeamRegistry],
});

// 3. MÉTRICA DE HORÁRIOS - Para análise de distribuição
const veeamScheduleDistribution = new Gauge({
  name: 'veeam_schedule_distribution',
  help: 'Distribuição de horários de execução',
  labelNames: ['hour_slot'],
  registers: [veeamRegistry],
});

// 4. MÉTRICA DE RETENÇÃO - Para compliance
const veeamRetentionDistribution = new Gauge({
  name: 'veeam_retention_distribution',
  help: 'Distribuição de políticas de retenção',
  labelNames: ['retention_range'],
  registers: [veeamRegistry],
});

// 5. MÉTRICA DE PROBLEMAS - Para alertas
const veeamConfigurationIssues = new Counter({
  name: 'veeam_configuration_issues',
  help: 'Contador de problemas de configuração encontrados',
  labelNames: ['issue_type', 'job_name'],
  registers: [veeamRegistry],
});

// 6. MÉTRICA DE PERFORMANCE - Para métricas numéricas
const veeamPerformanceMetrics = new Gauge({
  name: 'veeam_performance_metrics',
  help: 'Métricas de performance e configuração',
  labelNames: ['metric_type', 'job_name'],
  registers: [veeamRegistry],
});

// 7. MÉTRICAS AUXILIARES DE ESTADO/ERRO
const veeamMetricsNotReady = new Gauge({
  name: 'veeam_metrics_not_ready',
  help: 'Métricas não inicializadas',
  registers: [veeamRegistry],
});

const veeamCollectionError = new Gauge({
  name: 'veeam_collection_error',
  help: 'Indica erro na coleta de métricas',
  registers: [veeamRegistry],
});

let metricsInitialized = false;
let lastUpdateTime = 0;

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

// Categoriza horário em slots (útil para gráficos)
function getTimeSlot(localTime: string): string {
  if (!localTime) return 'unknown';

  const hour = parseInt(localTime.split(':')[0]);
  if (hour >= 0 && hour < 6) return '00-06';
  if (hour >= 6 && hour < 12) return '06-12';
  if (hour >= 12 && hour < 18) return '12-18';
  if (hour >= 18 && hour < 24) return '18-24';
  return 'unknown';
}

// Categoriza retenção em faixas (útil para gráficos)
function getRetentionRange(quantity: number, type: string): string {
  if (type !== 'Days') return type;

  if (quantity <= 7) return '1-7 dias';
  if (quantity <= 14) return '8-14 dias';
  if (quantity <= 30) return '15-30 dias';
  if (quantity <= 90) return '31-90 dias';
  return '90+ dias';
}

// Determina tipo de schedule
function getScheduleType(schedule: any): string {
  if (!schedule?.runAutomatically) return 'Manual';
  if (schedule?.daily?.isEnabled) return 'Diário';
  if (schedule?.monthly?.isEnabled) return 'Mensal';
  return 'Não Agendado';
}

// Determina tipo de full backup
function getFullBackupType(advanced: any): string {
  const synthetic = advanced?.synthenticFulls?.isEnabled;
  const active = advanced?.activeFulls?.isEnabled;

  if (synthetic && active) return 'Híbrido';
  if (synthetic) return 'Synthetic Full';
  if (active) return 'Active Full';
  return 'Não Configurado';
}

// Valida configurações críticas
function validateCriticalConfigurations(job: any): Array<{ type: string; severity: string }> {
  const issues = [];

  // 1. Job desativado mas com schedule ativo (inconsistência)
  if (job.isDisabled && job.schedule?.runAutomatically) {
    issues.push({ type: 'disabled_but_scheduled', severity: 'warning' });
  }

  // 2. Schedule automático mas sem frequência definida
  if (
    job.schedule?.runAutomatically &&
    !job.schedule?.daily?.isEnabled &&
    !job.schedule?.monthly?.isEnabled
  ) {
    issues.push({ type: 'auto_no_frequency', severity: 'critical' });
  }

  // 3. Sem política de retenção
  if (!job.retentionPolicy?.type || !job.retentionPolicy?.quantity) {
    issues.push({ type: 'no_retention_policy', severity: 'critical' });
  }

  // 4. Incremental sem full backup
  if (
    job.advancedSettings?.backupModeType === 'Incremental' &&
    getFullBackupType(job.advancedSettings) === 'none'
  ) {
    issues.push({ type: 'incremental_no_full', severity: 'high' });
  }

  // 5. Synthetic full no mesmo dia que backup diário (pode causar conflito)
  const dailyTime = job.schedule?.daily?.localTime || '';
  const syntheticDay = job.advancedSettings?.synthenticFulls?.weekly?.days || '';
  if (dailyTime && syntheticDay && job.schedule?.daily?.isEnabled) {
    // Lógica para detectar conflitos pode ser expandida aqui
    issues.push({ type: 'potential_schedule_conflict', severity: 'warning' });
  }

  return issues;
}

// ============================================================================
// FUNÇÃO PRINCIPAL DE COLETA
// ============================================================================

export async function updateVBRMetrics(): Promise<string> {
  try {
    const jobs = await VBRListBackupJobs();
    const updateTimestamp = Date.now();

    // Estado auxiliar
    veeamMetricsNotReady.set(0);
    veeamCollectionError.set(0);

    // Reset das métricas (exceto contadores que devem acumular)
    veeamJobSummary.reset();
    veeamJobConfiguration.reset();
    veeamScheduleDistribution.reset();
    veeamRetentionDistribution.reset();
    veeamPerformanceMetrics.reset();

    // Contadores para o resumo
    let totalJobs = 0;
    let activeJobs = 0;
    let highPriorityJobs = 0;
    let autoScheduledJobs = 0;
    let jobsWithIssues = 0;

    // Mapas para distribuições
    const timeSlotCount: Record<string, number> = {};
    const retentionRangeCount: Record<string, number> = {};

    for (const job of jobs) {
      totalJobs++;
      const jobName = job.name || `unknown_${totalJobs}`;

      // Status básico
      if (!job.isDisabled) activeJobs++;
      if (job.isHighPriority) highPriorityJobs++;

      // Agendamento
      const scheduleType = getScheduleType(job.schedule);
      if (scheduleType !== 'Manual') autoScheduledJobs++;

      // Horário
      const dailyTime = job.schedule?.daily?.localTime || '';
      if (dailyTime) {
        const timeSlot = getTimeSlot(dailyTime);
        timeSlotCount[timeSlot] = (timeSlotCount[timeSlot] || 0) + 1;
      }

      // Retenção
      const retentionQty = job.retentionPolicy?.quantity || 0;
      const retentionType = job.retentionPolicy?.type || 'Não configurado';
      const retentionRange = getRetentionRange(retentionQty, retentionType);
      retentionRangeCount[retentionRange] = (retentionRangeCount[retentionRange] || 0) + 1;

      // Full backup type
      const fullBackupType = getFullBackupType(job.advancedSettings);

      // Métrica de configuração detalhada
      veeamJobConfiguration.set(
        {
          job_name: jobName,
          priority: job.isHighPriority ? 'Alto' : 'Normal',
          status: job.isDisabled ? 'Desabilitado' : 'Habilitado',
          schedule_type: scheduleType,
          schedule_time: dailyTime || 'none',
          retention_type: retentionType,
          retentionQty: retentionQty.toString(),
          backup_mode: job.advancedSettings?.backupModeType || 'unknown',
          full_backup_type: fullBackupType,
          compression: job.advancedSettings?.storageData?.compressionLevel || 'none',
          storage_opt: job.advancedSettings?.storageData?.storageOptimization || 'none'
        },
        1
      );

      // Métricas de performance (valores numéricos para gráficos)
      veeamPerformanceMetrics.set(
        { metric_type: 'retentionQty', job_name: jobName },
        retentionQty
      );

      // Validação e problemas
      const issues = validateCriticalConfigurations(job);
      if (issues.length > 0) {
        jobsWithIssues++;
        issues.forEach(issue => {
          veeamConfigurationIssues.inc({
            issue_type: issue.type,
            job_name: jobName
          });
        });
      }

      // Configurações booleanas como métricas
      veeamPerformanceMetrics.set(
        { metric_type: 'has_backup_window', job_name: jobName },
        job.schedule?.backupWindow?.isEnabled ? 1 : 0
      );

      veeamPerformanceMetrics.set(
        { metric_type: 'has_gfs_policy', job_name: jobName },
        job.gfsPolicy?.isEnabled ? 1 : 0
      );

      veeamPerformanceMetrics.set(
        { metric_type: 'has_health_check', job_name: jobName },
        job.advancedSettings?.backupHealth?.isEnabled ? 1 : 0
      );
    }

    // ============================================================================
    // ATUALIZA MÉTRICAS RESUMO (para cards no Grafana)
    // ============================================================================

    veeamJobSummary.set({ status_type: 'total_jobs' }, totalJobs);
    veeamJobSummary.set({ status_type: 'active_jobs' }, activeJobs);
    veeamJobSummary.set({ status_type: 'disabled_jobs' }, totalJobs - activeJobs);
    veeamJobSummary.set({ status_type: 'high_priority_jobs' }, highPriorityJobs);
    veeamJobSummary.set({ status_type: 'auto_scheduled_jobs' }, autoScheduledJobs);
    veeamJobSummary.set({ status_type: 'manual_jobs' }, totalJobs - autoScheduledJobs);
    veeamJobSummary.set({ status_type: 'jobs_with_issues' }, jobsWithIssues);

    veeamJobSummary.set(
      { status_type: 'active_rate' },
      totalJobs > 0 ? (activeJobs / totalJobs) * 100 : 0
    );

    veeamJobSummary.set(
      { status_type: 'auto_schedule_rate' },
      totalJobs > 0 ? (autoScheduledJobs / totalJobs) * 100 : 0
    );

    veeamJobSummary.set(
      { status_type: 'issue_rate' },
      totalJobs > 0 ? (jobsWithIssues / totalJobs) * 100 : 0
    );

    // ============================================================================
    // ATUALIZA DISTRIBUIÇÕES (para gráficos no Grafana)
    // ============================================================================

    Object.entries(timeSlotCount).forEach(([slot, count]) => {
      veeamScheduleDistribution.set({ hour_slot: slot }, count);
    });

    Object.entries(retentionRangeCount).forEach(([range, count]) => {
      veeamRetentionDistribution.set({ retention_range: range }, count);
    });

    // ============================================================================
    // MÉTRICAS DE SISTEMA
    // ============================================================================

    veeamPerformanceMetrics.set(
      { metric_type: 'collection_duration_ms', job_name: 'system' },
      Date.now() - updateTimestamp
    );

    veeamPerformanceMetrics.set(
      { metric_type: 'last_update_timestamp', job_name: 'system' },
      updateTimestamp
    );

    metricsInitialized = true;
    lastUpdateTime = updateTimestamp;

    console.log(`✅ Métricas Veeam atualizadas: ${totalJobs} jobs processados, ${jobsWithIssues} com issues`);
    return veeamRegistry.metrics();
  } catch (error) {
    console.error('❌ Erro ao atualizar métricas Veeam:', error);

    veeamCollectionError.set(1);
    return veeamRegistry.metrics();
  }
}

// ============================================================================
// FUNÇÕES DE EXPORTAÇÃO
// ============================================================================

export async function getVBRMetrics(): Promise<string> {
  veeamMetricsNotReady.set(metricsInitialized ? 0 : 1);
  return veeamRegistry.metrics();
}

export function getMetricsAsJSON() {
  return veeamRegistry.getMetricsAsJSON();
}

export function getLastUpdateTime(): number {
  return lastUpdateTime;
}

// ============================================================================
// INICIALIZAÇÃO AUTOMÁTICA
// ============================================================================

// Configura intervalo de atualização (5 minutos padrão)
const DEFAULT_UPDATE_INTERVAL = parseInt(process.env.VEEAM_UPDATE_INTERVAL || '300000');
let updateInterval: NodeJS.Timeout;

export function startAutoUpdate(intervalMs: number = DEFAULT_UPDATE_INTERVAL) {
  if (updateInterval) {
    clearInterval(updateInterval);
  }

  updateInterval = setInterval(async () => {
    try {
      await updateVBRMetrics();
    } catch (error) {
      console.error('Erro na atualização automática:', error);
    }
  }, intervalMs);

  console.log(`🔄 Atualização automática configurada a cada ${intervalMs / 1000} segundos`);
}

export function stopAutoUpdate() {
  if (updateInterval) {
    clearInterval(updateInterval);
    console.log('⏹️ Atualização automática parada');
  }
}

// Inicializa na importação
if (process.env.NODE_ENV !== 'test') {
  setTimeout(() => {
    updateVBRMetrics()
      .then(() => {
        startAutoUpdate();
      })
      .catch(error => {
        console.error('Falha na inicialização das métricas Veeam:', error);
      });
  }, 5000); // Delay inicial de 5 segundos
}

// ============================================================================
// EXPORTAÇÕES PARA PROMETHEUS
// ============================================================================

export default {
  updateVBRMetrics,
  getVBRMetrics,
  getMetricsAsJSON,
  getLastUpdateTime,
  startAutoUpdate,
  stopAutoUpdate,
  register: veeamRegistry
};