import { FastifyRequest, FastifyReply } from "fastify"
import { GetRepositoriesService } from "../../../services/veeamOne/repositories/GetRepositoriesService";

export async function GetRepositoriesController(request: FastifyRequest, reply: FastifyReply) {

  try {
    const result = await GetRepositoriesService()
    return reply.status(200).send(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido ao processar a requisição';
    return reply.status(400).send({ message });
  }
}
