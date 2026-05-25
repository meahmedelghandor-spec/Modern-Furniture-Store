export interface SiteGlobal {
  siteName: string;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  email: string;
  address: string;
}

export interface CatalogContent {
  metaTitle: string;
  metaDescription: string;
  pageTitle: string;
  pageSubtitle: string;
  sidebarLabel: string;
  allItemsTitle: string;
  categoryTitlePrefix: string;
  defaultCategoryDesc: string;
  emptyTitle: string;
  emptyMessage: string;
  categoryDescriptions: Record<string, string>;
}

export interface ServiceItem {
  icon: string;
  title: string;
  description: string;
}

export interface ServicesContent {
  metaTitle: string;
  metaDescription: string;
  pageTitle: string;
  pageSubtitle: string;
  items: ServiceItem[];
  ctaText: string;
  ctaButton: string;
}

export interface AboutContent {
  metaTitle: string;
  metaDescription: string;
  pageTitle: string;
  pageSubtitle: string;
  paragraphs: string[];
  catalogButton: string;
  contactButton: string;
}

export type SocialPlatformId =
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'whatsapp'
  | 'tiktok'
  | 'snapchat'
  | 'youtube'
  | 'linkedin'
  | 'telegram'
  | 'pinterest'
  | 'custom';

export interface SocialLinkItem {
  id: string;
  platform: SocialPlatformId;
  /** للمنصة «أخرى» أو تسمية مخصصة */
  label?: string;
  url: string;
}

export const SOCIAL_PLATFORM_OPTIONS: { id: SocialPlatformId; label: string }[] = [
  { id: 'facebook', label: 'فيسبوك' },
  { id: 'instagram', label: 'إنستجرام' },
  { id: 'twitter', label: 'X (تويتر)' },
  { id: 'whatsapp', label: 'واتساب' },
  { id: 'tiktok', label: 'تيك توك' },
  { id: 'snapchat', label: 'سناب شات' },
  { id: 'youtube', label: 'يوتيوب' },
  { id: 'linkedin', label: 'لينكدإن' },
  { id: 'telegram', label: 'تيليجرام' },
  { id: 'pinterest', label: 'بينترست' },
  { id: 'custom', label: 'منصة أخرى' },
];

export interface ContactContent {
  metaTitle: string;
  metaDescription: string;
  pageTitle: string;
  pageSubtitle: string;
  contactSectionTitle: string;
  formSectionTitle: string;
  phoneLabel: string;
  whatsappLabel: string;
  whatsappLinkText: string;
  emailLabel: string;
  addressLabel: string;
  footerNote: string;
  formSuccessTitle: string;
  formSuccessMessage: string;
  googleMapsUrl: string;
  socialLinksTitle: string;
  /** قائمة ديناميكية — أضف أي منصة من لوحة التحكم */
  socialItems: SocialLinkItem[];
}

