-- Migration: Auth upgrade — email verification + Google OAuth
-- Run this against your buslens2 database

-- 1. Add new columns to users table
ALTER TABLE users
  ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT FALSE AFTER hashed_password,
  ADD COLUMN auth_provider ENUM('local','google') NOT NULL DEFAULT 'local' AFTER is_verified,
  ADD COLUMN google_id VARCHAR(255) NULL AFTER auth_provider;

-- Allow NULL password for Google-only users
ALTER TABLE users MODIFY COLUMN hashed_password VARCHAR(255) NULL;

-- Index for Google ID lookups
CREATE INDEX idx_users_google_id ON users(google_id);

-- 2. Create OTP codes table
CREATE TABLE otp_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  code VARCHAR(6) NOT NULL,
  purpose ENUM('email_verify') NOT NULL DEFAULT 'email_verify',
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_otp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_otp_user_purpose ON otp_codes(user_id, purpose, used);
