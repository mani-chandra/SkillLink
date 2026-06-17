#!/bin/bash

cd "$(dirname "$0")"

while true; do
  echo "Starting server..."
  node index.js
  echo "Server crashed, restarting in 2 seconds..."
  sleep 2
done
