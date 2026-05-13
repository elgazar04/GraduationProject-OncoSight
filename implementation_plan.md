# 🧠 Brain Tumor Detection System — Implementation Plan

> **Source:** All documentation from the `diagrams/` directory  
> **Excluded:** AI Models section (already implemented, will be connected later)  
> **Architecture:** 3-Tier — React SPA (Client) → Node.js/Express API Gateway → Data Persistence

---

## Project Overview

A full-stack web application for **Brain Tumor Detection** that enables:
- **Patients** to register, upload MRI scans, view AI analysis results, book consultations with doctors, and manage their medical history
- **Doctors** to view patient requests, review AI reports, add clinical notes, and manage consultations
- **Admins** to verify doctor credentials, manage users, and view system statistics

### Architecture (from diagrams)

```
┌─────────────────────────────────┐
│  Tier 1 — Client                │
│  React SPA (:3000)              │
│  Responsive UI, dark mode,      │
│  Arabic/English i18n            │
└───────────┬─────────────────────┘
            │ REST / HTTPS / JWT
            ▼
┌─────────────────────────────────┐
│  Tier 2 — API Gateway           │
│  Node.js + Express (:5000)      │
│  Auth, User Mgmt, Booking,      │
│  Admin, Messaging, Notifications│
│  Scan Orchestrator              │
│  ORM (Sequelize/Prisma/Mongoose)│
└───────────┬─────────────────────┘
            │ SQL / NoSQL queries
            ▼
┌─────────────────────────────────┐
│  Data Persistence               │
│  PostgreSQL / MongoDB           │
│  File Storage (MRI images)      │
└─────────────────────────────────┘
```

> [!NOTE]
> The **FastAPI AI service** (Tier 3, :8000) is already implemented and will be connected to the Scan Orchestrator later.

---

## Phase 1: Project Scaffolding & Design System

### 1.1 Initialize Project
- Create a **Vite + React** project
- Install core dependencies: `react-router-dom`, `react-i18next`, etc.
- Set up folder structure:
  ```
  src/
  ├── assets/          # Images, fonts, icons
  ├── components/      # Reusable UI components
  │   ├── common/      # Button, Input, Modal, Card, etc.
  │   ├── layout/      # Header, Footer, Sidebar, PageLayout
  │   └── shared/      # Shared feature components
  ├── contexts/        # React Context providers
  ├── hooks/           # Custom hooks
  ├── i18n/            # Localization files (en, ar)
  ├── pages/           # Page-level components
  │   ├── auth/        # Login, Register
  │   ├── patient/     # Intake, Upload, Results, History, Booking
  │   ├── doctor/      # Dashboard, Profile, Patients, Notes
  │   ├── admin/       # Dashboard, Users, Verification
  │   └── public/      # Home, About, FAQ, TumorInfo
  ├── services/        # API service layer
  ├── styles/          # Global CSS, design tokens
  ├── utils/           # Helper functions
  └── App.jsx          # Root component with routing
  ```

### 1.2 Design System (CSS Custom Properties)
- **Color palette:** Medical-themed with dark/light mode support
  - Primary: Deep teal/blue medical tones
  - Accent: Vibrant coral/orange for CTAs
  - Success/Warning/Danger states
  - Dark mode variants
- **Typography:** Google Font (Inter or similar)
- **Spacing scale:** 4px base unit
- **Border radius:** Consistent rounded corners
- **Shadows:** Layered depth system
- **Animations:** Micro-animations for hover, transitions, loading states
- **Components:** Glassmorphism cards, gradient backgrounds, animated elements

### 1.3 Routing Structure
```
/                           → Landing/Home page
/login                      → Login page
/register                   → Patient registration
/register/doctor            → Doctor registration

/patient/intake             → Medical history intake form
/patient/upload             → MRI upload page
/patient/results/:scanId    → AI results view (3-panel)
/patient/history            → Scan history timeline
/patient/doctors            → Browse doctors listing
/patient/doctor/:id         → Doctor profile page
/patient/booking/:doctorId  → Consultation booking
/patient/consultations      → Consultation history
/patient/messages           → Messaging
/patient/profile            → Profile management

/doctor/dashboard           → Doctor dashboard
/doctor/patients            → Patient list
/doctor/patient/:id         → Patient detail + AI reports
/doctor/consultations       → Consultation queue
/doctor/profile             → Doctor profile management

/admin/dashboard            → Admin dashboard
/admin/users                → User management
/admin/doctors/verify       → Doctor verification queue
/admin/stats                → System statistics

/info/tumors                → Tumor education pages
/info/faq                   → FAQ
```

