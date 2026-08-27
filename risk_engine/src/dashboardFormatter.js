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
    foodItem: foodType,
    temperature: sensorData.temperature,
    humidity: sensorData.humidity,
    riskPercentage: riskResult.riskScore,
    riskLevel: riskResult.riskLevel,
    alert: getDashboardAlert(riskResult.riskLevel),
    lastUpdated: new Date().toISOString()
  };
}

module.exports = {
  formatDashboardResult
};