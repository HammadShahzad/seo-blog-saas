#!/bin/bash
# =============================================================================
# StackSerp — Cron Setup Script
# Installs system crontab jobs for auto-generation
# The cron calls the local API directly (no Vercel, no external dependency)
# =============================================================================

APP_DIR="/var/www/stackserp"
APP_PORT=3001

# Read CRON_SECRET from .env
CRON_SECRET=$(grep '^CRON_SECRET' $APP_DIR/.env | cut -d'"' -f2)

if [ -z "$CRON_SECRET" ]; then
    echo "ERROR: CRON_SECRET not found in $APP_DIR/.env"
    exit 1
fi

BASE_URL="http://127.0.0.1:${APP_PORT}"
AUTH_HEADER="Authorization: Bearer ${CRON_SECRET}"

# ─── CRON JOBS ────────────────────────────────────────────────────────────────
# Job 1: Auto-generate blog posts — every hour
#         Also handles publishing any scheduled posts that are due
CRON_GENERATE="0 * * * * curl -s -X POST '${BASE_URL}/api/cron/generate' -H '${AUTH_HEADER}' -H 'Content-Type: application/json' >> /var/log/pm2/stackserp-cron.log 2>&1 # stackserp-generate"

# Job 2: Publish scheduled posts — every 5 minutes
#         Checks for posts with status=SCHEDULED and scheduledAt <= now
CRON_SCHEDULED="*/5 * * * * curl -s -X POST '${BASE_URL}/api/cron/publish-scheduled' -H '${AUTH_HEADER}' -H 'Content-Type: application/json' >> /var/log/pm2/stackserp-cron.log 2>&1 # stackserp-scheduled"

# Job 3: Weekly digest email — every Monday at 9am
CRON_DIGEST="0 9 * * 1 curl -s -X POST '${BASE_URL}/api/cron/digest' -H '${AUTH_HEADER}' -H 'Content-Type: application/json' >> /var/log/pm2/stackserp-cron.log 2>&1 # stackserp-digest"

# Job 4: Daily health check log at midnight
CRON_HEALTH="0 0 * * * curl -s '${BASE_URL}/api/health' >> /var/log/pm2/stackserp-health.log 2>&1 # stackserp-health"

# Install crons — remove old versions first to avoid duplicates
(
  crontab -l 2>/dev/null | grep -v "stackserp"
  echo "$CRON_GENERATE"
  echo "$CRON_SCHEDULED"
  echo "$CRON_DIGEST"
  echo "$CRON_HEALTH"
) | crontab -

echo ""
echo "✓ Cron jobs installed:"
echo ""
crontab -l | grep "stackserp"
echo ""
echo "Schedules:"
echo "  - Auto-generate:    every hour         (0 * * * *)"
echo "  - Publish scheduled: every 5 minutes   (*/5 * * * *)"
echo "  - Weekly digest:    Mon 9am            (0 9 * * 1)"
echo "  - Health check:     daily midnight     (0 0 * * *)"
echo ""
echo "To view cron logs:"
echo "  tail -f /var/log/pm2/stackserp-cron.log"
echo ""
echo "To trigger manually right now:"
echo "  curl -X POST http://127.0.0.1:${APP_PORT}/api/cron/generate -H 'Authorization: Bearer ${CRON_SECRET}'"
echo "  curl -X POST http://127.0.0.1:${APP_PORT}/api/cron/publish-scheduled -H 'Authorization: Bearer ${CRON_SECRET}'"
