const { formatDashboardResult } = require("../src/dashboardFormatter");

// Test 1: Low risk
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

console.log("Low alert:", lowResult.alert);

// Test 2: Medium risk
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

console.log("Medium alert:", mediumResult.alert);

// Test 3: High risk
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

console.log("High alert:", highResult.alert);

// Test 4: Invalid risk percentage
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

  console.log("ERROR: Invalid risk percentage was accepted.");
} catch (error) {
  console.log("Invalid risk percentage test:", error.message);
}

// Test 5: Invalid humidity
try {
  formatDashboardResult(
    "milk",
    {
      temperature: 4,
      humidity: 120
    },
    {
      riskScore: 30,
      riskLevel: "Low"
    }
  );

  console.log("ERROR: Invalid humidity was accepted.");
} catch (error) {
  console.log("Invalid humidity test:", error.message);
}

// Test 6: Invalid temperature
try {
  formatDashboardResult(
    "milk",
    {
      temperature: 150,
      humidity: 65
    },
    {
      riskScore: 30,
      riskLevel: "Low"
    }
  );

  console.log("ERROR: Invalid temperature was accepted.");
} catch (error) {
  console.log("Invalid temperature test:", error.message);
}
try {
  formatDashboardResult(
    "",
    {
      temperature: 4,
      humidity: 65
    },
    {
      riskScore: 30,
      riskLevel: "Low"
    }
  );

  console.log("ERROR: Invalid food item was accepted.");
} catch (error) {
  console.log("Invalid food item test:", error.message);
}
try {
  formatDashboardResult(
    "milk",
    {
      temperature: 4,
      humidity: 65
    },
    {
      riskScore: 30,
      riskLevel: "Unknown"
    }
  );

  console.log("ERROR: Invalid risk level was accepted.");
} catch (error) {
  console.log("Invalid risk level test:", error.message);
}