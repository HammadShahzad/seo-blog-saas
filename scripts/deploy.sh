#!/usr/bin/env bash
set -euo pipefail

DROPLET_IP="167.71.96.242"
DROPLET_USER="root"
DROPLET_PATH="/var/www/stackserp"
SSH_PASS="Hammad@2k2"
SSH_CMD="sshpass -p '${SSH_PASS}' ssh -o StrictHostKeyChecking=no"
SCP_CMD="sshpass -p '${SSH_PASS}' scp -o StrictHostKeyChecking=no"
RSYNC_CMD="sshpass -p '${SSH_PASS}' rsync -azP -e 'ssh -o StrictHostKeyChecking=no'"

REMOTE="${DROPLET_USER}@${DROPLET_IP}"
DEST="${REMOTE}:${DROPLET_PATH}"

echo "=== StackSerp Deploy ==="
echo ""

# 1. Build
echo "[1/5] Building Next.js standalone..."
npm run build 2>&1 | tail -5
echo ""

# 2. Deploy standalone output (server.js + .next/server bundles)
# NO --delete flag: standalone doesn't contain worker.js, schema, migrations, etc.
echo "[2/5] Deploying standalone build..."
eval $RSYNC_CMD \
  .next/standalone/ \
  "${DEST}/" \
  --exclude node_modules \
  --exclude .env \
  --exclude ecosystem.config.js 2>&1 | tail -3
echo ""

# 3. Deploy static assets (--delete OK here, fully owned by build)
echo "[3/5] Deploying static assets..."
eval $RSYNC_CMD --delete \
  .next/static/ \
  "${DEST}/.next/static/" 2>&1 | tail -3
echo ""

# 4. Deploy extra files not included in standalone output
echo "[4/5] Deploying worker, schema, and migrations..."
eval $SCP_CMD worker.js "${DEST}/worker.js"
eval $SCP_CMD prisma/schema.prisma "${DEST}/schema.prisma"
eval $RSYNC_CMD prisma/migrations/ "${DEST}/migrations/" 2>&1 | tail -3
echo ""

# 5. Restart PM2
echo "[5/5] Restarting PM2..."
eval $SSH_CMD ${REMOTE} "cd ${DROPLET_PATH} && pm2 restart all && sleep 2 && pm2 status"
echo ""

echo "=== Deploy complete ==="
