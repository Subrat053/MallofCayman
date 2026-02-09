module.exports = {
  apps: [
    {
      name: 'backend',
      script: '/var/www/caymanisland/backend/server.js',
      cwd: '/var/www/caymanisland/backend',
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
        FRONTEND_URL: 'https://your-domain.com'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/www/caymanisland/logs/backend-error.log',
      out_file: '/var/www/caymanisland/logs/backend-out.log'
    },
    {
      name: 'socket',
      script: '/var/www/caymanisland/socket/index.js',
      cwd: '/var/www/caymanisland/socket',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: '/var/www/caymanisland/logs/socket-error.log',
      out_file: '/var/www/caymanisland/logs/socket-out.log'
    }
  ]
};