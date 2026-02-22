import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let prometheusMetrics = '# No data yet';

export function getCurrentSnapshotMetrics(): string {
  return prometheusMetrics;
}

export async function getSnapshots(): Promise<any> {
  const scriptPath = path.resolve(__dirname, '../script/GetSnapshot-scripts.ps1');
  const command = `pwsh -ExecutionPolicy Bypass -File ${JSON.stringify(scriptPath)}`;

  return new Promise((resolve, reject) => {
    exec(command, { shell: 'pwsh' }, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || error.message);
        return;
      }

      try {
        const cleanOutput = stdout.replace(/\x1B\[[0-9;]*m/g, '').trim();
        const jsonStart = cleanOutput.indexOf('[');
        const jsonEnd = cleanOutput.lastIndexOf(']') + 1;
        const jsonString = cleanOutput.slice(jsonStart, jsonEnd);
        const result = JSON.parse(jsonString);

        const metrics = [
          '# HELP vm_snapshot_size_mb Tamanho do snapshot da VM em MB',
          '# TYPE vm_snapshot_size_mb gauge',
        ];

        for (const snap of result) {
          const vm = snap.VM.replace(/"/g, '');
          const snapshot = snap.Name.replace(/"/g, '');
          const size = parseFloat(snap.SizeMB || 0);
          metrics.push(`vm_snapshot_size_mb{vm="${vm}",snapshot="${snapshot}"} ${size}`);
        }

        prometheusMetrics = metrics.join('\n');
        resolve(result);
      } catch (parseError) {
        reject(`Erro ao interpretar saída do script: ${parseError}\nSaída:\n${stdout}`);
      }
    });
  });
}

// Agendador de coleta automática
export function startSnapshotScheduler() {
  const run = () => {
    getSnapshots()
      .then(() => console.log('✔️ Snapshot atualizado para Prometheus'))
      .catch((err) => console.error('❌ Erro ao atualizar snapshot:', err));
  };

  run(); // Executa imediatamente na inicialização
  setInterval(run, 5 * 60 * 1000); // Reexecuta a cada 5 minutos
}