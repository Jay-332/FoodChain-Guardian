const { EventEmitter } = require("node:events");

const FOOD_PROFILES = Object.freeze({
  milk: Object.freeze({
    temperature: Object.freeze({ min: 0, max: 7 }),
    humidity: Object.freeze({ min: 55, max: 75 }),
    anomaly: Object.freeze({ temperature: 8, humidity: 15 })
  }),
  chicken: Object.freeze({
    temperature: Object.freeze({ min: 0, max: 4 }),
    humidity: Object.freeze({ min: 60, max: 80 }),
    anomaly: Object.freeze({ temperature: 10, humidity: 12 })
  }),
  fish: Object.freeze({
    temperature: Object.freeze({ min: -1, max: 4 }),
    humidity: Object.freeze({ min: 65, max: 85 }),
    anomaly: Object.freeze({ temperature: 9, humidity: 10 })
  }),
  tomato: Object.freeze({
    temperature: Object.freeze({ min: 10, max: 15 }),
    humidity: Object.freeze({ min: 80, max: 95 }),
    anomaly: Object.freeze({ temperature: 8, humidity: 8 })
  }),
  spinach: Object.freeze({
    temperature: Object.freeze({ min: 0, max: 4 }),
    humidity: Object.freeze({ min: 85, max: 95 }),
    anomaly: Object.freeze({ temperature: 7, humidity: 5 })
  })
});

const DEFAULT_OPTIONS = Object.freeze({
  foodType: "milk",
  intervalMs: 1000,
  durationMs: 0,
  anomalyRate: 0.1
});

function randomBetween(random, min, max) {
  return min + random() * (max - min);
}

function validateFoodType(foodType) {
  if (typeof foodType !== "string" || foodType.trim() === "") {
    throw new Error("Food type must be a non-empty string.");
  }

  const normalizedFoodType = foodType.trim().toLowerCase();

  if (!FOOD_PROFILES[normalizedFoodType]) {
    throw new Error(`Unsupported food type: ${foodType}.`);
  }

  return normalizedFoodType;
}

function getFoodProfile(foodType) {
  return FOOD_PROFILES[validateFoodType(foodType)];
}

function validateReading(reading) {
  if (!reading || typeof reading !== "object") {
    throw new Error("Sensor reading must be an object.");
  }

  validateFoodType(reading.foodType);

  if (typeof reading.temperature !== "number" || !Number.isFinite(reading.temperature)) {
    throw new Error("Reading temperature must be a finite number.");
  }

  if (typeof reading.humidity !== "number" || !Number.isFinite(reading.humidity)) {
    throw new Error("Reading humidity must be a finite number.");
  }

  if (reading.humidity < 0 || reading.humidity > 100) {
    throw new Error("Reading humidity must be between 0 and 100.");
  }

  if (typeof reading.timeElapsedHours !== "number" || reading.timeElapsedHours < 0) {
    throw new Error("Reading timeElapsedHours must be a non-negative number.");
  }

  if (typeof reading.timestamp !== "string" || Number.isNaN(Date.parse(reading.timestamp))) {
    throw new Error("Reading timestamp must be a valid ISO date string.");
  }

  return reading;
}

