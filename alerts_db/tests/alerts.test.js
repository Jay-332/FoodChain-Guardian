const fs = require('fs');
const path = require('path');
const {
  getDb,
  insertReading,
  insertRiskResult,
  getReadings,
  getAlertsForRiskResult,
} = require('../database');
const { checkAndTriggerAlert } = require('../alerts');

const TEST_DB_PATH = path.join(__dirname, 'test.db');

let db;

beforeEach(() => {
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
  db = getDb(TEST_DB_PATH);
});

afterEach(() => {
  db.close();
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
});

test('insertReading stores a reading and getReadings returns it', () => {
  const id = insertReading(db, {
    food_type: 'milk',
    temperature: 5,
    humidity: 40,
    time_elapsed: 1,
  });
  const readings = getReadings(db);
  expect(readings.length).toBe(1);
  expect(readings[0].id).toBe(id);
  expect(readings[0].food_type).toBe('milk');
});

test('High risk result triggers exactly one email + one sms alert', () => {
  const readingId = insertReading(db, {
    food_type: 'fish',
    temperature: 15,
    humidity: 85,
    time_elapsed: 6,
  });
  const riskResultId = insertRiskResult(db, {
    reading_id: readingId,
    risk_level: 'High',
    score: 0.95,
  });

  const result = checkAndTriggerAlert(db, riskResultId);

  expect(result).not.toBeNull();
  const alerts = getAlertsForRiskResult(db, riskResultId);
  expect(alerts.length).toBe(2);
  expect(alerts.map(a => a.alert_type).sort()).toEqual(['email', 'sms']);
});

test('duplicate alerts are NOT created for the same risk result', () => {
  const readingId = insertReading(db, {
    food_type: 'eggs',
    temperature: 10,
    humidity: 70,
    time_elapsed: 3,
  });
  const riskResultId = insertRiskResult(db, {
    reading_id: readingId,
    risk_level: 'High',
    score: 0.88,
  });

  checkAndTriggerAlert(db, riskResultId);
  checkAndTriggerAlert(db, riskResultId); // second call

  const alerts = getAlertsForRiskResult(db, riskResultId);
  expect(alerts.length).toBe(2); // still just 1 email + 1 sms, not 4
});

test('Safe/Medium risk results do not trigger alerts', () => {
  const readingId = insertReading(db, {
    food_type: 'bread',
    temperature: 20,
    humidity: 50,
    time_elapsed: 2,
  });
  const riskResultId = insertRiskResult(db, {
    reading_id: readingId,
    risk_level: 'Safe',
    score: 0.1,
  });

  const result = checkAndTriggerAlert(db, riskResultId);
  expect(result).toBeNull();
  expect(getAlertsForRiskResult(db, riskResultId).length).toBe(0);
});

test('insertReading rejects a missing food_type', () => {
  expect(() => {
    insertReading(db, { temperature: 5, humidity: 40, time_elapsed: 1 });
  }).toThrow(/food_type/);
});

test('insertReading rejects a non-numeric temperature', () => {
  expect(() => {
    insertReading(db, { food_type: 'milk', temperature: 'cold', humidity: 40, time_elapsed: 1 });
  }).toThrow(/temperature/);
});

test('insertRiskResult rejects an invalid risk_level', () => {
  const readingId = insertReading(db, { food_type: 'milk', temperature: 5, humidity: 40, time_elapsed: 1 });
  expect(() => {
    insertRiskResult(db, { reading_id: readingId, risk_level: 'Extreme', score: 0.5 });
  }).toThrow(/risk_level/);
});

test('checkAndTriggerAlert throws a clear error for a non-existent risk result id', () => {
  expect(() => {
    checkAndTriggerAlert(db, 99999);
  }).toThrow(/no risk_result found/i);
});
