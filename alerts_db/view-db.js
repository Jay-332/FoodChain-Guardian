/**
 * view-db.js
 * Prints the contents of the real foodchain.db (not the throwaway demo.db).
 * Run with: node view-db.js
 * Or view just one table: node view-db.js readings
 */

const { getDb, getReadings, getRecentAlerts, getActivityLog, getSummaryReport } = require('./database');

const db = getDb(); // opens the real foodchain.db

const table = process.argv[2]; // optional: readings | alerts | log | summary

function printReadings() {
  console.log('=== READINGS ===');
  console.table(getReadings(db, { limit: 100 }));
}

function printAlerts() {
  console.log('=== ALERTS ===');
  console.table(getRecentAlerts(db, { limit: 100 }));
}

function printLog() {
  console.log('=== ACTIVITY LOG ===');
  console.table(getActivityLog(db, { limit: 100 }));
}

function printSummary() {
  console.log('=== SUMMARY (risk level counts) ===');
  console.table(getSummaryReport(db));
}

if (table === 'readings') {
  printReadings();
} else if (table === 'alerts') {
  printAlerts();
} else if (table === 'log') {
  printLog();
} else if (table === 'summary') {
  printSummary();
} else {
  // no argument given — show everything
  printReadings();
  console.log('');
  printAlerts();
  console.log('');
  printLog();
  console.log('');
  printSummary();
}

db.close();