export interface SiteContent {
  global: SiteGlobal;
  catalog: CatalogContent;
  services: ServicesContent;
  about: AboutContent;
  contact: ContactContent;
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  global: {
    siteName: 'نشتري أثاثك',
    phone: '+20100000000',
    phoneDisplay: '0100 000 0000',
    whatsapp: '20100000000',
    email: 'info@nushtri-athath.com',
    address: 'القاهرة، مصر',
  },
  catalog: {
    metaTitle: 'ما نشتريه | نشتري أثاثك',
    metaDescription: 'تصفّح أنواع الأثاث التي نشتريها منك بأفضل سعر.',
    pageTitle: 'ما نشتريه',
    pageSubtitle: 'اختر نوع الأثاث الذي تريد بيعه واطّلع على أسعار الشراء التقديرية',
    sidebarLabel: 'التصنيفات',
    allItemsTitle: 'كل الأصناف',
    categoryTitlePrefix: 'نشتري:',
    defaultCategoryDesc: 'تواصل معنا لمعرفة أسعار الشراء',
    emptyTitle: 'لا توجد أصناف',
    emptyMessage: 'لا توجد أصناف في هذا القسم حالياً.',
    categoryDescriptions: {
      'living-room': 'نشتري أرائك، طقم صالون، كنب، تلفزيون...',
      bedroom: 'نشتري غرف نوم كاملة أو قطع منفردة...',
      office: 'نشتري مكاتب، كراسي، خزانات مكتبية...',
    },
  },
  services: {
    metaTitle: 'خدماتنا | نشتري أثاثك',
    metaDescription: 'خدمات شراء الأثاث المستعمل — تقييم، نقل، ودفع فوري.',
    pageTitle: 'خدماتنا',
    pageSubtitle:
      'نقدّم تجربة بيع سلسة من أول اتصال حتى استلام الكاش — بدون تعقيد أو رسوم مخفية.',
    items: [
      {
        icon: 'Tag',
        title: 'تقييم مجاني',
        description:
          'نقيّم أثاثك بناءً على الصور أو المعاينة الميدانية ونعطيك عرض سعر عادل خلال دقائق.',
      },
      {
        icon: 'Truck',
        title: 'نقل وشيل مجاني',
        description:
          'بعد الاتفاق، فريقنا يتولى نقل الأثاث من منزلك أو مكتبك دون أي تكلفة إضافية عليك.',
      },
      {
        icon: 'ShieldCheck',
        title: 'دفع آمن وفوري',
        description:
          'تستلم المبلغ المتفق عليه نقداً فور اكتمال النقل — بدون تأخير أو خصومات مخفية.',
      },
      {
        icon: 'Clock',
        title: 'مواعيد مرنة',
        description:
          'نحدد موعد المعاينة والاستلام حسب جدولك — صباحاً أو مساءً وأيام الأسبوع.',
      },
      {
        icon: 'Home',
        title: 'شراء أثاث منزلي ومكتبي',
        description:
          'نشتري صالونات، غرف نوم، مطابخ، مكاتب، ومعدات مؤسسات بجميع الحالات.',
      },
    ],
    ctaText: 'جاهز تبيع أثاثك؟',
    ctaButton: 'تصفّح ما نشتريه',
  },
  about: {
    metaTitle: 'من نحن | نشتري أثاثك',
    metaDescription: 'تعرّف على فريقنا ورسالتنا في شراء الأثاث المستعمل.',
    pageTitle: 'من نحن',
    pageSubtitle:
      'نحن فريق متخصص في شراء الأثاث المستعمل في مصر. هدفنا تسهيل عملية التخلّص من الأثاث غير المطلوب مع ضمان سعر عادل ودفع فوري وخدمة محترمة.',
    paragraphs: [
      'بدأنا لأن كثيراً من الناس يواجهون صعوبة في بيع أثاثهم عند الانتقال أو التجديد. نقدّم بديلاً سريعاً: تقييم شفاف، موعد مرن، وشيل من الباب بدون عناء.',
      'نشتري صالونات، غرف نوم، مطابخ، مكاتب، وأثاث مؤسسات. كل صنف له سعر تقديري معروض على الموقع، والسعر النهائي يُؤكّد بعد المعاينة.',
      'ثقتك أولويتنا. لا نطلب رسوماً مقدّمة، ولا نلزمك بالبيع — العرض واضح قبل أي اتفاق.',
    ],
    catalogButton: 'ما نشتريه',
    contactButton: 'تواصل معنا',
  },
  contact: {
    metaTitle: 'تواصل معنا | نشتري أثاثك',
    metaDescription: 'تواصل معنا لبيع أثاثك المستعمل أو لأي استفسار.',
    pageTitle: 'تواصل معنا',
    pageSubtitle: 'عندك أثاث للبيع؟ ابعت لنا أو اتصل بينا — الرد خلال ساعات العمل.',
    contactSectionTitle: 'بيانات التواصل',
    formSectionTitle: 'أرسل رسالة',
    phoneLabel: 'هاتف',
    whatsappLabel: 'واتساب',
    whatsappLinkText: 'راسلنا على واتساب',
    emailLabel: 'بريد إلكتروني',
    addressLabel: 'العنوان',
    footerNote: 'أو تصفّح ما نشتريه وأضف قطعك لقائمة البيع مباشرة.',
    formSuccessTitle: 'تم إرسال رسالتك',
    formSuccessMessage: 'شكراً لتواصلك. سنرد عليك في أقرب وقت ممكن.',
    googleMapsUrl: '',
    socialLinksTitle: 'تابعنا على',
    socialItems: [],
  },
};

export const SERVICE_ICON_OPTIONS = [
  'Tag',
  'Truck',
  'ShieldCheck',
  'Clock',
  'Home',
  'PhoneCall',
  'MessageCircle',
  'CheckCircle2',
  'HandCoins',
  'Sofa',
  'BedDouble',
  'Briefcase',
] as const;
