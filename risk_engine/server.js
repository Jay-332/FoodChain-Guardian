const express = require("express");
const { predictRisk } = require("./ml/model");

const app = express();

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Food Chain Guardian Risk Engine",
    timestamp: new Date().toISOString()
  });
});

// Version endpoint
app.get("/version", (req, res) => {
  res.json({
    service: "Food Chain Guardian Risk Engine",
    version: "1.0.0"
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Food Chain Guardian Risk Engine API is running"
  });
});

// Risk endpoint
app.post("/risk", (req, res) => {
  try {
    const { foodType, sensorData } = req.body;
    if (!foodType || typeof foodType !== "string") {
  return res.status(400).json({
    error: "Food type is required and must be a string"
  });
}

    if (!sensorData) {
      return res.status(400).json({
        error: "Sensor data is required"
      });
    }

    if (
      typeof sensorData.temperature !== "number" ||
      typeof sensorData.humidity !== "number" ||
      typeof sensorData.storageHours !== "number"
    ) {
      return res.status(400).json({
        error: "Temperature, humidity and storageHours must be numbers"
      });
    }

    const risk = predictRisk({
      temperature: sensorData.temperature,
      humidity: sensorData.humidity,
      storageHours: sensorData.storageHours
    });

    res.json({
      foodType: foodType,
      sensorData: sensorData,
      risk: {
        riskPercentage: risk.riskPercentage,
        riskLevel: risk.riskLevel
      }
    });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log("Risk Engine API running on port " + PORT);
});