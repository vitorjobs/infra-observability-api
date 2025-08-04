import { FastifyInstance } from 'fastify';
// import { getVeeamMetrics, updateVeeamMetrics } from '../../util/VeeamOnePrometheusExporter';
import { getProtectedVMMetrics, protectedVMMetrics } from '../../util/GetAllProtectedVMsServiceExporter';
import { getVeeamMetrics, updateVeeamMetrics } from '../../util/GetJobsServiceExporter';
import { getScaleOutRepositoryMetrics } from '../../util/GetRepositoryScaleoutExporter';
import { getVeeamAboutMetrics } from '../../util/GetVeeamOneAboutExporter';
import { getRepositoriesMetrics } from '../../util/GetRepositoriesExporter';
// import { getVeeamMetrics, updateVeeamMetrics } from '../../util/VeeamOnePrometheusExporter';

export function PrometheusExporter(app: FastifyInstance) {
  app.get('/metrics', async (_, reply) => {
    try {
      // // Atualiza e coleta as métricas individualmente
      // const veeamMetrics = await updateVeeamMetrics();
      // const vmMetrics = await protectedVMMetrics();

      const repositoryScaleOut = await getScaleOutRepositoryMetrics()
      const veeamMetrics = await getVeeamMetrics();
      const vmMetrics = await getProtectedVMMetrics();
      const veeamAboutMetrics = await getVeeamAboutMetrics();
      const repositories = await getRepositoriesMetrics();

      const allMetrics = [
        veeamMetrics,
        vmMetrics,
        repositoryScaleOut,
        veeamAboutMetrics,
        repositories
      ].join('\n');

      reply
        .header('Content-Type', 'text/plain')
        .send(allMetrics);
    } catch (error) {
      console.error('Erro ao gerar métricas:', error);
      reply.code(500).send('# erro ao gerar métricas\n');
    }
  });
}

