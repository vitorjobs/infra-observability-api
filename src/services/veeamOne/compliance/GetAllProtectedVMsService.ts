import { getAuthToken } from './auth/AuthService';
import fetch from 'node-fetch';
import https from 'https';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

interface BackupJob {
  name: string;
  usedSourceSizeBytes: number;
  provisionedSourceSizeBytes: number;
  lastProtectedDate: string;
  jobName: string
}

export async function GetAllProtectedVMsService(): Promise<BackupJob[]> {
  // export async function listBackupJobs(): Promise<any[]> {
  const { access_token } = await getAuthToken();

  const baseUrl = process.env.VEEAM_ONE_BASE_URL;

  const response = await fetch(`${baseUrl}/v2.2/protectedData/virtualMachines`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Accept': 'application/json'
    },
    agent: httpsAgent
  });

  // const data = await response.json();
  // // console.log(data);
  // return data


  const { items = [] } = await response.json();

  return items.map(({
    name,
    usedSourceSizeBytes,
    provisionedSourceSizeBytes,
    lastProtectedDate,
    jobName
  }: BackupJob) => ({
    name,
    jobName,
    usedSourceSizeBytes,
    provisionedSourceSizeBytes,
    lastProtectedDate,

  }));

}
