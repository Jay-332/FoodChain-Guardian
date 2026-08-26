/**
 * alerts.js
 * Decides whether a risk result should trigger an alert, prevents duplicate
 * alerts for the same risk result, and "sends" the alert (simulated for
 * this project — real email would use something like nodemailer).
 */

const {
  insertAlert,
  getAlertsForRiskResult,
  getRiskResultById,
  logActivity,
} = require('./database');

const ALERT_THRESHOLD = 'High';

/**
 * Simulated email sender. In a real system you'd use nodemailer + SMTP here.
 */
function sendEmailAlert(message) {
  console.log(`[EMAIL] To: alerts@foodchain-guardian.local | ${message}`);
  return { success: true, channel: 'email' };
}

/**
 * Simulated SMS sender. In a real system you'd call a service like Twilio.
 */
function sendSmsAlert(message) {
  console.log(`[SMS] To: +1-555-0100 | ${message}`);
  return { success: true, channel: 'sms' };
}

/**
 * Checks a risk_result (by id) and, if it's High risk and hasn't already
 * been alerted on, fires an email + SMS alert and logs everything.
 *
 * Looking the risk_result up by id (rather than trusting a caller-passed
 * object) means this function is safe to call from anywhere — e.g. right
 * after the Risk Engine writes a row — without worrying about what fields
 * the caller remembered to include.
 *
 * @param {Database} db - better-sqlite3 connection
 * @param {number} riskResultId - id of the row in risk_results
 * @returns {object|null} - the alert(s) created, or null if no alert needed
 */
function checkAndTriggerAlert(db, riskResultId) {
  if (typeof riskResultId !== 'number' || !Number.isFinite(riskResultId)) {
    throw new Error(`checkAndTriggerAlert: riskResultId must be a number, got: ${JSON.stringify(riskResultId)}`);
  }

  let riskResult;
  try {
    riskResult = getRiskResultById(db, riskResultId);
  } catch (err) {
    throw new Error(`checkAndTriggerAlert: failed to look up risk result #${riskResultId} — ${err.message}`);
  }

  if (!riskResult) {
    throw new Error(`checkAndTriggerAlert: no risk_result found with id ${riskResultId}`);
  }

  if (riskResult.risk_level !== ALERT_THRESHOLD) {
    return null; // not high risk, nothing to do
  }

  // Duplicate prevention: don't re-alert on a risk_result we already alerted on
  const existing = getAlertsForRiskResult(db, riskResultId);
  if (existing.length > 0) {
    logActivity(db, {
      event_type: 'duplicate_alert_skipped',
      description: `Risk result #${riskResultId} already has an alert, skipping.`,
    });
    return null;
  }

  const message = `HIGH RISK detected for ${riskResult.food_type} ` +
    `(risk_result #${riskResultId}, score: ${riskResult.score ?? 'n/a'}).`;

  let emailResult, smsResult;
  try {
    emailResult = sendEmailAlert(message);
    smsResult = sendSmsAlert(message);
  } catch (err) {
    // Sending failed unexpectedly — still record that we tried, so it's visible in the log.
    logActivity(db, {
      event_type: 'alert_send_failed',
      description: `Failed to send alert for risk result #${riskResultId}: ${err.message}`,
    });
    throw new Error(`checkAndTriggerAlert: alert sending failed — ${err.message}`);
  }

  const emailAlertId = insertAlert(db, {
    risk_result_id: riskResultId,
    alert_type: 'email',
    message,
    status: emailResult.success ? 'sent' : 'failed',
  });

  const smsAlertId = insertAlert(db, {
    risk_result_id: riskResultId,
    alert_type: 'sms',
    message,
    status: smsResult.success ? 'sent' : 'failed',
  });

  logActivity(db, {
    event_type: 'high_risk_alert',
    description: `Alerts #${emailAlertId} (email) and #${smsAlertId} (sms) sent for risk result #${riskResultId}.`,
  });

  return { emailAlertId, smsAlertId, message };
}

module.exports = {
  checkAndTriggerAlert,
  sendEmailAlert,
  sendSmsAlert,
  ALERT_THRESHOLD,
};
