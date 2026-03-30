import { initHeader } from "./header.js";
import { loadPartials } from "./partials.js";
import { initLoginModal } from "./login-modal.js";

document.addEventListener("DOMContentLoaded", async () => {
  const base = window.location.pathname.includes("KaBarangay-Web-Information-System")
    ? "/KaBarangay-Web-Information-System"
    : "";

  // Load partials first
  await loadPartials();

  // Then initialize header
  await initHeader();

  await initLoginModal();
  let officials = [];
  fetch("https://kabarangay-web-information-system-backend.onrender.com/api/officials?is_deleted=false")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch officials");
    }
    return response.json();
  })
  .then((data) => {
    officials = data;
    renderDirectory();
  })
  .catch((error) => {
    console.error("Error loading officials:", error);
  });


  function renderDirectory() {
    const tbody = document.querySelector(".directory-table tbody");
    tbody.innerHTML = "";  

    officials.forEach((official) => {
      const row = document.createElement("tr");


      // photo cell
      const photoCell = document.createElement("td");
      const img = document.createElement("img");
      img.src = official.image_url || "/assets/img/placeholder-avatar.png";
      img.alt = official.name + " photo";
      img.className = "directory-photo";
      photoCell.appendChild(img);
      

      // Create and append each cell
      const nameCell = document.createElement("td");
      nameCell.textContent = official.name;

      const positionCell = document.createElement("td");
      positionCell.textContent = official.position;

      const contactCell = document.createElement("td");
      contactCell.textContent = official.contact_number;

      const emailCell = document.createElement("td");
      emailCell.textContent = official.email;

      // Append cells to the row
      row.appendChild(photoCell);
      row.appendChild(nameCell);
      row.appendChild(positionCell);
      row.appendChild(contactCell);
      row.appendChild(emailCell);

      // Append the row to the table body
      tbody.appendChild(row);
    });
  }
});
