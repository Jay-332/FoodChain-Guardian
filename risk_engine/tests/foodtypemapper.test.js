const { mapDashboardFoodType } = require("../src/foodtypeMapper");

const dashboardFoodTypes = [
  "milk",
  "chicken",
  "spinach",
  "grapes",
  "tomato"
];

for (const foodType of dashboardFoodTypes) {
  const mappedType = mapDashboardFoodType(foodType);
  console.log(foodType + " -> " + mappedType);
}