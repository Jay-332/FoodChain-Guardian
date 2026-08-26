const menuItems = document.querySelectorAll(".menu-item");
const refreshButton = document.getElementById("refreshBtn");
const lastUpdated = document.getElementById("lastUpdated");

menuItems.forEach((item) => {
    item.addEventListener("click", () => {
        menuItems.forEach((menuItem) => menuItem.classList.remove("active"));
        item.classList.add("active");
    });
});

refreshButton.addEventListener("click", () => {
    lastUpdated.textContent = new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });
});
