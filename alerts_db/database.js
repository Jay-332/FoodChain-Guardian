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
  let db;
  try {
    db = new DatabaseSync(dbPath);
  } catch (err) {
    throw new Error(`getDb: could not open database at ${dbPath} — ${err.message}`);
  }
  try {
    initSchema(db);
  } catch (err) {
    throw new Error(`getDb: connected, but failed to set up schema — ${err.message}`);
  }
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

const readingColumns = db.prepare('PRAGMA table_info(readings)').all();

if (!readingColumns.some(column => column.name === 'archived')) {
  db.exec(`
    ALTER TABLE readings
    ADD COLUMN archived INTEGER NOT NULL DEFAULT 0;
  `);
}


}

// ---------- Validation helpers ----------

function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

function isFiniteNumber(val) {
  return typeof val === 'number' && Number.isFinite(val);
}

// ---------- Inserts ----------

function insertReading(db, { food_type, temperature, humidity, time_elapsed }) {
  if (!isNonEmptyString(food_type)) {
    throw new Error(`insertReading: food_type must be a non-empty string, got: ${JSON.stringify(food_type)}`);
  }
  if (!isFiniteNumber(temperature) || !isFiniteNumber(humidity) || !isFiniteNumber(time_elapsed)) {
    throw new Error(
      `insertReading: temperature, humidity, and time_elapsed must all be numbers ` +
      `(got temperature=${temperature}, humidity=${humidity}, time_elapsed=${time_elapsed})`
    );
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO readings (food_type, temperature, humidity, time_elapsed)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(food_type, temperature, humidity, time_elapsed);
    return info.lastInsertRowid;
  } catch (err) {
    throw new Error(`insertReading: database write failed — ${err.message}`);
  }
}

function insertRiskResult(db, { reading_id, risk_level, score }) {
  if (!isFiniteNumber(reading_id)) {
    throw new Error(`insertRiskResult: reading_id must be a number, got: ${JSON.stringify(reading_id)}`);
  }
  if (!['Safe', 'Medium', 'High'].includes(risk_level)) {
    throw new Error(`insertRiskResult: risk_level must be 'Safe', 'Medium', or 'High', got: ${JSON.stringify(risk_level)}`);
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO risk_results (reading_id, risk_level, score)
      VALUES (?, ?, ?)
    `);
    const info = stmt.run(reading_id, risk_level, score ?? null);
    return info.lastInsertRowid;
  } catch (err) {
    // Most likely cause: reading_id doesn't exist in the readings table (a broken FOREIGN KEY)
    throw new Error(`insertRiskResult: database write failed (check that reading_id ${reading_id} exists) — ${err.message}`);
  }
}

function insertAlert(db, { risk_result_id, alert_type, message, status = 'sent' }) {
  if (!['email', 'sms'].includes(alert_type)) {
    throw new Error(`insertAlert: alert_type must be 'email' or 'sms', got: ${JSON.stringify(alert_type)}`);
  }
  if (!isNonEmptyString(message)) {
    throw new Error(`insertAlert: message must be a non-empty string`);
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO alerts (risk_result_id, alert_type, message, status)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(risk_result_id, alert_type, message, status);
    return info.lastInsertRowid;
  } catch (err) {
    throw new Error(`insertAlert: database write failed — ${err.message}`);
  }
}

function logActivity(db, { event_type, description }) {
  try {
    const stmt = db.prepare(`
      INSERT INTO activity_log (event_type, description)
      VALUES (?, ?)
    `);
    const info = stmt.run(event_type, description);
    return info.lastInsertRowid;
  } catch (err) {
    // Activity logging failing shouldn't crash the whole app — just warn.
    console.warn(`logActivity: failed to write log entry — ${err.message}`);
    return null;
  }
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
function getReadingsByFoodType(db, foodType) {
  if (!foodType || typeof foodType !== 'string') {
    throw new Error('foodType must be a non-empty string');
  }

  try {
    const stmt = db.prepare(
      'SELECT * FROM readings WHERE food_type = ? ORDER BY created_at DESC'
    );
    return stmt.all(foodType);
  } catch (err) {
    throw new Error(`getReadingsByFoodType failed: ${err.message}`);
  }
}
function getAlertsByDateRange(db, startDate, endDate) {
  if (!startDate || !endDate) {
    throw new Error(
      'startDate and endDate are required (ISO format, e.g. 2026-08-20)'
    );
  }

  if (new Date(startDate) > new Date(endDate)) {
    throw new Error('startDate must be before endDate');
  }

  try {
    const stmt = db.prepare(
      `SELECT * FROM alerts
       WHERE sent_at BETWEEN ? AND ?
       ORDER BY sent_at ASC`
    );

    return stmt.all(
      `${startDate} 00:00:00`,
      `${endDate} 23:59:59`
    );
  } catch (err) {
    throw new Error(`getAlertsByDateRange failed: ${err.message}`);
  }
}
function archiveOldReadings(db, daysOld = 30) {
  if (typeof daysOld !== 'number' || daysOld <= 0) {
    throw new Error('daysOld must be a positive number');
  }

  try {
    const stmt = db.prepare(
      `UPDATE readings
       SET archived = 1
       WHERE created_at < datetime('now', ?)
       AND archived = 0`
    );

    const result = stmt.run(`-${daysOld} days`);

    return { archivedCount: result.changes };
  } catch (err) {
    throw new Error(`archiveOldReadings failed: ${err.message}`);
  }
}

module.exports = {
  getDb,
  initSchema,
  insertReading,
  insertRiskResult,
  insertAlert,
  logActivity,
  getReadings,
  getReadingsByFoodType,
  getAlertsByDateRange,
  archiveOldReadings,
  getRiskResultById,
  getAlertsForRiskResult,
  getRecentAlerts,
  getActivityLog,
  getSummaryReport,
};
