module.exports = {
  apps: [
    {
      name: 'backend',
      script: '/var/www/cloudtesting/backend/server.js',
      cwd: '/var/www/cloudtesting/backend',
      env: {
        NODE_ENV: 'PRODUCTION',
        PORT: 8000,
        FRONTEND_URL: 'https://cloudtesting.cloud',
        CORS_ORIGINS: 'https://cloudtesting.cloud,https://www.cloudtesting.cloud'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/www/cloudtesting/logs/backend-error.log',
      out_file: '/var/www/cloudtesting/logs/backend-out.log'
    },
    {
      name: 'socket',
      script: '/var/www/cloudtesting/socket/index.js',
      cwd: '/var/www/cloudtesting/socket',
      env: {
        NODE_ENV: 'PRODUCTION',
        PORT: 4000,
        CORS_ORIGINS: 'https://cloudtesting.cloud,https://www.cloudtesting.cloud'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: '/var/www/cloudtesting/logs/socket-error.log',
      out_file: '/var/www/cloudtesting/logs/socket-out.log'
    }
  ]
};