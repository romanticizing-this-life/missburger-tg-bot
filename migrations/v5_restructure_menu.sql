-- v5: Restructure departments
-- 1. Rename Камелот → Кухня
-- 2. Move Бургеры/КФС/Лаваш/Донар items into Фаст Фуд as sub-categories
-- 3. Delete now-empty departments
--
-- Run in Supabase SQL editor. Safe to run multiple times (idempotent checks included).

-- ─────────────────────────────────────────
-- 1. Rename Камелот → Кухня
-- ─────────────────────────────────────────
UPDATE departments
SET name = 'Кухня'
WHERE name = 'Камелот' OR slug = 'kamelot';

-- ─────────────────────────────────────────
-- 2. Ensure Фаст Фуд categories exist
--    (insert only if the category name doesn't already exist in that dept)
-- ─────────────────────────────────────────
DO $$
DECLARE
  fastfood_id INT;
  burger_dept_id INT;
  kfc_dept_id INT;
  lavash_dept_id INT;
  donar_dept_id INT;
  cat_burger_id INT;
  cat_kfc_id INT;
  cat_lavash_id INT;
  cat_donar_id INT;
BEGIN
  -- Get fastfood dept id
  SELECT id INTO fastfood_id FROM departments WHERE slug = 'fastfood' OR name ILIKE '%фаст фуд%' OR name ILIKE '%fastfood%' LIMIT 1;
  IF fastfood_id IS NULL THEN
    RAISE NOTICE 'Фаст Фуд department not found, skipping sub-category migration';
    RETURN;
  END IF;

  -- ── Бургеры ──
  SELECT id INTO burger_dept_id FROM departments WHERE slug = 'burger' OR name ILIKE '%бургер%' LIMIT 1;
  IF burger_dept_id IS NOT NULL AND burger_dept_id <> fastfood_id THEN
    -- Create category in fastfood if not exists
    SELECT id INTO cat_burger_id FROM categories WHERE department_id = fastfood_id AND name ILIKE '%бургер%' LIMIT 1;
    IF cat_burger_id IS NULL THEN
      INSERT INTO categories (department_id, name, sort_order, is_active)
      VALUES (fastfood_id, 'Бургеры', 10, true)
      RETURNING id INTO cat_burger_id;
    END IF;
    -- Move items from all categories of burger dept → cat_burger_id
    UPDATE menu_items SET category_id = cat_burger_id
    WHERE category_id IN (SELECT id FROM categories WHERE department_id = burger_dept_id);
    -- Delete burger dept categories then dept
    DELETE FROM categories WHERE department_id = burger_dept_id;
    DELETE FROM departments WHERE id = burger_dept_id;
    RAISE NOTICE 'Merged burger dept into Фаст Фуд → Бургеры';
  END IF;

  -- ── КФС ──
  SELECT id INTO kfc_dept_id FROM departments WHERE slug = 'kfc' OR name ILIKE 'кфс' OR name ILIKE 'KFC' LIMIT 1;
  IF kfc_dept_id IS NOT NULL AND kfc_dept_id <> fastfood_id THEN
    SELECT id INTO cat_kfc_id FROM categories WHERE department_id = fastfood_id AND name ILIKE 'кфс' LIMIT 1;
    IF cat_kfc_id IS NULL THEN
      INSERT INTO categories (department_id, name, sort_order, is_active)
      VALUES (fastfood_id, 'КФС', 20, true)
      RETURNING id INTO cat_kfc_id;
    END IF;
    UPDATE menu_items SET category_id = cat_kfc_id
    WHERE category_id IN (SELECT id FROM categories WHERE department_id = kfc_dept_id);
    DELETE FROM categories WHERE department_id = kfc_dept_id;
    DELETE FROM departments WHERE id = kfc_dept_id;
    RAISE NOTICE 'Merged KFC dept into Фаст Фуд → КФС';
  END IF;

  -- ── Лаваш ──
  SELECT id INTO lavash_dept_id FROM departments WHERE slug = 'lavash' OR name ILIKE '%лаваш%' LIMIT 1;
  IF lavash_dept_id IS NOT NULL AND lavash_dept_id <> fastfood_id THEN
    SELECT id INTO cat_lavash_id FROM categories WHERE department_id = fastfood_id AND name ILIKE '%лаваш%' LIMIT 1;
    IF cat_lavash_id IS NULL THEN
      INSERT INTO categories (department_id, name, sort_order, is_active)
      VALUES (fastfood_id, 'Лаваш', 30, true)
      RETURNING id INTO cat_lavash_id;
    END IF;
    UPDATE menu_items SET category_id = cat_lavash_id
    WHERE category_id IN (SELECT id FROM categories WHERE department_id = lavash_dept_id);
    DELETE FROM categories WHERE department_id = lavash_dept_id;
    DELETE FROM departments WHERE id = lavash_dept_id;
    RAISE NOTICE 'Merged Lavash dept into Фаст Фуд → Лаваш';
  END IF;

  -- ── Донар ──
  SELECT id INTO donar_dept_id FROM departments WHERE slug = 'donar' OR name ILIKE '%донар%' OR name ILIKE '%дон%р%' LIMIT 1;
  IF donar_dept_id IS NOT NULL AND donar_dept_id <> fastfood_id THEN
    SELECT id INTO cat_donar_id FROM categories WHERE department_id = fastfood_id AND name ILIKE '%донар%' LIMIT 1;
    IF cat_donar_id IS NULL THEN
      INSERT INTO categories (department_id, name, sort_order, is_active)
      VALUES (fastfood_id, 'Донар', 40, true)
      RETURNING id INTO cat_donar_id;
    END IF;
    UPDATE menu_items SET category_id = cat_donar_id
    WHERE category_id IN (SELECT id FROM categories WHERE department_id = donar_dept_id);
    DELETE FROM categories WHERE department_id = donar_dept_id;
    DELETE FROM departments WHERE id = donar_dept_id;
    RAISE NOTICE 'Merged Donar dept into Фаст Фуд → Донар';
  END IF;
END $$;

-- ─────────────────────────────────────────
-- 3. Verify result
-- ─────────────────────────────────────────
SELECT d.name AS department, c.name AS category, COUNT(m.id) AS item_count
FROM departments d
LEFT JOIN categories c ON c.department_id = d.id
LEFT JOIN menu_items m ON m.category_id = c.id
GROUP BY d.sort_order, d.name, c.sort_order, c.name
ORDER BY d.sort_order, c.sort_order;
