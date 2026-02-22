// vitest.setup.ts
// Configurar fetch globalmente para todos os testes
import fetch from 'node-fetch';
// import { vi } from 'vitest';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente para testes
dotenv.config({ path: '.env.test' });

// Configurar fetch globalmente para todos os testes
global.fetch = fetch as any;

// Mock global do fetch se necessário
// vi.mock('node-fetch');
