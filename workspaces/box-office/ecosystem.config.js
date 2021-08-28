module.exports = {
  apps: [{
    name: 'box-office',
    script: 'yarn',
    args: 'box-office start',
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
