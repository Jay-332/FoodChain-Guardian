function validateFoodItem(foodType) {
  if (typeof foodType !== "string" || foodType.trim() === "") {
    throw new Error("Food item must be a valid name.");
  }

  return foodType.trim();
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
  return {
    foodItem: validateFoodItem(foodType),
    temperature: sensorData.temperature,
    humidity: sensorData.humidity,
    riskPercentage: riskResult.riskScore,
    riskLevel: riskResult.riskLevel,
    alert: getDashboardAlert(riskResult.riskLevel),
    alertMessage: getDashboardAlert(riskResult.riskLevel) === "HIGH"
  ? "Temperature or humidity requires immediate attention."
  : getDashboardAlert(riskResult.riskLevel) === "MEDIUM"
    ? "Food conditions should be monitored."
    : "Food conditions are stable.",
    lastUpdated: new Date().toISOString()
  };
}

module.exports = {
  formatDashboardResult
};