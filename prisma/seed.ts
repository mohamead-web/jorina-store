import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import {
  CollectionType,
  CountryCode,
  LocaleCode,
  PrismaClient
} from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" })
});

type ProductSeed = {
  slug: string;
  sku: string;
  basePrice: number;
  compareAtPrice?: number;
  totalStock: number;
  categories: string[];
  collections: CollectionType[];
  images: Array<{
    path: string;
    alt: string;
    isPrimary?: boolean;
    sortOrder?: number;
  }>;
  variants?: Array<{
    sku: string;
    shadeName: string;
    shadeLabel?: string;
    swatchHex?: string;
    stockQty: number;
    priceOverride?: number;
  }>;
  translations: Record<
    LocaleCode,
    {
      name: string;
      shortDescription: string;
      longDescription: string;
      ingredients?: string;
      howToUse?: string;
      seoTitle: string;
      seoDescription: string;
    }
  >;
};

const categories = [
  {
    slug: "face",
    imagePath: "/assets/categories/face.svg",
    sortOrder: 1,
    translations: {
      ar: {
        name: "مكياج الوجه",
        description: "أساسيات الإشراقة الهادئة والبشرة المصقولة.",
        seoTitle: "مكياج الوجه | JORINA",
        seoDescription:
          "فاونديشن، بلاش، بودرة، ولمسات مطفية بإحساس فاخر من JORINA."
      },
      en: {
        name: "Face",
        description: "Refined complexion essentials with a softly luminous finish.",
        seoTitle: "Face Makeup | JORINA",
        seoDescription:
          "Foundation, blush and finishing products crafted for a polished luxury complexion."
      }
    }
  },
  {
    slug: "lips",
    imagePath: "/assets/categories/lips.svg",
    sortOrder: 2,
    translations: {
      ar: {
        name: "الشفاه",
        description: "ألوان مخملية ولمسات لامعة بدرجات مدروسة.",
        seoTitle: "مستحضرات الشفاه | JORINA",
        seoDescription: "أحمر شفاه وزيوت شفاه بدرجات ناعمة وعصرية من JORINA."
      },
      en: {
        name: "Lips",
        description: "Velvet pigments and sheer shine in nuanced, wearable tones.",
        seoTitle: "Lip Collection | JORINA",
        seoDescription: "Lipsticks and lip oils in carefully balanced shades from JORINA."
      }
    }
  },
  {
    slug: "skin",
    imagePath: "/assets/categories/skin.svg",
    sortOrder: 3,
    translations: {
      ar: {
        name: "العناية بالبشرة",
        description: "طقوس تنظيف وتجديد بملمس ناعم ومظهر أنيق.",
        seoTitle: "العناية بالبشرة | JORINA",
        seoDescription: "منظفات وسيرومات بطابع فاخر وهادئ ضمن مجموعة JORINA."
      },
      en: {
        name: "Skin",
        description: "Quiet skincare rituals with polished textures and elevated formulas.",
        seoTitle: "Skincare | JORINA",
        seoDescription: "Cleansing balms and serums shaped for a premium, refined ritual."
      }
    }
  },
  {
    slug: "eyes",
    imagePath: "/assets/categories/eyes.svg",
    sortOrder: 4,
    translations: {
      ar: {
        name: "العيون",
        description: "تعريف ناعم ونظرة واضحة بلا مبالغة.",
        seoTitle: "مستحضرات العيون | JORINA",
        seoDescription: "ماسكارا وتفاصيل عيون أنيقة بإحساس حديث من JORINA."
      },
      en: {
        name: "Eyes",
        description: "Soft definition and clean structure for a modern eye look.",
        seoTitle: "Eye Collection | JORINA",
        seoDescription:
          "Refined mascara and eye essentials with a contemporary luxury mood."
      }
    }
  },
  {
    slug: "sets",
    imagePath: "/assets/categories/sets.svg",
    sortOrder: 5,
    translations: {
      ar: {
        name: "المجموعات",
        description: "تشكيلات منتقاة للهدايا والاكتشاف الأول.",
        seoTitle: "مجموعات JORINA",
        seoDescription: "مجموعات مختارة تجمع بين العناية والمكياج بلمسة فاخرة."
      },
      en: {
        name: "Sets",
        description: "Curated edits for gifting and first-time discovery.",
        seoTitle: "JORINA Sets",
        seoDescription: "Curated discovery and gifting sets across skincare and makeup."
      }
    }
  }
] as const;

