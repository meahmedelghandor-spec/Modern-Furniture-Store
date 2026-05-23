'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { Product, Category } from '@/types/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Upload, Loader2, Search, ImageOff } from 'lucide-react';

type ProductWithCategory = Product & { categories: { name: string } | null };

interface Props {
  products: ProductWithCategory[];
  categories: Category[];
}

const emptyForm = {
  name: '', description: '', price: '', discount_price: '',
  category_id: '', stock: '', is_featured: false,
};

export default function ProductsClient({ products: initialProducts, categories }: Props) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<ProductWithCategory | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (p: ProductWithCategory) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description ?? '',
      price: String(p.price), discount_price: String(p.discount_price ?? ''),
      category_id: p.category_id, stock: String(p.stock),
      is_featured: p.is_featured,
    });
    setImageFile(null);
    setImagePreview(p.images?.[0] ?? null);
    setError(null);
    setDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setError(null);
    if (!form.name || !form.price || !form.category_id || !form.stock) {
      setError('يرجى ملء جميع الحقول الإلزامية');
      return;
    }
    setSaving(true);

    let images: string[] = editing?.images ?? [];

    // Upload image if new one selected
    if (imageFile) {
      const ext = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile, { upsert: true });

      if (uploadError) {
        setError(`خطأ في رفع الصورة: ${uploadError.message}`);
        setSaving(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
      images = [publicUrl];
    }

    const payload = {
      name: form.name,
      description: form.description || null,
      price: Number(form.price),
      discount_price: form.discount_price ? Number(form.discount_price) : null,
      category_id: form.category_id,
      stock: Number(form.stock),
      is_featured: form.is_featured,
      images,
    };

    if (editing) {
      const { error: updateError } = await supabase
        .from('products').update(payload).eq('id', editing.id);
      if (updateError) { setError(updateError.message); setSaving(false); return; }
    } else {
      const { error: insertError } = await supabase.from('products').insert([payload]);
      if (insertError) { setError(insertError.message); setSaving(false); return; }
    }

    setSaving(false);
    setDialogOpen(false);
    router.refresh();
    // Optimistic: refetch products
    const { data } = await supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false });
    if (data) setProducts(data as ProductWithCategory[]);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('products').delete().eq('id', deleteId);
    setProducts(products.filter((p) => p.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">إدارة المنتجات</h1>
          <p className="text-muted-foreground text-sm mt-1">{products.length} منتج إجمالاً</p>
        </div>
        <Button onClick={openCreate} className="gap-2 self-start">
          <Plus className="h-4 w-4" /> إضافة منتج
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 right-3 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="البحث عن منتج..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-9"
        />
      </div>

      {/* Products Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-right p-4 text-sm font-semibold">المنتج</th>
                <th className="text-right p-4 text-sm font-semibold hidden md:table-cell">القسم</th>
                <th className="text-right p-4 text-sm font-semibold">السعر</th>
                <th className="text-right p-4 text-sm font-semibold hidden sm:table-cell">المخزون</th>
                <th className="text-right p-4 text-sm font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {product.images?.[0] ? (
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><ImageOff className="h-4 w-4 text-muted-foreground" /></div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                        {product.is_featured && <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-0 mt-0.5">مميز</Badge>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">
                    {product.categories?.name ?? '—'}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-primary">{(product.discount_price ?? product.price).toLocaleString('ar-EG')} ج.م</span>
                      {product.discount_price && (
                        <span className="text-xs text-muted-foreground line-through">{product.price.toLocaleString('ar-EG')}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <Badge variant={product.stock > 5 ? 'secondary' : product.stock > 0 ? 'outline' : 'destructive'}
                      className={product.stock > 5 ? 'bg-green-100 text-green-700 border-0' : ''}>
                      {product.stock > 0 ? `${product.stock} قطعة` : 'نفد'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(product)} className="h-8 w-8 p-0">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteId(product.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">لا توجد منتجات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">{error}</div>}

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>صورة المنتج</Label>
              <div className="flex items-start gap-4">
                <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center flex-shrink-0">
                  {imagePreview ? (
                    <Image src={imagePreview} alt="معاينة" fill className="object-cover" sizes="112px" />
                  ) : (
                    <ImageOff className="h-8 w-8 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1">
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors text-sm w-fit">
                      <Upload className="h-4 w-4" /> اختر صورة
                    </div>
                  </Label>
                  <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  <p className="text-xs text-muted-foreground mt-2">JPEG, PNG, WebP — حد أقصى 5 MB</p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="prod-name">اسم المنتج *</Label>
              <Input id="prod-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="prod-desc">وصف المنتج</Label>
              <Textarea id="prod-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>

            {/* Price & Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prod-price">السعر (ج.م) *</Label>
                <Input id="prod-price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-discount">سعر الخصم (اختياري)</Label>
                <Input id="prod-discount" type="number" value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: e.target.value })} dir="ltr" />
              </div>
            </div>

            {/* Category & Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>القسم *</Label>
                <Select
                  value={form.category_id}
                  onValueChange={(v) => v && setForm({ ...form, category_id: v })}
                >
                  <SelectTrigger><SelectValue placeholder="اختر قسم" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-stock">المخزون *</Label>
                <Input id="prod-stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} dir="ltr" />
              </div>
            </div>

            {/* Featured */}
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <input
                type="checkbox"
                id="prod-featured"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="h-4 w-4 rounded accent-primary"
              />
              <Label htmlFor="prod-featured" className="cursor-pointer text-sm font-normal">
                منتج مميز ⭐ (يظهر في صفحة الرئيسية بشكل بارز)
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> جاري الحفظ...</> : editing ? 'حفظ التعديلات' : 'إضافة المنتج'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