class SensorSimulator extends EventEmitter {
  constructor(options = {}) {
    super();

    this.foodType = validateFoodType(options.foodType || DEFAULT_OPTIONS.foodType);
    this.sensorId = options.sensorId || "simulator-1";
    this.intervalMs = options.intervalMs === undefined ? DEFAULT_OPTIONS.intervalMs : options.intervalMs;
    this.durationMs = options.durationMs === undefined ? DEFAULT_OPTIONS.durationMs : options.durationMs;
    this.anomalyRate = options.anomalyRate === undefined ? DEFAULT_OPTIONS.anomalyRate : options.anomalyRate;
    this.anomalyTemperatureDelta = options.anomalyTemperatureDelta;
    this.anomalyHumidityDelta = options.anomalyHumidityDelta;
    this.random = options.random || Math.random;
    this.clock = options.clock || (() => Date.now());
    this.timer = null;
    this.stopTimer = null;
    this.startedAt = null;
    this.readingNumber = 0;

    if (!Number.isInteger(this.intervalMs) || this.intervalMs <= 0) {
      throw new Error("intervalMs must be a positive integer.");
    }

    if (typeof this.sensorId !== "string" || this.sensorId.trim() === "") {
      throw new Error("sensorId must be a non-empty string.");
    }

    if (!Number.isInteger(this.durationMs) || this.durationMs < 0) {
      throw new Error("durationMs must be a non-negative integer.");
    }

    if (typeof this.anomalyRate !== "number" || this.anomalyRate < 0 || this.anomalyRate > 1) {
      throw new Error("anomalyRate must be between 0 and 1.");
    }

    for (const [name, value] of Object.entries({
      anomalyTemperatureDelta: this.anomalyTemperatureDelta,
      anomalyHumidityDelta: this.anomalyHumidityDelta
    })) {
      if (value !== undefined && (typeof value !== "number" || !Number.isFinite(value) || value < 0)) {
        throw new Error(`${name} must be a non-negative number.`);
      }
    }

    if (typeof this.random !== "function" || typeof this.clock !== "function") {
      throw new Error("random and clock must be functions.");
    }
  }

  get isRunning() {
    return Boolean(this.timer);
  }

  generateReading(timeElapsedHours = 0) {
    if (typeof timeElapsedHours !== "number" || !Number.isFinite(timeElapsedHours) || timeElapsedHours < 0) {
      throw new Error("timeElapsedHours must be a non-negative number.");
    }

    const profile = FOOD_PROFILES[this.foodType];
    const isAnomaly = this.random() < this.anomalyRate;
    const temperatureDelta = this.anomalyTemperatureDelta ?? profile.anomaly.temperature;
    const humidityDelta = this.anomalyHumidityDelta ?? profile.anomaly.humidity;
    const temperature = randomBetween(
      this.random,
      profile.temperature.min,
      profile.temperature.max
    );
    const humidity = randomBetween(this.random, profile.humidity.min, profile.humidity.max);

    const reading = {
      readingId: `${this.sensorId}-${++this.readingNumber}`,
      sensorId: this.sensorId,
      foodType: this.foodType,
      temperature: Number((temperature + (isAnomaly ? temperatureDelta : 0)).toFixed(2)),
      humidity: Number(
        Math.min(100, humidity + (isAnomaly ? humidityDelta : 0)).toFixed(2)
      ),
      timeElapsedHours: Number(timeElapsedHours.toFixed(2)),
      timestamp: new Date(this.clock()).toISOString(),
      anomaly: isAnomaly,
      anomalyType: isAnomaly ? "environmental-spike" : null
    };

    return validateReading(reading);
  }

  start(onReading) {
    if (typeof onReading !== "function") {
      throw new Error("start requires an onReading callback.");
    }

    if (this.timer) {
      throw new Error("The simulator is already running.");
    }

    this.startedAt = this.clock();
    const emitReading = () => {
      const elapsedHours = (this.clock() - this.startedAt) / (1000 * 60 * 60);
      const reading = this.generateReading(elapsedHours);
      onReading(reading);
      this.emit("reading", reading);
    };

    emitReading();
    this.timer = setInterval(emitReading, this.intervalMs);

    if (this.durationMs > 0) {
      this.stopTimer = setTimeout(() => this.stop(), this.durationMs);
    }

    return () => this.stop();
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (this.stopTimer) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }

    this.startedAt = null;
    this.emit("stopped");
  }

  createSampleReadings(count = 10) {
    if (!Number.isInteger(count) || count <= 0) {
      throw new Error("count must be a positive integer.");
    }

    return Array.from({ length: count }, (_, index) =>
      this.generateReading((index * this.intervalMs) / (1000 * 60 * 60))
    );
  }
}

module.exports = {
  DEFAULT_OPTIONS,
  FOOD_PROFILES,
  SensorSimulator,
  getFoodProfile,
  validateFoodType,
  validateReading
};
