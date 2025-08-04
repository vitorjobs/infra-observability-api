import { FastifyRequest, FastifyReply } from "fastify"
import { GetVeeamOneAboutService } from "../../../services/veeamOne/about/GetVeeamOneAboutService";

export async function GetVeeamOneAboutController(request: FastifyRequest, reply: FastifyReply) {

  try {
    const result = await GetVeeamOneAboutService()
    return reply.status(200).send(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido ao processar a requisição';
    return reply.status(400).send({ message });
  }
}
