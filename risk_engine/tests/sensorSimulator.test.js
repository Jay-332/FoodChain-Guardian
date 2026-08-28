const assert = require("node:assert/strict");
const test = require("node:test");
const {
  DEFAULT_OPTIONS,
  FOOD_PROFILES,
  SensorSimulator,
  validateReading
} = require("../src/sensorSimulator");

const fixedRandom = () => 0.5;
const fixedClock = () => 0;

test("exposes stable default options", () => {
  assert.deepEqual(DEFAULT_OPTIONS, {
    foodType: "milk",
    intervalMs: 1000,
    durationMs: 0,
    anomalyRate: 0.1
  });
});

test("generates normal readings inside the food profile range", () => {
  const simulator = new SensorSimulator({
    foodType: "milk",
    anomalyRate: 0,
    random: fixedRandom,
    clock: fixedClock
  });

  const reading = simulator.generateReading(2);
  const profile = FOOD_PROFILES.milk;

  assert.equal(reading.foodType, "milk");
  assert.equal(reading.anomaly, false);
  assert.ok(reading.temperature >= profile.temperature.min);
  assert.ok(reading.temperature <= profile.temperature.max);
  assert.ok(reading.humidity >= profile.humidity.min);
  assert.ok(reading.humidity <= profile.humidity.max);
  assert.equal(reading.timeElapsedHours, 2);
  assert.equal(reading.timestamp, "1970-01-01T00:00:00.000Z");
});

test("generates an abnormal reading when anomaly rate is one", () => {
  const simulator = new SensorSimulator({
    foodType: "tomato",
    anomalyRate: 1,
    random: fixedRandom,
    clock: fixedClock
  });

  const reading = simulator.generateReading();

  assert.equal(reading.anomaly, true);
  assert.ok(reading.humidity > FOOD_PROFILES.tomato.humidity.max);
  assert.ok(reading.humidity <= 100);
  assert.ok(reading.temperature > FOOD_PROFILES.tomato.temperature.max);
  assert.doesNotThrow(() => validateReading(reading));
});

test("normalizes supported food types", () => {
  const simulator = new SensorSimulator({
    foodType: "  FISH ",
    random: fixedRandom,
    clock: fixedClock
  });

  assert.equal(simulator.foodType, "fish");
});

test("rejects invalid simulator options", () => {
  assert.throws(() => new SensorSimulator({ foodType: "bread" }), /Unsupported food type/);
  assert.throws(() => new SensorSimulator({ intervalMs: 0 }), /intervalMs/);
  assert.throws(() => new SensorSimulator({ anomalyRate: 2 }), /anomalyRate/);
});

test("creates the requested number of sample readings", () => {
  const simulator = new SensorSimulator({
    intervalMs: 1000,
    random: fixedRandom,
    clock: fixedClock
  });

  const readings = simulator.createSampleReadings(3);

  assert.equal(readings.length, 3);
  assert.deepEqual(
    readings.map((reading) => reading.timeElapsedHours),
    [0, 0, 0]
  );
});
