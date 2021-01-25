module.exports = {
  apps: [{
    name: 'associate',
    script: './node_modules/.bin/next',
    args: 'start --port 3200',
    instances: 1,
    autorestart: false,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
}
