import { adminSupabase } from '@/lib/supabase/admin';
import OrdersClient, { type AdminRequest } from './OrdersClient';

export const revalidate = 0;

type EvaluationRow = {
  id: string;
  user_id: string;
  status: string;
  estimated_price: number;
  created_at: string;
  phone: string;
  address: string | null;
  products: { name: string; images: string[] | null; price: number } | null;
};

function isMissingTableError(message?: string | null, code?: string | null) {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    code === '42P01' ||
    (lower.includes('does not exist') && lower.includes('evaluation_requests'))
  );
}

async function fetchEvaluationRequests(): Promise<{
  rows: EvaluationRow[];
  profilesByUserId: Record<string, { full_name: string | null; phone: string | null }>;
  error: { message: string; code?: string } | null;
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = adminSupabase as any;

  // Try with embeds first (needs FK user_id -> profiles)
  const { data, error } = await sb
    .from('evaluation_requests')
    .select(`
      id,
      user_id,
      status,
      estimated_price,
      created_at,
      phone,
      address,
      products(name, images, price)
    `)
    .order('created_at', { ascending: false });

  if (!error && data) {
    const userIds = [...new Set((data as EvaluationRow[]).map((r) => r.user_id))];
    const profilesByUserId: Record<string, { full_name: string | null; phone: string | null }> = {};

    if (userIds.length > 0) {
      const { data: profiles } = await adminSupabase
        .from('profiles')
        .select('id, full_name, phone')
        .in('id', userIds);

      for (const p of profiles ?? []) {
        profilesByUserId[p.id] = { full_name: p.full_name, phone: p.phone };
      }
    }

    return { rows: data as EvaluationRow[], profilesByUserId, error: null };
  }

  // Fallback: flat select without joins (works even if FK/embed is broken)
  const { data: flat, error: flatError } = await sb
    .from('evaluation_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (flatError) {
    return {
      rows: [],
      profilesByUserId: {},
      error: { message: flatError.message, code: flatError.code },
    };
  }

  const rows = (flat ?? []) as EvaluationRow[];
  const productIds = [...new Set(rows.map((r) => (r as { product_id?: string }).product_id).filter(Boolean))] as string[];
  const userIds = [...new Set(rows.map((r) => r.user_id))];

  const profilesByUserId: Record<string, { full_name: string | null; phone: string | null }> = {};
  const productsById: Record<string, { name: string; images: string[] | null; price: number }> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('id, full_name, phone')
      .in('id', userIds);
    for (const p of profiles ?? []) {
      profilesByUserId[p.id] = { full_name: p.full_name, phone: p.phone };
    }
  }

  if (productIds.length > 0) {
    const { data: products } = await adminSupabase
      .from('products')
      .select('id, name, images, price')
      .in('id', productIds);
    for (const p of products ?? []) {
      productsById[p.id] = { name: p.name, images: p.images, price: p.price };
    }
  }

  const enriched = rows.map((r) => {
    const productId = (r as { product_id?: string }).product_id;
    return {
      ...r,
      products: productId ? productsById[productId] ?? null : null,
    };
  });

  return { rows: enriched, profilesByUserId, error: null };
}

export default async function AdminOrdersPage() {
  const { data: ordersData, error: ordersError } = await adminSupabase
    .from('orders')
    .select(`
      *,
      profiles(full_name, phone),
      order_items(*, products(name, images, price))
    `)
    .order('created_at', { ascending: false });

  const { rows: evaluationRows, profilesByUserId, error: evalError } =
    await fetchEvaluationRequests();

  const orders: AdminRequest[] = (ordersData ?? []).map((o) => ({
    id: o.id,
    kind: 'cart_order' as const,
    status: o.status,
    total_amount: o.total_amount,
    created_at: o.created_at,
    phone: o.phone,
    shipping_address: o.shipping_address,
    profiles: o.profiles,
    order_items: o.order_items ?? [],
  }));

  const evaluations: AdminRequest[] = evaluationRows.map((ev) => ({
    id: ev.id,
    kind: 'evaluation' as const,
    status: ev.status,
    total_amount: Number(ev.estimated_price),
    created_at: ev.created_at,
    phone: ev.phone,
    shipping_address: ev.address,
    profiles: profilesByUserId[ev.user_id] ?? null,
    order_items: [
      {
        id: ev.id,
        quantity: 1,
        price: Number(ev.estimated_price),
        products: ev.products,
      },
    ],
  }));

  const merged = [...orders, ...evaluations].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const tableMissing = isMissingTableError(evalError?.message, evalError?.code);
  const fetchFailed = !!evalError && !tableMissing;

  return (
    <div className="space-y-6">
      {ordersError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 text-sm">
          خطأ في جلب طلبات قائمة البيع: {ordersError.message}
        </div>
      )}

      {tableMissing && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm">
          جدول <code className="bg-white/80 px-1 rounded">evaluation_requests</code> غير موجود.
          نفّذ <code className="bg-white/80 px-1 rounded">supabase/evaluation_requests.sql</code> في Supabase.
        </div>
      )}

      {fetchFailed && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm">
          <p className="font-semibold mb-1">تعذّر جلب طلبات التقييم</p>
          <p className="text-xs opacity-90">{evalError?.message}</p>
          <p className="mt-2">
            إذا كان الجدول موجوداً، نفّذ{' '}
            <code className="bg-white/80 px-1 rounded">supabase/evaluation_requests_fix.sql</code>{' '}
            لإصلاح RLS وربط الجدول.
          </p>
        </div>
      )}

      <OrdersClient requests={merged} />
    </div>
  );
}
