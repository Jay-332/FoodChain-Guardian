const express = require("express");

const app = express();

app.use(express.json());

app.get("/", function (req, res) {
  res.json({
    message: "Food Chain Guardian Risk Engine API is running"
  });
});

const PORT = 3000;

app.listen(PORT, function () {
  console.log("Risk Engine API running on port " + PORT);
});