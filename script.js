const menuItems = document.querySelectorAll(".menu-item");
const refreshButton = document.getElementById("refreshBtn");
const lastUpdated = document.getElementById("lastUpdated");
const viewPanel = document.getElementById("viewPanel");
const dashboardSections = document.querySelectorAll(".main > .cards, .main > .charts, .main > .bottom-section");
const sidebar = document.querySelector(".sidebar");

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

menuItems.forEach((item) => {
    item.addEventListener("click", () => {
        menuItems.forEach((menuItem) => menuItem.classList.remove("active"));
        item.classList.add("active");

        const view = item.dataset.view;
        const viewDetails = views[view];
        const headerTitle = document.querySelector(".header h1");
        const headerDescription = document.querySelector(".header p");

        if (!viewDetails) {
            headerTitle.textContent = "Dashboard";
            headerDescription.textContent = "Real-time monitoring of food storage conditions and spoilage risk";
            viewPanel.hidden = true;
            dashboardSections.forEach((section) => section.hidden = false);
            return;
        }

        headerTitle.textContent = viewDetails[0];
        headerDescription.textContent = viewDetails[1];
        dashboardSections.forEach((section) => section.hidden = true);
        viewPanel.innerHTML = `<h2>${viewDetails[0]}</h2><p>${viewDetails[2]}</p>`;
        viewPanel.hidden = false;
    });
});

function updateUptime() {
    if (!uptime) {
        return;
    }

    const now = new Date();
    const elapsedMs = now.getTime() - performance.timeOrigin;
    const totalSeconds = Math.floor(elapsedMs / 1000);
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

function bindDashboardInteractions() {
    menuItems.forEach((item, index) => {
        item.addEventListener("click", () => {
            menuItems.forEach((menuItem) => menuItem.classList.remove("active"));
            item.classList.add("active");

            // Determine which view to show based on menu item
            if (index === 0) {
                switchView("dashboard");
            } else if (index === 1) {
                switchView("analytics");
            } else {
                switchView("dashboard");
            }
        });
    });
});

document.getElementById("hamburger").addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

document.getElementById("viewAllFoods").addEventListener("click", () => {
    selectView("food-summary");
});

document.getElementById("viewAllAlerts").addEventListener("click", (event) => {
    event.preventDefault();
    selectView("alerts");
});

document.getElementById("viewAlertHistory").addEventListener("click", () => {
    selectView("history");
});

document.getElementById("autoUpdate").addEventListener("change", (event) => {
    lastUpdated.textContent = event.target.checked ? "Auto update enabled" : "Auto update paused";
});

document.getElementById("dateFilter").addEventListener("change", (event) => {
    lastUpdated.textContent = `Range: ${event.target.value}`;
});
