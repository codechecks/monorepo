#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

# this could be a separate, reusable check in futue

cd ../packages/client
yarn link

mkdir -p /tmp/codechecks-client-audit
cd /tmp/codechecks-client-audit

yarn init -y 
yarn add @codechecks/client

echo "Conducting audit..."
yarn audit