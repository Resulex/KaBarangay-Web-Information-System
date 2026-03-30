import { loadPartials } from "../partials.js";
import { protectPage, initLogout } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const base = window.location.pathname.includes("KaBarangay-Web-Information-System")
    ? "/KaBarangay-Web-Information-System"
    : "";

  // Protect page: only allow access if user is authenticated
  if (!protectPage()) return;

  // 2. Load reusable UI parts
  await loadPartials();

  // 3. Initialize logout button
  await initLogout();

  // Select important DOM elements
  const searchInput = document.getElementById("searchInput");
  const cardContainer = document.getElementById("cardContainer");
  let requestData = null;

  // Fetch data from api
  fetch(`https://kabarangay-web-information-system-backend.onrender.com/api/document-requests`)
    .then((response) => response.json())
    .then((data) => {
      requestData = data;
      renderCards(requestData);
    })
    .catch((err) => {
      console.error("Failed to load document requests from API:", err);
      cardContainer.innerHTML =
        "<p class='text-danger'>Error loading request data.</p>";
    });

  /**
   * Helper function: Get progress bar details based on status
   * Returns an object containing percentage value, label, and Bootstrap color class
   */
  function getProgress(status) {
    switch (status) {
      case "Pending":
        return { value: 25, label: "Pending", class: "bg-secondary" };
      case "Processing":
        return { value: 50, label: "Processing", class: "bg-info" };
      case "Ready for Pickup":
        return { value: 75, label: "Ready for Pickup", class: "bg-info" };
      case "Picked-up":
        return { value: 100, label: "Picked-up", class: "bg-success" };
      default:
        return { value: 0, label: "Unknown", class: "bg-dark" };
    }
  }

  /**
   * Helper function: Update timeline array based on current document status
   * Each document has a timeline (array of steps with status and date)
   */
  function updateTimeline(status, timeline) {
    const today = new Date().toISOString().split("T")[0];

    const newTimeline = [...timeline, { step: status, date: new Date(), status: "Completed" }];
    return newTimeline;
  }

  /**
   * Main function: Render all request cards dynamically
   * Each card shows applicant info, request details, and progress bar
   */
  function renderCards(documents) {
    cardContainer.innerHTML = ""; // Clear previous cards
    sessionStorage.setItem("documents", JSON.stringify(documents)); // Save data in sessionStorage

    documents.forEach((doc, index) => {
      const progress = getProgress(doc.status);

      // Create card container using Bootstrap's card layout
      const cardDiv = document.createElement("div");
      cardDiv.className = "card mb-3";

      // Use template literals for dynamic HTML content
      cardDiv.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center">
          <span><strong>Request ID:</strong> ${doc.request_id}</span>
          <div>
            <label for="statusSelect-${index}" class="mr-2 mb-0"><strong>Status:</strong></label>
            <select class="custom-select" ${doc.status === "Picked-up" ? "disabled" : ""} id="statusSelect-${index}" style="width: auto; display: inline-block;">
              <option ${
                doc.status === "Pending" ? "selected" : ""
              }>Pending</option>
              <option ${
                doc.status === "Processing" ? "selected" : ""
              }>Processing</option>
              <option ${
                doc.status === "Ready for Pickup" ? "selected" : ""
              }>Ready for Pickup</option>
              <option ${
                doc.status === "Picked-up" ? "selected" : ""
              }>Picked-up</option>
            </select>
          </div>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>Applicant:</strong> ${doc.applicant.name}</p>
              <p><strong>Contact:</strong> ${doc.applicant.contact}</p>
              <p><strong>Email:</strong> ${doc.applicant.email}</p>
              <p><strong>Purpose:</strong> ${doc.purpose}</p>
            </div>
            <div class="col-md-6">
              <p><strong>Document:</strong> ${doc.document}</p>
              <p><strong>Date Requested:</strong> ${doc.date_requested}</p>
              <p><strong>Expected Completion:</strong> ${
                doc.expected_completion
              }</p>
            </div>
          </div>
          <div class="mt-3">
            <label><strong>Progress:</strong></label>
            <div class="progress">
              <div class="progress-bar ${
                progress.class
              }" id="progressBar-${index}" role="progressbar"
                style="width: ${progress.value}%;" 
                aria-valuenow="${
                  progress.value
                }" aria-valuemin="0" aria-valuemax="100">
                ${progress.label}
              </div>
            </div>
          </div>
        </div>
      `;

      cardContainer.appendChild(cardDiv);

      // Attach change listener to dropdown
      const statusSelect = document.getElementById(`statusSelect-${index}`);
      const progressBar = document.getElementById(`progressBar-${index}`);

      statusSelect.addEventListener("change", (e) => {
        const newStatus = e.target.value;
        doc.status = newStatus;

        if (newStatus === "Picked-up") {
          statusSelect.disabled = true;
        }

        // Update timeline
        doc.timeline = updateTimeline(newStatus, doc.timeline);

        // Update progress bar
        const progress = getProgress(newStatus);
        progressBar.style.width = `${progress.value}%`;
        progressBar.className = `progress-bar ${progress.class}`;
        progressBar.textContent = progress.label;

        // Log changes (in real app, would send update to backend)
        fetch(`https://kabarangay-web-information-system-backend.onrender.com/api/document-requests/${doc._id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: doc.status
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error("Failed to update document request");
          }
          return response.json();
        })
        .then(data => {
          console.log("Document request updated:", data);
        })
        .catch(error => {
          console.error("Error updating document request:", error);
        });

        console.log(`Status for ${doc.request_id} changed to:`, newStatus);
        console.log("Updated timeline:", doc.timeline);
      });
    });
  }

  // Search functionality
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();

    if (!requestData) return;

    const filteredDocs = requestData.filter((doc) => {
      return (
        doc.request_id.toLowerCase().includes(query) ||
        doc.applicant.name.toLowerCase().includes(query) ||
        doc.document.toLowerCase().includes(query)
      );
    });

    // Re-render filtered results
    if (filteredDocs.length > 0) {
      renderCards(filteredDocs);
    } else {
      cardContainer.innerHTML = "<p>No matching results.</p>";
    }
  });
});
