import { FastifyRequest, FastifyReply } from "fastify"
import { tapeServer } from "../../../services/veeamOne/tapes/TapeService";

export async function TapeController(request: FastifyRequest, reply: FastifyReply) {

  try {
    const result = await tapeServer()
    return reply.status(200).send(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido ao processar a requisição';
    return reply.status(400).send({ message });
  }
}
