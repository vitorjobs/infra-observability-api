import { FastifyInstance } from "fastify";
import { snapshotRoutes } from "./controllers/vcenter/SnapshotController"
import { listBackupJobs } from "./services/veeamOne/jobs/GetJobsService";
import { GetExagridInforController } from "./controllers/exagrid/ExagridInfoController";
import { RepositoryScaleoutController } from "./controllers/veeamOne/repositories/RepositoryScaleoutController";
import { GetVeeamOneAboutController } from "./controllers/veeamOne/about/GetVeeamOneAboutController";
import { GetAllProtectedVMsController } from "./controllers/veeamOne/compliance/GetAllProtectedVMsController";
import { GetRepositoriesController } from "./controllers/veeamOne/repositories/GetRepositoriesController";
import { TapeController } from "./controllers/veeamOne/tapes/TapeController";
import { VBRSearchJobs } from "./controllers/VBR/JobsController";
import { VBRSearchSessions } from "./controllers/VBR/SessionsController";



export async function appRoutes(app: FastifyInstance) {
  app.get('/snapshot/get', snapshotRoutes);

  app.post('/SearchJobs', listBackupJobs);
  app.post('/SearchTape', TapeController);
  app.post('/SearchRepositories', GetRepositoriesController);
  app.post('/SearchRepositoryScaleout', RepositoryScaleoutController);
  app.post('/GetAllProtectedVMsController', GetAllProtectedVMsController);

  app.post('/GetVeeamOneAboutController', GetVeeamOneAboutController);

  /** EXAGRID */
  app.get('/exagrid/infor', GetExagridInforController)


  /** VEEAM BACKUP & REPLICATION 12.3*/
  app.get('/SearchJobsVbr', VBRSearchJobs);
  app.get('/SearchSessionsJobsVbr', VBRSearchSessions);
}



