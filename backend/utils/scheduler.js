/**
 * scheduler.js
 * Reads cutoffTime from Settings and runs the daily job at that time IST.
 * Also re-schedulable live when admin updates the time.
 */

const cron     = require('node-cron');
const Settings = require('../models/Settings');
const { sendDailyShopSummaries } = require('./dailySummary');
const logger   = require('./logger');

let currentTask   = null;
let currentHour   = null;
let currentMinute = null;

function parseTime(timeStr) {
  const [h, m] = (timeStr || '23:00').split(':').map(Number);
  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    logger.warn(`[Scheduler] Invalid time "${timeStr}" — defaulting to 23:00`);
    return { hour: 23, minute: 0 };
  }
  return { hour: h, minute: m };
}

function stopCurrentJob() {
  if (currentTask) {
    currentTask.stop();
    currentTask = null;
    logger.info('[Scheduler] Previous cron job stopped');
  }
}

async function scheduleJob() {
  try {
    // Use cutoffTime as the schedule time (they are the same)
    const timeStr = await Settings.getValue('cutoffTime', '23:00');
    const { hour, minute } = parseTime(timeStr);

    if (hour === currentHour && minute === currentMinute && currentTask) return;

    stopCurrentJob();
    currentHour   = hour;
    currentMinute = minute;

    const cronExpr = `${minute} ${hour} * * *`;

    currentTask = cron.schedule(cronExpr, async () => {
      const enabled = await Settings.getValue('dailySummaryEnabled', true);
      if (!enabled) {
        logger.info('[Scheduler] Daily summary disabled — skipping');
        return;
      }
      logger.info(`[Scheduler] Cutoff reached at ${hour}:${String(minute).padStart(2,'0')} IST — running job`);
      await sendDailyShopSummaries();
    }, { timezone: 'Asia/Kolkata' });

    logger.info(`[Scheduler] Cutoff/summary job scheduled at ${hour}:${String(minute).padStart(2,'0')} IST`);
  } catch (err) {
    logger.error(`[Scheduler] Failed to schedule: ${err.message}`);
  }
}

async function rescheduleJob() {
  logger.info('[Scheduler] Rescheduling...');
  await scheduleJob();
}

module.exports = { scheduleJob, rescheduleJob };
