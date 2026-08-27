function formatDashboardResult(foodType, sensorData, riskResult) {
  return {
    foodItem: foodType,
    temperature: sensorData.temperature,
    humidity: sensorData.humidity,
    riskPercentage: riskResult.riskScore,
    riskLevel: riskResult.riskLevel,
    alert: riskResult.riskLevel.toUpperCase(),
    lastUpdated: new Date().toISOString()
  };
}

module.exports = {
  formatDashboardResult
};