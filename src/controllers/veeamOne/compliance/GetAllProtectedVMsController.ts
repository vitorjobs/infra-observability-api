import { FastifyRequest, FastifyReply } from "fastify"
import { GetAllProtectedVMsService } from "../../../services/veeamOne/compliance/GetAllProtectedVMsService";

export async function GetAllProtectedVMsController(request: FastifyRequest, reply: FastifyReply) {

  try {
    const result = await GetAllProtectedVMsService()
    return reply.status(200).send(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido ao processar a requisição';
    return reply.status(400).send({ message });
  }
}
