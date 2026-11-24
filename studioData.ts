export interface ServiceItem {
  id: string;
  number: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  image: string;
  imageAlt: string;
  featured?: boolean;
  highlights: string[];
}

export interface PaintSwatch {
  id: string;
  name: string;
  hex: string;
}

export interface InstagramHighlight {
  id: string;
  title: string;
  category: string;
  caption: string;
  image: string;
  imageAlt: string;
}

export const STUDIO_INFO = {
  name: 'King Detailing Studio',
  shortName: 'KING DETAILING',
  mapsPlaceName: 'King Detailing Car Studio',
  logoPath: '/assets/aistudio/logo_f847d7ae.png',
  locationShort: 'Chandawa · Arrah',
  addressLine:
    'Opp. Indian petrol pump, near shurya mandir, ara-buxar main rd., Chandawa, Arrah, Bihar 802301',
  mapsQueryAddress: 'Chandawa, Arrah, Bihar 802301',
  hours: '9 AM – 8 PM (confirm before visiting)',
  phoneDisplay: '+91 77392 37655',
  phoneHref: 'tel:+917739237655',
  whatsappNumber: '916201713029',
  whatsappHref: 'https://wa.me/916201713029',
  instagramHandle: '@king_detailing0707',
  instagramUrl: 'https://www.instagram.com/king_detailing0707/',
  googleMapsShortUrl: 'https://maps.app.goo.gl/VTSpQv9BkCjdoLhLA',
  gstin: '10UHKPS1426K1ZV',
  copyrightYear: 2026,
  coordinates: {
    lat: 25.5603208,
    lng: 84.6388741,
  },
} as const;

export const SERVICES: ServiceItem[] = [
  {
    id: 'ceramic-coating',
    number: '01',
    name: 'Ceramic coating',
    category: 'Surface protection',
    tagline: 'Gloss, water repellency and easier routine cleaning.',
    description:
      'Gloss and water repellency, with easier routine cleaning. A liquid polymer layer bonded to your clearcoat to enhance depth and simplify maintenance. Not a substitute for impact-protective film.',
    image: '/assets/kd/ceramic.webp',
    imageAlt: 'Water beading on dark ceramic-coated automotive paint',
    featured: true,
    highlights: [
      'Deep reflective gloss and colour depth',
      'Hydrophobic water and mud repellency',
      'Easier routine washing and UV resistance',
    ],
  },
  {
    id: 'paint-protection-film',
    number: '02',
    name: 'Paint protection film',
    category: 'Physical barrier',
    tagline:
      'A transparent film that helps protect selected painted surfaces from everyday road debris.',
    description:
      'A transparent urethane film that helps protect selected painted areas from road debris, stone chips, and minor abrasions. Coverage packages and gloss/matte film options are confirmed by the studio.',
    image: '/assets/kd/ppf.webp',
    imageAlt: 'Clear paint protection film installation on vehicle panel',
    featured: true,
    highlights: [
      'Physical impact defense against gravel and road rash',
      'Available in crystal gloss, satin, or matte finish',
      'Tailored partial front or full-body panel coverage',
    ],
  },
  {
    id: 'premium-detailing',
    number: '03',
    name: 'Premium detailing',
    category: 'Restore',
    tagline: 'A thorough clean and finish-focused care for your vehicle.',
    description:
      'Multi-stage decontamination, precision machine polishing to reduce swirl marks, and deep interior conditioning tailored to your vehicle materials.',
    image: '/assets/kd/detail.webp',
    imageAlt: 'Machine polishing and premium paint correction treatment',
    highlights: [
      'Safe iron and tar paint decontamination',
      'Machine polishing for swirl and haze reduction',
      'Deep interior sanitization and leather care',
    ],
  },
  {
    id: 'wrapping-and-customization',
    number: '04',
    name: 'Wrapping and customization',
    category: 'Personalise',
    tagline: 'Explore a different colour or finish without committing to repainting.',
    description:
      'Explore a different colour or finish without committing to repainting. Full colour-change wraps, roof blackouts, de-chrome trims, and bespoke accents confirmed during studio inspection.',
    image: '/assets/kd/wrap.webp',
    imageAlt: 'Custom vinyl wrap finish on automotive bodywork',
    highlights: [
      'Reversible colour-change and textured vinyl finishes',
      'Chrome delete, roof blackouts, and accent styling',
      'Clean tucked edges installed in a dust-controlled bay',
    ],
  },
  {
    id: 'denting-and-painting',
    number: '05',
    name: 'Denting and painting',
    category: 'Restore',
    tagline: 'Discuss bodywork damage and refinishing requirements with the studio.',
    description:
      'Precision panel restoration, colour-matched refinishing, and clearcoat blending to bring damaged body panels back to clean factory alignment.',
    image: '/assets/kd/paint.webp',
    imageAlt: 'Automotive panel refinishing and colour-matched painting',
    highlights: [
      'Panel dent repair and surface preparation',
      'Shade-matched paint application and clearcoat',
      'Final wet-sand and polish inspection',
    ],
  },
  {
    id: 'automotive-accessories',
    number: '06',
    name: 'Automotive accessories',
    category: 'Personalise',
    tagline: 'Discuss available accessories and vehicle-specific fitment.',
    description:
      'Vehicle-specific interior and exterior upgrades including seat covers, floor liners, lighting upgrades, audio, and functional protection accessories fitted cleanly.',
    image: '/assets/kd/accessories.webp',
    imageAlt: 'Curated automotive interior and exterior accessories',
    highlights: [
      'Model-specific fitment and clean wiring installation',
      'Interior comfort, mats, and trim enhancements',
      'Guided recommendations matched to your car',
    ],
  },
  {
    id: 'interior-and-exterior-washing',
    number: '07',
    name: 'Interior and exterior washing',
    category: 'Care',
    tagline: 'Routine cleaning for the interior and exterior surfaces of your vehicle.',
    description:
      'pH-neutral foam washing, safe two-bucket contact wash, wheel-well cleaning, and thorough interior vacuuming and trim dressing designed to preserve coatings and paintwork.',
    image: '/assets/kd/wash.webp',
    imageAlt: 'Snow foam wash and gentle automotive surface cleaning',
    highlights: [
      'Snow-foam pre-wash to lift grit safely',
      'Microfibre hand wash safe for PPF and ceramic coats',
      'Cabin vacuum, dashboard wipe-down, and glass clarity',
    ],
  },
];