### 1.4 i18n Setup
- Arabic/English support
- RTL layout support for Arabic

---

## Phase 2: Authentication & User Management

### 2.1 Pages to Build
| Page | Route | Features |
|------|-------|----------|
| **Login** | `/login` | Email/password, role selection, JWT token storage |
| **Patient Registration** | `/register` | Email, name, DOB, phone, password, basic profile |
| **Doctor Registration** | `/register/doctor` | License number, specialty, clinic info, availability, document upload |
| **Profile Management** | `/*/profile` | Edit profile, change password, avatar upload |

### 2.2 Auth Context
- `AuthContext` providing: `user`, `login()`, `logout()`, `register()`, `isAuthenticated`, `role`
- JWT token storage in localStorage/httpOnly cookies
- Automatic token refresh
- Route guards based on roles (Patient, Doctor, Admin)

### 2.3 Components
- `<LoginForm />` — Email/password with validation
- `<PatientRegisterForm />` — Multi-field registration
- `<DoctorRegisterForm />` — Extended registration with license verification
- `<ProtectedRoute />` — Role-based route guard HOC
- `<RoleSwitch />` — Conditional rendering by user role

### 2.4 API Endpoints (Frontend Service Layer)
```javascript
// services/authService.js
POST   /api/auth/register          // Patient registration
POST   /api/auth/register/doctor   // Doctor registration
POST   /api/auth/login             // Login (returns JWT)
POST   /api/auth/refresh           // Refresh token
GET    /api/auth/me                // Get current user
PUT    /api/auth/profile           // Update profile
POST   /api/auth/change-password   // Change password
```

---

## Phase 3: Patient Intake Flow

### 3.1 Pages to Build
| Page | Route | Features |
|------|-------|----------|
| **Intake Wizard** | `/patient/intake` | Multi-step medical history form |

### 3.2 Intake Form Steps (from documentation)
1. **Personal Info** — Age, gender, weight, height
2. **Medical History** — Prior diagnoses, family history
3. **Current Symptoms** — Headaches, seizures, vision changes, cognitive issues
4. **Symptom Details** — Duration, severity, frequency
5. **Lifestyle** — Smoking, alcohol, exercise
6. **Review & Submit** — Summary of all answers

### 3.3 Components
- `<IntakeWizard />` — Multi-step form container with progress indicator
- `<StepIndicator />` — Visual progress bar
- `<FormStep />` — Individual step wrapper
- `<SymptomChecklist />` — Checkbox group for symptoms
- `<SeveritySlider />` — Range input for severity

### 3.4 Data Model (14 patient features for treatment ML model)
```
age, gender, tumor_history_family, symptom_headache,
symptom_seizure, symptom_vision, symptom_cognitive,
symptom_duration_months, symptom_severity (1-10),
prior_surgery, prior_radiation, prior_chemo,
smoking_status, overall_health_score
```

---

## Phase 4: MRI Upload & AI Results

### 4.1 Pages to Build
| Page | Route | Features |
|------|-------|----------|
| **MRI Upload** | `/patient/upload` | Drag-drop file upload (JPG/PNG), image validation, preview |
| **Analysis Loading** | `/patient/analysis/:scanId` | Animated loading/processing state |
| **AI Results** | `/patient/results/:scanId` | 3-panel view, measurements, treatment explanation, PDF export |
| **Scan History** | `/patient/history` | Timeline of all scans with comparison |

