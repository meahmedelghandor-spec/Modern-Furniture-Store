import Link from 'next/link';
import { CheckCircle2, Home, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20">
      <Card className="w-full max-w-md text-center shadow-xl border-0">
        <CardContent className="p-10 space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-amber-400 flex items-center justify-center text-xs font-bold">
                ✓
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold mb-2">تم استلام طلبك! 🎉</h1>
            <p className="text-muted-foreground">
              شكراً لتواصلك معنا. سيتصل بك أحد فريقنا خلال ساعات قليلة لتحديد موعد المعاينة وتأكيد السعر النهائي.
            </p>
          </div>

          {orderId && (
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">رقم الطلب</p>
              <p className="font-mono font-bold text-sm">#{orderId.slice(0, 8).toUpperCase()}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: '📋', text: 'تم استلام الطلب' },
              { icon: '🔍', text: 'المعاينة والتقييم' },
              { icon: '💵', text: 'الدفع الفوري' },
            ].map((step, i) => (
              <div key={i} className={`p-3 rounded-lg ${i === 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <div className="text-2xl mb-1">{step.icon}</div>
                <div className="text-xs font-medium">{step.text}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <a href="https://wa.me/20100000000" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full gap-2">
                <PhoneCall className="h-4 w-4" />
                تواصل معنا على واتساب
              </Button>
            </a>
            <Link href="/">
              <Button className="w-full gap-2">
                <Home className="h-4 w-4" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
