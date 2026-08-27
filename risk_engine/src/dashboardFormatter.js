function formatDashboardResult(foodType, sensorData, riskResult) {
  return {
    foodItem: foodType,
    temperature: sensorData.temperature,
    humidity: sensorData.humidity,
    riskPercentage: riskResult.riskScore,
    riskLevel: riskResult.riskLevel,
    lastUpdated: new Date().toISOString()
  };
}

module.exports = {
  formatDashboardResult
};