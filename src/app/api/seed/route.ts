import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service-role client bypasses RLS — safe for server-only API routes
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Access at: GET /api/seed
// Remove or protect this route before going to production!

export async function GET() {
  try {
    // ─── 1. Upsert Categories (on slug) ─────────────────────────────────────
    const { data: cats, error: catError } = await adminClient
      .from('categories')
      .upsert(
        [
          { name: 'غرفة المعيشة', slug: 'living-room' },
          { name: 'غرفة النوم',   slug: 'bedroom'     },
          { name: 'المكتب',       slug: 'office'      },
        ],
        { onConflict: 'slug', ignoreDuplicates: false }
      )
      .select();

    if (catError) {
      return NextResponse.json(
        { success: false, step: 'categories', error: catError.message },
        { status: 500 }
      );
    }

    // Build a slug → id map
    const catMap: Record<string, string> = {};
    for (const c of cats ?? []) {
      catMap[c.slug] = c.id;
    }

    // ─── 2. Upsert Products (on name to avoid duplicates) ──────────────────
    const products = [
      // ── Living Room ──────────────────────────────────────────────────────
      {
        name: 'أريكة ثلاثية مخملية فاخرة',
        description:
          'أريكة ثلاثية بتصميم عصري أنيق مصنوعة من أجود أنواع المخمل الناعم. تتميز بإطار خشبي متين مع أرجل بلون ذهبي. المقاس: 220×85×90 سم. متوفرة بألوان: رمادي، أزرق داكن، وبيج. مثالية لغرف المعيشة الواسعة.',
        price: 8500,
        discount_price: 7200,
        category_id: catMap['living-room'],
        images: [
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
          'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
        ],
        stock: 15,
        is_featured: true,
      },
      {
        name: 'أريكة L شكل مودرن',
        description:
          'أريكة زاوية بتصميم L عصري مناسبة للعائلات، مصنوعة من قماش كتاني عالي الجودة مقاوم للبقع. المقاس: 280×200×85 سم. الإطار من خشب البلوط المحلي والوسائد قابلة للإزالة والغسيل.',
        price: 12000,
        discount_price: null,
        category_id: catMap['living-room'],
        images: [
          'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80',
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
        ],
        stock: 8,
        is_featured: true,
      },
      {
        name: 'طاولة قهوة زجاجية مع قاعدة رخامية',
        description:
          'طاولة قهوة فاخرة بسطح زجاجي مقسى بسماكة 10 مم وقاعدة من الرخام الطبيعي الإيطالي. المقاس: 120×60×45 سم. تصميم هندسي أنيق يضيف لمسة فاخرة لأي غرفة معيشة.',
        price: 3200,
        discount_price: 2800,
        category_id: catMap['living-room'],
        images: [
          'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80',
          'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
        ],
        stock: 20,
        is_featured: false,
      },
      {
        name: 'وحدة تلفزيون عائمة بأبواب خشبية',
        description:
          'وحدة تلفزيون بتصميم عائم بتركيب على الحائط من خشب البلوط الطبيعي. تتميز بـ 3 أبواب منزلقة وإضاءة LED مدمجة تحت الوحدة. المقاس: 180×40×50 سم. تتحمل شاشات حتى 75 بوصة.',
        price: 4500,
        discount_price: 3900,
        category_id: catMap['living-room'],
        images: [
          'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=800&q=80',
        ],
        stock: 12,
        is_featured: false,
      },

      // ── Bedroom ──────────────────────────────────────────────────────────
      {
        name: 'سرير منجد بلوح رأس مبطن بالمخمل',
        description:
          'سرير فاخر بلوح رأس مرتفع ومبطن بالمخمل الناعم مثبت بأزرار ذهبية. الهيكل من خشب الزان المتين مع قاعدة شرائحية. متوفر بمقاسات: 160×200 أو 180×200 سم. يمنح غرفة نومك مظهراً فندقياً فاخراً.',
        price: 9800,
        discount_price: 8500,
        category_id: catMap['bedroom'],
        images: [
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
          'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
          'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
        ],
        stock: 10,
        is_featured: true,
      },
      {
        name: 'كومودينو وطاولة تزيين مودرن',
        description:
          'طقم كومودينو وطاولة تزيين بتصميم موحد من الخشب الأبيض مع تفاصيل ذهبية. الكومودينو: 55×45×60 سم به درجين. طاولة التزيين: 120×45×140 سم مع مرآة دائرية كبيرة وإضاءة LED.',
        price: 5600,
        discount_price: null,
        category_id: catMap['bedroom'],
        images: [
          'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
          'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80',
        ],
        stock: 18,
        is_featured: false,
      },

      // ── Office ───────────────────────────────────────────────────────────
      {
        name: 'مكتب تنفيذي بسطح رخامي مع درج جانبي',
        description:
          'مكتب تنفيذي فخم بسطح رخامي أبيض وهيكل معدني أسود مطفي. المقاس: 160×80×75 سم. يحتوي على درج جانبي بثلاثة أدراج مع قفل مركزي. مناسب للمكاتب المنزلية والتجارية الراقية.',
        price: 6500,
        discount_price: 5800,
        category_id: catMap['office'],
        images: [
          'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
          'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80',
        ],
        stock: 7,
        is_featured: true,
      },
      {
        name: 'كرسي مكتب أرغونومي برو',
        description:
          'كرسي مكتب أرغونومي احترافي مصمم لدعم العمود الفقري خلال ساعات العمل الطويلة. مزود بمسند رأس قابل للضبط، ومسندي ذراع ثلاثي الأبعاد، وظهر شبكي قابل للإمالة. يتحمل وزناً حتى 120 كجم. ضمان 5 سنوات.',
        price: 3800,
        discount_price: 3200,
        category_id: catMap['office'],
        images: [
          'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80',
          'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800&q=80',
        ],
        stock: 25,
        is_featured: false,
      },
    ];

    // First clear existing seeded products to avoid duplicates on re-run
    await adminClient.from('products').delete().in(
      'category_id',
      (cats ?? []).map((c) => c.id)
    );

    const { error: prodError } = await adminClient
      .from('products')
      .insert(products);

    if (prodError) {
      return NextResponse.json(
        { success: false, step: 'products', error: prodError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `✅ تم زرع قاعدة البيانات بنجاح! تم إضافة ${cats?.length ?? 0} أقسام و ${products.length} منتجات.`,
      data: {
        categoriesSeeded: cats?.length ?? 0,
        productsSeeded: products.length,
        categories: cats,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
