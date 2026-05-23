import {
  Tag,
  Truck,
  ShieldCheck,
  Clock,
  Home,
  PhoneCall,
  MessageCircle,
  CheckCircle2,
  HandCoins,
  Sofa,
  BedDouble,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Tag,
  Truck,
  ShieldCheck,
  Clock,
  Home,
  PhoneCall,
  MessageCircle,
  CheckCircle2,
  HandCoins,
  Sofa,
  BedDouble,
  Briefcase,
};

export default function ServiceIcon({
  name,
  className = 'h-6 w-6',
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICON_MAP[name] ?? Tag;
  return <Icon className={className} />;
}
