# Sensor Simulation Engine

The simulator produces realistic food-storage readings for the dashboard and risk engine.

## Example

```js
const { SensorSimulator } = require("./src/sensorSimulator");

const simulator = new SensorSimulator({
  foodType: "milk",
  intervalMs: 1000,
  durationMs: 10000,
  anomalyRate: 0.1
});

const stop = simulator.start((reading) => {
  console.log(reading);
});

// Call stop() to end the stream early.
```

Each reading includes `foodType`, `temperature`, `humidity`, `timeElapsedHours`,
`timestamp`, and an `anomaly` flag. Supported food types are `milk`, `chicken`,
`fish`, `tomato`, and `spinach`.

Optional settings include `sensorId`, `maxReadings`, `anomalyTemperatureDelta`,
and `anomalyHumidityDelta`. The simulator also emits `reading` and `stopped`
events for stream consumers.

Generate a finite dataset without starting timers:

```js
const readings = simulator.createSampleReadings(20);
```

Run the tests with:

```text
npm run test:simulator
```
