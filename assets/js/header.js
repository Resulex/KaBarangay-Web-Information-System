// =============================================================
// header.js
// -------------------------------------------------------------
// This module dynamically loads the header HTML into the page,
// highlights the active navigation link, and manages accessibility
// for mobile navigation and the staff login modal.
//
// Used across all public pages of the KaBarangay website.
// =============================================================
export const initHeader = async () => {
  const base = window.location.pathname.includes("KaBarangay-Web-Information-System")
    ? "/KaBarangay-Web-Information-System"
    : "";

  try {
    // =============================================================
    // Load the header partial (HTML fragment)
    // -------------------------------------------------------------
    // This fetches the shared header from /partials/layout/header.html
    // and injects it into the #header-container element.
    // =============================================================
    const res = await fetch(`${base}/partials/layout/header.html`);
    const data = await res.text();
    document.getElementById("header-container").innerHTML = data;

    // ===== Highlight Current Page =====
    const navLinks = document.querySelectorAll(".nav__link");
    let currentPage = window.location.pathname.split("/").pop().split(".")[0];

    // Handle homepage detection (e.g., index.html or #home)
    if (currentPage === "index") {
      currentPage = window.location.hash
        ? window.location.hash.substring(1)
        : "home";
    }

    // Loop through navigation links and apply active class
    navLinks.forEach((link) => {
      link.classList.toggle(
        "nav__link--active",
        link.dataset.page === currentPage
      );
      link.classList.toggle("active", link.dataset.page === currentPage);
    });

    // ===== Mobile Menu Toggle (ARIA) =====
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const navMenu = document.getElementById("navMenu");

    if (mobileMenuBtn && navMenu) {
      mobileMenuBtn.setAttribute("aria-expanded", "false");
      navMenu.setAttribute("aria-hidden", "true");

      mobileMenuBtn.addEventListener("click", () => {
        const expanded = mobileMenuBtn.getAttribute("aria-expanded") === "true";

        mobileMenuBtn.setAttribute("aria-expanded", String(!expanded));
        navMenu.setAttribute("aria-hidden", String(expanded));
        navMenu.classList.toggle("active");
      });

      // Optional: Allow closing with Escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && navMenu.classList.contains("active")) {
          navMenu.classList.remove("active");
          mobileMenuBtn.setAttribute("aria-expanded", "false");
          navMenu.setAttribute("aria-hidden", "true");
        }
      });
    }

    // ===== Staff Login Modal (ARIA) =====
    const staffLoginBtn = document.getElementById("staffLoginBtn");
    const loginModal = document.getElementById("loginModal");
    const closeModal = document.getElementById("closeModal");

    if (staffLoginBtn && loginModal && closeModal) {
      // Check if the current URL path starts with '/admin-login'
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/admin-login')) {
        staffLoginBtn.style.visibility = 'hidden'; // Hide the staff login button if not on admin login page
      }
      loginModal.setAttribute("aria-hidden", "true");

      staffLoginBtn.addEventListener("click", () => {
        loginModal.setAttribute("aria-hidden", "false");
        loginModal.focus();
      });

      closeModal.addEventListener("click", () => {
        loginModal.setAttribute("aria-hidden", "true");
        staffLoginBtn.focus();
      });

      // Close modal with Escape key
      document.addEventListener("keydown", (e) => {
        if (
          e.key === "Escape" &&
          loginModal.getAttribute("aria-hidden") === "false"
        ) {
          loginModal.setAttribute("aria-hidden", "true");
          staffLoginBtn.focus();
        }
      });
    }
  } catch (error) {
    // =============================================================
    // Error Handling
    // -------------------------------------------------------------
    // Displays an error message in the console if header loading fails.
    // =============================================================
    console.error("Error loading header:", error);
  }
};
