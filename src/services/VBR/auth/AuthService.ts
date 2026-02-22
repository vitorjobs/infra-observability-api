// import 'dotenv/config';
// import fetch from 'node-fetch';
// import https from 'https';

// // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// interface TokenResponse {
//   access_token: string;
//   refresh_token?: string;
// }

// const httpsAgent = new https.Agent({
//   rejectUnauthorized: false,
// });

// function getEnvVariable(name: string, required = true): string | undefined {
//   const value = process.env[name];
//   if (required && !value) {
//     throw new Error(`Variável de ambiente obrigatória não definida: ${name}`);
//   }
//   return value;
// }

// export async function getAuthToken(): Promise<TokenResponse> {
//   console.log("🔐 Tentando obter token de autenticação para VBR 12.3...");

//   const baseUrl = getEnvVariable('VBR_BASE_URL')!;
//   const username = getEnvVariable('VBR_BASE_USERNAME')!;
//   const password = getEnvVariable('VBR_BASE_PASSWORD')!;
//   const grantType = getEnvVariable('VBR_BASE_GRANT_TYPE')!;
//   const refreshToken = getEnvVariable('VBR_BASE_REFRESH_TOKEN', false);
//   const params = new URLSearchParams({
//     username,
//     password,
//     grant_type: grantType,
//   });

//   console.log("URL da API:", `${baseUrl}/api/oauth2/token`);

//   if (refreshToken) {
//     params.append('refresh_token', refreshToken);
//   }

//   try {
//     const response = await fetch(`${baseUrl}/api/oauth2/token`, {
//       method: 'POST',
//       body: params.toString(),
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//         'x-api-version': '1.1-rev2',
//       },
//       // params: {
//       //   limit: '200'
//       // },

//       agent: httpsAgent,
//     });

//     const responseText = await response.text();

//     if (!response.ok) {
//       throw new Error(`Erro ao autenticar: ${response.status} ${response.statusText}\nCorpo da resposta:\n${responseText}`);
//     }

//     const data = JSON.parse(responseText);
//     console.log("✅ Token de autenticação obtido com sucesso!");

//     const { access_token, refresh_token } = data;
//     return { access_token, refresh_token }; // Retorna apenas o necessário

//   } catch (error: any) {
//     console.error(`❌ Falha na requisição de autenticação: ${error.message}`);
//     throw error;
//   }
// }


import 'dotenv/config';
import fetch from 'node-fetch';
import https from 'https';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
}

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

function getEnvVariable(name: string, required = true): string | undefined {
  const value = process.env[name];
  if (required && !value) {
    throw new Error(`Variável de ambiente obrigatória não definida: ${name}`);
  }
  return value;
}

export async function getAuthToken(): Promise<TokenResponse> {
  console.log("🔐 Tentando obter token de autenticação para VBR 12.3...");

  const baseUrl = getEnvVariable('VBR_BASE_URL')!;
  const username = getEnvVariable('VBR_BASE_USERNAME')!;
  const password = getEnvVariable('VBR_BASE_PASSWORD')!;
  const grantType = getEnvVariable('VBR_BASE_GRANT_TYPE')!;
  const refreshToken = getEnvVariable('VBR_BASE_REFRESH_TOKEN', false);
  const params = new URLSearchParams({
    username,
    password,
    grant_type: grantType,
  });

  console.log("URL da API:", `${baseUrl}/api/oauth2/token`);

  if (refreshToken) {
    params.append('refresh_token', refreshToken);
  }

  try {
    const response = await fetch(`${baseUrl}/api/oauth2/token`, {
      method: 'POST',
      body: params.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-api-version': '1.1-rev2',
      },
      // params: {
      //   limit: '200'
      // },

      agent: httpsAgent,
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`Erro ao autenticar: ${response.status} ${response.statusText}\nCorpo da resposta:\n${responseText}`);
    }

    const data = JSON.parse(responseText);
    console.log("✅ Token de autenticação obtido com sucesso!");

    const { access_token, refresh_token } = data;
    return { access_token, refresh_token }; // Retorna apenas o necessário

  } catch (error: any) {
    console.error(`❌ Falha na requisição de autenticação: ${error.message}`);
    throw error;
  }
}