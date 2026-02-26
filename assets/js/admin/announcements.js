/**
 * ==============================================================
 *  ADMIN ANNOUNCEMENTS DASHBOARD SCRIPT
 * ---------------------------------------------------------------
 *  Handles CRUD operations for announcements (Add, Edit, Delete, Hide)
 *  within the KaBarangay Admin Dashboard using direct API calls.
 *
 *  Features:
 *  - Dynamic rendering of announcements
 *  - API-based CRUD operations (localhost:3000/api/announcements)
 *  - Edit and delete capabilities
 *  - Hide/Unhide functionality
 *  - Real-time database persistence
 *  - Modular imports for authentication and reusable partials
 * ==============================================================
 */
import { loadPartials } from "../partials.js"; // Reusable UI components (header, footer, etc.)
import { protectPage, initLogout } from "./auth.js"; // Authentication and logout utilities

// Wait until all DOM elements are fully loaded before executing
document.addEventListener("DOMContentLoaded", async () => {
  // ==============================================================
  // API CONFIGURATION
  // ---------------------------------------------------------------
  const API_URL = "http://localhost:3000/api/announcements";
  // ---------------------------------------------------------------
  // Prevents unauthorized users from accessing this admin page.
  // If protectPage() returns false, stop further script execution.
  // ==============================================================
  if (!protectPage()) return;

  // ==============================================================
  // LOAD REUSABLE PARTIALS
  // ---------------------------------------------------------------
  // Loads the shared UI elements (like header, footer, modals, etc.)
  // from external HTML partials for code modularity.
  // ==============================================================
  await loadPartials();

  // ==============================================================
  // INITIALIZE LOGOUT FUNCTIONALITY
  // ---------------------------------------------------------------
  // Enables the logout button to clear session data and redirect user.
  // ==============================================================
  await initLogout();

  // ==============================================================
  // GLOBAL VARIABLES
  // ---------------------------------------------------------------
  // announcementsData: stores all announcements
  // isEditMode: indicates if form is currently editing an existing entry
  // currentEditId: holds MongoDB _id of the announcement being edited
  // priorityOrder: defines sorting order for high → low
  // ==============================================================
  let announcementsData = [];
  let isEditMode = false;
  let currentEditId = null;

  const priorityOrder = {
    high: 3,
    medium: 2,
    low: 1,
  };

  // ==============================================================
  // DOM ELEMENTS REFERENCES
  // ---------------------------------------------------------------
  // form: Add/Edit announcement form
  // formHeader: Heading text inside the form (changes between Add/Edit mode)
  // submitBtn: Button label that switches dynamically based on mode
  // ==============================================================
  const form = document.getElementById("add-announcement-form");
  const formHeader = document.querySelector(".form-container h3");
  const submitBtn = form.querySelector(".add-btn");

  // ==============================================================
  // FORM SUBMISSION HANDLER
  // ---------------------------------------------------------------
  // Handles both "Add" and "Edit" functionality via API.
  // Validates inputs, communicates with database, and re-renders.
  // ==============================================================
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Get input values
      const titleInput = form.querySelector("#title");
      const contentInput = form.querySelector("#content");
      const prioritySelect = form.querySelector("#priority");

      // Create announcement object
      const announcementData = {
        title: titleInput.value.trim(),
        description: contentInput.value.trim(),
        priority: prioritySelect.value.toLowerCase(),
        is_hidden: false,
      };

      // Validation: Ensure all required fields are filled
      if (!announcementData.title || !announcementData.description) {
        alert("Please fill in all required fields.");
        return;
      }

      try {
        const token = sessionStorage.getItem("token"); // Retrieve token from session storage

        // EDIT MODE: Update existing announcement via API
        if (isEditMode && currentEditId !== null) {
          const existing = announcementsData.find(
            (ann) => ann._id === currentEditId
          );
          announcementData.is_hidden = existing.is_hidden;

          const response = await fetch(`${API_URL}/${currentEditId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`, // Include token in headers
            },
            body: JSON.stringify(announcementData),
          });

          if (!response.ok) {
            alert("Failed to update announcement");
          } else {
            alert("Announcement updated successfully");
          }
        } else {
          // ADD MODE: Create new announcement via API
          const response = await fetch(API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`, // Include token in headers
            },
            body: JSON.stringify(announcementData),
          });

          if (!response.ok) {
            alert("Failed to create announcement");
          } else {
            alert("Announcement created successfully");
          }
        }

        titleInput.value = "";
        contentInput.value = "";
        prioritySelect.value = "medium";

        isEditMode = false;
        currentEditId = null;

        formHeader.textContent = "➕ Add New Announcement";
        submitBtn.textContent = "+ Add";

        await fetchAnnouncements();
      } catch (error) {
        console.error("Error submitting announcement:", error);
        alert("Failed to save announcement. Please try again.");
      }
    });
  }

  const container = document.getElementById("announcement-list");

  async function fetchAnnouncements() {
    try {
      const token = sessionStorage.getItem("token"); // Retrieve token from session storage
      const response = await fetch(API_URL, {
        headers: {
          "Authorization": `Bearer ${token}`, // Include token in headers
          "X-Admin": "true",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch announcements");
      announcementsData = await response.json();
      renderAnnouncements();
    } catch (error) {
      console.error("Error fetching announcements:", error);
      alert("Failed to load announcements. Please refresh the page.");
    }
  }

  function renderAnnouncements() {
    container.innerHTML = "";

    const announcements = announcementsData;
    const token = sessionStorage.getItem("token");

    const sortedAnnouncements = announcements.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      if (dateA > dateB) return -1;
      if (dateA < dateB) return 1;

      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    sortedAnnouncements.forEach((item) => {
      const card = document.createElement("div");
      card.className = "announcement-card";

      if (item.is_hidden) {
        card.classList.add("hidden");
      }

      card.innerHTML = `
        <h4>${item.title}</h4>
        <div class="meta">
          <span class="tag ${item.priority}">${item.priority}</span>
          <span class="date">📅 ${new Date(
            item.date
          ).toLocaleDateString()}</span>
        </div>
        <p>${item.description}</p>
        <div class="actions">
          <button class="btn view">👁 ${item.is_hidden ? "Unhide" : "Hide"}</button>
          <button class="btn edit">✏️ Edit</button>
          <button class="btn delete">🗑 Delete</button>
        </div>
      `;


      // Toggle hide
      card.querySelector(".btn.view").addEventListener("click", async () => {
        try {
          const updatedData = {
            is_hidden: !item.is_hidden,
          };
          const response = await fetch(`${API_URL}/${item._id}/toggle-hidden`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`, // Include token in headers

            },
            body: JSON.stringify(updatedData),
          });

          if (!response.ok) throw new Error("Failed to toggle announcement");

          await fetchAnnouncements();
        } catch (error) {
          console.error("Error toggling hide:", error);
          alert("Failed to update announcement. Please try again.");
        }
      });

      // Delete
      card.querySelector(".btn.delete").addEventListener("click", async () => {
        if (confirm(`Delete "${item.title}"?`)) {
          try {
            const response = await fetch(`${API_URL}/${item._id}`, {
              method: "DELETE",
              headers: {
                "Authorization": `Bearer ${token}`, // Include token in headers
            }
          });

            if (!response.ok) throw new Error("Failed to delete announcement");

            await fetchAnnouncements();
          } catch (error) {
            console.error("Error deleting announcement:", error);
            alert("Failed to delete announcement. Please try again.");
          }
        }
      });

      // Edit
      card.querySelector(".btn.edit").addEventListener("click", () => {
        isEditMode = true;
        currentEditId = item._id;

        // Populate form with existing data
        form.querySelector("#title").value = item.title;
        form.querySelector("#content").value = item.description;
        form.querySelector("#priority").value = item.priority;

        // Update UI
        formHeader.textContent = "✏️ Edit Announcement";
        submitBtn.textContent = "Update";

        // Smooth scroll to form
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      // Append card to container
      container.appendChild(card);
    });
  }

  // ==============================================================
  // INITIAL DATA LOAD
  // ---------------------------------------------------------------
  // Fetches all announcements from the database on page load
  // ==============================================================
  fetchAnnouncements();
});
