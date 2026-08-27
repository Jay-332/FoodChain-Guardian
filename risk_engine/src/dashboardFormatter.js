const SUPPORTED_FOOD_ITEMS = [
  "milk",
  "chicken",
  "fish",
  "tomato",
  "spinach"
];

function validateDashboardResult(result) {
  if (!result.foodItem) {
    throw new Error("Dashboard result must contain a food item.");
  }

  if (typeof result.temperature !== "number") {
    throw new Error("Temperature must be a number.");
  }

  if (result.temperature < -50 || result.temperature > 100) {
    throw new Error("Temperature must be between -50 and 100.");
  }

  if (typeof result.humidity !== "number") {
    throw new Error("Humidity must be a number.");
  }

  if (result.humidity < 0 || result.humidity > 100) {
    throw new Error("Humidity must be between 0 and 100.");
  }

  if (typeof result.riskPercentage !== "number") {
    throw new Error("Risk percentage must be a number.");
  }

  if (result.riskPercentage < 0 || result.riskPercentage > 100) {
    throw new Error("Risk percentage must be between 0 and 100.");
  }

  if (!result.riskLevel) {
    throw new Error("Dashboard result must contain a risk level.");
  }

  const validRiskLevels = ["Low", "Medium", "High"];

  if (!validRiskLevels.includes(result.riskLevel)) {
    throw new Error("Risk level must be Low, Medium, or High.");
  }

  return result;
}

function validateFoodItem(foodType) {
  if (typeof foodType !== "string" || foodType.trim() === "") {
    throw new Error("Food item must be a valid name.");
  }

  const normalizedFood = foodType.trim().toLowerCase();

  if (!SUPPORTED_FOOD_ITEMS.includes(normalizedFood)) {
    throw new Error("Unsupported food item.");
  }

  return normalizedFood;
}

function getDashboardAlert(riskLevel) {
  const normalizedLevel = riskLevel.trim().toLowerCase();

  if (
    normalizedLevel !== "high" &&
    normalizedLevel !== "medium" &&
    normalizedLevel !== "low"
  ) {
    throw new Error("Invalid risk level.");
  }

  return normalizedLevel.toUpperCase();
}

function formatDashboardResult(foodType, sensorData, riskResult) {
  if (!sensorData || typeof sensorData !== "object") {
    throw new Error("Sensor data is required.");
  }

  if (!riskResult || typeof riskResult !== "object") {
    throw new Error("Risk result is required.");
  }

  return validateDashboardResult({
    foodItem: validateFoodItem(foodType),
    temperature: sensorData.temperature,
    humidity: sensorData.humidity,
    riskPercentage: riskResult.riskScore,
    riskLevel:
      riskResult.riskLevel.charAt(0).toUpperCase() +
      riskResult.riskLevel.slice(1).toLowerCase(),
    alert: getDashboardAlert(riskResult.riskLevel),
    alertMessage:
      getDashboardAlert(riskResult.riskLevel) === "HIGH"
        ? "Temperature or humidity requires immediate attention."
        : getDashboardAlert(riskResult.riskLevel) === "MEDIUM"
          ? "Food conditions should be monitored."
          : "Food conditions are stable.",
    lastUpdated: new Date().toISOString()
  });
}

module.exports = {
  formatDashboardResult
};