const collections = [
  {
    slug: "featured",
    type: CollectionType.FEATURED,
    sortOrder: 1,
    translations: {
      ar: {
        title: "مختارات الدار",
        subtitle: "إطلالات أساسية بطابع مصقول",
        description:
          "تشكيلة مختارة تعكس توازن JORINA بين الهدوء والترف الحديث."
      },
      en: {
        title: "House Edit",
        subtitle: "Essential looks with a polished signature",
        description:
          "A curated edit that captures JORINA's balance of quiet luxury and modern beauty."
      }
    }
  },
  {
    slug: "best-sellers",
    type: CollectionType.BEST_SELLERS,
    sortOrder: 2,
    translations: {
      ar: {
        title: "الأكثر مبيعًا",
        subtitle: "مفضلات العملاء",
        description:
          "منتجات أثبتت حضورها من أول استخدام وحتى اللمسة الأخيرة."
      },
      en: {
        title: "Best Sellers",
        subtitle: "Customer favorites",
        description:
          "The formulas that move from first application to final touch with confidence."
      }
    }
  },
  {
    slug: "new-arrivals",
    type: CollectionType.NEW_ARRIVALS,
    sortOrder: 3,
    translations: {
      ar: {
        title: "الجديد لدى JORINA",
        subtitle: "إصدارات الموسم",
        description: "تصاميم ودرجات جديدة بملمس هادئ وشخصية راقية."
      },
      en: {
        title: "New Arrivals",
        subtitle: "Fresh releases for the season",
        description:
          "New textures, shades and forms with a composed luxury identity."
      }
    }
  },
  {
    slug: "offers",
    type: CollectionType.OFFERS,
    sortOrder: 4,
    translations: {
      ar: {
        title: "العروض المختارة",
        subtitle: "قيمة أعلى بدون ازدحام بصري",
        description: "عروض هادئة ومدروسة على منتجات أساسية ومجموعات هدايا."
      },
      en: {
        title: "Selected Offers",
        subtitle: "Elevated value without visual clutter",
        description: "Calm, curated offers across essentials and discovery sets."
      }
    }
  }
];

