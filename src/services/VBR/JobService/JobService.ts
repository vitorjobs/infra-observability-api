import { getAuthToken } from '../auth/AuthService';
import fetch from 'node-fetch';
import https from 'https';
import { scheduler } from 'timers/promises';

interface BackupJobSimple {
  name: string;
  isHighPriority: boolean;
  isDisabled: boolean;

  schedule: {
    // typeSchedule?: {};
    runAutomatically: boolean;
    daily: {
      dailyKind: string;
      isEnabled: boolean;
      localTime: string;
    };
    monthly: {
      // dayOfWeek: string;
      // dayNumberInMonth: number;
      isEnabled: boolean;
      // localTime: string;
    };
    backupWindow?: {
      isEnabled: boolean;
    }
  };

  retentionPolicy: {
    type: string;
    quantity: number;
  };

  gfsPolicy?: {
    isEnabled: boolean
  };

  advancedSettings?: {
    backupModeType?: string;
    synthenticFulls?: {
      isEnabled: boolean;
      weekly: {
        isEnabled: boolean;
        days: string;
      };
      monthly: {
        isEnabled: boolean;
      }
    }
    activeFulls?: {
      isEnabled: boolean;
      weekly: {
        isEnabled: boolean;
        days: string;
      };
      monthly: {
        isEnabled: boolean;
      }
    }

    backupHealth?: {
      isEnabled: boolean;
    }

    storageData: {
      compressionLevel: string;
      storageOptimization: string
    }

    lastRun?: string;
  }
}
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function VBRListBackupJobs(): Promise<BackupJobSimple[]> {
  const { access_token } = await getAuthToken();
  const baseUrl = process.env.VBR_BASE_URL;
  const response = await fetch(`${baseUrl}/api/v1/jobs`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Accept': 'application/json',
      'x-api-version': '1.1-rev2'
    },
    agent: httpsAgent
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao buscar jobs: ${response.status} - ${errorText}`);
  }

  const data = await response.json() as { data: any[] };

  if (!data.data || !Array.isArray(data.data)) {
    return [];
  }

  return data.data.map((job: any) => ({
    name: job.name || 'Sem nome',
    isHighPriority: job.isHighPriority || false,
    isDisabled: job.isDisabled || false,

    schedule: {
      runAutomatically: job.schedule?.runAutomatically || false,
      daily: {
        dailyKind: job.schedule?.daily?.dailyKind || '',
        isEnabled: job.schedule?.daily?.isEnabled || false,
        localTime: job.schedule?.daily?.localTime || '',
      },
      monthly: {

        isEnabled: job.schedule?.monthly?.isEnabled || false,

      },
      backupWindow: {
        isEnabled: job.schedule?.backupWindow?.isEnabled || false
      }
    },

    retentionPolicy: {
      type: job.storage?.retentionPolicy?.type || '',
      quantity: job.storage?.retentionPolicy?.quantity || 0,
    },

    gfsPolicy: {
      isEnabled: job.storage?.gfsPolicy?.isEnabled || false
    },

    advancedSettings: {
      backupModeType: job.storage?.advancedSettings?.backupModeType || '',

      synthenticFulls: {
        isEnabled: job.storage?.advancedSettings?.synthenticFulls?.isEnabled || false,
        weekly: {
          isEnabled: job.storage?.advancedSettings?.synthenticFulls?.weekly?.isEnabled || false,
          days: job.storage?.advancedSettings?.synthenticFulls?.weekly?.days[0] || ''
        },
        monthly: {
          isEnabled: job.storage?.advancedSettings?.synthenticFulls?.monthly?.isEnabled || false
        }
      },

      activeFulls: {
        isEnabled: job.storage?.advancedSettings?.activeFulls?.isEnabled || false,
        weekly: {
          isEnabled: job.storage?.advancedSettings?.activeFulls?.weekly?.isEnabled || false,
          days: job.storage?.advancedSettings?.activeFulls?.weekly?.days[0] || ''
        },
        monthly: {
          isEnabled: job.storage?.advancedSettings?.activeFulls?.monthly?.isEnabled || false
        }
      },

      backupHealth: {
        isEnabled: job.storage?.advancedSettings?.backupHealth?.isEnabled || false
      },

      storageData: {
        compressionLevel: job.storage?.advancedSettings?.storageData?.compressionLevel || '',
        storageOptimization: job.storage?.advancedSettings?.storageData?.storageOptimization || ''
      },

      ...(job.lastRun && { lastRun: job.lastRun })
    }
  }));
}