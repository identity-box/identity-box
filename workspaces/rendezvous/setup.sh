#!/bin/bash

# https://linuxize.com/post/bash-check-if-file-exists/
FILE=$INIT_CWD/node_modules/@identity-box/rendezvous/ecosystem.config.js
if [[ -f "$FILE" ]]; then
  cp $FILE $INIT_CWD/ecosystem.config.js
else
  echo "$FILE does not exist"
fi
