-- Migration: Add password_reset purpose to otp_codes
-- Run this against your buslens2 database

ALTER TABLE otp_codes
  MODIFY COLUMN purpose ENUM('email_verify', 'password_reset') NOT NULL DEFAULT 'email_verify';
