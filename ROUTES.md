# OncoSight — Complete Route Reference

> Use this document as a testing checklist for all frontend pages and backend API endpoints.
> Base URLs: **Frontend** `http://localhost:5173` | **Backend API** `http://localhost:5000`

---

## 1. Frontend Pages (React Router)

### Public (No Auth Required)

| Route | Component | Description |
|---|---|---|
| `/` | HomePage | Landing page with hero, features, stats |
| `/shared/:token` | SharedScan | Publicly shared scan report (via share link) |
| `/info/tumors` | TumorInfo | Bilingual tumor information page |
| `/info/faq` | FAQ | Accordion FAQ page |
| `/login` | Login | User login form |
| `/register` | PatientRegister | Patient registration form |
| `/register/doctor` | DoctorRegister | Doctor registration form |

---

### Patient Routes (Role: `patient` or `admin`)

| Route | Component | Description |
|---|---|---|
| `/patient/dashboard` | Dashboard | Main patient portal — scan history, consultations, health profile summary |
| `/patient/intake` | IntakeForm | 4-step clinical intake wizard (one-time setup, editable later) |
| `/patient/upload` | MriUpload | MRI scan upload page (requires completed profile) |
| `/patient/analysis/:scanId` | AnalysisLoader | AI pipeline progress animation + polling |
| `/patient/results/:scanId` | ScanResults | Full AI analysis report — classification, segmentation, triage, treatment |
| `/patient/history` | ScanHistory | List of all past scans |
| `/patient/doctors` | DoctorList | Browse verified doctors |
| `/patient/doctor/:id` | DoctorProfile | Individual doctor profile + reviews |
| `/patient/booking/:doctorId` | Booking | Book a consultation with a doctor |
| `/patient/consultations` | ComingSoon | Placeholder for dedicated consultations view |
| `/patient/profile` | Profile | Account settings (name, email, password) |

---

### Doctor Routes (Role: `doctor` or `admin`)

| Route | Component | Description |
|---|---|---|
| `/doctor/dashboard` | DoctorDashboard | Doctor portal — patient queue, metrics, chat |
| `/doctor/patient/:id` | PatientDetail | Clinical review page — MRI images, intake data, notes, chat |
| `/doctor/consultations` | DoctorConsultations | All doctor consultations with status management |
| `/doctor/patients` | ComingSoon | Placeholder for patient list view |
| `/doctor/profile` | Profile | Account settings |

---

### Admin Routes (Role: `admin`)

| Route | Component | Description |
|---|---|---|
| `/admin/dashboard` | AdminDashboard | Unified admin workspace (all tabs below) |
| `/admin/users` | AdminDashboard | User accounts management tab |
| `/admin/doctors/verify` | AdminDashboard | Doctor verification tab |
| `/admin/stats` | AdminDashboard | Platform statistics tab |

---

## 2. Backend API Endpoints

All endpoints use `http://localhost:5000` as base URL.
🔒 = Requires `Authorization: Bearer <token>` header.

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Register a new patient account |
| `POST` | `/api/auth/register/doctor` | — | Register a new doctor account |
| `POST` | `/api/auth/login` | — | Login and receive JWT + refresh token |
| `POST` | `/api/auth/refresh` | — | Refresh expired access token |
| `POST` | `/api/auth/logout` | — | Invalidate refresh token |
| `GET` | `/api/auth/me` | 🔒 | Get current user profile (includes patient/doctor profile data) |
| `PUT` | `/api/auth/profile/patient` | 🔒 | Update patient clinical profile (intake data) |
| `PUT` | `/api/auth/profile/doctor` | 🔒 | Update doctor profile (specialization, bio, etc.) |
| `PUT` | `/api/auth/reset-password` | 🔒 | Change password |
| `DELETE` | `/api/auth/deactivate` | 🔒 | Deactivate own account |

---

### Scans (`/api/scans`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/scans/upload` | 🔒 | Upload MRI scan + trigger AI pipeline |
| `GET` | `/api/scans/history/me` | 🔒 | Get all scans for the logged-in patient |
| `GET` | `/api/scans/:id` | 🔒 | Get single scan results by ID |
| `POST` | `/api/scans/:id/share` | 🔒 | Generate a public share link for a scan |
| `GET` | `/api/scans/shared/:token` | — | Access a shared scan via public token |
| `DELETE` | `/api/scans/:id` | 🔒 | Delete a scan + associated files (patient owner or admin) |

