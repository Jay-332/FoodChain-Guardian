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