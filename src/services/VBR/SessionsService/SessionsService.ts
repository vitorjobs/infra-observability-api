// import { getAuthToken } from '../auth/AuthService';
// import fetch from 'node-fetch';
// import https from 'https';

// interface SessionsService {
//   sessionType: string;
//   state: string;
//   name: string;
//   creationTime: string;
//   endTime: string | null; // ← precisa aceitar null

//   progressPercent: number;
//   result: {
//     result: string;
//     message: string;
//     isCanceled: boolean;
//   };
// }

// const httpsAgent = new https.Agent({
//   rejectUnauthorized: false,
// });

// export async function VBRSessionsServiceJobs(): Promise<SessionsService[]> {
//   const { access_token } = await getAuthToken();
//   const baseUrl = process.env.VBR_BASE_URL;
//   const response = await fetch(`${baseUrl}/api/v1/sessions/`, {
//     method: 'GET',
//     headers: {
//       'Authorization': `Bearer ${access_token}`,
//       'Accept': 'application/json',
//       'x-api-version': '1.2-rev1'
//     },
//     agent: httpsAgent
//   });

//   const data = await response.json() as { data: SessionsService[] };

//   if (!data.data || !Array.isArray(data.data)) {
//     return [];
//   }

//   // 🔥 Aqui você filtra apenas o que quer retornar
//   return data.data.map((session: SessionsService) => ({
//     sessionType: session.sessionType,
//     state: session.state,
//     name: session.name,
//     creationTime: session.creationTime,
//     endTime: session.endTime,
//     progressPercent: session.progressPercent,
//     result: {
//       result: session.result.result,
//       message: session.result.message,
//       isCanceled: session.result.isCanceled,
//     },
//   }));

// }



// import { getAuthToken } from '../auth/AuthService';
// import fetch from 'node-fetch';
// import https from 'https';

// interface SessionsService {
//   sessionType: string;
//   state: string;
//   name: string;
//   creationTime: string;
//   endTime: string | null;
//   progressPercent: number;
//   // durationMs: number | null;
//   durationMinutes: number | null; // ← agora em minutos

//   result: {
//     result: string;
//     message: string;
//     isCanceled: boolean;
//   };
// }

// const httpsAgent = new https.Agent({
//   rejectUnauthorized: false,
// });

// export async function VBRSessionsServiceJobs(): Promise<SessionsService[]> {
//   const { access_token } = await getAuthToken();
//   const baseUrl = process.env.VBR_BASE_URL;

//   const response = await fetch(`${baseUrl}/api/v1/sessions/`, {
//     method: 'GET',
//     headers: {
//       Authorization: `Bearer ${access_token}`,
//       Accept: 'application/json',
//       'x-api-version': '1.2-rev1',
//     },
//     agent: httpsAgent,
//   });

//   if (!response.ok) {
//     throw new Error(`Erro ao buscar sessões: ${response.status}`);
//   }

//   const json = await response.json() as { data: SessionsService[] };

//   if (!json.data || !Array.isArray(json.data)) {
//     return [];
//   }

//   return json.data.map((session) => {

//     let durationMinutes: number | null = null;

//     if (
//       session.result?.result === "Success" &&
//       session.endTime
//     ) {
//       const durationMs =
//         Date.parse(session.endTime) -
//         Date.parse(session.creationTime);

//       durationMinutes = Math.round(durationMs / 60000);
//     }
//     return {
//       sessionType: session.sessionType,
//       state: session.state,
//       name: session.name,
//       creationTime: session.creationTime,
//       endTime: session.endTime,
//       progressPercent: session.progressPercent,
//       durationMinutes,
//       result: {
//         result: session.result.result,
//         message: session.result.message,
//         isCanceled: session.result.isCanceled,
//       },
//     };
//   });
// }


import { getAuthToken } from '../auth/AuthService';
import fetch from 'node-fetch';
import https from 'https';

interface SessionsService {
  sessionType: string;
  state: string;
  name: string;
  creationTime: string;
  endTime: string | null;
  progressPercent: number;
  durationMinutes: number | null;

  result: {
    result: string;
    message: string;
    isCanceled: boolean;
  };
}

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function VBRSessionsServiceJobs(): Promise<SessionsService[]> {
  const { access_token } = await getAuthToken();
  const baseUrl = process.env.VBR_BASE_URL;

  const response = await fetch(`${baseUrl}/api/v1/sessions/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: 'application/json',
      'x-api-version': '1.2-rev1',
    },
    agent: httpsAgent,
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar sessões: ${response.status}`);
  }

  const json = (await response.json()) as { data: SessionsService[] };

  if (!json.data || !Array.isArray(json.data)) {
    return [];
  }

  // 🔹 Manter apenas a sessão mais recente por "name"
  const latestSessionsMap = new Map<string, SessionsService>();

  for (const session of json.data) {
    const existing = latestSessionsMap.get(session.name);

    if (!existing) {
      latestSessionsMap.set(session.name, session);
      continue;
    }

    const currentCreation = Date.parse(session.creationTime);
    const existingCreation = Date.parse(existing.creationTime);

    if (currentCreation > existingCreation) {
      latestSessionsMap.set(session.name, session);
    }
  }

  return Array.from(latestSessionsMap.values()).map((session) => {
    let durationMinutes: number | null = null;

    if (
      session.result?.result === "Success" &&
      session.endTime
    ) {
      const durationMs =
        Date.parse(session.endTime) -
        Date.parse(session.creationTime);

      durationMinutes = Math.round(durationMs / 60000);
    }

    return {
      sessionType: session.sessionType,
      state: session.state,
      name: session.name,
      creationTime: session.creationTime,
      endTime: session.endTime,
      progressPercent: session.progressPercent,
      durationMinutes,
      result: {
        result: session.result.result,
        message: session.result.message,
        isCanceled: session.result.isCanceled,
      },
    };
  });
}