---

### Consultations (`/api/consultations`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/consultations` | 🔒 | Book a new consultation |
| `GET` | `/api/consultations/me` | 🔒 | Get all consultations for the logged-in user |
| `GET` | `/api/consultations/:id` | 🔒 | Get a specific consultation with full details |
| `PUT` | `/api/consultations/:id/notes` | 🔒 | Doctor: save clinical notes + mark completed |
| `PUT` | `/api/consultations/:id/status` | 🔒 | Doctor: accept/decline/update consultation status |
| `POST` | `/api/consultations/:id/rate` | 🔒 | Patient: rate a completed consultation |
| `POST` | `/api/consultations/:id/messages` | 🔒 | Send a chat message (authorized participants only) |
| `GET` | `/api/consultations/:id/messages` | 🔒 | Get chat messages (authorized participants only) |

---

### Doctors (`/api/doctors`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/doctors` | — | List all verified doctors (public) |
| `GET` | `/api/doctors/:id` | — | Get a single doctor profile (public) |

---

### Notifications (`/api/notifications`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | 🔒 | Get all notifications for the logged-in user |
| `GET` | `/api/notifications/unread-count` | 🔒 | Get count of unread notifications |
| `PUT` | `/api/notifications/read-all` | 🔒 | Mark all notifications as read |
| `PUT` | `/api/notifications/:id/read` | 🔒 | Mark a single notification as read |

---

### Admin (`/api/admin`)

> All admin endpoints require a valid admin JWT token.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/doctors/pending` | 🔒 | List doctors pending verification |
| `PUT` | `/api/admin/doctors/:id/verify` | 🔒 | Approve/reject a doctor |
| `GET` | `/api/admin/stats` | 🔒 | Platform-wide statistics |
| `GET` | `/api/admin/users` | 🔒 | List all user accounts |
| `PUT` | `/api/admin/users/:id` | 🔒 | Edit a user (name, email, role, active status) |
| `DELETE` | `/api/admin/users/:id` | 🔒 | Delete a user account (cascade) |
| `GET` | `/api/admin/scans` | 🔒 | List all scans on the platform |
| `PUT` | `/api/admin/scans/:id` | 🔒 | Edit scan diagnostic data |
| `DELETE` | `/api/admin/scans/:id` | 🔒 | Delete a scan + files |

---

## 3. Static / Misc

| URL | Description |
|---|---|
| `http://localhost:5000/` | API health check ("OncoSight MySQL API is running...") |
| `http://localhost:5000/uploads/*` | Static file serving for uploaded MRI images and masks |
| `http://localhost:8000/docs` | FastAPI (AI service) Swagger documentation |

---

## 4. Quick Testing Flow

### Patient Happy Path
1. `POST /api/auth/register` → Register
2. `POST /api/auth/login` → Login
3. Visit `/patient/intake` → Fill clinical profile
4. Visit `/patient/upload` → Upload MRI
5. Auto-redirect → `/patient/analysis/:scanId` → Wait for AI
6. Auto-redirect → `/patient/results/:scanId` → View report
7. Click "Reserve Consultation" → `/patient/doctors` → Select doctor
8. Visit `/patient/booking/:doctorId` → Book appointment
9. Visit `/patient/dashboard` → View scans, consultations, chat

### Doctor Happy Path
1. `POST /api/auth/register/doctor` → Register
2. Admin verifies via `/api/admin/doctors/:id/verify`
3. `POST /api/auth/login` → Login
4. Visit `/doctor/dashboard` → See patient queue
5. Click "View Clinical Profile" → `/doctor/patient/:id`
6. Review MRI, write notes, mark completed
7. Chat with patient via floating chat widget

### Admin Happy Path
1. `POST /api/auth/login` → Login as admin
2. Visit `/admin/dashboard` → Overview stats
3. Tab: Doctor Verification → Approve/reject doctors
4. Tab: User Accounts → Edit/delete users
5. Tab: Scan Database → View/edit/delete scans
