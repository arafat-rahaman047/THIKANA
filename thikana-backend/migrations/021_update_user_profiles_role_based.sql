-- Migration: Add role-specific profile fields to user_profiles table
-- thikana-backend/migrations/021_update_user_profiles_role_based.sql

ALTER TABLE user_profiles 
  ADD COLUMN company_name VARCHAR(150) NULL,
  ADD COLUMN contact_person_name VARCHAR(100) NULL,
  ADD COLUMN date_of_birth DATE NULL,
  ADD COLUMN gender VARCHAR(30) NULL,
  ADD COLUMN occupation VARCHAR(100) NULL,
  ADD COLUMN institution_name VARCHAR(150) NULL,
  ADD COLUMN student_id_number VARCHAR(80) NULL,
  ADD COLUMN emergency_contact VARCHAR(30) NULL,
  ADD COLUMN city VARCHAR(100) NULL,
  ADD COLUMN area VARCHAR(100) NULL,
  ADD COLUMN profile_visibility ENUM('public','limited') DEFAULT 'public',
  ADD COLUMN website_url VARCHAR(255) NULL,
  ADD COLUMN facebook_url VARCHAR(255) NULL,
  ADD COLUMN office_address VARCHAR(255) NULL,
  ADD COLUMN business_registration_number VARCHAR(100) NULL,
  ADD COLUMN years_of_experience INT NULL;
