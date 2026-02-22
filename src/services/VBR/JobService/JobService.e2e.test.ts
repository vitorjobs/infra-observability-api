// src/services/VBR/JobService.e2e.test.ts - VERSÃO CORRIGIDA
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { VBRListBackupJobs } from './JobService';
import { getAuthToken } from '../auth/AuthService';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch'; // IMPORTANTE: Importar fetch

// Garantir que fetch está disponível globalmente
if (!global.fetch) {
  global.fetch = fetch as any;
}

// Carrega variáveis de ambiente do arquivo .env.test
const envPath = path.resolve(process.cwd(), '.env.test');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`📁 Arquivo .env.test carregado: ${envPath}`);
} else {
  dotenv.config();
  console.log('⚠️ Arquivo .env.test não encontrado, usando .env padrão');
}

describe('VBRListBackupJobs - Testes de Integração com AuthService Real', () => {
  // Verifica se as variáveis de ambiente estão configuradas antes de todos os testes
  beforeAll(() => {
    console.log('\n🔍 Verificando configuração para testes de integração...');

    const requiredVars = [
      'VBR_BASE_URL',
      'VBR_BASE_USERNAME',
      'VBR_BASE_PASSWORD',
      'VBR_BASE_GRANT_TYPE'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      console.error('\n❌ Variáveis de ambiente obrigatórias não configuradas:');
      missingVars.forEach(varName => console.error(`   - ${varName}`));
      console.error('\n📝 Configure um arquivo .env.test com:');
      console.error(`
        VBR_BASE_URL=https://seu-servidor-vbr:9419
        VBR_BASE_USERNAME=seu-usuario
        VBR_BASE_PASSWORD=sua-senha
        VBR_BASE_GRANT_TYPE=password
      `);
      throw new Error(`Variáveis de ambiente faltando: ${missingVars.join(', ')}`);
    }

    // Mostra configuração (ocultando senha)
    console.log('\n✅ Configuração encontrada:');
    console.log(`   VBR_BASE_URL: ${process.env.VBR_BASE_URL}`);
    console.log(`   VBR_BASE_USERNAME: ${process.env.VBR_BASE_USERNAME?.substring(0, 3)}...`);
    console.log(`   VBR_BASE_GRANT_TYPE: ${process.env.VBR_BASE_GRANT_TYPE}`);
    console.log('');
  });

  // Teste 1: Verificar conectividade básica com o servidor
  it('Deve verificar se o servidor VBR está acessível', async () => {
    console.log('🔄 Verificando conectividade com o servidor...');

    try {
      const baseUrl = process.env.VBR_BASE_URL;
      const testUrl = `${baseUrl}/api/v1/serverTime`; // Endpoint de health check

      // const response = await fetch(testUrl, {
      //   method: 'GET',

      //   agent: new (await import('https')).Agent({
      //     rejectUnauthorized: false
      //   })
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'x-api-version': '1.2-rev1'
        },
        agent: new (await import('https')).Agent({
          rejectUnauthorized: false
        })
      });

      // expect(response).toBeDefined();
      // expect(response).toHaveProperty('serverTime')
      expect(response.status).toBe(200);
      expect(response.ok).toBe(true);

      // Type assertion direta
      const data = await response.json() as { timeZone: string; serverTime?: string };

      expect(data.timeZone).toBe('(UTC-03:00) Brasília');

      console.log(`✅ Servidor OK | Status: ${response.status} | TimeZone: ${data.timeZone}`);

      // Log adicional do serverTime se existir
      console.log(`✅ Servidor acessível: ${response.status} ${response.statusText}`);

    } catch (error: any) {
      console.error(`❌ Servidor inacessível: ${error.message}`);
      throw new Error(`Não foi possível conectar ao servidor VBR. Verifique se a URL ${process.env.VBR_BASE_URL} está correta e acessível.`);
    }
  }, 10000);

  // Teste 2: Verificar se o AuthService funciona isoladamente
  it('deve obter token de autenticação com sucesso', async () => {
    console.log('🔄 Testando autenticação isolada...');

    try {
      const tokenResponse = await getAuthToken();

      expect(tokenResponse).toBeDefined();
      expect(tokenResponse).toHaveProperty('access_token');
      expect(typeof tokenResponse.access_token).toBe('string');
      expect(tokenResponse.access_token.length).toBeGreaterThan(0);

      console.log('✅ Token obtido com sucesso!');
      console.log(`   Access Token: ${tokenResponse.access_token.substring(0, 20)}...`);

      if (tokenResponse.refresh_token) {
        console.log(`   Refresh Token: ${tokenResponse.refresh_token.substring(0, 20)}...`);
      }
    } catch (error: any) {
      console.error(`❌ Falha na autenticação: ${error.message}`);
      throw error;
    }
  }, 30000);

  // Teste 3: Testar a função completa VBRListBackupJobs
  it('deve buscar e processar jobs reais da API Veeam', async () => {
    console.log('🔄 Buscando jobs da API Veeam...');

    try {
      const jobs = await VBRListBackupJobs();

      // Verificações básicas
      expect(Array.isArray(jobs)).toBe(true);
      console.log(`✅ Busca concluída. Encontrados ${jobs.length} jobs.`);

      // Se houver jobs, valida a estrutura do primeiro
      if (jobs.length > 0) {
        const firstJob = jobs[0];

        // Validação da estrutura do job
        expect(firstJob).toHaveProperty('name');
        expect(typeof firstJob.name).toBe('string');
        expect(firstJob).toHaveProperty('isHighPriority');
        expect(typeof firstJob.isHighPriority).toBe('boolean');
        expect(firstJob).toHaveProperty('isDisabled');
        expect(typeof firstJob.isDisabled).toBe('boolean');

        console.log('📋 Primeiro job encontrado:');
        console.log(`   Nome: ${firstJob.name}`);
        console.log(`   Prioridade: ${firstJob.isHighPriority ? 'Alta' : 'Normal'}`);
        console.log(`   Status: ${firstJob.isDisabled ? 'Desabilitado' : 'Habilitado'}`);
      }
    } catch (error: any) {
      console.error(`❌ Erro ao buscar jobs: ${error.message}`);
      throw error;
    }
  }, 60000);

  // Teste 4: Verificar tratamento de erros com credenciais inválidas
  it('deve falhar com credenciais inválidas', async () => {
    const originalUsername = process.env.VBR_BASE_USERNAME;
    const originalPassword = process.env.VBR_BASE_PASSWORD;

    try {
      process.env.VBR_BASE_USERNAME = 'usuario_invalido_123';
      process.env.VBR_BASE_PASSWORD = 'senha_invalida_456';

      console.log('🔄 Testando falha de autenticação com credenciais inválidas...');

      await expect(VBRListBackupJobs()).rejects.toThrow();
      console.log('✅ Falha de autenticação capturada corretamente!');

    } finally {
      process.env.VBR_BASE_USERNAME = originalUsername;
      process.env.VBR_BASE_PASSWORD = originalPassword;
    }
  }, 30000);
});

// Testes de diagnóstico adicionais
describe('VBR Diagnostics', () => {
  it('deve verificar versão da API Veeam', async () => {
    try {
      const baseUrl = process.env.VBR_BASE_URL;
      const response = await fetch(`${baseUrl}/api/version`, {
        method: 'GET',
        agent: new (await import('https')).Agent({
          rejectUnauthorized: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Informações do servidor Veeam:', data);
      }
    } catch (error) {
      console.log('⚠️ Não foi possível obter versão da API');
    }
  });
});