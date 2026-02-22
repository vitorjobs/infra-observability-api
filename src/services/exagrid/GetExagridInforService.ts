import fetch from 'node-fetch';
import https from 'https';

interface SiteInfo {
  name: string;
  adminStatus: string;
  operStatus: string;
  isUp: boolean;
  exagridUuid: string;
  veeamEnabled: boolean;
  primaryPooledSharesCount: number;
  maxPooledShares: number;
  retentionForeignPendingPurge: number;
  dedupRatio: number;
  serversCount: number;
  sharesCount: number;
}

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function GetExagridInforService(): Promise<any[]> {

  const baseUrl = process.env.EXAGRID_API_EXAGRIDS;
  const response = await fetch(`${baseUrl}`, {
    method: 'GET',
    headers: {
      // 'Authorization': `Bearer ${access_token}`,
      'Accept': 'application/json',
      'cookie': 'JSESSIONID=AB1AF76D0D4AB458A50D653BF122CB95; JSESSIONID=0090B37276EDBEAADDD4A245AF688586; JSESSIONIDSSO=53452B9F4B4ADB1338EA0D9C23284589'
    },
    agent: httpsAgent
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao buscar jobs: ${response.status} - ${errorText}`);
  }
  const data = await response.json();

  const getSiteInfoArray = (data: any[]): SiteInfo[] => {
    return data.flatMap(host =>
      Array.isArray(host.sites)
        ? host.sites.map((site: any) => ({
          name: site.name,
          adminStatus: site.adminStatus,
          operStatus: site.operStatus,
          isUp: site.isUp,
          exagridUuid: site.exagridUuid,
          veeamEnabled: site.veeamEnabled,
          maxPooledShares: site.maxPooledShares,
          dedupRatio: parseFloat(site.dedupRatio),
          serversCount: Array.isArray(site.servers) ? site.servers.length : 0,
          sharesCount: Array.isArray(site.shares) ? site.shares.length : 0
        }))
        : []
    );
  };

  // Uso:
  const siteInfoArray = getSiteInfoArray(data);
  console.dir(siteInfoArray, { depth: null });
  return siteInfoArray;
}
