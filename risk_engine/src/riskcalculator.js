const thresholds = require("../data/thresholds.json");

const WEIGHTS = {
  temperature: 0.4,
  humidity: 0.3,
  time: 0.3
};

function clamp(value, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

function calculateTemperatureRisk(temperature, safeMaxTemperature) {
  if (temperature <= safeMaxTemperature) {
    return 0;
  }

  const excess = temperature - safeMaxTemperature;

  return clamp(excess * 20);
}

function calculateHumidityRisk(humidity) {
  if (humidity <= 60) {
    return 0;
  }

  return clamp((humidity - 60) * 2.5);
}

function calculateTimeRisk(timeElapsedHours) {
  if (timeElapsedHours <= 2) {
    return 0;
  }

  return clamp((timeElapsedHours - 2) * 10);
}
function getFoodProfile(foodType) {
  const foodProfile = thresholds.food_profiles[foodType];

  if (!foodProfile) {
    throw new Error(`Unknown food type: ${foodType}`);
  }

  return foodProfile;
}

function calculateRisk({
  foodType,
  temperature,
  humidity,
  timeElapsedHours,
  safeMaxTemperature
}) {
  if (typeof foodType !== "string" || foodType.trim() === "") {
  throw new Error("Food type is required.");
}
  
  const normalizedFoodType = foodType.trim().toLowerCase();
const foodProfile = thresholds.food_profiles[normalizedFoodType];

  if (!foodProfile) {
    throw new Error(`Unknown food type: ${foodType}`);
  }

  const temperatureLimit =
    safeMaxTemperature ?? foodProfile.recommended_max_storage_c;

  if (
    !Number.isFinite(temperature) ||
    !Number.isFinite(humidity) ||
    !Number.isFinite(timeElapsedHours)
  ) {
    throw new Error("Temperature, humidity and elapsed time must be numbers.");
  }

  if (humidity < 0 || humidity > 100) {
    throw new Error("Humidity must be between 0 and 100 percent.");
  }

  if (timeElapsedHours < 0) {
    throw new Error("Elapsed time cannot be negative.");
  }

  const temperatureRisk = calculateTemperatureRisk(
    temperature,
    temperatureLimit
  );

  const humidityRisk = calculateHumidityRisk(humidity);

  const timeRisk = calculateTimeRisk(timeElapsedHours);

  const riskScore =
    temperatureRisk * WEIGHTS.temperature +
    humidityRisk * WEIGHTS.humidity +
    timeRisk * WEIGHTS.time;

  return {
    riskScore: Number(riskScore.toFixed(2)),
    components: {
      temperatureRisk: Number(temperatureRisk.toFixed(2)),
      humidityRisk: Number(humidityRisk.toFixed(2)),
      timeRisk: Number(timeRisk.toFixed(2))
    }
  };
}

function classifyRisk(riskScore) {
  if (!Number.isFinite(riskScore)) {
    throw new Error("Risk score must be a number.");
  }

  if (riskScore < 30) {
    return "SAFE";
  }

  if (riskScore < 60) {
    return "MEDIUM";
  }

  return "HIGH";
}

module.exports = {
  calculateRisk,
  classifyRisk
};