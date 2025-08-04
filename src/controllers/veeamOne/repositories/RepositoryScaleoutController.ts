import { FastifyRequest, FastifyReply } from "fastify"
import { RepositoryScaleoutService } from "../../../services/veeamOne/repositories/GetRepositoryScaleoutService";

export async function RepositoryScaleoutController(request: FastifyRequest, reply: FastifyReply) {

  try {
    const result = await RepositoryScaleoutService()
    return reply.status(200).send(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido ao processar a requisição';
    return reply.status(400).send({ message });
  }
}
