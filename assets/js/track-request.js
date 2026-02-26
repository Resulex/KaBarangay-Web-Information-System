// track-request.js
// ==========================================================
// Handles the "Track Request" page functionality for KaBarangay
// - Loads partial components (header, footer, modal)
// - Allows users to search document requests by ID, name, or email
// - Displays matched request details and timeline
// - Uses dynamic HTML rendering with clear status-based UI styling
// ==========================================================
import { initHeader } from "./header.js";
import { loadPartials } from "./partials.js";
import { initLoginModal } from "./login-modal.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Load partials first
  await loadPartials();

  // Then initialize header
  await initHeader();

  // Load login-modal
  await initLoginModal();

  // Other scripts for track request page
  const base = window.location.pathname.includes("KaBarangay-Web-Information-System")
    ? "/KaBarangay-Web-Information-System"
    : "";
  const form = document.getElementById("searchForm");
  const input = document.getElementById("trackSearch");
  const detailsSection = document.getElementById("detailsSection");

  // --- Add submit event for the tracking form ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = input.value.trim().toLowerCase();
    if (!query) return;

    try {
      // --- Fetch document requests data from API ---
      const response = await fetch(`http://localhost:3000/api/document-requests/${query}`);
      const data = await response.json();
      renderDetails(data);
      detailsSection.hidden = false;
    } catch (err) {
      console.error("Error loading data:", err);
      detailsSection.innerHTML = `<p>No results found for "${query}"</p>`;
      detailsSection.hidden = false;
    }
  });
});

/**
 * Render details and timeline for a matched request
 * @param {Object} doc - The document request object from JSON data
 */

function renderDetails(doc) {
  const timelineSteps = doc.timeline
    .map((step) => {
      const statusClass =
        {
          Completed: "timeline__item--completed",
          "In Progress": "timeline__item--current",
          Pending: "timeline__item--pending",
        }[step.status] || "";

      return `
        <li class="timeline__item ${statusClass}">
          <h3 class="timeline__step">${step.step}</h3>
          ${
            step.date
              ? `<time datetime="${step.date}">${formatDate(step.date)}</time>`
              : `<p>${step.status}</p>`
          }
        </li>
      `;
    })
    .join("");

  // --- Create detailed request info layout ---
  const detailsHTML = `
    <article class="details__card request">
      <header class="request__header">
        <div class="request__info">
          <h2 class="request__title">${doc.document}</h2>
          <p class="request__number">Request #${doc.request_id}</p>
        </div>
        <span class="request__status request__status--processing">${
          doc.status
        }</span>
      </header>

      <dl class="request__details-grid">
        <div class="request__detail">
          <dt class="request__label">Applicant</dt>
          <dd class="request__value">${doc.applicant.name}</dd>
        </div>
        <div class="request__detail">
          <dt class="request__label">Contact</dt>
          <dd class="request__value">${doc.applicant.contact}</dd>
        </div>
        <div class="request__detail">
          <dt class="request__label">Email</dt>
          <dd class="request__value">${doc.applicant.email}</dd>
        </div>
        <div class="request__detail">
          <dt class="request__label">Purpose</dt>
          <dd class="request__value">${doc.purpose}</dd>
        </div>
        <div class="request__detail">
          <dt class="request__label">Date Requested</dt>
          <dd class="request__value">${formatDate(doc.date_requested)}</dd>
        </div>
        <div class="request__detail">
          <dt class="request__label">Expected Completion</dt>
          <dd class="request__value">${formatDate(doc.expected_completion)}</dd>
        </div>
      </dl>

      <section class="request__update">
        <h3 class="request__update-title">Latest Update:</h3>
        <p class="request__update-text">
          ${
            doc.timeline.find((t) => t.status === "In Progress")?.step ||
            "Status details available in timeline below."
          }
        </p>
      </section>
    </article>

    <article class="details__card timeline">
      <h2 class="timeline__title">Processing Timeline</h2>
      <p class="timeline__subtitle">Track the progress of your document request</p>
      <ol class="timeline__list">${timelineSteps}</ol>
    </article>
  `;

  // --- Insert generated HTML into the details section ---
  document.getElementById("detailsSection").innerHTML = detailsHTML;
}

/**
 * Format a date string into readable format (e.g., "October 27, 2025")
 * @param {string} dateStr - The raw date string (YYYY-MM-DD)
 * @returns {string} - Formatted human-readable date
 */
function formatDate(dateStr) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateStr).toLocaleDateString(undefined, options);
}
