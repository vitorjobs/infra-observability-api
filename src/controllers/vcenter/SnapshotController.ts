import { getSnapshots } from '../../services/vcenter/GetSnapshot-services';
import { FastifyRequest, FastifyReply } from "fastify"

export async function snapshotRoutes(request: FastifyRequest, reply: FastifyReply) {
  try {
    const snapshots = await getSnapshots();
    reply.send(snapshots);
  } catch (error) {
    reply.status(500).send({ error: 'Erro ao buscar snapshots' });
  }
}
