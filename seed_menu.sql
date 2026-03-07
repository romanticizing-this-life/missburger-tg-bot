-- Miss Burger Menu Seed Data
-- Run AFTER schema.sql

-- Locations
INSERT INTO locations (name, address, is_active, sort_order) VALUES
  ('Galaba 24', 'Galaba ko''chasi 24, Namangan', true, 1),
  ('Навои 7/1', 'Navoiy ko''chasi 7/1, Namangan', true, 2)
ON CONFLICT DO NOTHING;

-- Departments
INSERT INTO departments (slug, name, icon, sort_order, is_active) VALUES
  ('burgers', 'Бургеры', '🍔', 1, true),
  ('snacks', 'Снэки', '🍟', 2, true),
  ('drinks', 'Напитки', '🥤', 3, true),
  ('sets', 'Комбо', '🎁', 4, true)
ON CONFLICT (slug) DO NOTHING;

-- Categories
INSERT INTO categories (department_id, name, sort_order, is_active)
SELECT d.id, 'Классические бургеры', 1, true FROM departments d WHERE d.slug = 'burgers'
ON CONFLICT DO NOTHING;

INSERT INTO categories (department_id, name, sort_order, is_active)
SELECT d.id, 'Двойные бургеры', 2, true FROM departments d WHERE d.slug = 'burgers'
ON CONFLICT DO NOTHING;

INSERT INTO categories (department_id, name, sort_order, is_active)
SELECT d.id, 'Куриные бургеры', 3, true FROM departments d WHERE d.slug = 'burgers'
ON CONFLICT DO NOTHING;

INSERT INTO categories (department_id, name, sort_order, is_active)
SELECT d.id, 'Картошка фри', 1, true FROM departments d WHERE d.slug = 'snacks'
ON CONFLICT DO NOTHING;

INSERT INTO categories (department_id, name, sort_order, is_active)
SELECT d.id, 'Соусы', 2, true FROM departments d WHERE d.slug = 'snacks'
ON CONFLICT DO NOTHING;

INSERT INTO categories (department_id, name, sort_order, is_active)
SELECT d.id, 'Холодные напитки', 1, true FROM departments d WHERE d.slug = 'drinks'
ON CONFLICT DO NOTHING;

INSERT INTO categories (department_id, name, sort_order, is_active)
SELECT d.id, 'Горячие напитки', 2, true FROM departments d WHERE d.slug = 'drinks'
ON CONFLICT DO NOTHING;

INSERT INTO categories (department_id, name, sort_order, is_active)
SELECT d.id, 'Комбо сеты', 1, true FROM departments d WHERE d.slug = 'sets'
ON CONFLICT DO NOTHING;

-- Menu items: Classic Burgers
INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Miss Burger Classic', 'Говяжья котлета, салат, помидор, лук, соус', 35000, true, 1
FROM categories c WHERE c.name = 'Классические бургеры';

INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Cheeseburger', 'Говяжья котлета, сыр чеддер, маринованный огурец, соус', 38000, true, 2
FROM categories c WHERE c.name = 'Классические бургеры';

INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'BBQ Burger', 'Говяжья котлета, соус BBQ, жареный лук, сыр, бекон', 45000, true, 3
FROM categories c WHERE c.name = 'Классические бургеры';

INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Mushroom Swiss', 'Говяжья котлета, грибы, сыр Swiss, майонез', 47000, true, 4
FROM categories c WHERE c.name = 'Классические бургеры';

-- Menu items: Double Burgers
INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Double Miss', 'Двойная говяжья котлета, двойной сыр, соус Miss', 65000, true, 1
FROM categories c WHERE c.name = 'Двойные бургеры';

INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Double BBQ Bacon', 'Двойная котлета, двойной бекон, BBQ соус, сыр', 72000, true, 2
FROM categories c WHERE c.name = 'Двойные бургеры';

-- Menu items: Chicken Burgers
INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Crispy Chicken', 'Хрустящая куриная котлета, капуста, соус', 35000, true, 1
FROM categories c WHERE c.name = 'Куриные бургеры';

INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Spicy Chicken', 'Острая куриная котлета, перец халапеньо, сыр', 38000, true, 2
FROM categories c WHERE c.name = 'Куриные бургеры';

INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Chicken Deluxe', 'Куриная котлета, авокадо, бекон, сыр, соус Deluxe', 48000, true, 3
FROM categories c WHERE c.name = 'Куриные бургеры';

-- Menu items: Fries
INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Картошка фри S', 'Хрустящий картофель, соль', 12000, true, 1
FROM categories c WHERE c.name = 'Картошка фри';

INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Картошка фри M', 'Хрустящий картофель, соль', 18000, true, 2
FROM categories c WHERE c.name = 'Картошка фри';

INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Картошка фри L', 'Хрустящий картофель, соль', 24000, true, 3
FROM categories c WHERE c.name = 'Картошка фри';

INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Картошка с сыром', 'Картошка фри с сырным соусом', 28000, true, 4
FROM categories c WHERE c.name = 'Картошка фри';

-- Menu items: Sauces
INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Соус BBQ', NULL, 3000, true, 1
FROM categories c WHERE c.name = 'Соусы';

INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Соус Чесночный', NULL, 3000, true, 2
FROM categories c WHERE c.name = 'Соусы';

INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Соус Острый', NULL, 3000, true, 3
FROM categories c WHERE c.name = 'Соусы';

-- Menu items: Cold Drinks
INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Coca-Cola 0.5л', NULL, 12000, true, 1
FROM categories c WHERE c.name = 'Холодные напитки';

INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Sprite 0.5л', NULL, 12000, true, 2
FROM categories c WHERE c.name = 'Холодные напитки';

INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Fanta 0.5л', NULL, 12000, true, 3
FROM categories c WHERE c.name = 'Холодные напитки';

INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Вода негаз. 0.5л', NULL, 7000, true, 4
FROM categories c WHERE c.name = 'Холодные напитки';

INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Молочный коктейль', 'Ваниль / Клубника / Шоколад', 22000, true, 5
FROM categories c WHERE c.name = 'Холодные напитки';

-- Menu items: Hot Drinks
INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Чай', NULL, 8000, true, 1
FROM categories c WHERE c.name = 'Горячие напитки';

INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Кофе американо', NULL, 15000, true, 2
FROM categories c WHERE c.name = 'Горячие напитки';

-- Menu items: Combo sets
INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Комбо Classic', 'Classic Burger + Картошка M + Напиток', 55000, true, 1
FROM categories c WHERE c.name = 'Комбо сеты';

INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Комбо Double', 'Double Miss + Картошка L + Напиток', 85000, true, 2
FROM categories c WHERE c.name = 'Комбо сеты';

INSERT INTO menu_items (category_id, name, description, price, is_available, sort_order)
SELECT c.id, 'Комбо Chicken', 'Crispy Chicken + Картошка M + Напиток', 55000, true, 3
FROM categories c WHERE c.name = 'Комбо сеты';

-- Admin user
INSERT INTO admins (telegram_id) VALUES (2118122588) ON CONFLICT DO NOTHING;
