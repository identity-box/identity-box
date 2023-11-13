module.exports = {
  apps: [{
    name: 'box-office',
    script: './node_modules/.bin/box-office',
    args: 'start',
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
