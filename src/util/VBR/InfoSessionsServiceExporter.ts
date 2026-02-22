// import { Gauge, Registry } from 'prom-client';
// import { VBRSessionsServiceJobs } from '../../services/VBR/SessionsService/SessionsService';


// // ===============================================================
// // REGISTRY DEDICADO (ISOLADO DO JOB CONFIG)
// // ===============================================================

// const sessionRegistry = new Registry();

// // ===============================================================
// // MÉTRICAS
// // ===============================================================

// // 1️⃣ Estatísticas gerais
// const veeamSessionStats = new Gauge({
//   name: 'veeam_sessions_stats',
//   help: 'Estatísticas gerais das sessões Veeam',
//   labelNames: ['metric'],
//   registers: [sessionRegistry],
// });

// // 2️⃣ Duração das sessões concluídas (Success)
// const veeamSessionDuration = new Gauge({
//   name: 'veeam_session_duration_minutes',
//   help: 'Duração da sessão em minutos (apenas Success)',
//   labelNames: ['job_name'],
//   registers: [sessionRegistry],
// });

// // 3️⃣ Progresso das sessões em andamento
// const veeamSessionProgress = new Gauge({
//   name: 'veeam_session_progress_percent',
//   help: 'Progresso percentual das sessões em andamento',
//   labelNames: ['job_name'],
//   registers: [sessionRegistry],
// });

// // ===============================================================
// // CONTROLE DE ESTADO
// // ===============================================================

// let metricsInitialized = false;
// let lastUpdateTime = 0;

// // ===============================================================
// // FUNÇÃO PRINCIPAL DE COLETA
// // ===============================================================

// export async function updateVBRSessionMetrics(): Promise<string> {
//   try {
//     const sessions = await VBRSessionsServiceJobs();
//     const updateTimestamp = Date.now();

//     // Reset gauges
//     veeamSessionStats.reset();
//     veeamSessionDuration.reset();
//     veeamSessionProgress.reset();

//     let total = 0;
//     let success = 0;
//     let failed = 0;
//     let warning = 0;
//     let working = 0;
//     let canceled = 0;

//     let totalDuration = 0;
//     let durationCount = 0;

//     for (const session of sessions) {
//       total++;
//       const jobName = session.name || 'unknown';

//       // ==========================================================
//       // CONTADORES DE STATUS
//       // ==========================================================

//       switch (session.result.result) {
//         case 'Success':
//           success++;
//           break;
//         case 'Failed':
//           failed++;
//           break;
//         case 'Warning':
//           warning++;
//           break;
//       }

//       if (session.state === 'Working') {
//         working++;

//         veeamSessionProgress.set(
//           { job_name: jobName },
//           session.progressPercent
//         );
//       }

//       if (session.result.isCanceled) {
//         canceled++;
//       }

//       // ==========================================================
//       // DURAÇÃO (Success apenas)
//       // ==========================================================

//       if (
//         session.result.result === 'Success' &&
//         session.durationMinutes !== null
//       ) {
//         veeamSessionDuration.set(
//           { job_name: jobName },
//           session.durationMinutes
//         );

//         totalDuration += session.durationMinutes;
//         durationCount++;
//       }
//     }

//     // ==========================================================
//     // MÉTRICAS RESUMO
//     // ==========================================================

//     veeamSessionStats.set({ metric: 'total_sessions' }, total);
//     veeamSessionStats.set({ metric: 'success_sessions' }, success);
//     veeamSessionStats.set({ metric: 'failed_sessions' }, failed);
//     veeamSessionStats.set({ metric: 'warning_sessions' }, warning);
//     veeamSessionStats.set({ metric: 'working_sessions' }, working);
//     veeamSessionStats.set({ metric: 'canceled_sessions' }, canceled);

//     veeamSessionStats.set(
//       { metric: 'success_rate_percent' },
//       total > 0 ? (success / total) * 100 : 0
//     );

//     veeamSessionStats.set(
//       { metric: 'avg_duration_minutes' },
//       durationCount > 0 ? totalDuration / durationCount : 0
//     );

