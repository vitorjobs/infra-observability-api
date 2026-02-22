// JobService.unit.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VBRListBackupJobs } from './JobService';
import { getAuthToken } from '../auth/AuthService';
import fetch from 'node-fetch';

// Mock dos módulos externos
vi.mock('./auth/AuthService');
vi.mock('node-fetch');

describe('VBRListBackupJobs - Testes Unitários', () => {
  const mockAccessToken = 'mock-token-123';
  const mockBaseUrl = 'https://vbr-server:9419';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VBR_BASE_URL = mockBaseUrl;

    // Mock do token de autenticação
    vi.mocked(getAuthToken).mockResolvedValue({ access_token: mockAccessToken });
  });

  it('deve buscar e transformar jobs com sucesso', async () => {
    // Arrange
    const mockApiResponse = {
      data: [
        {
          name: 'Backup Job 1',
          isHighPriority: true,
          isDisabled: false,
          schedule: {
            runAutomatically: true,
            daily: {
              dailyKind: 'Everyday',
              isEnabled: true,
              localTime: '22:00'
            },
            monthly: {
              isEnabled: false
            },
            backupWindow: {
              isEnabled: true
            }
          },
          storage: {
            retentionPolicy: {
              type: 'Days',
              quantity: 30
            },
            gfsPolicy: {
              isEnabled: true
            },
            advancedSettings: {
              backupModeType: 'Incremental',
              synthenticFulls: {
                isEnabled: true,
                weekly: {
                  isEnabled: true,
                  days: ['Sunday']
                },
                monthly: {
                  isEnabled: false
                }
              },
              activeFulls: {
                isEnabled: false,
                weekly: {
                  isEnabled: false,
                  days: []
                },
                monthly: {
                  isEnabled: false
                }
              },
              backupHealth: {
                isEnabled: true
              },
              storageData: {
                compressionLevel: 'Optimal',
                storageOptimization: 'LocalTarget'
              }
            }
          },
          lastRun: '2024-01-15T22:00:00Z'
        }
      ]
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockApiResponse),
      text: vi.fn()
    } as any);

    // Act
    const result = await VBRListBackupJobs();

    // Assert
    expect(getAuthToken).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${mockBaseUrl}/api/v1/jobs`,
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockAccessToken}`,
          'Accept': 'application/json',
          'x-api-version': '1.1-rev2'
        }
      })
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: 'Backup Job 1',
      isHighPriority: true,
      isDisabled: false,
      schedule: {
        runAutomatically: true,
        daily: {
          dailyKind: 'Everyday',
          isEnabled: true,
          localTime: '22:00'
        },
        monthly: {
          isEnabled: false
        },
        backupWindow: {
          isEnabled: true
        }
      },
      retentionPolicy: {
        type: 'Days',
        quantity: 30
      },
      gfsPolicy: {
        isEnabled: true
      },
      advancedSettings: {
        backupModeType: 'Incremental',
        synthenticFulls: {
          isEnabled: true,
          weekly: {
            isEnabled: true,
            days: 'Sunday'
          },
          monthly: {
            isEnabled: false
          }
        },
        activeFulls: {
          isEnabled: false,
          weekly: {
            isEnabled: false,
            days: ''
          },
          monthly: {
            isEnabled: false
          }
        },
        backupHealth: {
          isEnabled: true
        },
        storageData: {
          compressionLevel: 'Optimal',
          storageOptimization: 'LocalTarget'
        },
        lastRun: '2024-01-15T22:00:00Z'
      }
    });
  });

  it('deve retornar array vazio quando não há dados', async () => {
    // Arrange
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce({}),
      text: vi.fn()
    } as any);

    // Act
    const result = await VBRListBackupJobs();

    // Assert
    expect(result).toEqual([]);
  });

  it('deve lidar com propriedades faltantes nos dados', async () => {
    // Arrange
    const mockApiResponse = {
      data: [
        {
          name: 'Incomplete Job',
          // Propriedades faltantes
        }
      ]
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockApiResponse),
      text: vi.fn()
    } as any);

    // Act
    const result = await VBRListBackupJobs();

    // Assert
    expect(result[0]).toEqual({
      name: 'Incomplete Job',
      isHighPriority: false,
      isDisabled: false,
      schedule: {
        runAutomatically: false,
        daily: {
          dailyKind: '',
          isEnabled: false,
          localTime: ''
        },
        monthly: {
          isEnabled: false
        },
        backupWindow: {
          isEnabled: false
        }
      },
      retentionPolicy: {
        type: '',
        quantity: 0
      },
      gfsPolicy: {
        isEnabled: false
      },
      advancedSettings: {
        backupModeType: '',
        synthenticFulls: {
          isEnabled: false,
          weekly: {
            isEnabled: false,
            days: ''
          },
          monthly: {
            isEnabled: false
          }
        },
        activeFulls: {
          isEnabled: false,
          weekly: {
            isEnabled: false,
            days: ''
          },
          monthly: {
            isEnabled: false
          }
        },
        backupHealth: {
          isEnabled: false
        },
        storageData: {
          compressionLevel: '',
          storageOptimization: ''
        }
      }
    });
  });

  it('deve lançar erro quando a resposta da API não é ok', async () => {
    // Arrange
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: vi.fn().mockResolvedValueOnce('Invalid token')
    } as any);

    // Act & Assert
    await expect(VBRListBackupJobs()).rejects.toThrow(
      'Erro ao buscar jobs: 401 - Invalid token'
    );
  });

  it('deve lançar erro quando VBR_BASE_URL não está definido', async () => {
    // Arrange
    delete process.env.VBR_BASE_URL;

    // Act & Assert
    await expect(VBRListBackupJobs()).rejects.toThrow();
  });
});