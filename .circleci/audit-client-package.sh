#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

# this could be a separate, reusable check in futue

cd ../packages/client
echo "Packing package"
npm pack
mv codechecks-client-*.tgz /tmp/codechecks-client.tgz

echo "Creating dummy client package and reinstalling client"
rm -rf /tmp/codechecks-client-audit
mkdir -p /tmp/codechecks-client-audit
cd /tmp/codechecks-client-audit

yarn init -y 
yarn add /tmp/codechecks-client.tgz

echo "Conducting audit..."
yarn audit