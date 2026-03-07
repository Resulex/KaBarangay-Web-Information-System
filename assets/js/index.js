// main.js
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

  // For index page other js scripts
});

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const email = urlParams.get('email');

    if (error === 'unauthorized_admin') {
        alert(`Google user ${email} is not an authorized admin.`);
        
        // Clean the URL by removing the error parameters
        // This prevents the alert from showing again if the user refreshes the page
        window.history.replaceState({}, document.title, window.location.pathname);
    }

});