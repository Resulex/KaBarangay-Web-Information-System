export const protectPage = () => {
  // For google auth, check for token in URL first
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get('token');

  if (tokenFromUrl) {
    sessionStorage.setItem('token', tokenFromUrl);
    // Clean the URL to remove the token query parameter for security and aesthetics
    urlParams.delete('token');
    const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }
  // checkSessionTimeout();
  if (!sessionStorage.getItem("token")) {
    alert("Access denied! Please log in first.");
    window.location.href = "admin-login.html";
    return false; // Stop further execution
  }

  return true;
};

/**
 * Initializes logout functionality.
 * Can be safely called multiple times — it will rebind after partials are loaded.
 */
export const initLogout = () => {
  const attachLogout = () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("token");
        alert("You have been logged out.");
        window.location.href = "admin-login.html";
      });
    }
  };

  // Bind immediately (if button exists on static pages)
  attachLogout();

  // Re-bind when partials (like header) are loaded
  document.addEventListener("partialsLoaded", attachLogout);
};

// Auto-logout after 30 minutes
export const checkSessionTimeout = () => {
  const loginTime = sessionStorage.getItem("loginTime");
  if (!loginTime) {
    sessionStorage.removeItem("loginTime");
    sessionStorage.removeItem("isLoggedIn");
    alert("Invalid Session. Please log in again.");
    window.location.href = "index.html";
  } else {
    const now = Date.now();
    const elapsed = now - new Date(loginTime).getTime();
    const timeout = 30 * 60 * 1000; // 30 minutes
    // const timeout = 60 * 1000; // 60 sec for testing

    if (elapsed > timeout) {
      sessionStorage.removeItem("loginTime");
      sessionStorage.removeItem("isLoggedIn");
      alert("Session expired. Please log in again.");
      window.location.href = "index.html";
    }
  }
};
