-- =====================================================
-- Modern Furniture E-commerce - Database Seed Script
-- Run this in Supabase SQL Editor
-- =====================================================

-- Clear existing data (optional, uncomment if needed)
-- DELETE FROM order_items;
-- DELETE FROM orders;
-- DELETE FROM products;
-- DELETE FROM categories;

-- =====================================================
-- 1. Insert Categories
-- =====================================================
INSERT INTO categories (id, name, slug) VALUES
  ('cat-living',   'غرفة المعيشة', 'living-room'),
  ('cat-bedroom',  'غرفة النوم',   'bedroom'),
  ('cat-office',   'المكتب',       'office')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. Insert Products (Living Room - 3 products)
-- =====================================================
INSERT INTO products (id, name, description, price, discount_price, category_id, images, stock, is_featured) VALUES
(
  'prod-sofa-1',
  'أريكة ثلاثية مخملية فاخرة',
  'أريكة ثلاثية بتصميم عصري أنيق مصنوعة من أجود أنواع المخمل الناعم. تتميز بإطار خشبي متين مع أرجل بلون ذهبي. المقاس: 220×85×90 سم. متوفرة بألوان: رمادي، أزرق داكن، وبيج. مثالية لغرف المعيشة الواسعة.',
  8500,
  7200,
  'cat-living',
  ARRAY[
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'
  ],
  15,
  true
),
(
  'prod-sofa-2',
  'أريكة L شكل مودرن',
  'أريكة زاوية بتصميم L عصري مناسبة للعائلات، مصنوعة من قماش كتاني عالي الجودة مقاوم للبقع. المقاس: 280×200×85 سم. الإطار من خشب البلوط المحلي والوسائد قابلة للإزالة والغسيل.',
  12000,
  NULL,
  'cat-living',
  ARRAY[
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'
  ],
  8,
  true
),
(
  'prod-table-1',
  'طاولة قهوة زجاجية مع قاعدة رخامية',
  'طاولة قهوة فاخرة بسطح زجاجي مقسى بسماكة 10 مم وقاعدة من الرخام الطبيعي الإيطالي. المقاس: 120×60×45 سم. تصميم هندسي أنيق يضيف لمسة فاخرة لأي غرفة معيشة.',
  3200,
  2800,
  'cat-living',
  ARRAY[
    'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80'
  ],
  20,
  false
),

-- =====================================================
-- Living Room TV Stand
-- =====================================================
(
  'prod-tv-1',
  'وحدة تلفزيون عائمة بأبواب خشبية',
  'وحدة تلفزيون بتصميم عائم بتركيب على الحائط من خشب البلوط الطبيعي. تتميز بـ 3 أبواب منزلقة وإضاءة LED مدمجة تحت الوحدة. المقاس: 180×40×50 سم. تتحمل شاشات حتى 75 بوصة.',
  4500,
  3900,
  'cat-living',
  ARRAY[
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=800&q=80'
  ],
  12,
  false
),

-- =====================================================
-- 3. Insert Products (Bedroom - 2 products)
-- =====================================================
(
  'prod-bed-1',
  'سرير منجد بلوح رأس مبطن بالمخمل',
  'سرير فاخر بلوح رأس مرتفع ومبطن بالمخمل الناعم مثبت بأزرار ذهبية. الهيكل من خشب الزان المتين مع قاعدة شرائحية لدعم المرتبة. متوفر بمقاسات: 160×200 أو 180×200 سم. يمنح غرفة نومك مظهراً فندقياً فاخراً.',
  9800,
  8500,
  'cat-bedroom',
  ARRAY[
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80'
  ],
  10,
  true
),
(
  'prod-dresser-1',
  'كومودينو وطاولة تزيين مودرن',
  'طقم كومودينو وطاولة تزيين بتصميم موحد من الخشب الأبيض مع تفاصيل ذهبية. الكومودينو: 55×45×60 سم به درجين. طاولة التزيين: 120×45×140 سم مع مرآة دائرية كبيرة وإضاءة LED. يمكن شراؤهم معاً أو بشكل منفصل.',
  5600,
  NULL,
  'cat-bedroom',
  ARRAY[
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
    'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80'
  ],
  18,
  false
),

-- =====================================================
-- 4. Insert Products (Office - 2 products)
-- =====================================================
(
  'prod-desk-1',
  'مكتب تنفيذي بسطح رخامي مع درج جانبي',
  'مكتب تنفيذي فخم بسطح رخامي أبيض وهيكل معدني أسود مطفي. المقاس: 160×80×75 سم. يحتوي على درج جانبي بثلاثة أدراج مع قفل مركزي. مناسب للمكاتب المنزلية والتجارية الراقية. يتحمل وزناً حتى 80 كجم.',
  6500,
  5800,
  'cat-office',
  ARRAY[
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
    'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80'
  ],
  7,
  true
),
(
  'prod-chair-1',
  'كرسي مكتب أرغونومي برو',
  'كرسي مكتب أرغونومي احترافي مصمم لدعم العمود الفقري خلال ساعات العمل الطويلة. مزود بمسند رأس قابل للضبط، ومسندي ذراع ثلاثي الأبعاد، وظهر شبكي قابل للإمالة. ارتفاع الجلوس: 42-52 سم. يتحمل وزناً حتى 120 كجم. ضمان 5 سنوات.',
  3800,
  3200,
  'cat-office',
  ARRAY[
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80',
    'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800&q=80'
  ],
  25,
  false
)
ON CONFLICT (id) DO NOTHING;
