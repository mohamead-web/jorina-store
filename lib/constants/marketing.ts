export const brandStory = {
  ar: {
    eyebrow: "تجربة علامة تجميل فاخرة",
    headline: "مستحضرات تعتني بالتفصيل قبل اللون",
    subheadline:
      "JORINA تقدم توازنًا هادئًا بين العناية واللون، بتصميم بصري مصقول ومنتجات مختارة للإطلالة الحديثة.",
    primaryCta: "تسوقي الآن",
    secondaryCta: "اكتشفي المجموعة",
    statementTitle: "ترف هادئ مصمم ليُرى ويُشعر",
    statementBody:
      "من البنية البصرية وحتى ملمس المنتجات، صممت JORINA لتبدو راقية على الهاتف كما هي على الطاولة أمام المرآة."
  },
  en: {
    eyebrow: "A luxury beauty house experience",
    headline: "Cosmetics shaped by detail before color",
    subheadline:
      "JORINA balances care and color through polished design, premium textures and a restrained modern beauty point of view.",
    primaryCta: "Shop now",
    secondaryCta: "Discover the collection",
    statementTitle: "Quiet luxury, designed to be seen and felt",
    statementBody:
      "From the visual rhythm to the product textures, JORINA is designed to feel elevated in-hand and editorial on-screen."
  }
};

export const valueProps = [
  {
    icon: "sparkles",
    ar: {
      title: "مكونات نقية وآمنة",
      description: "تركيبات لطيفة على البشرة غنية بالعناصر المغذية لتمنحكِ إشراقة طبيعية صحية ومريحة."
    },
    en: {
      title: "Pure & Safe Ingredients",
      description: "Gentle formulas enriched with nourishing elements for a naturally healthy, comfortable glow."
    }
  },
  {
    icon: "shield",
    ar: {
      title: "ثبات يدوم طويلاً",
      description: "جودة استثنائية تقاوم ظروف يومك، لتحافظي على أناقة مظهرك من الصباح وحتى المساء بارتياح تام."
    },
    en: {
      title: "Long-lasting Performance",
      description: "Exceptional quality that withstands your day, maintaining your elegant look from dawn till dusk."
    }
  },
  {
    icon: "heart",
    ar: {
      title: "ألوان صُممت بحب",
      description: "تدرجات لونية مدروسة تناسب سحر البشرة العربية وتزيد من جاذبيتها بتغطية ساحرة ومثالية."
    },
    en: {
      title: "Expertly Crafted Shades",
      description: "Thoughtful color palettes perfectly tailored for Arab skin tones, adding magic with flawless coverage."
    }
  }
] as const;

export const testimonials = [
  {
    ar: {
      quote: "درجات أحمر الشفاه ساحرة جداً، والملمس خفيف على البشرة ولا يتكتل أبداً. جودة تستحق كل ريال!",
      author: "رهف",
      role: "عميلة متكررة"
    },
    en: {
      quote: "The lipstick shades are truly magical, and the texture is feather-light. A thoroughly premium quality!",
      author: "Rahaf",
      role: "Returning customer"
    }
  },
  {
    ar: {
      quote: "أخيراً وجدت البودرة التي تثبت طوال اليوم بدون أن تخفي لمعان بشرتي الطبيعي. تجربة رائعة.",
      author: "سارة",
      role: "من الرياض"
    },
    en: {
      quote: "Finally found a powder that sets all day without masking my natural glow. Wonderful experience.",
      author: "Sarah",
      role: "Riyadh"
    }
  }
] as const;

export const faqEntries = [
  {
    ar: {
      question: "ما هي طريقة الدفع المتوفرة حاليًا؟",
      answer:
        "الدفع عند الاستلام هو الطريقة المتاحة في هذه النسخة الأولى، مع بنية جاهزة لإضافة بوابات دفع إلكترونية لاحقًا."
    },
    en: {
      question: "Which payment method is currently available?",
      answer:
        "Cash on delivery is available in the first release, while the architecture is prepared for future online gateways."
    }
  },
  {
    ar: {
      question: "هل يمكنني الطلب بدون تسجيل دخول؟",
      answer:
        "نعم، يمكنك إتمام الطلب كضيف، ثم إنشاء حساب لاحقًا أو تسجيل الدخول عبر Google لإدارة الطلبات والعناوين والمفضلة."
    },
    en: {
      question: "Can I place an order without signing in?",
      answer:
        "Yes. Guest checkout is supported, and you can later sign in with Google to manage orders, addresses and favorites."
    }
  },
  {
    ar: {
      question: "متى يمكنني طلب إرجاع؟",
      answer:
        "بعد تسليم الطلب يمكن تقديم طلب إرجاع خلال 7 أيام للطلبات المؤهلة، ثم تتم مراجعته في المرحلة الحالية يدويًا."
    },
    en: {
      question: "When can I request a return?",
      answer:
        "Eligible delivered orders can receive a return request within 7 days, followed by a manual review in the current phase."
    }
  }
] as const;
