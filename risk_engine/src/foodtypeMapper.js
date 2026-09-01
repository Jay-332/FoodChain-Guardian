const dashboardFoodTypeMap = {
  milk: "dairy",
  chicken: "meat",
  spinach: "vegetables",
  grapes: "cut_fruits",
  tomato: "vegetables",
  cut_fruits: "cut_fruits",
  vegetables: "vegetables",
  dairy: "dairy",
  meat: "meat",
  fish: "fish"
};

function mapDashboardFoodType(foodType) {
  if (typeof foodType !== "string" || foodType.trim() === "") {
    throw new Error("Food type is required.");
  }

  const normalizedFoodType = foodType.trim().toLowerCase();
  const mappedFoodType = dashboardFoodTypeMap[normalizedFoodType];

  if (!mappedFoodType) {
    throw new Error("Unsupported dashboard food type: " + foodType);
  }

  return mappedFoodType;
}

module.exports = {
  mapDashboardFoodType,
  dashboardFoodTypeMap
};