// import { FastifyInstance } from 'fastify';
// import { getCurrentSnapshotMetrics } from './GetSnapshot-services';

// export async function PrometheusExporter(app: FastifyInstance) {
//   app.get('/metrics', async (request, reply) => {
//     const metrics = getCurrentSnapshotMetrics();
//     reply.header('Content-Type', 'text/plain').send(metrics);
//   });
// }


// import { FastifyInstance } from 'fastify';
// import { getExagridMetrics } from '../util/ExagridPrometheusExporter';

// export function PrometheusExporter(app: FastifyInstance) {
//   app.get('/metrics', async (_, reply) => {
//     try {
//       const metrics = await getExagridMetrics();

//       reply
//         .header('Content-Type', 'text/plain')
//         .send(metrics);
//     } catch (error) {
//       reply.code(500).send('Erro ao gerar métricas');
//     }
//   });
// }


import { FastifyInstance } from 'fastify';
import { getExagridMetrics } from '../../util/ExagridPrometheusExporter';
import { getCurrentSnapshotMetrics } from '../vcenter/GetSnapshot-services';
import { getVeeamMetrics, updateVeeamMetrics } from '../../util/VeeamOnePrometheusExporter';
import { GetAllProtectedVMsService } from '../veeamOne/GetAllProtectedVMsService';
import { protectedVMMetrics } from '../../util/GetAllProtectedVMsServiceExporter';

export function PrometheusExporter(app: FastifyInstance) {
  app.get('/metrics', async (_, reply) => {
    try {
      // const exagridMetrics = await getExagridMetrics();
      // const snapshotMetrics = getCurrentSnapshotMetrics();
      // const vmsProtected = protectedVMMetrics()
      const veeamOneJobs = await updateVeeamMetrics()



      const allMetrics = [
        // exagridMetrics,
        // snapshotMetrics,
        // veeamOneJobs,
        // vmsProtected,
        veeamOneJobs,
        // metrics

      ].join('\n');

      reply
        .header('Content-Type', 'text/plain')
        .send(allMetrics);
    } catch (error) {
      reply.code(500).send('Erro ao gerar métricas');
    }
  });
}


