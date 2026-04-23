-- Run this in your Supabase SQL editor
-- Adds operating hours to departments table
-- open_time / close_time format: 'HH:MM' (24h), NULL = open 24/7
-- Times are evaluated in Uzbekistan Standard Time (UTC+5)

ALTER TABLE departments
  ADD COLUMN IF NOT EXISTS open_time  TEXT,
  ADD COLUMN IF NOT EXISTS close_time TEXT;

-- Set initial hours based on Miss Burger's schedule
UPDATE departments SET open_time = '11:00', close_time = '02:00' WHERE slug = 'sushi';
UPDATE departments SET open_time = '11:00', close_time = '02:00' WHERE slug = 'kamelot';
-- All others (burger, kfc, fastfood, pizza, etc.) remain NULL = 24/7
