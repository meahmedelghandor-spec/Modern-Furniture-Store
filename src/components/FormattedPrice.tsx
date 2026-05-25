'use client';

import { useFormatPrice } from '@/contexts/SiteContentContext';

export default function FormattedPrice({
  amount,
  approximate,
  className,
}: {
  amount: number;
  approximate?: boolean;
  className?: string;
}) {
  const format = useFormatPrice();
  return <span className={className}>{format(amount, { approximate })}</span>;
}