const products: ProductSeed[] = [
  {
    slug: "velvet-veil-foundation",
    sku: "JOR-FAC-001",
    basePrice: 210,
    compareAtPrice: 240,
    totalStock: 54,
    categories: ["face"],
    collections: [CollectionType.FEATURED, CollectionType.BEST_SELLERS],
    images: [
      {
        path: "/assets/products/velvet-veil-foundation-1.jpg",
        alt: "Refined complexion essentials arranged on pale marble",
        isPrimary: true,
        sortOrder: 1
      },
      {
        path: "/assets/products/velvet-veil-foundation-2.jpg",
        alt: "Luxury pump bottle on stone surface with directional light",
        sortOrder: 2
      }
    ],
    variants: [
      {
        sku: "JOR-FAC-001-01",
        shadeName: "Porcelain",
        shadeLabel: "Ivory neutral",
        swatchHex: "#E6D7CB",
        stockQty: 18
      },
      {
        sku: "JOR-FAC-001-02",
        shadeName: "Sand",
        shadeLabel: "Warm beige",
        swatchHex: "#D8B695",
        stockQty: 20
      },
      {
        sku: "JOR-FAC-001-03",
        shadeName: "Honey",
        shadeLabel: "Golden tan",
        swatchHex: "#B8845F",
        stockQty: 16
      }
    ],
    translations: {
      ar: {
        name: "فاونديشن فيلفت فايل",
        shortDescription:
          "تغطية قابلة للبناء بملمس مخملي ناعم ولمسة نصف مطفية.",
        longDescription:
          "مصمم ليمنح البشرة مظهرًا مصقولًا دون أن يفقدها حيويتها. يمتزج بسهولة، يثبت بثقة، ويمنح توازنًا راقيًا بين الإشراق والنعومة.",
        ingredients: "مستخلصات مرطبة، بوليمرات تثبيت ناعمة، جزيئات ضوئية دقيقة.",
        howToUse:
          "يوزّع بكمية خفيفة من منتصف الوجه للخارج مع زيادة التغطية عند الحاجة.",
        seoTitle: "فاونديشن فيلفت فايل | JORINA",
        seoDescription:
          "فاونديشن فاخر بملمس مخملي ولمسة نصف مطفية بدرجات متوازنة من JORINA."
      },
      en: {
        name: "Velvet Veil Foundation",
        shortDescription:
          "Buildable coverage with a velvet-soft texture and satin-matte finish.",
        longDescription:
          "Designed to perfect the complexion without flattening it. The formula melts into skin, holds elegantly, and balances soft luminosity with tailored coverage.",
        ingredients:
          "Hydrating extracts, smoothing setting polymers and refined light-diffusing pigments.",
        howToUse:
          "Blend from the center of the face outward and layer where added coverage is desired.",
        seoTitle: "Velvet Veil Foundation | JORINA",
        seoDescription:
          "Luxury foundation with a velvet texture and balanced satin-matte finish from JORINA."
      }
    }
  },
  {
    slug: "satin-bloom-lipstick",
    sku: "JOR-LIP-002",
    basePrice: 125,
    totalStock: 72,
    categories: ["lips"],
    collections: [CollectionType.FEATURED, CollectionType.NEW_ARRIVALS],
    images: [
      {
        path: "/assets/products/satin-bloom-lipstick-1.jpg",
        alt: "Three lipstick bullets in warm nude and rose tones",
        isPrimary: true,
        sortOrder: 1
      },
      {
        path: "/assets/products/satin-bloom-lipstick-2.jpg",
        alt: "Makeup edit with lipstick and complexion products on ivory surface",
        sortOrder: 2
      }
    ],
    variants: [
      {
        sku: "JOR-LIP-002-01",
        shadeName: "Cedar Rose",
        shadeLabel: "Muted rosewood",
        swatchHex: "#A76067",
        stockQty: 24
      },
      {
        sku: "JOR-LIP-002-02",
        shadeName: "Soft Garnet",
        shadeLabel: "Soft garnet red",
        swatchHex: "#8A3C46",
        stockQty: 22
      },
      {
        sku: "JOR-LIP-002-03",
        shadeName: "Nude Muse",
        shadeLabel: "Refined nude pink",
        swatchHex: "#BE8D84",
        stockQty: 26
      }
    ],
    translations: {
      ar: {
        name: "أحمر شفاه ساتن بلوم",
        shortDescription: "لون غني بانعكاس حريري وراحة تدوم لساعات.",
        longDescription:
          "يقدم حضورًا واضحًا دون صخب، بتركيبة تنساب بنعومة على الشفاه وتترك لونًا متزنًا وملمسًا أنيقًا.",
        ingredients: "شموع نباتية ناعمة، زيوت خفيفة، أصباغ عالية النقاء.",
        howToUse:
          "يطبق مباشرة من العبوة أو بفرشاة شفاه لتحديد أكثر دقة.",
        seoTitle: "أحمر شفاه ساتن بلوم | JORINA",
        seoDescription:
          "أحمر شفاه ساتان فاخر بدرجات ناعمة وعصرية من JORINA."
      },
      en: {
        name: "Satin Bloom Lipstick",
        shortDescription:
          "Rich color with a silk-reflective finish and long-wearing comfort.",
        longDescription:
          "A modern lip statement with no excess. The formula glides softly, leaves a composed satin sheen, and wears with quiet confidence.",
        ingredients:
          "Soft plant waxes, lightweight oils and high-purity pigments.",
        howToUse:
          "Apply directly from the bullet or use a lip brush for a more tailored contour.",
        seoTitle: "Satin Bloom Lipstick | JORINA",
        seoDescription:
          "Luxury satin lipstick in nuanced, modern shades from JORINA."
      }
    }
  },
  {
    slug: "night-renewal-serum",
    sku: "JOR-SKN-003",
    basePrice: 260,
    totalStock: 30,
    categories: ["skin"],
    collections: [CollectionType.FEATURED, CollectionType.BEST_SELLERS],
    images: [
      {
        path: "/assets/products/night-renewal-serum-1.jpg",
        alt: "Glass serum bottles and skincare ritual arranged on linen",
        isPrimary: true,
        sortOrder: 1
      },
      {
        path: "/assets/products/night-renewal-serum-2.jpg",
        alt: "Single serum essence bottle with gold-toned pump on soft ivory backdrop",
        sortOrder: 2
      }
    ],
    translations: {
      ar: {
        name: "سيروم نايت رينيوال",
        shortDescription:
          "تركيبة ليلية مركزة تمنح البشرة ملمسًا أكثر صفاءً في الصباح.",
        longDescription:
          "يركز على دعم النضارة واستعادة توازن البشرة خلال الليل، بملمس مائي فاخر وسريع الامتصاص.",
        ingredients: "نياسيناميد، ببتيدات داعمة، هيالورونيك أسيد متعدد الأوزان.",
        howToUse:
          "يوضع مساءً بعد التنظيف وعلى بشرة جافة، ثم يتبع بمرطب مناسب.",
        seoTitle: "سيروم نايت رينيوال | JORINA",
        seoDescription:
          "سيروم ليلي فاخر لتجديد البشرة وتهدئتها من JORINA."
      },
      en: {
        name: "Night Renewal Serum",
        shortDescription:
          "A concentrated evening serum for a visibly smoother, clearer morning texture.",
        longDescription:
          "Crafted to support renewal overnight with a weightless fluid feel. It restores balance, softens texture and leaves the skin looking composed by morning.",
        ingredients:
          "Niacinamide, supportive peptides and multi-weight hyaluronic acid.",
        howToUse:
          "Apply at night to clean, dry skin and follow with your preferred moisturizer.",
        seoTitle: "Night Renewal Serum | JORINA",
        seoDescription:
          "Luxury evening serum designed to renew and calm the skin overnight."
      }
    }
  },
  {
    slug: "luminous-silk-blush",
    sku: "JOR-FAC-004",
    basePrice: 145,
    totalStock: 48,
    categories: ["face"],
    collections: [CollectionType.NEW_ARRIVALS, CollectionType.OFFERS],
    images: [
      {
        path: "/assets/products/luminous-silk-blush-1.jpg",
        alt: "Radiant compact powder in a warm champagne blush tone",
        isPrimary: true,
        sortOrder: 1
      },
      {
        path: "/assets/products/luminous-silk-blush-2.jpg",
        alt: "Curated makeup still life with blush, lipstick and palettes",
        sortOrder: 2
      }
    ],
    variants: [
      {
        sku: "JOR-FAC-004-01",
        shadeName: "Petal Mist",
        shadeLabel: "Soft blush pink",
        swatchHex: "#D8A0A6",
        stockQty: 20
      },
      {
        sku: "JOR-FAC-004-02",
        shadeName: "Rose Haze",
        shadeLabel: "Dusty rose",
        swatchHex: "#B98389",
        stockQty: 28
      }
    ],
    translations: {
      ar: {
        name: "بلاش لومنَس سيلك",
        shortDescription:
          "توريد ناعم بانعكاس خفيف ينساب على البشرة.",
        longDescription:
          "بودرة حريرية تمنح الخدين لونًا متدرجًا وأثرًا مصقولًا دون أي كثافة مزعجة.",
        ingredients: "صبغات دقيقة، بودرات ناعمة، مكوّنات تمنح انزلاقًا سهلاً.",
        howToUse: "يوضع على أعلى الخدين ويُسحب برفق نحو الخارج.",
        seoTitle: "بلاش لومنَس سيلك | JORINA",
        seoDescription:
          "بلاش حريري فاخر بدرجات وردية هادئة من JORINA."
      },
      en: {
        name: "Luminous Silk Blush",
        shortDescription:
          "Soft flush with a refined veil of light across the cheeks.",
        longDescription:
          "A silky powder blush that diffuses beautifully, bringing a gentle warmth and polished color to the complexion.",
        ingredients:
          "Micro pigments, finely milled powders and smoothing glide agents.",
        howToUse: "Sweep lightly across the upper cheeks and blend outward.",
        seoTitle: "Luminous Silk Blush | JORINA",
        seoDescription:
          "A refined silk blush in soft rose tones from JORINA."
      }
    }
  },
  {
    slug: "halo-definition-mascara",
    sku: "JOR-EYE-005",
    basePrice: 110,
    totalStock: 60,
    categories: ["eyes"],
    collections: [CollectionType.BEST_SELLERS],
    images: [
      {
        path: "/assets/products/halo-definition-mascara-1.jpg",
        alt: "Mascara-style beauty tube with precision brush on neutral backdrop",
        isPrimary: true,
        sortOrder: 1
      },
      {
        path: "/assets/products/halo-definition-mascara-2.jpg",
        alt: "Minimal eye-care and lash styling edit in soft neutral tones",
        sortOrder: 2
      }
    ],
    translations: {
      ar: {
        name: "ماسكارا هالو ديفينيشن",
        shortDescription:
          "تعريف دقيق وكثافة نظيفة من الجذور حتى الأطراف.",
        longDescription:
          "فرشاة مدروسة وتركيبة مرنة ترفع الرموش وتحددها بوضوح من دون تكتل أو مظهر ثقيل.",
        ingredients: "شموع مرنة، ألياف دقيقة، مركبات تثبيت خفيفة.",
        howToUse:
          "يطبق من الجذور إلى الأطراف بحركات متعرجة قصيرة ثم يكرر حسب الكثافة المطلوبة.",
        seoTitle: "ماسكارا هالو ديفينيشن | JORINA",
        seoDescription:
          "ماسكارا حديثة لتعريف الرموش بكثافة ناعمة من JORINA."
      },
      en: {
        name: "Halo Definition Mascara",
        shortDescription: "Clean lift and definition from root to tip.",
        longDescription:
          "A thoughtfully shaped brush and flexible formula define, lift and separate lashes without heaviness or flaking.",
        ingredients:
          "Flexible waxes, micro fibers and lightweight setting agents.",
        howToUse:
          "Apply from root to tip in short zig-zag motions and layer to desired intensity.",
        seoTitle: "Halo Definition Mascara | JORINA",
        seoDescription:
          "Modern mascara for softly volumized, defined lashes from JORINA."
      }
    }
  },
  {
    slug: "dew-ritual-cleansing-balm",
    sku: "JOR-SKN-006",
    basePrice: 135,
    totalStock: 38,
    categories: ["skin"],
    collections: [CollectionType.NEW_ARRIVALS, CollectionType.OFFERS],
    images: [
      {
        path: "/assets/products/dew-ritual-cleansing-balm-1.jpg",
        alt: "Cleansing oil bottles illuminated on soft white set",
        isPrimary: true,
        sortOrder: 1
      },
      {
        path: "/assets/products/dew-ritual-cleansing-balm-2.jpg",
        alt: "Minimal white skincare tubes and carton with directional shadows",
        sortOrder: 2
      }
    ],
    translations: {
      ar: {
        name: "بلسم ديو ريتشوال للتنظيف",
        shortDescription:
          "ينظف بلطف ويذيب المكياج مع إحساس مريح وملمس فاخر.",
        longDescription:
          "بلسم يتحول إلى زيت ناعم ثم حليب لطيف عند مزجه بالماء، ليزيل المكياج والشوائب من دون سحب البشرة أو إزعاجها.",
        ingredients: "زيوت مغذية، مستخلصات مهدئة، مستحلبات لطيفة.",
        howToUse:
          "يُدلك على بشرة جافة ثم يُضاف القليل من الماء ويُشطف جيدًا.",
        seoTitle: "بلسم ديو ريتشوال للتنظيف | JORINA",
        seoDescription:
          "بلسم تنظيف فاخر يذيب المكياج ويترك البشرة ناعمة ومتوازنة."
      },
      en: {
        name: "Dew Ritual Cleansing Balm",
        shortDescription:
          "A gentle cleansing balm that melts makeup with a comforting luxe feel.",
        longDescription:
          "The balm transforms from a rich balm to a silk oil and finally a soft milk, dissolving makeup and daily buildup without stripping the skin.",
        ingredients: "Nourishing oils, soothing extracts and gentle emulsifiers.",
        howToUse:
          "Massage over dry skin, add a little water to emulsify, then rinse thoroughly.",
        seoTitle: "Dew Ritual Cleansing Balm | JORINA",
        seoDescription:
          "Luxury cleansing balm that melts away makeup while leaving the skin balanced and soft."
      }
    }
  },
  {
    slug: "blush-veil-setting-powder",
    sku: "JOR-FAC-007",
    basePrice: 150,
    totalStock: 40,
    categories: ["face"],
    collections: [CollectionType.FEATURED, CollectionType.NEW_ARRIVALS],
    images: [
      {
        path: "/assets/products/blush-veil-setting-powder-1.jpg",
        alt: "Soft-focus compact powder with satin glow",
        isPrimary: true,
        sortOrder: 1
      },
      {
        path: "/assets/products/blush-veil-setting-powder-2.jpg",
        alt: "Elegant complexion trio with powder jar and cream textures",
        sortOrder: 2
      }
    ],
    variants: [
      {
        sku: "JOR-FAC-007-01",
        shadeName: "Translucent",
        shadeLabel: "Pure veil",
        swatchHex: "#F1E9E3",
        stockQty: 22
      },
      {
        sku: "JOR-FAC-007-02",
        shadeName: "Soft Beige",
        shadeLabel: "Warm balancing tone",
        swatchHex: "#D8C0AC",
        stockQty: 18
      }
    ],
    translations: {
      ar: {
        name: "بودرة بلَش فايل",
        shortDescription:
          "تثبيت ناعم مع لمسة وردية هادئة تقلل اللمعان وتبقي البشرة حية.",
        longDescription:
          "بودرة فائقة النعومة تمنح ثباتًا راقيًا وتترك طبقة خفيفة مطفية من دون أثر جاف أو طباشيري.",
        ingredients: "بودرات مصقولة، مكونات تحكم بالزيوت، مشتقات حريرية.",
        howToUse:
          "توزع بخفة على المناطق المطلوبة أو على كامل الوجه بفرشاة كبيرة.",
        seoTitle: "بودرة بلَش فايل | JORINA",
        seoDescription:
          "بودرة تثبيت فاخرة بملمس ناعم ولمسة وردية متزنة من JORINA."
      },
      en: {
        name: "Blush Veil Setting Powder",
        shortDescription:
          "Soft-setting powder with a calm blush undertone that keeps skin alive.",
        longDescription:
          "Ultra-fine powder that refines shine while leaving the complexion smooth, breathable and softly diffused.",
        ingredients:
          "Refined powders, oil-balancing agents and silk-derived smoothing components.",
        howToUse:
          "Apply lightly where needed or sweep across the face with a generous brush.",
        seoTitle: "Blush Veil Setting Powder | JORINA",
        seoDescription:
          "Luxury setting powder with a soft veil finish and balanced blush undertone."
      }
    }
  },
  {
    slug: "atelier-nude-lip-oil",
    sku: "JOR-LIP-008",
    basePrice: 95,
    totalStock: 68,
    categories: ["lips"],
    collections: [CollectionType.BEST_SELLERS, CollectionType.OFFERS],
    images: [
      {
        path: "/assets/products/atelier-nude-lip-oil-1.jpg",
        alt: "Gloss tube standing on warm neutral studio background",
        isPrimary: true,
        sortOrder: 1
      },
      {
        path: "/assets/products/atelier-nude-lip-oil-2.jpg",
        alt: "Nude lipstick trio with softly reflective finish",
        sortOrder: 2
      }
    ],
    variants: [
      {
        sku: "JOR-LIP-008-01",
        shadeName: "Bare Bloom",
        shadeLabel: "Sheer nude blossom",
        swatchHex: "#D09B92",
        stockQty: 30
      },
      {
        sku: "JOR-LIP-008-02",
        shadeName: "Rosy Satin",
        shadeLabel: "Muted rosy shine",
        swatchHex: "#C07D7B",
        stockQty: 38
      }
    ],
    translations: {
      ar: {
        name: "زيت الشفاه أتيليه نود",
        shortDescription:
          "لمعة مريحة ولون شفاف يبرز هدوء الإطلالة.",
        longDescription:
          "زيت شفاه يومي يمنح نعومة وامتلاء بصريًا خفيفًا مع لون شفاف مدروس يناسب الإطلالات الراقية.",
        ingredients: "زيوت نباتية خفيفة، فيتامين هـ، لمعان مرن غير لزج.",
        howToUse:
          "يوضع بمفرده أو فوق أحمر الشفاه لإضافة طبقة لامعة راقية.",
        seoTitle: "زيت الشفاه أتيليه نود | JORINA",
        seoDescription:
          "زيت شفاه فاخر بلون شفاف ولمعة ناعمة من JORINA."
      },
      en: {
        name: "Atelier Nude Lip Oil",
        shortDescription:
          "Comfortable shine with a sheer tint that keeps the look composed.",
        longDescription:
          "A daily lip oil with supple shine, soft nourishment and a delicate tint designed for polished everyday wear.",
        ingredients:
          "Lightweight botanical oils, vitamin E and flexible non-sticky shine agents.",
        howToUse:
          "Wear alone for a sheer sheen or layer over lipstick for a refined gloss finish.",
        seoTitle: "Atelier Nude Lip Oil | JORINA",
        seoDescription:
          "Luxury lip oil with a sheer tint and soft, nourishing shine from JORINA."
      }
    }
  },
  {
    slug: "signature-discovery-set",
    sku: "JOR-SET-009",
    basePrice: 320,
    compareAtPrice: 365,
    totalStock: 22,
    categories: ["sets"],
    collections: [CollectionType.FEATURED, CollectionType.OFFERS],
    images: [
      {
        path: "/assets/products/signature-discovery-set-1.jpg",
        alt: "Beauty discovery assortment arranged across an ivory studio table",
        isPrimary: true,
        sortOrder: 1
      },
      {
        path: "/assets/products/signature-discovery-set-2.jpg",
        alt: "Curated beauty edit featuring complexion and lip essentials",
        sortOrder: 2
      }
    ],
    translations: {
      ar: {
        name: "مجموعة سيغنتشر ديسكفري",
        shortDescription:
          "مجموعة تعريفية تجمع بين أساسيات البشرة والشفاه بإحساس فاخر.",
        longDescription:
          "اختيار متوازن لتجربة عالم JORINA لأول مرة أو لتقديمه كهدية أنيقة، مع منتجات مفضلة في أحجام كاملة ومصغّرة.",
        ingredients:
          "فاونديشن مختار، أحمر شفاه ساتاني، سيروم ليلي، وزيت شفاه يومي.",
        howToUse:
          "استخدمي المنتجات منفردة أو ضمن روتين متكامل حسب المناسبة.",
        seoTitle: "مجموعة سيغنتشر ديسكفري | JORINA",
        seoDescription:
          "مجموعة فاخره لاكتشاف أساسيات JORINA للمكياج والعناية."
      },
      en: {
        name: "Signature Discovery Set",
        shortDescription:
          "A refined starter set spanning complexion, lips and nightly care.",
        longDescription:
          "Designed as an elegant first encounter with JORINA or as a polished gift, this set gathers hero products across makeup and skincare.",
        ingredients:
          "Selected foundation, satin lipstick, evening serum and daily lip oil.",
        howToUse:
          "Use each piece alone or combine them into a full ritual depending on the occasion.",
        seoTitle: "Signature Discovery Set | JORINA",
        seoDescription:
          "A luxury discovery set featuring key JORINA makeup and skincare essentials."
      }
    }
  }
];

