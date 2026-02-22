import { FastifyRequest, FastifyReply } from "fastify"
import { listBackupJobs } from "../../../services/veeamOne/jobs/GetJobsService";

export async function SearchJobs(request: FastifyRequest, reply: FastifyReply) {

  // let jobs
  try {
    // const registerUseCase = MakeSearchPetsUseCase()
    const result = await listBackupJobs()
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