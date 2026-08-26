const fs = require('fs');
const path = require('path');
const { getDb, insertReading, insertRiskResult, getRecentAlerts, getSummaryReport } = require('./database');
const { checkAndTriggerAlert } = require('./alerts');

// Use a throwaway demo DB so running this repeatedly doesn't pile up data
const demoDbPath = path.join(__dirname, 'demo.db');
if (fs.existsSync(demoDbPath)) fs.unlinkSync(demoDbPath);

const db = getDb(demoDbPath);

// 1. Simulate a reading coming in from the Sensor module
const readingId = insertReading(db, {
  food_type: 'chicken',
  temperature: 12.5,
  humidity: 80,
  time_elapsed: 4,
});

// 2. Simulate the Risk Engine flagging it High risk
const riskResultId = insertRiskResult(db, {
  reading_id: readingId,
  risk_level: 'High',
  score: 0.92,
});

// 3. Our module reacts to that risk result
checkAndTriggerAlert(db, riskResultId);

// Running it again on the SAME risk result should NOT duplicate the alert
checkAndTriggerAlert(db, riskResultId);

console.log('\nRecent alerts:', getRecentAlerts(db));
console.log('\nSummary report:', getSummaryReport(db));

db.close();
