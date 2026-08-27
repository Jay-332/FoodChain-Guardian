const { calculateRisk } = require("../src/riskcalculator");

const foodTypes = [
  "cut_fruits",
  "vegetables",
  "dairy",
  "meat",
  "fish"
];
for (const foodType of foodTypes) {
  const result = calculateRisk({
    foodType,
    temperature: 8,
    humidity: 70,
    timeElapsedHours: 4
  });

  console.log(
    `${foodType}: risk=${result.riskScore}, category=${result.foodCategory}`
  );
}

console.log("\nValid risk calculation test:");

const testResult = calculateRisk({
  foodType: "meat",
  temperature: 8,
  humidity: 70,
  timeElapsedHours: 4
});

if (
  testResult.riskScore === 37.5 &&
  testResult.components.temperatureRisk === 60 &&
  testResult.components.humidityRisk === 25 &&
  testResult.components.timeRisk === 20
) {
  console.log("PASS: Risk calculation is correct.");
} else {
  console.log("FAIL: Risk calculation returned unexpected values.");
}