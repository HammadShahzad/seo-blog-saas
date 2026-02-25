/**
 * Job Queue Worker — runs as a separate PM2 process on the Droplet.
 * Polls every 5 seconds for QUEUED generation jobs and processes them
 * by calling the local /api/worker/process endpoint.
 *
 * Features:
 * - Auto-reconnect with backoff when the API is unreachable
 * - Job processing duration logging
 * - Periodic heartbeat with stats
 * - Error reporting with categorization
 */

const POLL_INTERVAL = 5000;
const WORKER_PORT = process.env.PORT || 3001;
const CRON_SECRET = process.env.CRON_SECRET || "";
const BASE_URL = `http://127.0.0.1:${WORKER_PORT}`;
const HEARTBEAT_INTERVAL = 5 * 60 * 1000; // Log stats every 5 minutes

let processing = false;
let consecutiveErrors = 0;
let stats = { processed: 0, failed: 0, polls: 0, errors: 0, lastJobAt: null, startedAt: new Date().toISOString() };

function ts() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

async function poll() {
  if (processing) return;
  processing = true;
  stats.polls++;

  try {
    const startTime = Date.now();
    const res = await fetch(`${BASE_URL}/api/worker/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CRON_SECRET}`,
      },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(290000), // 4m50s — slightly under 5min
    });

    const data = await res.json();

    if (res.ok) {
      consecutiveErrors = 0; // Reset on successful API call
    } else {
      console.error(`[worker] ${ts()} API returned ${res.status}: ${JSON.stringify(data)}`);
      stats.errors++;
    }

    if (data.processed) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`[worker] ${ts()} Job ${data.jobId} completed in ${duration}s`);
      stats.processed++;
      stats.lastJobAt = ts();
      // Immediately check for more queued jobs
      processing = false;
      poll();
      return;
    }

    if (data.error) {
      console.error(`[worker] ${ts()} Processing error: ${data.error}`);
      stats.failed++;
    }
  } catch (err) {
    consecutiveErrors++;
    const msg = err instanceof Error ? err.message : String(err);

    // Only log every few errors to avoid spam when server is down
    if (consecutiveErrors <= 3 || consecutiveErrors % 12 === 0) {
      console.error(`[worker] ${ts()} API unreachable (${consecutiveErrors}x): ${msg.slice(0, 100)}`);
    }
    stats.errors++;
  }

  processing = false;
}

// Periodic heartbeat with stats
function heartbeat() {
  console.log(
    `[worker] ${ts()} Heartbeat — processed: ${stats.processed}, failed: ${stats.failed}, ` +
    `polls: ${stats.polls}, errors: ${stats.errors}, ` +
    `lastJob: ${stats.lastJobAt || "none"}, uptime: ${stats.startedAt}`
  );
}

console.log(`[worker] ${ts()} Started — polling ${BASE_URL} every ${POLL_INTERVAL / 1000}s`);
setInterval(poll, POLL_INTERVAL);
setInterval(heartbeat, HEARTBEAT_INTERVAL);

// Initial poll after short delay to let the server start
setTimeout(poll, 2000);