//     veeamSessionStats.set(
//       { metric: 'last_update_timestamp' },
//       updateTimestamp
//     );

//     metricsInitialized = true;
//     lastUpdateTime = updateTimestamp;

//     console.log(
//       `📊 Sessions coletadas: Total=${total}, Success=${success}, Failed=${failed}, Working=${working}`
//     );

//     return sessionRegistry.metrics();

//   } catch (error) {
//     console.error('❌ Erro ao coletar métricas de sessões:', error);
//     return sessionRegistry.metrics();
//   }
// }

// // ===============================================================
// // EXPORTAÇÕES
// // ===============================================================

// export async function getVBRSessionMetrics(): Promise<string> {
//   if (!metricsInitialized) {
//     veeamSessionStats.set({ metric: 'not_initialized' }, 1);
//   }
//   return sessionRegistry.metrics();
// }

// export function getSessionMetricsAsJSON() {
//   return sessionRegistry.getMetricsAsJSON();
// }

// export function getSessionLastUpdateTime(): number {
//   return lastUpdateTime;
// }

// // ===============================================================
// // AUTO UPDATE OPCIONAL
// // ===============================================================

// const DEFAULT_UPDATE_INTERVAL = parseInt(
//   process.env.VEEAM_SESSION_UPDATE_INTERVAL || '300000'
// );

// let updateInterval: NodeJS.Timeout;

// export function startSessionAutoUpdate(intervalMs: number = DEFAULT_UPDATE_INTERVAL) {
//   if (updateInterval) clearInterval(updateInterval);

//   updateInterval = setInterval(async () => {
//     try {
//       await updateVBRSessionMetrics();
//     } catch (error) {
//       console.error('Erro na atualização automática de sessions:', error);
//     }
//   }, intervalMs);

//   console.log(`🔄 Sessions atualizando a cada ${intervalMs / 1000}s`);
// }

// export function stopSessionAutoUpdate() {
//   if (updateInterval) {
//     clearInterval(updateInterval);
//     console.log('⏹️ Auto update de sessions parado');
//   }
// }

// // Inicialização automática
// if (process.env.NODE_ENV !== 'test') {
//   setTimeout(() => {
//     updateVBRSessionMetrics()
//       .then(() => startSessionAutoUpdate())
//       .catch(err => console.error('Falha inicial sessions:', err));
//   }, 5000);
// }

// export default {
//   updateVBRSessionMetrics,
//   getVBRSessionMetrics,
//   getSessionMetricsAsJSON,
//   getSessionLastUpdateTime,
//   startSessionAutoUpdate,
//   stopSessionAutoUpdate,
//   register: sessionRegistry
// };


import { Gauge, Registry } from 'prom-client';
import { VBRSessionsServiceJobs } from '../../services/VBR/SessionsService/SessionsService';

// ===============================================================
// REGISTRY DEDICADO
// ===============================================================

const sessionRegistry = new Registry();

// ===============================================================
// MÉTRICA ÚNICA PARA DADOS BRUTOS
// ===============================================================

// Gauge principal que conterá todos os dados brutos
const veeamSessionsRaw = new Gauge({
  name: 'veeam_sessions_raw',
  help: 'Dados brutos de todas as sessões Veeam',
  labelNames: [
    'job_name',                // Nome do job
    'session_type',            // Tipo da sessão (BackupJob, RestoreVm, etc)
    'state',                   // Estado atual (Working, Stopped, etc)
    'result',                  // Resultado (Success, Failed, Warning, None)
    'is_canceled',             // Se foi cancelado (true/false)
    'platform_name',           // Plataforma (VMware, etc)
    'creation_time',           // Timestamp de criação
    'end_time',                // Timestamp de fim (quando disponível)
    'message',                 // Mensagem de resultado
    'has_error',               // Se contém erro (true/false)
    'duration_minutes_raw'          // Status da duração (available/not_available)
  ],
  registers: [sessionRegistry],
});

