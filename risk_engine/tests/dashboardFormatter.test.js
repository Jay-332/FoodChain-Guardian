const { formatDashboardResult } = require("../src/dashboardFormatter");

const lowResult = formatDashboardResult(
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

const mediumResult = formatDashboardResult(
  "chicken",
  {
    temperature: 7,
    humidity: 70
  },
  {
    riskScore: 55,
    riskLevel: "Medium"
  }
);

const highResult = formatDashboardResult(
  "fish",
  {
    temperature: 12,
    humidity: 80
  },
  {
    riskScore: 85,
    riskLevel: "High"
  }
);

console.log("Low alert:", lowResult.alert);
console.log("Medium alert:", mediumResult.alert);
console.log("High alert:", highResult.alert);
try {
  formatDashboardResult(
    "milk",
    {
      temperature: 4,
      humidity: 65
    },
    {
      riskScore: 120,
      riskLevel: "High"
    }
  );
} catch (error) {
  console.log("Invalid risk percentage test:", error.message);
}