# FoodChain Guardian

Food Chain Guardian is a smart food spoilage monitoring system designed to track storage conditions, evaluate spoilage risk, and notify users of unsafe food conditions in real time. The project simulates sensor-driven monitoring for temperature, humidity, and food safety thresholds, helping users quickly identify potential spoilage risks before they lead to waste or health issues.

## Project Description

This project focuses on building a practical dashboard and risk assessment system for food safety management. It brings together:

- sensor-style environmental monitoring
- risk calculation for food items
- visual dashboard analytics
- alert generation for abnormal conditions
- testing of the system logic and behavior

The system is designed to be a strong SCM group project because it is realistic, modular, and easy to split among multiple contributors.

## Features

- Real-time dashboard overview for food safety monitoring
- Temperature and humidity tracking
- Spoilage risk calculation by food type and storage conditions
- Risk-level categorization: Safe, Medium, High
- Alert generation for abnormal readings
- Environmental trend charts
- Food status table for monitoring multiple food items
- Photo upload preview support for food item review
- Automated test coverage for core logic

## Tech Stack

- HTML, CSS, JavaScript for the dashboard frontend
- Chart.js for trend visualization
- Node.js for backend/service logic
- Jest and Node test runner for automated testing
- Git and GitHub for collaboration and version control

## Project Structure

```text
FoodChain-Guardian/
├── alerts_db/
│   ├── tests/
│   ├── add-reading.js
│   ├── alerts.js
│   ├── database.js
│   ├── demo.js
│   ├── INTEGRATION.md
│   ├── package.json
│   └── view-db.js
├── risk_engine/
│   ├── data/
│   ├── ml/
│   ├── src/
│   ├── tests/
│   ├── index.js
│   ├── package.json
│   ├── server.js
│   └── SENSOR_SIMULATOR.md
├── index.html
├── script.js
├── style.css
├── README.md
└── .gitignore
```

## Core Modules

### Frontend Dashboard
- Built in [index.html](index.html), [script.js](script.js), and [style.css](style.css)
- Displays overall system health, metrics, risk indicators, and charts

### Alert Database Module
- Located in [alerts_db](alerts_db)
- Handles alert generation and stored alert data

### Risk Engine Module
- Located in [risk_engine](risk_engine)
- Simulates sensor readings and calculates food safety risk

## Team Members and Contributions

The project is structured so multiple team members can work in parallel. The following contribution map can be assigned to the group members:

- Member 1: Frontend dashboard and UI design
- Member 2: Risk calculation and food safety logic
- Member 3: Sensor simulation and data generation
- Member 4: Alerts and database integration
- Member 5: Testing, documentation, and project coordination

Each member should contribute to the repository through GitHub by creating commits for their assigned tasks and supporting the final demo preparation.

## Git and Collaboration Workflow

- Create feature branches for each task
- Use meaningful commit messages such as:
  - Add food dashboard layout
  - Implement risk calculation logic
  - Create alert database module
  - Fix temperature validation bug
  - Add test coverage for simulator
- Merge changes through pull requests after review
- Keep the repository organized and documentation updated

## Testing

The project includes automated validation for key modules. Verified test status in the current workspace:

- Alerts module: 19/19 tests passing
- Risk engine simulator: 22/22 tests passing

## Future Improvements

- Add real device sensor integration
- Implement persistent database storage
- Improve ML-based spoilage prediction
- Add user authentication and admin panels
- Expand alert channels and notifications

## Project Status

This project is a suitable SCM group assignment because it combines practical functionality, modular engineering, version control practices, and presentation-ready features.

## License

This project is intended for academic and collaborative learning purposes.
