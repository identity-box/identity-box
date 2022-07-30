module.exports = {
  apps: [{
    name: 'hush-hush',
    script: './node_modules/.bin/next',
    args: 'start --port 3300',
    instances: 1,
    autorestart: false,
    watch: false,
    max_memory_restart: '2G'
  }]
}
