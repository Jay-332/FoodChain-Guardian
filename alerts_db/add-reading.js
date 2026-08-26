/**
 * add-reading.js
 * Adds one custom reading (and optionally a risk result) to the real
 * foodchain.db, so you can build up real data without editing code.
 *
 * Usage:
 *   node add-reading.js <food_type> <temperature> <humidity> <time_elapsed> [risk_level] [score]
 *
 * Examples:
 *   node add-reading.js mango 20 45 3
 *   node add-reading.js mango 20 45 3 High 0.91
 */

const { getDb, insertReading, insertRiskResult } = require('./database');
const { checkAndTriggerAlert } = require('./alerts');

const [, , food_type, temperature, humidity, time_elapsed, risk_level, score] = process.argv;

if (!food_type || !temperature || !humidity || !time_elapsed) {
  console.log('Usage: node add-reading.js <food_type> <temperature> <humidity> <time_elapsed> [risk_level] [score]');
  console.log('Example: node add-reading.js mango 20 45 3 High 0.91');
  process.exit(1);
}

const db = getDb(); // the real foodchain.db

const readingId = insertReading(db, {
  food_type,
  temperature: Number(temperature),
  humidity: Number(humidity),
  time_elapsed: Number(time_elapsed),
});
console.log(`Inserted reading #${readingId}: ${food_type}`);

if (risk_level) {
  const riskResultId = insertRiskResult(db, {
    reading_id: readingId,
    risk_level,
    score: score ? Number(score) : null,
  });
  console.log(`Inserted risk result #${riskResultId}: ${risk_level}`);

  const alertResult = checkAndTriggerAlert(db, riskResultId);
  if (alertResult) {
    console.log('High risk — alert triggered (email + sms).');
  } else {
    console.log('No alert triggered (not High risk, or already alerted).');
  }
}

db.close();
