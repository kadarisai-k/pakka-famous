module.exports = {
  apps: [
    {
      name: 'pakka-backend',
      script: './backend/server.js',
      cwd: __dirname,
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      autorestart: true,
      min_uptime: '5s',
      max_restarts: 10,
    },
    // NOTE: PM2 is used for the backend only.
    // Frontend (port 3000) and Admin (port 3001) are served as static builds via nginx in production.
    // For local development, run each with: npm start (inside /frontend and /admin)
  ],
};
