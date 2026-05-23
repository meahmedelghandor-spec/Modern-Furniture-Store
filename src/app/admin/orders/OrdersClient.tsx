'use client';

import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Package, Eye, Search, Clock, Truck, CheckCircle2, XCircle, Phone, MapPin, Tag } from 'lucide-react';

export type AdminRequest = {
  id: string;
  kind: 'cart_order' | 'evaluation';
  status: string;
  total_amount: number;
  created_at: string;
  phone: string | null;
  shipping_address: string | null;
  profiles: { full_name: string | null; phone: string | null } | null;
  order_items: Array<{
    id: string;
    quantity: number;
    price: number;
    products: { name: string; images: string[] | null; price: number } | null;
  }>;
};

const statusConfig = {
  pending: { label: 'قيد المراجعة', icon: Clock, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  shipped: { label: 'جاري المتابعة', icon: Truck, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  delivered: { label: 'مكتمل', icon: CheckCircle2, color: 'bg-green-100 text-green-700 border-green-200' },
  cancelled: { label: 'ملغي', icon: XCircle, color: 'bg-red-100 text-red-700 border-red-200' },
};

const kindConfig = {
  cart_order: { label: 'قائمة بيع', className: 'bg-violet-100 text-violet-800 border-violet-200' },
  evaluation: { label: 'تقييم مجاني', className: 'bg-teal-100 text-teal-800 border-teal-200' },
};

export default function OrdersClient({ requests: initial }: { requests: AdminRequest[] }) {
  const [requests, setRequests] = useState(initial);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterKind, setFilterKind] = useState<'all' | AdminRequest['kind']>('all');
  const [selected, setSelected] = useState<AdminRequest | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = requests.filter((r) => {
    const matchSearch =
      !search ||
      r.id.includes(search) ||
      r.profiles?.full_name?.includes(search) ||
      r.profiles?.phone?.includes(search) ||
      r.phone?.includes(search) ||
      r.order_items.some((i) => i.products?.name?.includes(search));
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchKind = filterKind === 'all' || r.kind === filterKind;
    return matchSearch && matchStatus && matchKind;
  });

  const updateStatus = async (req: AdminRequest, newStatus: string) => {
    setUpdatingId(req.id);
    const table = req.kind === 'evaluation' ? 'evaluation_requests' : 'orders';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from(table).update({ status: newStatus }).eq('id', req.id);
    if (!error) {
      setRequests((prev) => prev.map((r) => (r.id === req.id && r.kind === req.kind ? { ...r, status: newStatus } : r)));
      if (selected?.id === req.id && selected.kind === req.kind) {
        setSelected({ ...selected, status: newStatus });
      }
    }
    setUpdatingId(null);
  };

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    shipped: requests.filter((r) => r.status === 'shipped').length,
    delivered: requests.filter((r) => r.status === 'delivered').length,
    cancelled: requests.filter((r) => r.status === 'cancelled').length,
    evaluation: requests.filter((r) => r.kind === 'evaluation').length,
    cart_order: requests.filter((r) => r.kind === 'cart_order').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {requests.length} طلب — {counts.evaluation} تقييم مجاني — {counts.cart_order} قائمة بيع
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(
          [
            ['all', 'الكل', counts.all],
            ['evaluation', 'تقييم مجاني', counts.evaluation],
            ['cart_order', 'قائمة بيع', counts.cart_order],
          ] as const
        ).map(([key, label, count]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilterKind(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterKind === key ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {Object.entries({
          all: 'كل الحالات',
          ...Object.fromEntries(Object.entries(statusConfig).map(([k, v]) => [k, v.label])),
        }).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilterStatus(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === key ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {label} ({counts[key as keyof typeof counts] ?? 0})
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 right-3 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ابحث برقم الطلب، العميل، الهاتف، أو الصنف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-9"
        />
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-right p-4 text-sm font-semibold">النوع</th>
                <th className="text-right p-4 text-sm font-semibold">رقم الطلب</th>
                <th className="text-right p-4 text-sm font-semibold">العميل</th>
                <th className="text-right p-4 text-sm font-semibold hidden md:table-cell">المبلغ</th>
                <th className="text-right p-4 text-sm font-semibold">الحالة</th>
                <th className="text-right p-4 text-sm font-semibold hidden lg:table-cell">التاريخ</th>
                <th className="text-right p-4 text-sm font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((req) => {
                const status = statusConfig[req.status as keyof typeof statusConfig] ?? statusConfig.pending;
                const StatusIcon = status.icon;
                const kind = kindConfig[req.kind];
                return (
                  <tr key={`${req.kind}-${req.id}`} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <Badge variant="outline" className={`text-xs border ${kind.className}`}>
                        {req.kind === 'evaluation' ? <Tag className="h-3 w-3 ml-1" /> : null}
                        {kind.label}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono text-sm">#{req.id.slice(0, 8).toUpperCase()}</td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-medium">{req.profiles?.full_name ?? 'غير معروف'}</p>
                        <p className="text-xs text-muted-foreground" dir="ltr">
                          {req.phone ?? req.profiles?.phone ?? '—'}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell font-bold text-primary text-sm">
                      {req.total_amount.toLocaleString('ar-EG')} ج.م
                    </td>
                    <td className="p-4">
                      <Badge className={`border flex items-center gap-1 w-fit text-xs ${status.color}`}>
                        <StatusIcon className="h-3 w-3" /> {status.label}
                      </Badge>
                    </td>
                    <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">
                      {new Date(req.created_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Select
                          value={req.status}
                          onValueChange={(v) => v && updateStatus(req, v)}
                          disabled={updatingId === req.id}
                        >
                          <SelectTrigger className="h-8 w-36 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusConfig).map(([k, v]) => (
                              <SelectItem key={k} value={k} className="text-xs">
                                {v.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => setSelected(req)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    لا توجد طلبات
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <span className="font-mono">#{selected?.id.slice(0, 8).toUpperCase()}</span>
              {selected && (
                <Badge variant="outline" className={kindConfig[selected.kind].className}>
                  {kindConfig[selected.kind].label}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-sm mb-3">بيانات العميل</h3>
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  {selected.profiles?.full_name ?? 'غير معروف'}
                </div>
                {(selected.phone || selected.profiles?.phone) && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span dir="ltr">{selected.phone ?? selected.profiles?.phone}</span>
                  </div>
                )}
                {selected.shipping_address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    {selected.shipping_address}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-3">
                  {selected.kind === 'evaluation' ? 'الصنف المطلوب تقييمه' : 'عناصر الطلب'} (
                  {selected.order_items.length})
                </h3>
                <div className="space-y-3">
                  {selected.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {item.products?.images?.[0] && (
                          <Image
                            src={item.products.images[0]}
                            alt={item.products.name ?? ''}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{item.products?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × {item.price.toLocaleString('ar-EG')} ج.م
                        </p>
                      </div>
                      <span className="text-sm font-bold">
                        {(item.quantity * item.price).toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold">
                <span>{selected.kind === 'evaluation' ? 'السعر التقديري' : 'الإجمالي'}</span>
                <span className="text-primary">{selected.total_amount.toLocaleString('ar-EG')} ج.م</span>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">تحديث الحالة</h3>
                <Select
                  value={selected.status}
                  onValueChange={(v) => v && updateStatus(selected, v)}
                  disabled={updatingId === selected.id}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
