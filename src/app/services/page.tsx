import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ServiceIcon from '@/components/ServiceIcon';
import { getSiteContent } from '@/lib/site-content';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const { services } = await getSiteContent();
  return {
    title: services.metaTitle,
    description: services.metaDescription,
  };
}

export default async function ServicesPage() {
  const { services } = await getSiteContent();

  return (
    <div>
      <section className="border-b bg-gradient-to-bl from-primary/5 via-background to-accent/20">
        <div className="container mx-auto px-4 lg:px-8 py-14 md:py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">{services.pageTitle}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {services.pageSubtitle}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.items.map((service) => (
            <div
              key={`${service.title}-${service.icon}`}
              className="flex flex-col gap-4 p-6 rounded-2xl border bg-card hover:shadow-md transition-shadow"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <ServiceIcon name={service.icon} />
              </div>
              <h2 className="text-xl font-bold">{service.title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <p className="text-muted-foreground mb-4">{services.ctaText}</p>
          <Link href="/catalog">
            <Button size="lg" className="gap-2">
              {services.ctaButton}
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
