# Kabarangay Web Information System

The KaBarangay Web Information System is a full-stack platform designed to provide streamlined barangay-level services and community information. Residents can stay informed through real-time announcements, access a digital directory of local officials, and submit or track service requests through a secure, database-driven system.

## Features

- **Dynamic News & Announcements:** Real-time updates with priority levels and visibility controls.
- **Barangay Officials Directory:** A searchable database of local leaders and their key responsibilities, with secure profile image uploads to **AWS S3**.
- **Service Request & Tracking:** Residents can submit document requests online and monitor their status via a real-time progress timeline.
- **Admin Dashboard:** A secure management suite for administrators to handle records, announcements, and document approvals.
- **Staff Authentication:** Secure login for authorized personnel via **local credentials or Google OAuth**, with **role-based access control (RBAC)** implemented using **JSON Web Tokens (JWTs)**.

## Project Structure

- **Back-end and Database sections:**
  - `api/`: Backend logic including Express routes and Mongoose CRUD operations.
    - `admins/, announcements/, document-request/, officials/`: Domain-specific API folders.
    - `middleware/`: Custom middleware for authentication, authorization, error handling, and file uploads.
    - `validation/`: `express-validator` schemas for input validation.
- `assets/`: 
  - `css/`: Modular stylesheets for individual components (e.g., `admin-dashboard.css`, `timeline.css`).
  - `js/`: Dynamic logic for frontend interactions, API fetching, and partials loading. Includes client-side authentication handling.
- `data/`: JSON templates used for initial database seeding (Announcements, Officials, Requests).
- `partials/`: Reusable HTML snippets for headers, footers, and common layout elements.
- `server.js`: Main entry point for the Node.js/Express backend.

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5 (via CDN).
- **Backend:** Node.js, Express.js, **Passport.js (for Google OAuth)**.
- **Database:** MongoDB Atlas (NoSQL).
- **Security:** Bcrypt (Password Hashing), JWT (Authentication), Helmet.js (HTTP Security Headers), **`express-validator` (Input Validation)**.
- **Tools:** Postman (API Testing), **AWS S3 (Integrated File Storage)**, **Multer (File Upload Handling)**, Winston (Logging).

## API & Database Overview

The system leverages a robust **MongoDB Atlas** backend for all data persistence.
- **Collections:** `admins`, `announcements`, `officials`, and `document-requests`.
- **CRUD Integration:** Administrators have full Create, Read, Update, and Delete capabilities for all records via a secure dashboard. Residents can access public-facing read endpoints for information and submit new service requests.
- **Tracking Logic:** The `document-requests` collection includes a `timeline` array, which dynamically tracks each step of a request's progress (e.g., "Submitted," "Processing," "Ready for Pickup").

## API & Authentication Integration

- **Public Features:** Residents can use `GET /api/announcements` to view active news and `GET /api/document-requests/:search` to track their specific service request status.
- **Admin Management:** Staff can create, update, and delete records for announcements, officials, and document requests. Key admin actions include `POST /api/admin/announcements` to create news and `PATCH /api/admin/document-requests/:id/status` to trigger automatic timeline updates for residents.
- **Security & Authentication:**
    - Admin routes are protected via secure login flows.
    - **Local Admin Login:** `POST /api/auth/login` verifies credentials against `bcrypt` hashed passwords stored in the `admins` collection.
    - **Google OAuth Login:** Integrated via `GET /auth/google` for initiation and `GET /auth/callback` to handle the redirect and token issuance.
    - **JWT-Based Authorization:** All protected admin routes utilize `authenticateToken` middleware to validate JWTs and `authorizeAdmin` middleware to enforce `role: 'admin'` access.

---

## Setup and Running Instructions

Follow these steps to get the KaBarangay Web Information System running on your local machine:

### Prerequisites

