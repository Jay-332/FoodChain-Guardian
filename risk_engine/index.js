const { formatDashboardResult } = require("./src/dashboardFormatter");

function calculateRiskResponse(foodType, sensorData, riskResult) {
  return formatDashboardResult(foodType, sensorData, riskResult);
}

module.exports = {
  calculateRiskResponse
};