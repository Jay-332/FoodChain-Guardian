const express = require("express");
const { calculateRiskResponse } = require("./index");

const app = express();

app.use(express.json());

app.get("/", function (req, res) {
  res.json({
    message: "Food Chain Guardian Risk Engine API is running"
  });
});

app.post("/risk", function (req, res) {
  try {
    const { foodType, sensorData, riskResult } = req.body;

    const result = calculateRiskResponse(
      foodType,
      sensorData,
      riskResult
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});

const PORT = 3000;

app.listen(PORT, function () {
  console.log("Risk Engine API running on port " + PORT);
});