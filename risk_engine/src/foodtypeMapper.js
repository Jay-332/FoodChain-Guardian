const dashboardFoodTypeMap = {
  milk: "dairy",
  chicken: "meat",
  spinach: "vegetables",
  grapes: "cut-fruits",
  tomato: "vegetables"
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