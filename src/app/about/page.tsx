import Link from 'next/link';
import { HandCoins, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSiteContent } from '@/lib/site-content';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const { about } = await getSiteContent();
  return {
    title: about.metaTitle,
    description: about.metaDescription,
  };
}

export default async function AboutPage() {
  const { about } = await getSiteContent();

  return (
    <div>
      <section className="border-b bg-gradient-to-bl from-primary/5 via-background to-accent/20">
        <div className="container mx-auto px-4 lg:px-8 py-14 md:py-20">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-6">
              <HandCoins className="h-7 w-7" />
            </div>
            <h1 className="text-4xl font-bold mb-4">{about.pageTitle}</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {about.pageSubtitle}
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 lg:px-8 py-14 max-w-3xl">
        <div className="prose prose-neutral max-w-none space-y-6 text-muted-foreground leading-relaxed">
          {about.paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <Link href="/catalog">
            <Button className="gap-2">
              {about.catalogButton}
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline">{about.contactButton}</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
