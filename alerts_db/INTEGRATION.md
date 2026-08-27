# How to use the alerts_db module (for Sensor / Risk Engine / Dashboard teammates)

This module handles storage and alerting. You don't need to touch its internals —
just call these functions from your own code.

## Setup (once, at the top of your file)

```javascript
const { getDb, insertReading, insertRiskResult } = require('../alerts_db/database');
const { checkAndTriggerAlert } = require('../alerts_db/alerts');

const db = getDb(); // opens (or creates) foodchain.db, sets up tables automatically
```

**Important:** everyone should call `getDb()` with no argument, so we all point at the
same `foodchain.db` file in the `alerts_db` folder. Don't pass a custom path unless
we agree on it as a team — otherwise the Dashboard will look at an empty database
while readings pile up somewhere else.

## If you're building the Sensor Simulator

Every time you generate a fake reading, save it like this:

```javascript
const readingId = insertReading(db, {
  food_type: 'chicken',      // string, required
  temperature: 12.5,         // number, required
  humidity: 80,               // number, required
  time_elapsed: 4,            // number, required
});
```

`insertReading` returns the new reading's id (a number) — pass that along to whoever
does the risk calculation.

If any field is missing or the wrong type, it'll throw a clear error immediately
(e.g. `"insertReading: food_type must be a non-empty string"`) instead of silently
failing or corrupting data.

## If you're building the Risk Engine

Once you've calculated a risk level for a reading, save it and let the alert system
check it in one go:

```javascript
const riskResultId = insertRiskResult(db, {
  reading_id: readingId,       // number, required — must be a real reading id
  risk_level: 'High',          // must be exactly 'Safe', 'Medium', or 'High'
  score: 0.92,                 // number, optional
});

checkAndTriggerAlert(db, riskResultId); // that's it — alerting is automatic
```

You don't need to do anything else — `checkAndTriggerAlert` automatically checks if
it's High risk, prevents duplicate alerts, and logs everything. Just call it after
every `insertRiskResult`.

## If you're building the Dashboard

Pull data with these read-only functions — no need to write any SQL yourself:

```javascript
const {
  getReadings,       // recent sensor readings
  getRecentAlerts,   // recent alerts, joined with risk level + food type
  getActivityLog,    // full event history
  getSummaryReport,  // counts grouped by risk level — good for a simple stat display
} = require('../alerts_db/database');

getReadings(db, { limit: 20 });
getRecentAlerts(db, { limit: 20 });
getSummaryReport(db); // e.g. [{ risk_level: 'High', count: 3 }, { risk_level: 'Safe', count: 12 }]
```

## Quick sanity check before you integrate

Run this from inside `alerts_db` to confirm the module itself is working before you
plug your code into it:
```
npm install
node demo.js
npm test
```
If all tests pass, any issues you hit afterward are almost certainly on the
integration side (wrong field names, wrong types) — check the error message, it'll
usually say exactly what's wrong.

## If something breaks

Every function here throws a specific, readable error message rather than failing
silently — read the message first, it usually tells you exactly which field was
wrong. If you're stuck, ping the alerts_db owner with the exact error text.
## New Query and Archive Functions

### getReadingsByFoodType(db, foodType)
Returns all readings for a specific food type, newest first.

Example:
getReadingsByFoodType(db, 'milk');

### getAlertsByDateRange(db, startDate, endDate)
Returns alerts created between the given dates.

Example:
getAlertsByDateRange(db, '2026-08-01', '2026-08-27');

### archiveOldReadings(db, daysOld)
Marks readings older than the specified number of days as archived instead of deleting them.

Example:
archiveOldReadings(db, 30);

### Archived Readings

The `readings` table has an `archived` column.

- `0` = active reading
- `1` = archived reading

`archiveOldReadings(db, 30)` marks readings older than 30 days as archived. It does not delete them.