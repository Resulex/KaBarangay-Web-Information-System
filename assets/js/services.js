// services.js
// ==========================================================
// Handles document request form submission logic
// - Loads partial HTML files (header, footer, etc.)
// - Initializes header navigation and login modal
// - Manages document request creation, ID generation, and
//   storage using sessionStorage
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

  // Determine base URL (adjusted for GitHub Pages or local file paths)
  const base = window.location.pathname.includes("KaBarangay-Web-Information-System")
    ? "/KaBarangay-Web-Information-System"
    : "";

  // Other scripts for services page
  const form = document.querySelector(".document-request__form");
  const requiredFields = form.querySelectorAll("[required]");
  const errorMsg = form.querySelectorAll(".error-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.forEach((msg) => msg.remove());

    let isValid = true;

    requiredFields.forEach((field) => {
      const fieldContainer =
        field.closest(".document-request__field") || field.parentElement;
      // Remove previous error styling

      field.classList.remove("input-error");
      // Remove any leftover error message (just in case)
      const oldError = fieldContainer.querySelector(".error-message");

      if (oldError) oldError.remove();
      if (!field.value.trim()) {
        field.classList.add("input-error");

        isValid = false;
        const errorMsg = document.createElement("small");
        errorMsg.className = "error-message text-danger";
        errorMsg.textContent = "This field is required";
        fieldContainer.appendChild(errorMsg);
      } else {
        field.classList.remove("input-error");
      }
    });

    if (!isValid) {
      alert("Please fill out all required fields before submitting.");
      const firstError = form.querySelector(".input-error");

      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      return;
    }

    // Load existing documents from sessionStorage or start with empty array
    let documents = [];

    const storedData = sessionStorage.getItem("documents");
    if (!storedData) {
      try {
        const response = await fetch(`${base}/data/document-request.json`);
        const data = await response.json();
        documents = data.documents;
      } catch (err) {
        console.error("Failed to load request.json:", err);
        cardContainer.innerHTML =
          "<p class='text-danger'>Error loading request data.</p>";
        return; // Stop execution if fetch failed
      }
    } else {
      documents = JSON.parse(storedData);
    }

    // Helper function to generate request ID like BL2025-001, BL2025-002...
    function generateRequestId(documentType) {
      const documentCode = // Get all first letters of each word in document type as capital
        documentType.split(" ").map(word => word.charAt(0).toUpperCase()).join("");
      // document type code + random 10 random alpha
      const prefix = documentCode + Math.random().toString(36).substring(2, 12); 
      // random 3 numeric value
      const randomNum = Math.floor(Math.random() * 900) + 100; // Generate a random 3-digit number (100-999)
      return prefix + "-" + randomNum;
    }

    // Collect form values
    const form = e.target;
    const applicantName = form.fullName.value.trim();
    const contact = form.contactNumber.value.trim();
    const email = form.email.value.trim();
    const documentType = form.documentType.value;
    const purpose = form.purpose.value;
    const today = new Date();

    // Format dates as YYYY-MM-DD (ISO-like)
    function formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    const dateRequested = formatDate(today);
    const expectedCompletion = formatDate(
      new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)
    ); // +5 days

    // Build timeline steps
    const timeline = [
      { step: "Request Submitted", date: dateRequested, status: "Completed" },
      
    ];

    // New request object
    const newRequest = {
      request_id: generateRequestId(documentType),
      status: "Pending",
      document: documentType,
      applicant: {
        name: applicantName,
        contact: contact,
        email: email,
      },
      purpose: purpose,
      date_requested: dateRequested,
      expected_completion: expectedCompletion,
      timeline: timeline || [],
    };

    fetch('http://localhost:3000/api/document-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newRequest)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to submit document request");
      }
      return response.json();
    })
    .then(data => {
      console.log("Document request submitted:", data);
      alert("Your document request has been submitted with request ID: " + newRequest.request_id);
      // Optionally reset the form
      form.reset();
    })
    .catch(error => {
      console.error("Error submitting document request:", error);
      alert("Error submitting document request. Please try again.");
    });
  });

  // remove red border on input once user types
  form.addEventListener("input", (e) => {
    const field = e.target;
    if (field.required && field.value.trim() !== "") {
      field.classList.remove("input-error");
      const msg = field
        .closest(".document-request__field")
        ?.querySelector(".error-message");
      if (msg) {
        msg.remove();
      }
    }
  });
});
