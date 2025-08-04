import { FastifyRequest, FastifyReply } from "fastify"
import { GetExagridInforService } from "../../services/exagrid/GetExagridInforService";

export async function GetExagridInforController(request: FastifyRequest, reply: FastifyReply) {

  try {
    const result = await GetExagridInforService()
    // console.log(result)
    // jobs = result.job

  } catch (err) {
    if (err instanceof Error) {
      return reply.status(400).send({
        message: err.message,
      });
    }
    throw err
  }
  return reply
    .status(200)
    .send(

    // jobs
  )
}