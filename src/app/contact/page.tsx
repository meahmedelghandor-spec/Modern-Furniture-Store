import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { getSiteContent } from '@/lib/site-content';
import SocialLinks from '@/components/SocialLinks';
import ContactForm from './ContactForm';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const { contact } = await getSiteContent();
  return {
    title: contact.metaTitle,
    description: contact.metaDescription,
  };
}

export default async function ContactPage() {
  const { global, contact } = await getSiteContent();

  return (
    <div>
      <section className="border-b bg-gradient-to-bl from-primary/5 via-background to-accent/20">
        <div className="container mx-auto px-4 lg:px-8 py-14 md:py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">{contact.pageTitle}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {contact.pageSubtitle}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{contact.contactSectionTitle}</h2>
            <ul className="space-y-4">
              <li>
                <a
                  href={`tel:${global.phone}`}
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Phone className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-xs text-muted-foreground">{contact.phoneLabel}</span>
                    <span className="font-medium text-foreground" dir="ltr">
                      {global.phoneDisplay}
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${global.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                    <MessageCircle className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-xs text-muted-foreground">{contact.whatsappLabel}</span>
                    <span className="font-medium text-foreground">{contact.whatsappLinkText}</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${global.email}`}
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-xs text-muted-foreground">{contact.emailLabel}</span>
                    <span className="font-medium text-foreground">{global.email}</span>
                  </span>
                </a>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs text-muted-foreground">{contact.addressLabel}</span>
                  <span className="font-medium text-foreground">{global.address}</span>
                </span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">{contact.footerNote}</p>

            <SocialLinks
              items={contact.socialItems}
              whatsappFallback={global.whatsapp}
              title={contact.socialLinksTitle}
              showTitle
              size="md"
              className="items-start pt-4 border-t"
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">{contact.formSectionTitle}</h2>
            <ContactForm
              successTitle={contact.formSuccessTitle}
              successMessage={contact.formSuccessMessage}
            />
          </div>
        </div>
      </section>

      {/* ── قسم خريطة جوجل ── يُعرض فقط إذا تم ضبط الرابط من لوحة الإدارة */}
      {contact.googleMapsUrl && (
        <section className="border-t bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8 py-10">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              موقعنا على الخريطة
            </h2>
            <div className="w-full overflow-hidden rounded-xl border shadow-sm" style={{ height: 400 }}>
              <iframe
                src={contact.googleMapsUrl}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="موقعنا على خريطة جوجل"
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