// Métrica separada para valores numéricos (progresso e duração)
const veeamSessionsValues = new Gauge({
  name: 'veeam_sessions_values',
  help: 'Valores numéricos das sessões Veeam',
  labelNames: [
    'job_name',
    'value_type'              // 'progress' ou 'duration'
  ],
  registers: [sessionRegistry],
});

// Métrica para timestamp de última atualização
const veeamSessionsLastUpdate = new Gauge({
  name: 'veeam_sessions_last_update',
  help: 'Timestamp da última atualização dos dados brutos',
  labelNames: ['instance'],
  registers: [sessionRegistry],
});

// ===============================================================
// FUNÇÕES AUXILIARES
// ===============================================================

function sanitizeLabelValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  // Converte para string e substitui caracteres problemáticos
  return String(value)
    .replace(/[^\w\s-]/g, '_')  // Substitui caracteres especiais por underscore
    .replace(/\s+/g, '_')        // Substitui espaços por underscore
    .substring(0, 200);          // Limita tamanho do label
}

function generateSessionId(session: any): string {
  // Gera um ID único baseado nos campos disponíveis
  if (session.id) return sanitizeLabelValue(session.id);
  if (session.jobId && session.creationTime) {
    return sanitizeLabelValue(`${session.jobId}_${session.creationTime}`);
  }
  return sanitizeLabelValue(`${session.name}_${Date.now()}_${Math.random()}`);
}

function formatTimestamp(timestamp: string | null): string {
  if (!timestamp) return '';

  try {
    // Converte para timestamp Unix (segundos) para facilitar queries no Grafana
    return String(Math.floor(new Date(timestamp).getTime() / 1000));
  } catch {
    return '';
  }
}

function hasError(session: any): string {
  if (session.result?.result === 'Failed') return 'true';
  if (session.result?.message?.toLowerCase().includes('error')) return 'true';
  if (session.result?.message?.toLowerCase().includes('fail')) return 'true';
  return 'false';
}

// ===============================================================
// FUNÇÃO PRINCIPAL DE COLETA
// ===============================================================

export async function updateVBRSessionMetrics(): Promise<string> {
  try {
    const startTime = Date.now();
    const sessions = await VBRSessionsServiceJobs();

    if (!Array.isArray(sessions)) {
      console.error('❌ Dados retornados não são um array:', sessions);
      return sessionRegistry.metrics();
    }

    console.log(`📊 Processando ${sessions.length} sessões brutas...`);

    // Reset das métricas (importante para evitar dados antigos)
    veeamSessionsRaw.reset();
    veeamSessionsValues.reset();

    let sessionsProcessed = 0;

    // Processa cada sessão individualmente
    for (const session of sessions) {
      try {

        const jobName = sanitizeLabelValue(session.name || 'unknown');

        const sessionType = sanitizeLabelValue(session.sessionType || '');
        const state = sanitizeLabelValue(session.state || '');
        const result = sanitizeLabelValue(session.result?.result || '');
        const isCanceled = session.result?.isCanceled ? 'true' : 'false';

        const message = sanitizeLabelValue(session.result?.message || '');
        const errorFlag = hasError(session);

        // Formata timestamps
        const creationTime = formatTimestamp(session.creationTime);
        const endTime = formatTimestamp(session.endTime);

        // // Status da duração
        // const durationStatus = session.durationMinutes !== null && session.durationMinutes !== undefined
        //   ? 'available'
        //   : 'not_available';

        // VALOR BRUTO ORIGINAL do durationMinutes (pode ser null)
        // Exatamente como retornado pelo service, sem qualquer processamento
        const durationRaw = session.durationMinutes !== null && session.durationMinutes !== undefined
          ? String(session.durationMinutes)
          : 'null';
        // Cria a métrica raw com todos os campos como labels
        veeamSessionsRaw.set(
          {
            job_name: jobName,
            session_type: sessionType,
            state: state,
            result: result,
            is_canceled: isCanceled,

            creation_time: creationTime,
            end_time: endTime,
            message: message,
            has_error: errorFlag,
            duration_minutes_raw: durationRaw
          },
          1  // Valor fixo 1 pois a informação está nos labels
        );

        // Valores numéricos (progresso e duração) em métrica separada
        if (session.progressPercent !== undefined && session.progressPercent !== null) {
          veeamSessionsValues.set(
            {
              job_name: jobName,
              value_type: 'progress'
            },
            Number(session.progressPercent)
          );
        }

        if (session.durationMinutes !== undefined && session.durationMinutes !== null) {
          veeamSessionsValues.set(
            {
              job_name: jobName,
              value_type: 'duration'
            },
            Number(session.durationMinutes)
          );
        }

        sessionsProcessed++;

        // Log progresso a cada 100 sessões
        if (sessionsProcessed % 100 === 0) {
          console.log(`  Progresso: ${sessionsProcessed}/${sessions.length} sessões`);
        }

      } catch (sessionError) {
        console.error(`❌ Erro ao processar sessão individual:`, sessionError, session);
      }
    }

    // Timestamp da última atualização
    veeamSessionsLastUpdate.set(
      { instance: 'veeam_collector' },
      Date.now() / 1000  // Em segundos para facilitar no Grafana
    );

    console.log(`✅ ${sessionsProcessed} sessões processadas com sucesso em ${Date.now() - startTime}ms`);

    return sessionRegistry.metrics();

  } catch (error) {
    console.error('❌ Erro ao coletar métricas brutas:', error);

    // Métrica de erro
    veeamSessionsLastUpdate.set(
      { instance: 'veeam_collector_error' },
      Date.now() / 1000
    );

    return sessionRegistry.metrics();
  }
}

