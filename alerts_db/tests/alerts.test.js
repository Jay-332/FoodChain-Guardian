const fs = require('fs');
const path = require('path');
const {
  getDb,
  insertReading,
  insertRiskResult,
  getReadings,
  getReadingsByFoodType,
  getAlertsByDateRange,
  archiveOldReadings,
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

test('insertReading rejects NaN temperature', () => {
  expect(() => {
    insertReading(db, {
      food_type: 'milk',
      temperature: NaN,
      humidity: 40,
      time_elapsed: 1
    });
  }).toThrow(/temperature/);
});

test('insertReading rejects Infinity temperature', () => {
  expect(() => {
    insertReading(db, {
      food_type: 'milk',
      temperature: Infinity,
      humidity: 40,
      time_elapsed: 1
    });
  }).toThrow(/temperature/);
});

test('insertReading rejects -Infinity temperature', () => {
  expect(() => {
    insertReading(db, {
      food_type: 'milk',
      temperature: -Infinity,
      humidity: 40,
      time_elapsed: 1
    });
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
test('getReadingsByFoodType returns readings for the requested food', () => {
  insertReading(db, {
    food_type: 'milk',
    temperature: 5,
    humidity: 40,
    time_elapsed: 1,
  });

  insertReading(db, {
    food_type: 'milk',
    temperature: 6,
    humidity: 42,
    time_elapsed: 2,
  });

  insertReading(db, {
    food_type: 'fish',
    temperature: 4,
    humidity: 50,
    time_elapsed: 1,
  });

  const readings = getReadingsByFoodType(db, 'milk');

  expect(readings.length).toBe(2);
  expect(readings.every(r => r.food_type === 'milk')).toBe(true);
});

test('getReadingsByFoodType rejects an invalid food type', () => {
  expect(() => getReadingsByFoodType(db, '')).toThrow(
    'foodType must be a non-empty string'
  );
});
test('getAlertsByDateRange returns alerts within the date range', () => {
  const readingId = insertReading(db, {
    food_type: 'fish',
    temperature: 5,
    humidity: 50,
    time_elapsed: 2,
  });

  const riskResultId = insertRiskResult(db, {
    reading_id: readingId,
    risk_level: 'High',
    score: 0.9,
  });

  checkAndTriggerAlert(db, riskResultId);

  const alerts = getAlertsByDateRange(
    db,
    '2000-01-01',
    '2100-01-01'
  );

  expect(alerts.length).toBe(2);
});

test('getAlertsByDateRange rejects an invalid date range', () => {
  expect(() =>
    getAlertsByDateRange(
      db,
      '2026-08-27',
      '2026-08-20'
    )
  ).toThrow('startDate must be before endDate');
});
test('archiveOldReadings archives old readings', () => {
  const readingId = insertReading(db, {
    food_type: 'beef',
    temperature: 5,
    humidity: 40,
    time_elapsed: 2,
  });

  db.prepare(
    `UPDATE readings
     SET created_at = '2000-01-01 00:00:00'
     WHERE id = ?`
  ).run(readingId);

  const result = archiveOldReadings(db, 30);

  expect(result.archivedCount).toBe(1);

  const reading = db
    .prepare('SELECT * FROM readings WHERE id = ?')
    .get(readingId);

  expect(reading.archived).toBe(1);
});

test('archiveOldReadings rejects an invalid number of days', () => {
  expect(() => archiveOldReadings(db, 0)).toThrow(
    'daysOld must be a positive number'
  );
});

test('insertReading trims food_type', () => {
  const id = insertReading(db, {
    food_type: '  chicken  ',
    temperature: 5,
    humidity: 70,
    time_elapsed: 2
  });

  const reading = db.prepare(
    'SELECT food_type FROM readings WHERE id = ?'
  ).get(id);

  expect(reading.food_type).toBe('chicken');
});

test('insertReading rejects food_type longer than 50 characters', () => {
  expect(() =>
    insertReading(db, {
      food_type: 'a'.repeat(51),
      temperature: 5,
      humidity: 70,
      time_elapsed: 2
    })
  ).toThrow('food_type must be 50 characters or less');
});