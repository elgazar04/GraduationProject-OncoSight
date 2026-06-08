-- MySQL Schema for Brain Tumor Detection System

-- 4.1 Users
CREATE TABLE Users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('patient', 'doctor', 'admin') NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4.2 PatientProfiles
CREATE TABLE PatientProfiles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL UNIQUE,
    age INT CHECK (age >= 0 AND age <= 120),
    gender ENUM('male', 'female'),
    family_cancer_history BOOLEAN,
    previous_treatment BOOLEAN,
    comorbidities VARCHAR(500),
    headache_severity INT CHECK (headache_severity >= 0 AND headache_severity <= 10),
    seizure_history BOOLEAN,
    vision_problems BOOLEAN,
    cognitive_changes BOOLEAN,
    nausea_vomiting BOOLEAN,
    functional_status ENUM('independent', 'needs_some_help', 'needs_significant_help', 'fully_dependent'),
    neurological_symptoms ENUM('none', 'mild', 'moderate', 'severe'),
    immunosuppressed BOOLEAN,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 4.3 DoctorProfiles
CREATE TABLE DoctorProfiles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL UNIQUE,
    specialization VARCHAR(100) NOT NULL,
    years_experience INT CHECK (years_experience >= 0 AND years_experience <= 60),
    license_file_path VARCHAR(500) NOT NULL,
    verification_status ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
    verified_at TIMESTAMP NULL,
    average_rating DECIMAL(3,2),
    bio TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 4.4 Scans
CREATE TABLE Scans (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    patient_id CHAR(36) NOT NULL,
    mri_file_path VARCHAR(500) NOT NULL,
    status ENUM('created', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'created',
    tumor_type VARCHAR(50),
    tumor_location VARCHAR(100),
    tumor_size_mm2 DECIMAL(10,2),
    hemisphere ENUM('left', 'right'),
    classification_confidence DECIMAL(4,3),
    treatment_plan VARCHAR(255),
    urgency_level VARCHAR(50),
    triage_tier ENUM('emergency', 'urgent', 'routine'),
    segmentation_mask_path VARCHAR(500),
    share_token VARCHAR(64) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES PatientProfiles(id) ON DELETE CASCADE
);

-- 4.5 Consultations
CREATE TABLE Consultations (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    scan_id CHAR(36) NOT NULL,
    patient_id CHAR(36) NOT NULL,
    doctor_id CHAR(36) NOT NULL,
    meeting_time DATETIME NOT NULL,
    status ENUM('pending', 'accepted', 'declined', 'in_progress', 'completed') NOT NULL DEFAULT 'pending',
    ai_agreement ENUM('agree', 'partially_agree', 'disagree'),
    clinical_notes TEXT,
    alternative_recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (scan_id) REFERENCES Scans(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES PatientProfiles(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES DoctorProfiles(id) ON DELETE CASCADE
);

-- 4.6 Messages
CREATE TABLE Messages (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    consultation_id CHAR(36) NOT NULL,
    sender_id CHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consultation_id) REFERENCES Consultations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 4.7 Notifications
CREATE TABLE Notifications (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    type ENUM('scan_completed', 'consultation_requested', 'consultation_accepted', 'consultation_declined', 'notes_available', 'new_message', 'doctor_verified') NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    reference_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 4.8 DoctorRatings
CREATE TABLE DoctorRatings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    consultation_id CHAR(36) NOT NULL UNIQUE,
    patient_id CHAR(36) NOT NULL,
    doctor_id CHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consultation_id) REFERENCES Consultations(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES PatientProfiles(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES DoctorProfiles(id) ON DELETE CASCADE
);

-- 6. Database Indexes (for query performance)
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_patientprofiles_user_id ON PatientProfiles(user_id);
CREATE INDEX idx_doctorprofiles_user_id ON DoctorProfiles(user_id);
CREATE INDEX idx_doctorprofiles_status ON DoctorProfiles(verification_status);
CREATE INDEX idx_scans_patient_id ON Scans(patient_id);
CREATE UNIQUE INDEX idx_scans_share_token ON Scans(share_token);
CREATE INDEX idx_consultations_patient_id ON Consultations(patient_id);
CREATE INDEX idx_consultations_doctor_id ON Consultations(doctor_id);
CREATE INDEX idx_consultations_status ON Consultations(status);
CREATE INDEX idx_messages_consultation_time ON Messages(consultation_id, created_at);
CREATE INDEX idx_notifications_user_unread ON Notifications(user_id, is_read);