### 4.2 Results Page — 3 Panel View (Core Feature)
```
┌─────────────────┬─────────────────┬─────────────────┐
│  Original MRI   │  Predicted Mask │  Contour Overlay │
│  (uploaded scan) │  (segmentation) │  (with measures)│
└─────────────────┴─────────────────┴─────────────────┘

┌─────────────────────────────────────────────────────┐
│  Classification: Glioma (87.3% confidence)          │
│  Location: Frontal lobe, Left hemisphere            │
│  Area: 1,240 mm² | Diameter: 39.7 mm               │
├─────────────────────────────────────────────────────┤
│  Treatment Suggestion: Surgery + Radiation           │
│  Urgency: Urgent                                     │
│  Triage Tier: Urgent (Tier 2)                       │
├─────────────────────────────────────────────────────┤
│  ⚠️ DISCLAIMER: This is not a diagnosis.            │
│  Consult a specialist for clinical decisions.        │
├─────────────────────────────────────────────────────┤
│  [📄 Download PDF Report] [📤 Share with Doctor]     │
│  [📞 Contact a Doctor]                              │
└─────────────────────────────────────────────────────┘
```

### 4.3 Components
- `<MRIUploader />` — Drag-and-drop with preview and validation
- `<AnalysisLoader />` — Animated brain scan processing visualization
- `<ThreePanelView />` — Side-by-side image comparison (original, mask, overlay)
- `<ClassificationCard />` — Tumor type with confidence bar
- `<LocationMap />` — Brain region visualization
- `<MeasurementsPanel />` — Area, diameter, contour stats
- `<TreatmentExplanation />` — Plain-English treatment explanation
- `<ConfidenceBar />` — Visual confidence indicator (low triggers "needs review")
- `<PDFExportButton />` — Generate downloadable report
- `<ShareButton />` — Share report with doctor
- `<DisclaimerBanner />` — Legal disclaimer (always visible)
- `<ScanTimeline />` — History timeline with comparison

### 4.4 API Endpoints
```javascript
POST   /api/scans/upload           // Upload MRI image
GET    /api/scans/:id              // Get scan details + results
GET    /api/scans/:id/report       // Download PDF report
GET    /api/scans/history          // Patient scan history
POST   /api/scans/:id/share       // Share with doctor
```

---

## Phase 5: Triage & Consultation Routing

### 5.1 Triage System (3-Tier — from evaluator feedback)
| Tier | Level | Behavior |
|------|-------|----------|
| **Tier 1** | 🔴 Emergency | "Go to ER" message, online booking DISABLED |
| **Tier 2** | 🟡 Urgent | Priority appointment slots offered |
| **Tier 3** | 🟢 Routine | Regular calendar booking |

### 5.2 Components
- `<TriageBadge />` — Color-coded tier indicator
- `<EmergencyRedirect />` — Full-screen warning for Tier 1 patients
- `<ContactDoctorCTA />` — Sticky button that adapts to triage tier
- `<ShareReportPrompt />` — "Would you like to send your AI report to the doctor?"

### 5.3 Logic
- Triage tier is determined by AI results (tumor type, size, urgency score)
- Emergency (Tier 1): Large tumor, high urgency, dangerous location
- Urgent (Tier 2): Medium severity, needs prompt attention
- Routine (Tier 3): Small/stable, follow-up recommended

---

## Phase 6: Doctor Platform

### 6.1 Pages to Build
| Page | Route | Features |
|------|-------|----------|
| **Doctor Listing** | `/patient/doctors` | Search/filter by specialty, rating, availability |
| **Doctor Profile** | `/patient/doctor/:id` | Public profile with credentials, rating, availability |
| **Booking** | `/patient/booking/:doctorId` | Calendar-based slot selection |
| **Doctor Dashboard** | `/doctor/dashboard` | Incoming requests, AI reports queue, stats |
| **Patient Detail** | `/doctor/patient/:id` | Full patient history + AI reports |
| **Doctor Notes** | `/doctor/patient/:id/notes` | Add clinical notes, confirm/override AI |
| **Consultation History** | `/*/consultations` | Past consultations for both roles |

### 6.2 Components
- `<DoctorCard />` — Compact doctor info card for listing
- `<DoctorProfile />` — Full profile with specialty, credentials, rating
- `<AvailabilityCalendar />` — Interactive booking calendar
- `<TimeSlotPicker />` — Available time slots
- `<BookingConfirmation />` — Booking summary and confirmation
- `<DoctorDashboard />` — Stats, queue, notifications
- `<PatientRequestCard />` — Incoming patient request in queue
- `<AIReportViewer />` — Doctor's view of AI analysis results
- `<ClinicalNotesEditor />` — Rich text editor for doctor notes
- `<AIOverridePanel />` — Confirm or override AI suggestion
- `<ConsultationCard />` — Consultation history entry
- `<RatingStars />` — Star rating component
- `<ReviewForm />` — Rate and review a doctor

