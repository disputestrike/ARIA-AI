// Demo campaign data for new users on first login
export const DEMO_CAMPAIGN = {
  name: "Lumos Coffee Co.",
  strategy: {
    domain: "lumoscoffee.com",
    brandName: "Lumos Coffee Co.",
    positioning: "We find the world's best farmers so you don't have to.",
    audience: ["Coffee enthusiasts", "Work-from-home professionals", "Gift-givers"],
    tone: "Warm, knowledgeable, inspiring",
    competitors: ["Trade Coffee", "Atlas Coffee Club"],
    channels: ["email", "social", "content", "ad", "landing"],
    recommendedAssets: ["blog", "email", "social", "ad", "landing", "seo"],
    ninetyDayRoadmap: [
      "Week 1-2: Launch email welcome sequence and social content calendar",
      "Week 3-4: Publish 3 SEO-optimized blog posts about single-origin coffee",
      "Week 5-6: Launch paid ad campaign targeting coffee enthusiasts",
      "Week 7-8: Create video testimonials from customers",
      "Week 9-10: Launch referral program with email automation",
      "Week 11-12: Analyze performance and optimize best-performing channels",
    ],
  },
  assets: [
    {
      type: "blog",
      title: "Why Single-Origin Coffee Matters (And How to Taste the Difference)",
      preview: "Learn about the journey of single-origin coffee, from farm to cup, and why it tastes so much better than blends...",
      version: 1,
    },
    {
      type: "email",
      title: "Welcome to Lumos Coffee Co.",
      preview: "Subject: Your monthly coffee adventure starts here ☕\n\nHi there,\n\nWelcome to Lumos Coffee Co. — where exceptional coffee begins with real relationships with coffee farmers...",
      version: 1,
    },
    {
      type: "social",
      platform: "instagram",
      title: "Instagram Post - Meet Our Farmer",
      preview: "Meet Juan, a coffee farmer in Ethiopia who's been perfecting his craft for 20 years. This month, we're bringing his incredible Yirgacheffe beans to your doorstep. 🌱☕",
      version: 1,
    },
    {
      type: "ad",
      title: "Meta Ad - Coffee Subscription",
      preview: "Headline: Discover the World's Best Coffee Monthly\nBody: A new single-origin coffee delivered to your door every month. From farmers we know personally.\nCTA: Start My Subscription",
      version: 1,
    },
    {
      type: "landing",
      title: "Coffee Subscription Landing Page",
      preview: "Lumos Coffee Co. - $39/month for premium single-origin coffee. 12oz of two rotating coffees. Free shipping. Risk-free 30-day guarantee.",
      version: 1,
      live_at: "/lp/lumos-coffee",
    },
    {
      type: "seo",
      title: "SEO Keyword Package",
      preview: "Top Keywords: single-origin coffee (450 searches/mo), best specialty coffee (320), Ethiopian coffee (280), coffee subscription box (220), fair trade coffee (190)",
      version: 1,
    },
  ],
  campaign_score: 87,
  note: "Example campaign - read-only. Click 'Use This for My Brand' to customize for your business.",
};

export const DEMO_BRAND_KIT = {
  logoUrl: "https://via.placeholder.com/200x200?text=Lumos",
  primaryColor: "#8B4513", // Coffee brown
  secondaryColor: "#D4A574", // Light brown
  fontFamily: "Merriweather",
  tone_of_voice:
    "Warm, knowledgeable, and passionate about coffee. We educate customers about single-origin coffee and build relationships with the farmers who grow it.",
  brand_keywords: ["single-origin", "specialty coffee", "ethical sourcing", "coffee farmer", "artisanal"],
  competitor_exclusions: ["Starbucks", "Nespresso"],
  target_audience:
    "Coffee enthusiasts aged 25-55 who appreciate quality, are willing to pay premium prices for exceptional coffee, and value direct relationships with producers.",
  presenter_profile: {
    gender: "female",
    age: "30-40",
    ethnicity: "european",
    voice_tone: "warm",
    style: "casual professional",
    language: "english",
  },
};
