function predictRisk(features) {
  const { temperature, humidity, storageHours } = features;

  if (
    typeof temperature !== "number" ||
    typeof humidity !== "number" ||
    typeof storageHours !== "number"
  ) {
    throw new Error("All ML features must be numeric.");
  }

  const temperatureRisk = Math.min(Math.abs(temperature - 4) * 5, 40);
  const humidityRisk = Math.min(Math.abs(humidity - 60) * 0.5, 20);
  const timeRisk = Math.min(storageHours * 2, 40);

  const score = Math.min(
    100,
    temperatureRisk + humidityRisk + timeRisk
  );

  let riskLevel = "Low";

  if (score >= 70) {
    riskLevel = "High";
  } else if (score >= 40) {
    riskLevel = "Medium";
  }

  return {
    riskScore: Number(score.toFixed(2)),
    riskLevel
  };
}

module.exports = {
  predictRisk
};