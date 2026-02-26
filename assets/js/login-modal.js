// modal-login.js
// ===============================
// Initializes the Staff Login Modal logic
// Handles opening, closing, and login validation
// ===============================
export const initLoginModal = () => {
  console.log("Initializing login modal...");

  // --- Select modal-related elements from the DOM ---
  const loginModal = document.getElementById("loginModal");
  const openModalBtn = document.getElementById("staffLoginBtn");
  const closeModalBtn = document.getElementById("closeModal");
  const overlay = loginModal
    ? loginModal.querySelector(".modal__overlay")
    : null;
  const loginForm = document.getElementById("loginFormModal");
  const errorMsg = document.getElementById("loginError");

  // --- Safety check: Skip initialization if modal elements are missing ---
  if (!loginModal || !openModalBtn) {
    console.warn(
      "Login modal elements not found. Skipping modal initialization."
    );
    return;
  }

  // --- Open Modal ---
  openModalBtn.addEventListener("click", () => {
    console.log("Opening login modal...");
    loginModal.classList.add("show");
    document.body.style.overflow = "hidden";
  });

  // --- Close Modal ---
  const closeElements = [closeModalBtn, overlay].filter(Boolean);
  closeElements.forEach((el) => {
    el.addEventListener("click", () => {
      loginModal.classList.remove("show");
      document.body.style.overflow = "";
      if (errorMsg) errorMsg.style.display = "none";
    });
  });

  // --- Login Form Validation ---
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Get entered credentials
      const username = document.getElementById("modalUsername").value.trim();
      const password = document.getElementById("modalPassword").value.trim();

      // --- Authentication Logic through API ---
      // POST login API call
      fetch(`http://localhost:3000/api/admins/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);
          if (data.success) {
            // SUCCESS: Save token in session
            
            sessionStorage.setItem("token", data.token); // Store token in session storage
            window.location.href = "admin-dashboard.html"; // Redirect to dashboard
          } else {
            // FAILURE: Show alert and inline error message
            alert("Invalid username or password.");
            if (errorMsg) {
              errorMsg.textContent = "Invalid username or password.";
              errorMsg.style.display = "block";
            }
          }
        })
        .catch((error) => {
          console.error("Error during login fetch:", error);
          alert("An error occurred during login. Please try again later.");
        });
    });
  }

  console.log("Login modal initialized successfully.");
};