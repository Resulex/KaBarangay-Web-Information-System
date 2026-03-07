# Kabarangay Web Information System

The KaBarangay Web Information System is a full-stack platform designed to provide streamlined barangay-level services and community information. Residents can stay informed through real-time announcements, access a digital directory of local officials, and submit or track service requests through a secure, database-driven system.

## Features

- Dynamic News & Announcements: Real-time updates with priority levels and visibility controls.
- Barangay Officials Directory: A searchable database of local leaders and their key responsibilities.
- Service Request & Tracking: Residents can submit document requests online and monitor their status via a real-time progress timeline.
- Admin Dashboard: A secure management suite for administrators to handle records, announcements, and document approvals.
- Staff Authentication: Secure login for authorized personnel with role-based access control.

## Project Structure

- **Back-end and Database sections:**
- `api/`: Backend logic including Express routes and Mongoose CRUD operations.
  - `admins/, announcements/, document-request/, officials/`: Domain-specific API folders.
- `assets/`: 
  - `css/`: Modular stylesheets for individual components (e.g., admin-dashboard.css, timeline.css).
  - `js/`: Dynamic logic for frontend interactions, API fetching, and partials loading.
- `data/`: JSON templates used for initial database seeding (Announcements, Officials, Requests).
- `partials/`: Reusable HTML snippets for headers, footers, and common layout elements.
- `server.js`: Main entry point for the Node.js/Express backend.


## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5 (via CDN).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB Atlas (NoSQL).
- **Security:** Bcrypt (Password Hashing), JWT (Authentication), Helmet.js (HTTP Security).
- **Tools:** Postman (API Testing), AWS S3 (Future File Storage).


## API & Database Overview

The system transitions from static JSON to a MongoDB Atlas backend
- **Collections:** `announcements`, `officials`, `document-requests`, and `admins`.
- **CRUD Integration:** Admins can Create, Read, Update, and Delete records directly from the dashboard, while residents interact with public-facing Read and Create endpoints.
- **Tracking Logic:** The `document-requests` collection features a timeline array to store every step of the request's progress.


## Setup Instructions

1. **Clone the repository:**
`git clone https://github.com/AlexResu/KaBarangay-Web-Information-System.git`
2. **Install Dependencies:** `npm install`
3. **Configure Environment Variables::** Create a `.env` file and add your `MONGODB_URI` and `PORT`.
4. **Run the Server::** `node server.js` or `npm start`
5. **Access the App::** Open `http://localhost:3000` in your browser.



## Project Documentation

| Document Type | Link / Reference |
|------------|-------------|
| **Project Requirements Document** | https://drive.google.com/open?id=1PW6AWgvafYbLoe7B3cDd_KDrkKzLPtdMV_ukMP51NKw&usp=drive_copy |
| **Database Plan Worksheet** | https://docs.google.com/document/d/1LHA8q5p1KvyDC0z9EemwZoFmQQizEn9172CeQTCF6XE/edit?usp=sharing |
| **Unified API Integration Plan** | https://docs.google.com/spreadsheets/d/1R3_IBYNSae-m5iHVllGbr0AkPnT-CsUONAOk8iAsWls/edit?usp=sharing |
| **Project Roadmap/ Plan** | https://docs.google.com/spreadsheets/d/1SL-W0upeWfAPKhvz-eZLKp3KOaL1CJoQVWYsKM8hANg/edit?usp=sharing |
| **Postman Testing Results (Screenshots)** | https://drive.google.com/drive/folders/1i9zssVEqJaHgSgjV0-wz7NqIHUWQhm8y?usp=sharing |
| **Postman Testing Results (JSON file)** | https://drive.google.com/drive/folders/1Z2MDppmzb-as-inzalLGvIhsmVsMIRTW?usp=sharing |
| **MS2 Postman Testing Results (Screenshots)** | https://drive.google.com/drive/folders/1ho9YPDwToW6foG_rj-lLB7JsC_vrxaXu?usp=sharing |
| **MS2 Postman Testing Results (JSON file)** | https://drive.google.com/drive/folders/12M1MjlphN9YL9UzCKOe7fwsxgGb-KdX2?usp=sharing |
| **GitHub repository** | https://github.com/AlexResu/KaBarangay-Web-Information-System  |
| **GitHub pages** | https://alexresu.github.io/KaBarangay-Web-Information-System/ |



## API Integration Summary

- **Public Features:** Residents can use `GET /api/announcements` to see active news and `GET /api/document-requests/search` to track their specific request ID.
- **Admin Management:** Staff can use `POST /api/announcements` to create news and `PATCH /api/document-requests/:id/status` to trigger an automatic timeline update for residents.
- **Data Structure:** All data is persisted in **MongoDB Atlas**, with collections for `announcements`, `officials`, `document-requests`, and `admins`.


## API Integration Summary


- **Mongoose Models:** Backend routes utilize `findByIdAndUpdate()` and `deleteOne()` for data persistence.
- **Security:** Admin routes are protected via a `POST /api/admins` login flow that verifies credentials against stored password hashes.
- **Tracking System:** The Document Request System uses a `timeline` array to store progress steps such as "Submitted," "Processing," and "Ready for Pickup".




## Developer Documentation

- **Branching Strategy:** Use `feature/` for new tools and `bugfix/` for repairs.
- **Soft Deletion:** For officials, use is_deleted: true rather than a permanent delete to preserve historical records.
- **Validation:** Use server-side validation for all POST/PATCH requests to ensure data integrity.


## Developer

- Developer: Alex Resurreccion
- Institution: Mapúa Malayan Digital College (MMDC)
- Program: BS Information Technology Major in Software Development
  
---
