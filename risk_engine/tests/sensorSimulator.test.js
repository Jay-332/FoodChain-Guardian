const assert = require("node:assert/strict");
const test = require("node:test");
const {
  DEFAULT_OPTIONS,
  FOOD_PROFILES,
  SensorSimulator,
  getFoodProfile,
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

test("returns a profile for a supported food type", () => {
  assert.deepEqual(getFoodProfile("MILK"), FOOD_PROFILES.milk);
  assert.throws(() => getFoodProfile("bread"), /Unsupported food type/);
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
  assert.equal(reading.sensorId, "simulator-1");
  assert.equal(reading.readingId, "simulator-1-1");
  assert.equal(reading.anomaly, false);
  assert.equal(reading.anomalyType, null);
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
  assert.equal(reading.anomalyType, "environmental-spike");
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

test("includes a configured sensor identity", () => {
  const simulator = new SensorSimulator({
    sensorId: "cold-room-2",
    random: fixedRandom,
    clock: fixedClock
  });

  assert.equal(simulator.generateReading().sensorId, "cold-room-2");
  assert.throws(() => new SensorSimulator({ sensorId: " " }), /sensorId/);
});

test("rejects invalid simulator options", () => {
  assert.throws(() => new SensorSimulator({ foodType: "bread" }), /Unsupported food type/);
  assert.throws(() => new SensorSimulator({ intervalMs: 0 }), /intervalMs/);
  assert.throws(() => new SensorSimulator({ anomalyRate: 2 }), /anomalyRate/);
  assert.throws(() => new SensorSimulator({ maxReadings: 0 }), /maxReadings/);
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

test("reports an inactive state before a stream starts", () => {
  const simulator = new SensorSimulator({ random: fixedRandom, clock: fixedClock });

  assert.equal(simulator.isRunning, false);
});

test("supports custom anomaly magnitudes", () => {
  const simulator = new SensorSimulator({
    anomalyRate: 1,
    anomalyTemperatureDelta: 20,
    anomalyHumidityDelta: 1,
    random: fixedRandom,
    clock: fixedClock
  });

  const reading = simulator.generateReading();

  assert.equal(reading.temperature, 23.5);
  assert.equal(reading.humidity, 66);
});

test("stops automatically after the maximum number of readings", async () => {
  const simulator = new SensorSimulator({
    intervalMs: 5,
    maxReadings: 2,
    random: fixedRandom,
    clock: fixedClock
  });
  const readings = [];
  const stopped = new Promise((resolve) => simulator.once("stopped", resolve));

  simulator.start((reading) => readings.push(reading));
  await stopped;

  assert.equal(readings.length, 2);
  assert.equal(simulator.isRunning, false);
});

test("supports every configured food profile", () => {
  for (const foodType of Object.keys(FOOD_PROFILES)) {
    const simulator = new SensorSimulator({
      foodType,
      anomalyRate: 0,
      random: fixedRandom,
      clock: fixedClock
    });

    assert.equal(simulator.generateReading().foodType, foodType);
  }
});

test("rejects readings with invalid humidity", () => {
  assert.throws(
    () => validateReading({
      foodType: "milk",
      temperature: 4,
      humidity: 101,
      timeElapsedHours: 1,
      timestamp: "2026-08-28T00:00:00.000Z"
    }),
    /humidity must be between 0 and 100/
  );
});

test("rejects negative elapsed time", () => {
  const simulator = new SensorSimulator({ random: fixedRandom, clock: fixedClock });

  assert.throws(() => simulator.generateReading(-1), /timeElapsedHours/);
});

test("requires a callback when starting a stream", () => {
  const simulator = new SensorSimulator({ random: fixedRandom, clock: fixedClock });

  assert.throws(() => simulator.start(), /onReading callback/);
});

test("prevents starting the same simulator twice", () => {
  const simulator = new SensorSimulator({ random: fixedRandom, clock: fixedClock });
  const stop = simulator.start(() => {});

  assert.throws(() => simulator.start(() => {}), /already running/);
  stop();
});

test("rejects malformed timestamps", () => {
  assert.throws(
    () => validateReading({
      foodType: "milk",
      temperature: 4,
      humidity: 60,
      timeElapsedHours: 1,
      timestamp: "invalid"
    }),
    /timestamp must be a valid ISO date string/
  );
});
