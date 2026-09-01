const menuItems = document.querySelectorAll(".menu-item");
const refreshButton = document.getElementById("refreshBtn");
const lastUpdated = document.getElementById("lastUpdated");
const viewPanel = document.getElementById("viewPanel");
const dashboardSections = document.querySelectorAll(".main > .cards, .main > .charts, .main > .bottom-section");
const sidebar = document.querySelector(".sidebar");
const uptime = document.getElementById("uptime");
const clock = document.getElementById("clock");
const date = document.getElementById("date");
const foodPhotoInput = document.getElementById("foodPhoto");
const foodPhotoPreview = document.getElementById("foodPhotoPreview");
const foodPhotoMessage = document.getElementById("foodPhotoMessage");
const hamburger = document.getElementById("hamburger");
const viewAllFoods = document.getElementById("viewAllFoods");
const viewAllAlerts = document.getElementById("viewAllAlerts");
const viewAlertHistory = document.getElementById("viewAlertHistory");
const autoUpdate = document.getElementById("autoUpdate");
const dateFilter = document.getElementById("dateFilter");

const views = {
    "live-monitor": ["Live Monitor", "Current sensor readings from monitored storage areas.", "All sensors are online. Temperature and humidity readings are updating normally."],
    "food-summary": ["Food Summary", "Overview of monitored food items and their current risk.", "5 food items monitored · 3 safe · 1 medium risk · 1 high risk"],
    alerts: ["Alerts", "Review active food safety warnings.", "1 high-risk alert and 1 medium-risk alert require attention."],
    history: ["History & Logs", "Recent monitoring events and system activity.", "No system outages recorded. Last sync completed just now."],
    reports: ["Reports", "Generate a snapshot of current food safety conditions.", "The latest daily report is ready to review."],
    settings: ["Settings", "Manage monitoring preferences.", "Auto Update is enabled and the system is connected to SQLite."]
};

function selectView(view) {
    const item = document.querySelector(`[data-view="${view}"]`);
    if (item) item.click();
}

function showDashboard() {
    const headerTitle = document.querySelector(".header h1");
    const headerDescription = document.querySelector(".header p");

    if (headerTitle) headerTitle.textContent = "Dashboard";
    if (headerDescription) headerDescription.textContent = "Real-time monitoring of food storage conditions and spoilage risk";

    if (viewPanel) {
        viewPanel.hidden = true;
        viewPanel.innerHTML = "";
    }

    dashboardSections.forEach((section) => {
        section.hidden = false;
    });
}

function updateUptime() {
    if (!uptime) {
        return;
    }

    const now = new Date();
    const totalSeconds = Math.floor((now.getTime() - performance.timeOrigin) / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    uptime.textContent = `${hours}:${minutes}:${seconds}`;
}

function handleFoodPhotoUpload(event) {
    const file = event && event.target && event.target.files ? event.target.files[0] : null;

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        if (foodPhotoPreview) {
            foodPhotoPreview.hidden = true;
            foodPhotoPreview.removeAttribute("src");
            if (foodPhotoPreview.dataset.objectUrl) {
                URL.revokeObjectURL(foodPhotoPreview.dataset.objectUrl);
                delete foodPhotoPreview.dataset.objectUrl;
            }
        }

        if (foodPhotoMessage) {
            foodPhotoMessage.textContent = "Please choose a valid image file.";
        }
        return;
    }

    const previousObjectUrl = foodPhotoPreview && foodPhotoPreview.dataset.objectUrl;
    if (previousObjectUrl) {
        URL.revokeObjectURL(previousObjectUrl);
    }

    const imageUrl = URL.createObjectURL(file);

    if (foodPhotoPreview) {
        foodPhotoPreview.dataset.objectUrl = imageUrl;
        foodPhotoPreview.src = imageUrl;
        foodPhotoPreview.hidden = false;
    }

    if (foodPhotoMessage) {
        foodPhotoMessage.textContent = `Previewing ${file.name}`;
    }
}