export const PAINT_SWATCHES: PaintSwatch[] = [
  {id: 'midnight', name: 'Midnight blue', hex: '#283b50'},
  {id: 'graphite', name: 'Graphite', hex: '#3b3c40'},
  {id: 'crimson', name: 'Deep red', hex: '#8c2028'},
  {id: 'silver', name: 'Silver', hex: '#c3c6cb'},
];

export const VEHICLE_CATEGORIES = [
  'Hatchback',
  'Sedan',
  'SUV',
  'Luxury / performance',
  'Other',
] as const;

export const PAINT_CONDITIONS = [
  'Not sure',
  'New / good',
  'Swirls / dull paint',
  'Visible scratches',
] as const;

export const STUDIO_PROCESS = [
  {step: '01', label: 'Inspect', detail: 'Paint depth and surface evaluation under studio lighting.'},
  {step: '02', label: 'Prepare', detail: 'Multi-stage wash, clay decontamination, and masking.'},
  {step: '03', label: 'Treat', detail: 'Precision polishing, coating, film, or custom work.'},
  {step: '04', label: 'Review', detail: 'Final inspection and aftercare guidance at handover.'},
] as const;

export const HERO_FORTUNER_IMAGES = {
  desktop: '/src/assets/images/hero_black_fortuner_desktop_1795552183150.jpg',
  mobile: '/src/assets/images/hero_black_fortuner_mobile_1795552184637.jpg',
} as const;

export const CURTAIN_TEXTURE_IMAGE =
  '/src/assets/images/cherry_red_polyester_drape_1795554634706.jpg';

export const INSTAGRAM_HIGHLIGHTS: InstagramHighlight[] = [
  {
    id: 'ig-ceramic',
    title: 'Ceramic Mirror Finish',
    category: 'Reels & Delivery',
    caption: 'Hydrophobic depth and showroom reflection checks before handover.',
    image: '/assets/kd/ceramic.webp',
    imageAlt: 'Ceramic coating mirror gloss finish at King Detailing Studio',
  },
  {
    id: 'ig-ppf',
    title: 'PPF Bay Installations',
    category: 'Process',
    caption: 'Seamless edge tucking and stone-chip barrier protection.',
    image: '/assets/kd/ppf.webp',
    imageAlt: 'Paint protection film bay installation at King Detailing Studio',
  },
  {
    id: 'ig-detail',
    title: 'Paint Correction Craft',
    category: 'Before & After',
    caption: 'Swirl removal and clarity restoration under inspection lamps.',
    image: '/assets/kd/studio.webp',
    imageAlt: 'Machine polishing inside King Detailing Studio',
  },
  {
    id: 'ig-wash',
    title: 'Custom Finishes & Care',
    category: 'Studio Feed',
    caption: 'Daily deliveries, foam baths, wraps, and client builds in Arrah.',
    image: '/src/assets/images/hero_black_fortuner_desktop_1795552183150.jpg',
    imageAlt: 'Glossy black Toyota Fortuner inside King Detailing Studio bay',
  },
];
