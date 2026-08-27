const { predictRisk } = require("../model");

const result = predictRisk({
  temperature: 8,
  humidity: 70,
  storageHours: 10
});

console.log("ML risk score:", result.riskScore);
console.log("ML risk level:", result.riskLevel);

try {
  predictRisk({
    temperature: "hot",
    humidity: 70,
    storageHours: 10
  });

  console.log("ERROR: Invalid ML input was accepted.");
} catch (error) {
  console.log("Invalid ML input test:", error.message);
}