function updateClockAndDate() {
    const now = new Date();

    if (clock) {
        clock.textContent = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }

    if (date) {
        date.textContent = now.toLocaleDateString([], {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }
}

function buildCharts() {
    if (typeof Chart === "undefined") {
        return;
    }

    const environmentChart = document.getElementById("environmentChart");
    const riskChart = document.getElementById("riskChart");
    const riskDistributionChart = document.getElementById("riskDistributionChart");
    const hourlyRiskChart = document.getElementById("hourlyRiskChart");

    if (environmentChart) {
        new Chart(environmentChart, {
            type: "line",
            data: {
                labels: ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00"],
                datasets: [
                    {
                        label: "Temperature (°C)",
                        data: [4.1, 4.4, 4.8, 5.1, 4.9, 4.6, 4.3, 4.2],
                        borderColor: "#176bd1",
                        backgroundColor: "rgba(23, 107, 209, 0.12)",
                        borderWidth: 3,
                        tension: 0.35,
                        fill: true
                    },
                    {
                        label: "Humidity (%)",
                        data: [62, 65, 68, 67, 64, 63, 60, 61],
                        borderColor: "#62a840",
                        backgroundColor: "rgba(98, 168, 64, 0.12)",
                        borderWidth: 3,
                        tension: 0.35,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        suggestedMin: 0,
                        suggestedMax: 100
                    }
                }
            }
        });
    }

    if (riskChart) {
        new Chart(riskChart, {
            type: "line",
            data: {
                labels: ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00"],
                datasets: [
                    {
                        label: "Low Risk",
                        data: [12, 18, 24, 31, 26, 22, 15, 14],
                        borderColor: "#269c51",
                        borderWidth: 2,
                        tension: 0.35,
                        fill: false
                    },
                    {
                        label: "Medium Risk",
                        data: [18, 25, 36, 48, 42, 38, 29, 22],
                        borderColor: "#ee9d19",
                        borderWidth: 2,
                        tension: 0.35,
                        fill: false
                    },
                    {
                        label: "High Risk",
                        data: [5, 9, 16, 28, 21, 14, 10, 8],
                        borderColor: "#df3a3a",
                        borderWidth: 2,
                        tension: 0.35,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    if (riskDistributionChart) {
        new Chart(riskDistributionChart, {
            type: "doughnut",
            data: {
                labels: ["Safe", "Medium", "High"],
                datasets: [{
                    data: [58, 27, 15],
                    backgroundColor: ["#1dbf73", "#f2b94b", "#ef4b4b"]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "bottom" }
                }
            }
        });
    }

    if (hourlyRiskChart) {
        new Chart(hourlyRiskChart, {
            type: "bar",
            data: {
                labels: ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00"],
                datasets: [{
                    label: "Risk Trend by Hour",
                    data: [10, 18, 22, 35, 48, 53, 44, 26],
                    backgroundColor: ["#dff7eb", "#c7efd8", "#b2e3c8", "#fbe6b9", "#f9d17a", "#f3a950", "#ef7c50", "#d9515d"],
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
}

menuItems.forEach((item) => {
    item.addEventListener("click", () => {
        menuItems.forEach((menuItem) => menuItem.classList.remove("active"));
        item.classList.add("active");

        const view = item.dataset.view;
        const viewDetails = views[view];
        const headerTitle = document.querySelector(".header h1");
        const headerDescription = document.querySelector(".header p");

        if (!viewDetails) {
            if (headerTitle) headerTitle.textContent = "Dashboard";
            if (headerDescription) headerDescription.textContent = "Real-time monitoring of food storage conditions and spoilage risk";
            if (viewPanel) {
                viewPanel.hidden = true;
                viewPanel.innerHTML = "";
            }
            dashboardSections.forEach((section) => { section.hidden = false; });
            return;
        }

        if (headerTitle) headerTitle.textContent = viewDetails[0];
        if (headerDescription) headerDescription.textContent = viewDetails[1];
        dashboardSections.forEach((section) => { section.hidden = true; });

        if (viewPanel) {
            viewPanel.innerHTML = `<h2>${viewDetails[0]}</h2><p>${viewDetails[2]}</p>`;
            viewPanel.hidden = false;
        }
    });
});

if (refreshButton) {
    refreshButton.addEventListener("click", () => {
        if (lastUpdated) {
            lastUpdated.textContent = new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });
        }
    });
}

if (hamburger) {
    hamburger.addEventListener("click", () => {
        if (sidebar) {
            sidebar.classList.toggle("open");
        }
    });
}

if (viewAllFoods) {
    viewAllFoods.addEventListener("click", () => {
        selectView("food-summary");
    });
}

if (viewAllAlerts) {
    viewAllAlerts.addEventListener("click", (event) => {
        event.preventDefault();
        selectView("alerts");
    });
}

if (viewAlertHistory) {
    viewAlertHistory.addEventListener("click", () => {
        selectView("history");
    });
}

if (autoUpdate) {
    autoUpdate.addEventListener("change", (event) => {
        if (lastUpdated) {
            lastUpdated.textContent = event.target.checked ? "Auto update enabled" : "Auto update paused";
        }
    });
}

if (dateFilter) {
    dateFilter.addEventListener("change", (event) => {
        if (lastUpdated) {
            lastUpdated.textContent = `Range: ${event.target.value}`;
        }
    });
}

if (foodPhotoInput) {
    foodPhotoInput.addEventListener("change", handleFoodPhotoUpload);
}

updateClockAndDate();
updateUptime();
buildCharts();
setInterval(updateClockAndDate, 1000);
setInterval(updateUptime, 1000);
