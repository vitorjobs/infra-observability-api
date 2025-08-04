import { getAuthToken } from '../auth/AuthService';
import fetch from 'node-fetch';
import https from 'https';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function tapeServer(): Promise<any> {
  // export async function listBackupJobs(): Promise<any[]> {
  const { access_token } = await getAuthToken();

  const baseUrl = process.env.VEEAM_ONE_BASE_URL;

  const response = await fetch(`${baseUrl}/v2.2/vbr/tapeServers`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Accept': 'application/json'
    },
    agent: httpsAgent
  });

  const data = await response.json();
  console.log(data);
  return data

}
