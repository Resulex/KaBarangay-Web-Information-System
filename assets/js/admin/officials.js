import { loadPartials } from "../partials.js";
import { protectPage, initLogout } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const base = window.location.pathname.includes("KaBarangay-Web-Information-System")
    ? "/KaBarangay-Web-Information-System"
    : "";

  if (!protectPage()) return;

  // 2. Load reusable UI parts
  await loadPartials();

  // 3. Initialize logout button
  await initLogout();
  let officialsData = []; // Store loaded data for reuse
  let editingIndex = null; // Track the index of the official being edited
  let currentEditingOfficial = null;
  const formTitle = document.querySelector(".form-container h3");
  const submitButton = document.querySelector(
    '#add-official-form button[type="submit"]'
  );

  const imageInput = document.getElementById("official_image");
  const imagePreview = document.getElementById("imagePreview");

  // Image preview handler
  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        imagePreview.src = event.target.result;
        imagePreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });



  renderOfficials();

  // Function to render all officials
  function renderOfficials() {
    console.log(officialsData);
    // await getOfficials();

    fetch(`http://localhost:3000/api/officials?is_deleted=false`,
      {cache: 'no-store'}
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched officials data:", data);
        officialsData = data;

        const container = document.getElementById("officials-container");
        container.innerHTML = ""; // Clear previous content

        officialsData.forEach((official, index) => {
        const card = document.createElement("div");
        card.className = "card mb-4";
        card.setAttribute("data-index", index);

        const cardBody = document.createElement("div");
        cardBody.className = "card-body";

        const row = document.createElement("div");
        row.className = "row";

        // Left Column
        const leftCol = document.createElement("div");
        leftCol.className = "col-md-4";
        leftCol.innerHTML = `
            <div style="width: 150px; height: 150px; margin: 0 auto 1rem auto; overflow: hidden; border-radius: 50%; border: 3px solid #f0f0f0;">
            ${official.image_url ? 
              `<img src="${official.image_url}" 
                    alt="${official.name}" 
                    style="width: 100%; height: 100%; object-fit: contain; background-color: #e0dfdfff;" />` : 
              `<div style="width:100%; height:100%; background:#f8f9fa; display:flex; align-items:center; justify-content:center;">
                <p class="text-muted" style="font-size: 0.8rem;">No Image</p>
              </div>`
            }
          </div>
          <h5 class="card-title font-weight-bold text-center">${official.name}</h5>
          <p class="card-text mb-1 text-center"><strong>${official.position}</strong></p>
          <p class="card-text mb-1 text-center"><i class="fas fa-phone"></i> ${official.contact_number}</p>
          <p class="card-text mb-1 text-center"><i class="fas fa-envelope"></i> ${official.email}</p>
          <p class="card-text text-center"><i class="fas fa-map-marker-alt"></i> ${official.location}</p>
        `;

        // Right Column
        const rightCol = document.createElement("div");
        rightCol.className =
          "col-md-8 d-flex flex-column justify-content-between";

        const responsibilities = document.createElement("div");
        responsibilities.innerHTML = `
        <h6 class="font-weight-bold">Key Responsibilities:</h6>
        <ul class="mb-3">
          ${official.key_responsibility.map((res) => `<li>${res}</li>`).join("")}
        </ul>
      `;

        const buttonGroup = document.createElement("div");
        buttonGroup.className = "text-right mt-auto";
        buttonGroup.innerHTML = `
        <button class="btn btn-sm btn-primary mr-2 edit-btn">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn">Delete</button>
      `;

        // Button event listeners
        buttonGroup.querySelector(".delete-btn").addEventListener("click", () => {
          if (confirm(`Delete ${official.name}?`)) {
            // Remove from API
            const token = sessionStorage.getItem("token");
            fetch(`http://localhost:3000/api/officials/${official._id}`, {
              method: "DELETE",
              headers: {
                "Authorization": `Bearer ${token}`
              }
            })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to delete official");
              }
              // Remove from local data
              officialsData.splice(index, 1);
              renderOfficials(); // Re-render
            }).catch((error) => {
              console.error("Error deleting official:", error);
              alert("Error deleting official. Please try again.");
            });
          }
        });

        buttonGroup.querySelector(".edit-btn").addEventListener("click", () => {
          editingIndex = index;
          currentEditingOfficial = official;
          fillFormWithOfficial(official);
        });

        rightCol.appendChild(responsibilities);
        rightCol.appendChild(buttonGroup);

        row.appendChild(leftCol);
        row.appendChild(rightCol);
        cardBody.appendChild(row);
        card.appendChild(cardBody);
        container.appendChild(card);
      });
        })
        .catch((error) => {
          console.error("Error loading officials from API:", error);
        });
  }

  // Function to fill form with existing official data
  function fillFormWithOfficial(official) {
    document.getElementById("full_name").value = official.name;
    document.getElementById("position").value = official.position;
    document.getElementById("contact_number").value = official.contact_number;
    document.getElementById("email").value = official.email;
    document.getElementById("office_address").value = official.location;
    document.getElementById("responsibilities").value =
      official.key_responsibility.join(", ");

      // Show current image preview
    if (official.image_url) {
      imagePreview.src = official.image_url;
      imagePreview.style.display = "block";
    }
    
    imageInput.value = ""; // Clear file input

    formTitle.textContent = "✏️ Edit Barangay Official";
    submitButton.textContent = "Update";
    document
      .getElementById("add-official-form")
      .scrollIntoView({ behavior: "smooth" });
  }

  // Handle form submission (update or add)
  document
    .getElementById("add-official-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData();
       // Use the keys the backend expects (name, position, etc.)
      formData.append("name", document.getElementById("full_name").value);
      formData.append("position", document.getElementById("position").value);
      formData.append("contact_number", document.getElementById("contact_number").value);
      formData.append("email", document.getElementById("email").value);
      formData.append("location", document.getElementById("office_address").value);
      formData.append("key_responsibility", JSON.stringify(
        document
          .getElementById("responsibilities")
          .value.split(",")
          .map((s) => s.trim())
      ));

      // Append image file if selected
      if (imageInput.files.length > 0) {
        formData.append("image", imageInput.files[0]);
      } else if (editingIndex !== null && currentEditingOfficial.image_url) {
        // Keep existing image URL if no new image selected
        formData.append("image_url", currentEditingOfficial.image_url);
      }

      const token = sessionStorage.getItem("token");

      if (editingIndex !== null) {
        // Update
        fetch(`http://localhost:3000/api/officials/${officialsData[editingIndex]._id}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData,
        })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to update official");
          }
          // Reset form
          alert("Barangay official updated successfully.");
          this.reset();
          imagePreview.style.display = "none";
          formTitle.textContent = "➕ Add New Barangay Official";
          submitButton.textContent = "Add";
          editingIndex = null;
          currentEditingOfficial = null;
          renderOfficials();
          return response.json();
        })
        .catch((error) => {
          console.error("Error updating official:", error);
          alert("Error updating official. Please try again.");
        });
      } else {
        // Add new
        fetch(`http://localhost:3000/api/officials`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData,
        })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to add official");
          }
          return response.json(); // This is the newOfficial object from crud.js
        })
        .then((newOfficial) => {
          // Update local data array so renderOfficials() sees the new data
          officialsData.push(newOfficial);


          // Reset the UI form
          alert("Barangay official added successfully.");
          // this.reset();
          // imagePreview.style.display = "none";
          // formTitle.textContent = "➕ Add New Barangay Official";
          // submitButton.textContent = "Add";
          document.getElementById("add-official-form").reset();
          imagePreview.style.display = "none";

          // Re-render the list includes the new official with their photo
          renderOfficials();
          // return response.json();
        })
        .catch((error) => {
          console.error("Error adding official:", error);
          alert("Error adding official. Please try again.");
        });
      }
    });
});