### 6.3 API Endpoints
```javascript
GET    /api/doctors                 // List doctors (with filters)
GET    /api/doctors/:id            // Get doctor profile
GET    /api/doctors/:id/slots      // Get available time slots
POST   /api/bookings               // Create booking
GET    /api/bookings               // List bookings (patient or doctor)
PUT    /api/bookings/:id           // Update booking status
POST   /api/notes                  // Add clinical note
GET    /api/notes/patient/:id      // Get notes for patient
POST   /api/ratings                // Rate a doctor
GET    /api/doctors/:id/ratings    // Get doctor ratings
```

---

## Phase 7: Education & Safety

### 7.1 Pages to Build
| Page | Route | Features |
|------|-------|----------|
| **Tumor Info** | `/info/tumors` | Educational content per tumor type |
| **FAQ** | `/info/faq` | Accordion-style Q&A about AI, accuracy, etc. |

### 7.2 Tumor Types Content
- **Glioma** — Description, symptoms, treatment options, prognosis
- **Meningioma** — Description, symptoms, treatment options, prognosis
- **Pituitary** — Description, symptoms, treatment options, prognosis

### 7.3 Components
- `<TumorInfoCard />` — Educational card for each tumor type
- `<FAQAccordion />` — Expandable Q&A sections
- `<DisclaimerFooter />` — Persistent disclaimer across all pages

---

## Phase 8: Admin Dashboard

### 8.1 Pages to Build
| Page | Route | Features |
|------|-------|----------|
| **Admin Dashboard** | `/admin/dashboard` | System overview with key metrics |
| **User Management** | `/admin/users` | List, search, activate/deactivate users |
| **Doctor Verification** | `/admin/doctors/verify` | Review and approve doctor applications |
| **System Stats** | `/admin/stats` | Charts: scans/day, users/week, tumor distribution |

### 8.2 Components
- `<AdminStatsGrid />` — Key metrics cards (total users, scans, doctors)
- `<UserTable />` — Filterable/sortable user list
- `<VerificationQueue />` — Doctor applications pending review
- `<LicenseViewer />` — View uploaded doctor credentials
- `<ApproveRejectButtons />` — Approve/reject doctor applications
- `<StatsChart />` — Data visualization (bar, pie, line charts)

### 8.3 API Endpoints
```javascript
GET    /api/admin/users            // List all users
PUT    /api/admin/users/:id        // Update user status
GET    /api/admin/doctors/pending  // Pending doctor verifications
PUT    /api/admin/doctors/:id/verify  // Approve/reject doctor
GET    /api/admin/stats            // System statistics
```

---

## Implementation Order

> [!IMPORTANT]
> The recommended build order prioritizes **core graduation requirements** first, then additional features.

| Priority | Phase | Status | Description |
|----------|-------|--------|-------------|
| 1️⃣ | Phase 1 | ✅ | Project scaffolding, design system, routing |
| 2️⃣ | Phase 2 | ⬜ | Authentication & user management |
| 3️⃣ | Phase 3 | ⬜ | Patient intake form |
| 4️⃣ | Phase 4 | ⬜ | MRI upload & AI results display |
| 5️⃣ | Phase 5 | ⬜ | Triage system |
| 6️⃣ | Phase 6 | ⬜ | Doctor platform & booking |
| 7️⃣ | Phase 7 | ⬜ | Education & safety pages |
| 8️⃣ | Phase 8 | ⬜ | Admin dashboard |

---

## Key Design Principles

1. **Rich, Premium Aesthetics** — Dark mode, glassmorphism, gradients, micro-animations
2. **Responsive** — Mobile-first, works on all screen sizes
3. **Accessible** — ARIA labels, keyboard navigation, color contrast
4. **Bilingual** — Arabic/English with RTL support
5. **Medical-grade UX** — Clear disclaimers, confidence indicators, triage urgency visualization
6. **Mock Data Ready** — All features work with mock/simulated data until backend is connected

> [!TIP]
> Since the AI service is already built, all AI-related UI components will use **mock/simulated data** for now. The `Scan Orchestrator` in the Node.js API will later forward requests to the FastAPI AI service via `POST /predict`.
