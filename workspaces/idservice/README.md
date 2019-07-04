# Identity Service

A service to handle identity requests on IdBox.

## Usage

```
node -r esm main.js <dag-ref>
```

## With PM2

We're using pm2 to start the processes.

> NOTE: we still need to pass a proper dag to the process in ecosystem.config.js

### Start process
```
../../node_modules/pm2/bin/pm2 start ecosystem.config.js
```

### All processes
```
../../node_modules/pm2/bin/pm2 list
```

### Settings on idservice
```
../../node_modules/pm2/bin/pm2 show idservice
```

### Logs idservice
All:
```
../../node_modules/pm2/bin/pm2 log idservice
```

Qrcode:
```
../../node_modules/pm2/bin/pm2 log idservice --out --lines 150
```

### Restart process after editing ecosystem
```
../../node_modules/pm2/bin/pm2 delete ecosystem.config.js
../../node_modules/pm2/bin/pm2 start ecosystem.config.js
```
