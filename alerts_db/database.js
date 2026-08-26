/**
 * database.js
 * Owns the SQLite connection, schema, and all insert/query functions.
 * Other modules (alerts.js, dashboard, risk engine) should go through
 * these functions instead of writing raw SQL elsewhere.
 */

const path = require('path');
const { DatabaseSync } = require('node:sqlite'); // built into Node — no compiler/install needed

const DB_PATH = path.join(__dirname, 'foodchain.db');

function getDb(dbPath = DB_PATH) {
  const db = new DatabaseSync(dbPath);
  initSchema(db);
  return db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      food_type TEXT NOT NULL,
      temperature REAL NOT NULL,
      humidity REAL NOT NULL,
      time_elapsed REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS risk_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reading_id INTEGER NOT NULL,
      risk_level TEXT NOT NULL CHECK (risk_level IN ('Safe','Medium','High')),
      score REAL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (reading_id) REFERENCES readings(id)
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      risk_result_id INTEGER NOT NULL,
      alert_type TEXT NOT NULL CHECK (alert_type IN ('email','sms')),
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'sent',
      sent_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (risk_result_id) REFERENCES risk_results(id)
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

// ---------- Inserts ----------

function insertReading(db, { food_type, temperature, humidity, time_elapsed }) {
  const stmt = db.prepare(`
    INSERT INTO readings (food_type, temperature, humidity, time_elapsed)
    VALUES (?, ?, ?, ?)
  `);
  const info = stmt.run(food_type, temperature, humidity, time_elapsed);
  return info.lastInsertRowid;
}

function insertRiskResult(db, { reading_id, risk_level, score }) {
  const stmt = db.prepare(`
    INSERT INTO risk_results (reading_id, risk_level, score)
    VALUES (?, ?, ?)
  `);
  const info = stmt.run(reading_id, risk_level, score);
  return info.lastInsertRowid;
}

function insertAlert(db, { risk_result_id, alert_type, message, status = 'sent' }) {
  const stmt = db.prepare(`
    INSERT INTO alerts (risk_result_id, alert_type, message, status)
    VALUES (?, ?, ?, ?)
  `);
  const info = stmt.run(risk_result_id, alert_type, message, status);
  return info.lastInsertRowid;
}

function logActivity(db, { event_type, description }) {
  const stmt = db.prepare(`
    INSERT INTO activity_log (event_type, description)
    VALUES (?, ?)
  `);
  const info = stmt.run(event_type, description);
  return info.lastInsertRowid;
}

// ---------- Queries ----------

function getReadings(db, { limit = 50 } = {}) {
  return db.prepare(`SELECT * FROM readings ORDER BY id DESC LIMIT ?`).all(limit);
}

function getRiskResultById(db, riskResultId) {
  return db.prepare(`
    SELECT risk_results.*, readings.food_type
    FROM risk_results
    JOIN readings ON risk_results.reading_id = readings.id
    WHERE risk_results.id = ?
  `).get(riskResultId);
}

function getAlertsForRiskResult(db, riskResultId) {
  return db.prepare(`SELECT * FROM alerts WHERE risk_result_id = ?`).all(riskResultId);
}

function getRecentAlerts(db, { limit = 50 } = {}) {
  return db.prepare(`
    SELECT alerts.*, risk_results.risk_level, readings.food_type
    FROM alerts
    JOIN risk_results ON alerts.risk_result_id = risk_results.id
    JOIN readings ON risk_results.reading_id = readings.id
    ORDER BY alerts.id DESC
    LIMIT ?
  `).all(limit);
}

function getActivityLog(db, { limit = 100 } = {}) {
  return db.prepare(`SELECT * FROM activity_log ORDER BY id DESC LIMIT ?`).all(limit);
}

function getSummaryReport(db) {
  return db.prepare(`
    SELECT risk_level, COUNT(*) as count
    FROM risk_results
    GROUP BY risk_level
  `).all();
}

module.exports = {
  getDb,
  initSchema,
  insertReading,
  insertRiskResult,
  insertAlert,
  logActivity,
  getReadings,
  getRiskResultById,
  getAlertsForRiskResult,
  getRecentAlerts,
  getActivityLog,
  getSummaryReport,
};
