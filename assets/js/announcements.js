import { initHeader } from "./header.js";
import { loadPartials } from "./partials.js";
import { initLoginModal } from "./login-modal.js";

// Run the script once the DOM is fully loaded
document.addEventListener("DOMContentLoaded", async () => {
  // 1️⃣ Load reusable page sections (partials) first to ensure consistent UI structure
  await loadPartials();

  // 2️⃣ Initialize the header AFTER partials are loaded
  await initHeader();

  // 3️⃣ Initialize the login modal AFTER header setup
  await initLoginModal();

  // ------------------------------------------------------------
  // 🔽 ANNOUNCEMENTS LOGIC STARTS HERE
  // ------------------------------------------------------------

  // Initialize announcement list
  let announcementList = [];

  /**
   * Function: Fetch Announcements from CRUD module
   * Retrieves all visible announcements from the database
   */
  async function fetchAnnouncements() {
    try {
      const response = await fetch('https://kabarangay-web-information-system-backend.onrender.com/api/announcements');
      announcementList = await response.json();
      renderAnnouncements();
    } catch (error) {
      console.error("Error fetching announcements:", error);
      announcementList = [];
      renderAnnouncements();
    }
  }

  /**
   * Function: Render Announcements
   * Loops through visible announcements and dynamically generates DOM elements
   */
  function renderAnnouncements() {
    // Find the container where announcements will appear
    const container = document.getElementById("announcement-list");
    container.innerHTML = "";
    announcementList
      .filter((announcement) => !announcement.is_hidden)
      .forEach((item) => {
        const div = document.createElement("div");
        div.classList.add("announcement-item");
        div.innerHTML = `
          <h3>${item.title}</h3>
          <span class="announcement-date">Date: ${item.date}</span>
          <p>${item.description}</p>
        `;
        // Append to main container
        container.appendChild(div);
      });
  }

  // Load announcements from CRUD module on page load
  await fetchAnnouncements();
});
