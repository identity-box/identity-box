module.exports = {
  apps: [{
    name: 'identity-service',
    script: './node_modules/.bin/identity-service',
    instances: 1,
    autorestart: false,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    node_args: '-r esm'
  }]
}