*   **Node.js (LTS version recommended):** Download and install from [nodejs.org](https://nodejs.org/).
*   **npm (Node Package Manager):** Comes bundled with Node.js.
*   **MongoDB Atlas Account:** The application connects to a MongoDB Atlas cluster. Ensure network access is configured for your IP address in your Atlas project settings.
*   **AWS S3 Bucket:** The application uses an AWS S3 bucket for file storage. Ensure the provided `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in your `.env` have appropriate permissions (e.g., `s3:PutObject`, `s3:GetObject`) to the `AWS_S3_BUCKET_NAME`.
*   **VS Code (Recommended):** With the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension for easily hosting the frontend.

### Steps to Run

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/AlexResu/KaBarangay-Web-Information-System.git
    cd KaBarangay-Web-Information-System
    ```

2.  **Configure Environment Variables (`.env` file):**
    *   The application requires specific environment variables to handle Authentication, Database connections, and Cloud storage.
    *   Authorized Team Members: You can access the pre-configured `.env` values via this link https://docs.google.com/document/d/19aEv9xU2aGXeOQ63M6BtTs7tXQi2P2yRIpIaKFH1_jg/edit?usp=sharing. Note: You must be logged in with an authorized email to view this file.
    *   External Contributors: Create a file named `.env` in the root directory and populate it with your own credentials following this template:
        ```env
        # Google OAuth Configuration
        GOOGLE_CLIENT_ID=your_google_client_id_here
        GOOGLE_CLIENT_SECRET=your_google_client_secret_here
        GOOGLE_CALLBACK_URL=http://localhost:3000/auth/callback
        # Security Secrets
        SESSION_SECRET=your_random_session_secret
        JWT_SECRET=your_secure_jwt_secret
        # MongoDB Database Settings
        MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/dbname
        DB_NAME=Kabarangay-system-db
        USER_COLLECTION=admins
        ANNOUNCEMENT_COLLECTION=announcements
        DOCUMENT_REQUEST_COLLECTION=document_requests
        OFFICIALS_COLLECTION=officials
        # AWS S3 Storage Settings
        AWS_ACCESS_KEY_ID=your_aws_access_key
        AWS_SECRET_ACCESS_KEY=your_aws_secret_key
        AWS_S3_BUCKET_NAME=your_bucket_name
        AWS_S3_REGION=ap-southeast-1
        ```
    *   **Important:** Replace `your_session_secret_here_for_passportjs_internal_use` with a strong, random string.

3.  **Install Backend Dependencies:**
    *   Navigate into the `api` directory:
        ```bash
        cd api
        ```
    *   Install all required Node.js packages:
        ```bash
        npm install
        ```

4.  **Start the Backend Server:**
    *   From within the `api` directory, run the server:
        ```bash
        node server.js
        ```
    *   You should see messages in your terminal indicating the server is running, typically on `http://localhost:3000`.

5.  **Access the Frontend (CMS Admin Login Page):**
    *   Open the entire `KaBarangay-Web-Information-System` folder in **Visual Studio Code**.
    *   Locate the file `admin-login.html` in the root directory.
    *   **Right-click on `admin-login.html`** in the VS Code Explorer and select **"Open with Live Server"**.
    *   Your default browser should automatically open to a URL similar to: `http://127.0.0.1:5500/admin-login.html` (the exact port `5500` might vary depending on your Live Server configuration, but `127.0.0.1` or `localhost` will be consistent).
    *   **Alternative Method:** If your browser opens the default page: http://127.0.0.1:5500/index.html
    *   You can manually access the admin login page by editing the URL in the browser and replacing: index.html with admin-login.html
    *   Example: http://127.0.0.1:5500/admin-login.html 


---

## Administrator Login Credentials for CMS Access

Use these credentials to test the admin login functionality via local username/password or Google OAuth:

| Username        | Role             | Plain Password | Login through Google OAuth           |
| :-------------- | :--------------- | :------------- | :----------------------------------- |
| `adminUser1`    | Admin            | `Admin@5678`   | `lr.alresurreccion@mmdc.mcl.edu.ph` |
| `adminUser2`    | Admin            | `Admin@5678`   | `lr.alresurreccion@mmdc.mcl.edu.ph` |
| `adminUser3`    | Admin/Moderator | `Moderator@5678` | `mpisonjr@mmdc.mcl.edu.ph`         |
| `adminUser4`    | Content Admin    | `Content@5678` | `lr.alresurreccion@mmdc.mcl.edu.ph` |

---


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


---

## Developer Documentation

-   **Branching Strategy:** Use `feature/` for new tool integrations or functionalities and `bugfix/` for addressing identified issues or repairs.
-   **Soft Deletion:** For sensitive data like official records, a `is_deleted: true` flag is used instead of permanent deletion to preserve historical records and ensure data integrity.
-   **Validation:** Robust server-side validation using `express-validator` is applied to all `POST` and `PUT` requests to ensure data integrity and security.

---

## Developer

-   Developer: Alex Resurreccion
-   Institution: Mapúa Malayan Digital College (MMDC)
-   Program: BS Information Technology Major in Software Development
  
---


