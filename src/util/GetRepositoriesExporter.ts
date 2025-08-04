// repositoriesMetrics.ts
import { Gauge, Registry } from 'prom-client';
import { GetRepositoriesService } from '../services/veeamOne/repositories/GetRepositoriesService';

/**
 * Repository Metrics Collector for Veeam Backup Repositories
 * 
 * This module collects metrics from all Veeam repositories (Linux, ExaGrid, Data Domain, etc.)
 * and exposes them in Prometheus format.
 */

// Create a dedicated registry for repository metrics
const repositoriesRegistry = new Registry();

// Define all possible repository types for type checking
type RepositoryType =
  | 'Linux'
  | 'ExaGrid'
  | 'DataDomain'
  | 'Windows'
  | 'AzureBlob'
  | 'AmazonS3'
  | string; // Fallback for unknown types

// Type definition for repository data
interface VeeamRepository {
  repositoryId: number;
  repositoryUidInVbr: string;
  backupServerId: number;
  name: string;
  type: RepositoryType;
  capacityBytes: number;
  freeSpaceBytes: number;
  runningTasks: number;
  maxConcurrentTasks: number;
  upgradeRequired: boolean;
  outOfSpaceInDays: number;
  state: string;
  path: string;
  oneBackupFilePerVm: boolean;
  isReFs: boolean;
  isImmutable: boolean;
  immutabilityIntervalDays: number | null;
}

/**
 * Repository Metrics Definitions
 * 
 * Each metric includes:
 * - name: Prometheus metric name (prefixed with 'veeam_repository_')
 * - help: Clear description of the metric
 * - labelNames: Dimensions for segmenting data
 * - registers: Links to our dedicated registry
 */
const metrics = {
  // Info metric with repository characteristics
  repositoryInfo: new Gauge({
    name: 'veeam_repository_info',
    help: 'Metadata about Veeam backup repositories',
    labelNames: [
      'name',
      'type',
      'state',
      'backup_server_id',
      'is_immutable',
      'one_file_per_vm',
      'is_refs'
    ],
    registers: [repositoriesRegistry],
  }),

  // Capacity metrics
  capacityBytes: new Gauge({
    name: 'veeam_repository_capacity_bytes',
    help: 'Total storage capacity of the repository in bytes',
    labelNames: ['name', 'type'],
    registers: [repositoriesRegistry],
  }),

  freeSpaceBytes: new Gauge({
    name: 'veeam_repository_free_space_bytes',
    help: 'Available storage space in bytes',
    labelNames: ['name', 'type'],
    registers: [repositoriesRegistry],
  }),

  spaceUsedBytes: new Gauge({
    name: 'veeam_repository_used_space_bytes',
    help: 'Calculated used space in bytes (capacity - free)',
    labelNames: ['name', 'type'],
    registers: [repositoriesRegistry],
  }),

  spaceUtilizationPercent: new Gauge({
    name: 'veeam_repository_space_utilization_percent',
    help: 'Percentage of used space (0-100)',
    labelNames: ['name', 'type'],
    registers: [repositoriesRegistry],
  }),

  // Task metrics
  runningTasks: new Gauge({
    name: 'veeam_repository_running_tasks',
    help: 'Number of currently running tasks',
    labelNames: ['name', 'type'],
    registers: [repositoriesRegistry],
  }),

  maxConcurrentTasks: new Gauge({
    name: 'veeam_repository_max_concurrent_tasks',
    help: 'Maximum allowed concurrent tasks',
    labelNames: ['name', 'type'],
    registers: [repositoriesRegistry],
  }),

  // Status metrics
  outOfSpaceInDays: new Gauge({
    name: 'veeam_repository_out_of_space_in_days',
    help: 'Estimated days until repository runs out of space',
    labelNames: ['name', 'type'],
    registers: [repositoriesRegistry],
  }),

  upgradeRequired: new Gauge({
    name: 'veeam_repository_upgrade_required',
    help: 'Indicates if repository requires upgrade (1=true, 0=false)',
    labelNames: ['name', 'type'],
    registers: [repositoriesRegistry],
  }),

  // Advanced features
  immutabilityIntervalDays: new Gauge({
    name: 'veeam_repository_immutability_interval_days',
    help: 'Configured immutability period in days (0 if not immutable)',
    labelNames: ['name', 'type'],
    registers: [repositoriesRegistry],
  }),
};

/**
 * Updates all repository metrics with fresh data from Veeam API
 */
export async function updateRepositoriesMetrics(): Promise<void> {
  try {
    const apiResponse = await GetRepositoriesService();
    const repositories = apiResponse.items;

    // Reset all metrics before updating to avoid stale data
    Object.values(metrics).forEach(metric => metric.reset());

    if (!Array.isArray(repositories)) {
      throw new Error('API response does not contain valid repositories array');
    }

    repositories.forEach((repo: VeeamRepository) => {
      // Calculate derived metrics
      const usedSpaceBytes = repo.capacityBytes - repo.freeSpaceBytes;
      const spaceUtilization = (usedSpaceBytes / repo.capacityBytes) * 100;

      // Set info metric (always 1, used for labels)
      metrics.repositoryInfo.set(
        {
          name: repo.name,
          type: repo.type,
          state: repo.state,
          backup_server_id: String(repo.backupServerId),
          is_immutable: String(repo.isImmutable),
          one_file_per_vm: String(repo.oneBackupFilePerVm),
          is_refs: String(repo.isReFs),
        },
        1
      );

      // Set capacity metrics
      metrics.capacityBytes.set(
        { name: repo.name, type: repo.type },
        repo.capacityBytes
      );
      metrics.freeSpaceBytes.set(
        { name: repo.name, type: repo.type },
        repo.freeSpaceBytes
      );
      metrics.spaceUsedBytes.set(
        { name: repo.name, type: repo.type },
        usedSpaceBytes
      );
      metrics.spaceUtilizationPercent.set(
        { name: repo.name, type: repo.type },
        spaceUtilization
      );

      // Set task metrics
      metrics.runningTasks.set(
        { name: repo.name, type: repo.type },
        repo.runningTasks
      );
      metrics.maxConcurrentTasks.set(
        { name: repo.name, type: repo.type },
        repo.maxConcurrentTasks
      );

      // Set status metrics
      metrics.outOfSpaceInDays.set(
        { name: repo.name, type: repo.type },
        repo.outOfSpaceInDays
      );
      metrics.upgradeRequired.set(
        { name: repo.name, type: repo.type },
        repo.upgradeRequired ? 1 : 0
      );

      // Set advanced feature metrics
      metrics.immutabilityIntervalDays.set(
        { name: repo.name, type: repo.type },
        repo.immutabilityIntervalDays || 0
      );
    });

  } catch (error) {
    console.error('Failed to update repository metrics:', error);
    // Note: Existing metrics remain unchanged (Prometheus will scrape last good values)
  }
}

/**
 * Returns all repository metrics in Prometheus exposition format
 */
export function getRepositoriesMetrics(): Promise<string> {
  return repositoriesRegistry.metrics();
}

// Configuration
const UPDATE_INTERVAL_MS = 120000; // 2 minutes

// Start periodic updates
setInterval(updateRepositoriesMetrics, UPDATE_INTERVAL_MS).unref();

// Initial update (don't block startup)
updateRepositoriesMetrics().catch(error => {
  console.error('Initial repository metrics update failed:', error);
});

// Export the registry for direct access if needed
export { repositoriesRegistry };