async function upsertLanguages() {
  await prisma.language.upsert({
    where: { code: LocaleCode.ar },
    update: {
      name: "Arabic",
      nativeName: "العربية",
      dir: "rtl",
      isDefault: true
    },
    create: {
      code: LocaleCode.ar,
      name: "Arabic",
      nativeName: "العربية",
      dir: "rtl",
      isDefault: true
    }
  });

  await prisma.language.upsert({
    where: { code: LocaleCode.en },
    update: {
      name: "English",
      nativeName: "English",
      dir: "ltr",
      isDefault: false
    },
    create: {
      code: LocaleCode.en,
      name: "English",
      nativeName: "English",
      dir: "ltr",
      isDefault: false
    }
  });
}

async function upsertCountries() {
  await prisma.country.upsert({
    where: { code: CountryCode.EG },
    update: {
      name: "Egypt",
      nativeName: "مصر",
      phoneCode: "+20",
      currencyCode: "EGP",
      defaultShippingFee: 50
    },
    create: {
      code: CountryCode.EG,
      name: "Egypt",
      nativeName: "مصر",
      phoneCode: "+20",
      currencyCode: "EGP",
      defaultShippingFee: 50
    }
  });
}

async function upsertCategories() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        imagePath: category.imagePath,
        sortOrder: category.sortOrder,
        translations: {
          deleteMany: {},
          create: [
            { localeCode: LocaleCode.ar, ...category.translations.ar },
            { localeCode: LocaleCode.en, ...category.translations.en }
          ]
        }
      },
      create: {
        slug: category.slug,
        imagePath: category.imagePath,
        sortOrder: category.sortOrder,
        translations: {
          create: [
            { localeCode: LocaleCode.ar, ...category.translations.ar },
            { localeCode: LocaleCode.en, ...category.translations.en }
          ]
        }
      }
    });
  }
}

