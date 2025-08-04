// export const apps = [{
//   name: 'veeam-backup-monitor',
//   script: 'dist/server.js', // Arquivo compilado
//   instances: 1,
//   autorestart: true,
//   watch: false,
//   max_memory_restart: '1G', // Corrigido de '16' para '1G'
//   env: {
//     NODE_ENV: 'production',
//     LOG_LEVEL: 'info'
//   },
//   error_file: './logs/veeam-error.log',
//   out_file: './logs/veeam-out.log',
//   log_date_format: 'YYYY-MM-DD HH:mm:ss',
//   merge_logs: true,
//   time: true
// }];

// // ✅ CommonJS (compatível com PM2)
// export const apps = [{
//   name: 'veeam-backup-monitor',
//   script: 'build/server.js',
//   instances: 1,
//   autorestart: true,
//   watch: false,
//   max_memory_restart: '1G',
//   env: {
//     NODE_ENV: 'production',
//     LOG_LEVEL: 'info'
//   },
//   // error_file: './logs/veeam-error.log',
//   // out_file: './logs/veeam-out.log',
//   // log_date_format: 'YYYY-MM-DD HH:mm:ss',
//   merge_logs: true,
//   time: true
// }];


module.exports = {
  apps: [{
    name: 'veeam-backup-monitor',
    script: 'build/server.js', // Arquivo compilado
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      LOG_LEVEL: 'info'
    },
    error_file: './logs/veeam-error.log',
    out_file: './logs/veeam-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    time: true
  }]
};