const { calculateRisk } = require("../src/riskcalculator");

try {
  calculateRisk({
    foodType: "meat",
    temperature: 8,
    humidity: 70,
    timeElapsedHours: "four"
  });
} catch (error) {
  console.log(error.message);
}