async function upsertCollections() {
  for (const collection of collections) {
    await prisma.collection.upsert({
      where: { slug: collection.slug },
      update: {
        type: collection.type,
        sortOrder: collection.sortOrder,
        translations: {
          deleteMany: {},
          create: [
            { localeCode: LocaleCode.ar, ...collection.translations.ar },
            { localeCode: LocaleCode.en, ...collection.translations.en }
          ]
        }
      },
      create: {
        slug: collection.slug,
        type: collection.type,
        sortOrder: collection.sortOrder,
        translations: {
          create: [
            { localeCode: LocaleCode.ar, ...collection.translations.ar },
            { localeCode: LocaleCode.en, ...collection.translations.en }
          ]
        }
      }
    });
  }
}

async function upsertProducts() {
  const categoryMap = Object.fromEntries(
    (
      await prisma.category.findMany({
        select: { id: true, slug: true }
      })
    ).map((entry) => [entry.slug, entry.id])
  );

  const collectionMap = Object.fromEntries(
    (
      await prisma.collection.findMany({
        select: { id: true, type: true }
      })
    ).map((entry) => [entry.type, entry.id])
  );

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        sku: product.sku,
        status: "ACTIVE",
        basePrice: product.basePrice,
        compareAtPrice: product.compareAtPrice,
        totalStock: product.totalStock,
        translations: {
          deleteMany: {},
          create: [
            { localeCode: LocaleCode.ar, ...product.translations.ar },
            { localeCode: LocaleCode.en, ...product.translations.en }
          ]
        },
        images: {
          deleteMany: {},
          create: product.images.map((image) => ({
            path: image.path,
            alt: image.alt,
            isPrimary: image.isPrimary ?? false,
            sortOrder: image.sortOrder ?? 0
          }))
        },
        variants: {
          deleteMany: {},
          create: product.variants?.map((variant) => ({
            sku: variant.sku,
            shadeName: variant.shadeName,
            shadeLabel: variant.shadeLabel,
            swatchHex: variant.swatchHex,
            stockQty: variant.stockQty,
            priceOverride: variant.priceOverride
          }))
        },
        productCategories: {
          deleteMany: {},
          create: product.categories.map((slug, index) => ({
            categoryId: categoryMap[slug],
            sortOrder: index
          }))
        },
        collections: {
          deleteMany: {},
          create: product.collections.map((type, index) => ({
            collectionId: collectionMap[type],
            sortOrder: index
          }))
        }
      },
      create: {
        slug: product.slug,
        sku: product.sku,
        status: "ACTIVE",
        basePrice: product.basePrice,
        compareAtPrice: product.compareAtPrice,
        totalStock: product.totalStock,
        translations: {
          create: [
            { localeCode: LocaleCode.ar, ...product.translations.ar },
            { localeCode: LocaleCode.en, ...product.translations.en }
          ]
        },
        images: {
          create: product.images.map((image) => ({
            path: image.path,
            alt: image.alt,
            isPrimary: image.isPrimary ?? false,
            sortOrder: image.sortOrder ?? 0
          }))
        },
        variants: {
          create: product.variants?.map((variant) => ({
            sku: variant.sku,
            shadeName: variant.shadeName,
            shadeLabel: variant.shadeLabel,
            swatchHex: variant.swatchHex,
            stockQty: variant.stockQty,
            priceOverride: variant.priceOverride
          }))
        },
        productCategories: {
          create: product.categories.map((slug, index) => ({
            categoryId: categoryMap[slug],
            sortOrder: index
          }))
        },
        collections: {
          create: product.collections.map((type, index) => ({
            collectionId: collectionMap[type],
            sortOrder: index
          }))
        }
      }
    });
  }
}

async function main() {
  await upsertLanguages();
  await upsertCountries();
  await upsertCategories();
  await upsertCollections();
  await upsertProducts();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
