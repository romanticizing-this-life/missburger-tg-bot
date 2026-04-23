-- Run this in your Supabase SQL editor
-- Adds phone_number to users table

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone_number TEXT;
