const { formatDashboardResult } = require("../src/dashboardFormatter");

const result = formatDashboardResult(
  "milk",
  {
    temperature: 4,
    humidity: 65
  },
  {
    riskScore: 30,
    riskLevel: "Low"
  }
);

console.log(result);