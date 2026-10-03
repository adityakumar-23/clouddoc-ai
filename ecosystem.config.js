module.exports = {
  apps: [
    {
      name: 'clouddoc-api',
      script: './dist/server.js',
      cwd: '/opt/clouddoc/backend',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/var/log/clouddoc/api-err.log',
      out_file: '/var/log/clouddoc/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'clouddoc-worker',
      script: './dist/workers/documentWorker.js',
      cwd: '/opt/clouddoc/backend',
      instances: 2,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1.5G',
      env_production: {
        NODE_ENV: 'production'
      },
      error_file: '/var/log/clouddoc/worker-err.log',
      out_file: '/var/log/clouddoc/worker-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
