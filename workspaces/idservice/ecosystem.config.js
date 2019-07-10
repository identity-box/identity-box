module.exports = {
  apps: [{
    name: 'idservice',
    script: './node_modules/.bin/idservice',
    args: 'zdpuAnNHdFqw4FQkBgSTC3kKCHrHyFHyEBbeuCafwV2JkvPc6',
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
