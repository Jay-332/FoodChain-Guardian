# FoodChain Guardian - Final Presentation Document

## 1. Project Overview

FoodChain Guardian is a smart food spoilage monitoring dashboard designed to track environmental conditions, detect spoilage risks, and alert users when food storage conditions become unsafe. The system focuses on protecting food quality, reducing waste, and improving safety awareness in storage environments.

The project combines a real-time dashboard with monitoring logic, food risk analysis, and alert generation. It is a practical software solution designed for real-world food safety and warehouse monitoring scenarios.

---

## 2. Problem Statement

Food quality can degrade due to temperature fluctuations, humidity changes, and poor storage conditions. Without continuous monitoring, food items may become unsafe before the issue is noticed.

This leads to:
- spoiled food inventory
- increased waste and cost
- health and safety concerns
- poor visibility into risky conditions

FoodChain Guardian addresses this by providing a single monitoring platform for food condition tracking and risk assessment.

---

## 3. Solution and Objective

The project provides a dashboard that monitors:
- temperature conditions
- humidity levels
- risk levels for each food item
- storage health trends
- alert status for critical conditions

The goal is to give users a simple, clear overview of food safety and help them act before spoilage becomes severe.

---

## 4. Key Features

### Dashboard Overview
- Displays the current system health status
- Shows overall safe/low-risk status
- Presents live time and date information
- Displays important environmental metrics

### Temperature and Humidity Monitoring
- Tracks average temperature and humidity values
- Compares current values to safe ranges
- Helps identify abnormal operating conditions

### Spoilage Risk Calculation
- Estimates risk percentage for different food items
- Categorizes risk as Safe, Medium, or High
- Helps prioritize risky storage conditions

### Charts and Trend Visualization
- Uses environment trend charts for temperature and humidity
- Uses risk trend charts to monitor changes over time
- Visualizes patterns that support decision-making

### Alerts Section
- Highlights critical and medium-risk conditions
- Flags abnormal readings for specific food items
- Allows the user to review alert history and current alert state

### Food Status Table
- Lists food items with their current values
- Displays temperature, humidity, and risk percentage
- Shows the current risk level badge for each item

### Food Photo Upload
- Lets users attach a photo of a food item for review
- Displays image preview immediately after upload
- Helps with visual validation during monitoring workflows

### Refresh and Live Monitoring
- Refresh button updates the dashboard status
- Live system time keeps the UI active and current

---

## 5. System Workflow

The application follows a simple operational workflow:

1. Read or simulate environmental sensor data
2. Compare values against safe thresholds
3. Calculate spoilage risk for each food item
4. Present the result in dashboard cards and tables
5. Generate alerts when values exceed thresholds
6. Display charts and trends for monitoring decisions
7. Allow users to refresh and review conditions at any time

This workflow makes the system practical for real-time food safety monitoring and decision support.

---

## 6. Functional Demo Flow

Use the following sequence to record a short demonstration video:

### Demo Recording Steps
1. Open the homepage of the dashboard.
2. Show the sidebar and navigation menu.
3. Point out the live clock and system status cards.
4. Explain the average temperature, humidity, and spoilage risk panels.
5. Show the environment trend chart and risk trend chart.
6. Highlight the food status table and food risk badges.
7. Show the alerts card with high/medium/low risk notifications.
8. Upload a sample food image in the food photo section.
9. Explain that the preview appears immediately after upload.
10. Click Refresh Now and show the time updates.
11. Conclude by explaining the system is monitoring food safety in real time.

---

## 7. How the Features Work

### Overall Dashboard
The main dashboard acts as a central overview panel. It gives the user a quick summary of the current system condition without needing to inspect many separate records.

### Risk Logic
Each food product has values that are compared against safe ranges. If temperature or humidity exceeds the expected range, the risk value increases and the UI reflects the status with a badge and alert.

### Alerts
The alert section identifies issues requiring attention. This helps users quickly prioritize items that need intervention.

### Charts
The charts provide a historical view of conditions over time, which makes the dashboard more useful for trend-based decisions.

### Upload Preview
The photo review function lets users visually inspect a food item while checking its metrics. This helps support manual verification and makes the system feel more realistic and practical.

---

## 8. Technology Stack

