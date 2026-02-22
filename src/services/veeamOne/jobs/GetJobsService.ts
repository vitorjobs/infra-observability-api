import { getAuthToken } from '../auth/AuthService';
import fetch from 'node-fetch';
import https from 'https';

interface BackupJob {
  name: string;
  status: string;
  // details: string[];
  lastRun: string;
  lastRunDurationSec: number;
  avgDurationSec: number;
  lastTransferredDataBytes: number;
}

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function listBackupJobs(): Promise<BackupJob[]> {
  // export async function listBackupJobs(): Promise<any[]> {
  const { access_token } = await getAuthToken();

  const baseUrl = process.env.VEEAM_ONE_BASE_URL;
  const response = await fetch(`${baseUrl}/v2.2/vbrJobs/vmBackupJobs`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Accept': 'application/json'
    },
    agent: httpsAgent
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao buscar jobs: ${response.status} - ${errorText}`);
  }

  // /**TENTATIVA 01 */
  // return await response.json();
  // /** */

  // /**TENTATIVA 02 */
  // const jobs: VmBackupJob[] = await response.json();
  // console.log(jobs)
  // return jobs;
  // /** */

  /**TENTATIVA 03 */
  const { items = [] } = await response.json();

  return items.map(({
    name,
    status,
    // details,
    lastRun,
    lastRunDurationSec,
    avgDurationSec,
    lastTransferredDataBytes
  }: BackupJob) => ({
    name,
    status,
    // details,
    lastRun,
    lastRunDurationSec,
    avgDurationSec,
    lastTransferredDataBytes
  }));


}
