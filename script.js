const menuItems = document.querySelectorAll(".menu-item");
const refreshButton = document.getElementById("refreshBtn");
const lastUpdated = document.getElementById("lastUpdated");
const clock = document.getElementById("clock");
const date = document.getElementById("date");
const uptime = document.getElementById("uptime");
const chartsSection = document.getElementById("chartsSection");
const foodPhotoInput = document.getElementById("foodPhoto");
const foodPhotoPreview = document.getElementById("foodPhotoPreview");
const foodPhotoMessage = document.getElementById("foodPhotoMessage");

function showCharts() {
    if (chartsSection) {
        chartsSection.classList.add("visible");
    }
}

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
    menuItems.forEach((item) => {
        item.addEventListener("click", () => {
            menuItems.forEach((menuItem) => menuItem.classList.remove("active"));
            item.classList.add("active");
        });
    });

    if (refreshButton && lastUpdated) {
        refreshButton.addEventListener("click", () => {
            const now = new Date();
            lastUpdated.textContent = now.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit"
            });
            updateClockAndDate();
            updateUptime();
        });
    }

    if (foodPhotoInput) {
        foodPhotoInput.addEventListener("change", handleFoodPhotoUpload);
        foodPhotoInput.onchange = handleFoodPhotoUpload;
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindDashboardInteractions);
} else {
    bindDashboardInteractions();
}

updateClockAndDate();
updateUptime();
setInterval(updateClockAndDate, 1000);
setInterval(updateUptime, 1000);

function initCharts() {
    const environmentCanvas = document.getElementById("environmentChart");
    const riskCanvas = document.getElementById("riskChart");

    if (environmentCanvas && window.Chart) {
        new Chart(environmentCanvas, {
            type: "line",
            data: {
                labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
                datasets: [
                    {
                        label: "Temperature (°C)",
                        data: [4.2, 4.8, 5.4, 5.0, 4.7, 4.9],
                        borderColor: "#176bd1",
                        backgroundColor: "rgba(23, 107, 209, 0.12)",
                        borderWidth: 2,
                        tension: 0.35,
                        fill: true
                    },
                    {
                        label: "Humidity (%)",
                        data: [62, 60, 68, 74, 71, 66],
                        borderColor: "#62a840",
                        backgroundColor: "rgba(98, 168, 64, 0.12)",
                        borderWidth: 2,
                        tension: 0.35,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    if (riskCanvas && window.Chart) {
        new Chart(riskCanvas, {
            type: "line",
            data: {
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                datasets: [
                    {
                        label: "Low Risk",
                        data: [12, 18, 28, 26, 18, 15],
                        borderColor: "#269c51",
                        backgroundColor: "rgba(38, 156, 81, 0.1)",
                        borderWidth: 2,
                        tension: 0.35,
                        fill: false
                    },
                    {
                        label: "Medium Risk",
                        data: [24, 34, 42, 48, 39, 31],
                        borderColor: "#ee9d19",
                        backgroundColor: "rgba(238, 157, 25, 0.1)",
                        borderWidth: 2,
                        tension: 0.35,
                        fill: false
                    },
                    {
                        label: "High Risk",
                        data: [8, 14, 20, 24, 16, 12],
                        borderColor: "#df3a3a",
                        backgroundColor: "rgba(223, 58, 58, 0.1)",
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
                    legend: {
                        display: false
                    }
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
}

initCharts();
showCharts();