- HTML for page structure
- CSS for layout and visual design
- JavaScript for interactive UI behavior
- Chart.js for trend charts
- Node.js for the project’s logic modules
- Jest and Node test runner for validation

---

## 9. Project Structure

The project is divided into logical modules:

- Frontend Dashboard
  - HTML, CSS, JavaScript files
- Alert Database Module
  - Handles alert generation and stored alert logic
- Risk Engine Module
  - Handles simulation and risk calculation logic

This modular structure makes the project suitable for collaborative group development and version control.

---

## 10. Testing and Verification

The project was validated with automated testing in the repository and live dashboard checks.

Verified results:
- Alerts module: 19/19 tests passing
- Risk engine: 22/22 tests passing
- Dashboard loads correctly
- UI interactions work in the browser

This confirms that the system is operational and suitable for final presentation.

---

## 11. Team Contribution and Git Workflow

The project follows a group collaboration workflow:
- separate modules for each team member or task area
- clearly defined functionality boundaries
- version-controlled updates through Git and GitHub
- final merged result with preserved project history

This is important because the assignment emphasizes collaborative development and SCM practices.

### Member Contributions

#### Member 1 - Frontend Dashboard and UI Design
- Designed the dashboard layout and overall interface
- Built the monitoring cards, sidebar navigation, status panels, and visual styling
- Contributed to the main user experience and presentation look
- Final contribution: the dashboard is polished and ready for demonstration

#### Member 2 - Risk Calculation and Food Safety Logic
- Implemented logic for calculating food spoilage risk
- Defined how temperature and humidity values affect warning levels
- Helped interpret environmental readings into usable risk categories
- Final contribution: the system clearly identifies safe, medium, and high-risk food items

#### Member 3 - Sensor Simulation and Data Flow
- Created the simulation logic for food and environmental readings
- Set realistic sensor values and storage conditions for testing
- Supported the project with simulated data and monitoring scenarios
- Final contribution: the dashboard reflects realistic and consistent food-status monitoring

#### Member 4 - Alert System and Database Module
- Built alert generation logic for high, medium, and low-risk states
- Managed database-related alert logging and event handling
- Ensured abnormal readings are captured and presented clearly
- Final contribution: the alert section is active and meaningful during live demo use

#### Member 5 - Testing, Documentation, and Final Integration
- Verified core project behavior through automated checks
- Prepared documentation and final project presentation materials
- Helped confirm the project is running correctly before final submission
- Final contribution: project validation, final polish, and presentation readiness

### Final Project Outcome
At the end of the project, all major parts were integrated into one working solution:
- dashboard UI is fully functional
- risk logic and sensor simulation work together
- alerts and status monitoring are visible to the user
- charts and food tables display real-time-style data
- photo upload functionality works in the final interface
- the project is tested and presentation-ready

The final result is a working, complete SCM project that demonstrates teamwork, modular development, and a practical food safety monitoring system.

---

## 12. Website Screenshots

### Dashboard Overview
![Dashboard Screenshot](website-dashboard-full.png)

### Feature Highlight: Food Monitoring and Alerts
![Food and Alerts Screenshot](website-dashboard-upload.png)

> These images show the main dashboard, charts, food status table, alerts, upload workflow, and overall application interface.

---

## 13. Why This Project Is Good

This project is a good assignment because it includes:
- a practical real-world problem
- clear functionality and user flow
- teamwork-friendly modular design
- dashboard UI and data visualization
- alert logic and risk management
- testing and validation
- presentation-ready structure

It demonstrates software engineering concepts in an understandable and complete way.

---

## 14. Final Summary

FoodChain Guardian is a well-rounded project that combines food safety, monitoring logic, UI design, and alerting into one solution. It is effective for both academic presentation and practical demonstration because it clearly shows how a system can monitor conditions and reduce risk before damage occurs.

The project is complete, working, polished for a presentation, and ready to demonstrate to an audience. The final version includes all major features, passes validation checks, and presents the completed result of the team’s collaborative work.

---

## 15. Short Closing Statement for Presentation

“Our project, FoodChain Guardian, is a smart food monitoring system that tracks temperature, humidity, and spoilage risk in order to keep food storage conditions safe. It combines data monitoring, risk analysis, alerts, and dashboard visualization to help reduce waste and improve food safety.”
