import { FastifyRequest, FastifyReply } from "fastify"
import { VBRListBackupJobs } from "../../services/VBR/JobService/JobService";

export async function VBRSearchJobs(request: FastifyRequest, reply: FastifyReply) {

  // let jobs
  try {
    // const registerUseCase = MakeSearchPetsUseCase()
    const result = await VBRListBackupJobs()
    return reply.status(200).send(result);

    // jobs = result.job
  } catch (err) {
    if (err instanceof Error) {
      return reply.status(400).send({
        message: err.message,
      });
    }
    throw err
  }
  // return reply
  //   .status(200)
  //   .send(

  //   // jobs
  // )
}