import 'dotenv/config';
import fetch from 'node-fetch';
import https from 'https';

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
  console.log("🔐 Tentando obter token de autenticação...");

  const baseUrl = getEnvVariable('VEEAM_ONE_BASE_URL')!;
  const username = getEnvVariable('VEEAM_ONE_USERNAME')!;
  const password = getEnvVariable('VEEAM_ONE_PASSWORD')!;
  const grantType = getEnvVariable('VEEAM_ONE_GRANT_TYPE')!;
  const refreshToken = getEnvVariable('VEEAM_ONE_REFRESH_TOKEN', false);

  const params = new URLSearchParams({
    username,
    password,
    grant_type: grantType,
  });

  if (refreshToken) {
    params.append('refresh_token', refreshToken);
  }

  try {
    const response = await fetch(`${baseUrl}/token`, {
      method: 'POST',
      body: params.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
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