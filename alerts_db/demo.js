const fs = require('fs');
const path = require('path');
const { getDb, insertReading, insertRiskResult, getReadings, getRecentAlerts, getSummaryReport } = require('./database');
const { checkAndTriggerAlert } = require('./alerts');

// Use a throwaway demo DB so running this repeatedly doesn't pile up data
const demoDbPath = path.join(__dirname, 'demo.db');
if (fs.existsSync(demoDbPath)) fs.unlinkSync(demoDbPath);

const db = getDb(demoDbPath);

// A wide spread of readings across food categories, so the demo shows the
// system handling real variety instead of one repeated food type.
const sampleReadings = [
  // Meat & poultry
  { food_type: 'chicken',    temperature: 12.5, humidity: 80, time_elapsed: 4, risk_level: 'High',   score: 0.92 },
  { food_type: 'ground beef',temperature: 11.0, humidity: 78, time_elapsed: 5, risk_level: 'High',   score: 0.89 },
  { food_type: 'bacon',      temperature: 4.0,  humidity: 45, time_elapsed: 1, risk_level: 'Safe',   score: 0.08 },

  // Seafood
  { food_type: 'salmon',     temperature: 9.0,  humidity: 75, time_elapsed: 3, risk_level: 'High',   score: 0.88 },
  { food_type: 'shrimp',     temperature: 6.0,  humidity: 65, time_elapsed: 2, risk_level: 'Medium', score: 0.52 },

  // Dairy
  { food_type: 'milk',       temperature: 6.5,  humidity: 60, time_elapsed: 2, risk_level: 'Medium', score: 0.55 },
  { food_type: 'yogurt',     temperature: 5.0,  humidity: 55, time_elapsed: 1, risk_level: 'Safe',   score: 0.10 },
  { food_type: 'cheddar cheese', temperature: 7.0, humidity: 50, time_elapsed: 3, risk_level: 'Safe', score: 0.20 },

  // Fruit
  { food_type: 'apple',      temperature: 18.0, humidity: 40, time_elapsed: 6, risk_level: 'Safe',   score: 0.15 },
  { food_type: 'strawberry', temperature: 15.0, humidity: 70, time_elapsed: 5, risk_level: 'Medium', score: 0.48 },
  { food_type: 'banana',     temperature: 22.0, humidity: 45, time_elapsed: 4, risk_level: 'Safe',   score: 0.18 },

  // Vegetables
  { food_type: 'lettuce',    temperature: 10.0, humidity: 85, time_elapsed: 4, risk_level: 'High',   score: 0.90 },
  { food_type: 'carrot',     temperature: 12.0, humidity: 50, time_elapsed: 3, risk_level: 'Safe',   score: 0.12 },
  { food_type: 'spinach',    temperature: 13.0, humidity: 82, time_elapsed: 5, risk_level: 'High',   score: 0.85 },

  // Bakery
  { food_type: 'bread',      temperature: 20.0, humidity: 55, time_elapsed: 3, risk_level: 'Safe',   score: 0.14 },

  // Leftovers / cooked food
  { food_type: 'cooked rice',temperature: 14.0, humidity: 70, time_elapsed: 6, risk_level: 'Medium', score: 0.58 },

  // Frozen
  { food_type: 'frozen peas',temperature: -2.0, humidity: 30, time_elapsed: 1, risk_level: 'Safe',   score: 0.02 },

  // Beverages
  { food_type: 'orange juice', temperature: 8.0, humidity: 40, time_elapsed: 2, risk_level: 'Safe',  score: 0.16 },
];

console.log(`Inserting ${sampleReadings.length} sample readings across meat, seafood, dairy, fruit, vegetable, bakery, leftovers, frozen, and beverages...\n`);

let firstHighRiskId = null;

for (const item of sampleReadings) {
  const readingId = insertReading(db, {
    food_type: item.food_type,
    temperature: item.temperature,
    humidity: item.humidity,
    time_elapsed: item.time_elapsed,
  });

  const riskResultId = insertRiskResult(db, {
    reading_id: readingId,
    risk_level: item.risk_level,
    score: item.score,
  });

  // Only High risk actually triggers an alert — checkAndTriggerAlert handles that itself
  checkAndTriggerAlert(db, riskResultId);

  if (item.risk_level === 'High' && firstHighRiskId === null) {
    firstHighRiskId = riskResultId;
  }
}

// Prove duplicate prevention still works: re-checking an already-alerted result
// should NOT create a second alert for it.
checkAndTriggerAlert(db, firstHighRiskId);

console.log(`Total readings inserted: ${getReadings(db, { limit: 100 }).length}`);
console.log('\nAlerts fired (one email + one sms per High-risk item, no duplicates):');
for (const alert of getRecentAlerts(db, { limit: 100 })) {
  console.log(`  [${alert.alert_type.toUpperCase()}] ${alert.food_type} — ${alert.status}`);
}

console.log('\nSummary report:', getSummaryReport(db));

db.close();