// ===============================================================
// FUNÇÕES DE EXPORTAÇÃO
// ===============================================================

export async function getVBRSessionMetrics(): Promise<string> {
  return sessionRegistry.metrics();
}

export function getSessionMetricsAsJSON() {
  return sessionRegistry.getMetricsAsJSON();
}

export function getSessionsCount(): number {
  // Esta função pode ser implementada se necessário
  return 0;
}

// ===============================================================
// AUTO UPDATE
// ===============================================================

const DEFAULT_UPDATE_INTERVAL = parseInt(
  process.env.VEEAM_SESSION_UPDATE_INTERVAL || '300000' // 5 minutos default
);

let updateInterval: NodeJS.Timeout;
let isUpdating = false;

export function startSessionAutoUpdate(intervalMs: number = DEFAULT_UPDATE_INTERVAL) {
  if (updateInterval) {
    clearInterval(updateInterval);
  }

  updateInterval = setInterval(async () => {
    if (isUpdating) {
      console.log('⏳ Atualização anterior ainda em progresso, pulando...');
      return;
    }

    isUpdating = true;
    try {
      await updateVBRSessionMetrics();
    } catch (error) {
      console.error('❌ Erro na atualização automática:', error);
    } finally {
      isUpdating = false;
    }
  }, intervalMs);

  console.log(`🔄 Dados brutos atualizando a cada ${intervalMs / 1000}s`);
}

export function stopSessionAutoUpdate() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null as any; // ou use null com type assertion
    console.log('⏹️ Auto update parado');
  }
}

// ===============================================================
// INICIALIZAÇÃO
// ===============================================================

if (process.env.NODE_ENV !== 'test') {
  setTimeout(async () => {
    try {
      await updateVBRSessionMetrics();
      startSessionAutoUpdate();
      console.log('✅ Coletor de dados brutos Veeam inicializado');
    } catch (err) {
      console.error('❌ Falha na inicialização:', err);
    }
  }, 5000);
}

// ===============================================================
// EXPORTAÇÕES
// ===============================================================

export default {
  updateVBRSessionMetrics,
  getVBRSessionMetrics,
  getSessionMetricsAsJSON,
  startSessionAutoUpdate,
  stopSessionAutoUpdate,
  register: sessionRegistry
};