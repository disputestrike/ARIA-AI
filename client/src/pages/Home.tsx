import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  ArrowRight, Star, Check, Zap, Brain, TrendingUp,
  MessageSquare, BarChart3, Users, Sparkles,
  ChevronDown, Play, Shield, Clock, DollarSign, Rocket
} from "lucide-react";

const IMGS = {
  hero1: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-hero-1-PH77jxyviFCJ4ztK3dePQV.webp",
  hero2: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-hero-2-DHAuTbscxWuLP3TZfEGXSZ.webp",
  hero3: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-hero-3-UkgE6FrkFjQVcmTzwzj3E3.webp",
  hero4: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-hero-4-PqNbeWp3NZiy9pMXNXVnP2.webp",
  gallery1: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-gallery-1-X92CM7pg8hPa59pbVxaCct.webp",
  gallery2: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-gallery-2-fkQozGMZNLUshKV5s97R4c.webp",
  gallery3: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-gallery-3-BoLpYw4VrvpEYp2c9mjyVd.webp",
  gallery4: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-gallery-4-RtS8joeMv8LCEPZQXrVVF6.webp",
  gallery5: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-gallery-5-5j99C5XumYeNVSZJi5fmQK.webp",
  gallery6: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-gallery-6-R3bbVbkocvm6ebSK9Dutnn.webp",
  gallery7: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-gallery-7-SreFtjCxXgHU2EyEwWio2n.webp",
  gallery8: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-gallery-8-5HcnjrxrpyRvx5DEUJcGMw.webp",
  gallery9: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-gallery-9-LaUumeVcPdRB8rkTHFAZwP.webp",
  t1: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-testimonial-1-LcDN2UtcsSyrLYAXNa97rn.webp",
  t2: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-testimonial-2-4EHnhoyUFXjPVSE3RWyE7F.webp",
  t3: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-testimonial-3-NtvjKyEhJ5JiZGCRtBy9Zp.webp",
  t4: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-testimonial-4-f47K746B2EYC3zNdVAwDij.webp",
  benefitRevenue: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-benefit-revenue-MZANSwEdYiS3vKywNYuJeA.webp",
  benefitSpeed: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-benefit-speed-bE8YveQp8cLxX7iSiwg8Mw.webp",
  benefitContent: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-benefit-content-LhfkozttV2axwBHCoN7dio.webp",
  productDemo: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-product-demo-JEMPXj7ZNNbkqfHABSdrBB.webp",
  usecaseEcom: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-usecase-ecom-3fcGTWEby3qyWvGvPceQva.webp",
  usecaseAgency: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-usecase-agency-hFvLqG7aZTH228WKZuxVa2.webp",
  usecaseBrand: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-usecase-brand-cqmdVmkJSmJxT8BUrt9pZ7.webp",
};

const galleryImages = [
  IMGS.gallery1, IMGS.gallery2, IMGS.gallery3, IMGS.gallery4,
  IMGS.gallery5, IMGS.gallery6, IMGS.gallery7, IMGS.gallery8, IMGS.gallery9,
  IMGS.gallery1, IMGS.gallery2, IMGS.gallery3, IMGS.gallery4,
];

const FAQS = [
  { q: "What exactly is ARIA?", a: "ARIA is your AI Chief Marketing Officer — a single conversational interface that replaces 35 separate marketing tools. You describe what you want in plain English, and ARIA builds campaigns, writes copy, schedules posts, analyzes competitors, and reports results — all without you touching a dashboard." },
  { q: "How is ARIA different from other AI marketing tools?", a: "Other tools give you AI-assisted features inside a complex dashboard. ARIA eliminates the dashboard entirely. You talk to ARIA like a CMO, and it uses 32 specialized tools behind the scenes to execute your entire marketing strategy — from brand voice to paid media to SEO." },
  { q: "Do I need marketing expertise to use ARIA?", a: "No. ARIA is designed for founders, small teams, and busy marketers who don't have time to be experts in every channel. You describe your goals, ARIA asks smart questions, and then executes. It's like having a senior marketing team available 24/7." },
  { q: "What kind of marketing can ARIA handle?", a: "Everything: paid campaigns (Meta, Google, TikTok, LinkedIn, DSP), organic content, email sequences, landing pages, SEO, competitor analysis, brand voice, CRM, A/B tests, funnels, automations, video scripts, and full performance reporting." },
  { q: "Does ARIA really learn my brand voice?", a: "Yes. ARIA builds a persistent brand memory that includes your tone, audience, products, past campaigns, and what has worked. Every conversation builds on the last, so ARIA gets smarter and more on-brand over time." },
  { q: "What platforms does ARIA publish to?", a: "Instagram, TikTok, Facebook, LinkedIn, Twitter/X, YouTube, Pinterest, Google Ads, Meta Ads, and more. ARIA can schedule and publish directly, or hand you ready-to-post content." },
];

const USECASES = [
  {
    label: "E-Commerce Brands",
    img: IMGS.usecaseEcom,
    headline: "Turn browsers into buyers — on autopilot.",
    body: "ARIA builds your full-funnel: product ads that convert, email sequences that recover carts, landing pages that close, and weekly reports that show exactly what's making you money.",
    stats: [{ n: "3.2×", l: "ROAS Average" }, { n: "47%", l: "Lower CAC" }, { n: "2 hrs", l: "Saved Daily" }],
  },
  {
    label: "Marketing Agencies",
    img: IMGS.usecaseAgency,
    headline: "Deliver more for every client, with less overhead.",
    body: "ARIA becomes your agency's secret weapon. Run 10 client campaigns simultaneously, generate white-label reports, and deliver senior-level strategy at junior-level cost.",
    stats: [{ n: "10×", l: "More Clients" }, { n: "80%", l: "Less Admin" }, { n: "5 min", l: "Per Report" }],
  },
  {
    label: "Brand Builders",
    img: IMGS.usecaseBrand,
    headline: "Go from idea to iconic brand in one conversation.",
    body: "ARIA captures your brand voice, builds your visual identity guidelines, and ensures every piece of content — across every channel — sounds and looks unmistakably you.",
    stats: [{ n: "100%", l: "Brand Consistent" }, { n: "30 days", l: "To Full Presence" }, { n: "1 voice", l: "Everywhere" }],
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [activeUsecase, setActiveUsecase] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [heroWord, setHeroWord] = useState(0);
  const heroWords = ["Campaigns", "Content", "Revenue", "Audiences", "Results"];

  useEffect(() => {
    const t = setInterval(() => setHeroWord(w => (w + 1) % heroWords.length), 2000);
    return () => clearInterval(t);
  }, []);

  const loginUrl = getLoginUrl();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">ARIA</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#benefits" className="hover:text-white transition-colors">Benefits</a>
            <a href="#usecases" className="hover:text-white transition-colors">Use Cases</a>
            <a href="#gallery" className="hover:text-white transition-colors">Gallery</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/aria">
                <Button className="bg-violet-600 hover:bg-violet-500 text-white rounded-full px-5 h-9 text-sm font-semibold">
                  Open ARIA <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            ) : (
              <>
                <a href={loginUrl} className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block">Log in</a>
                <a href={loginUrl}>
                  <Button className="bg-violet-600 hover:bg-violet-500 text-white rounded-full px-5 h-9 text-sm font-semibold">
                    Get Started Free
                  </Button>
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-violet-600/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[80px]" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[80px]" />
        </div>

        {/* Floating images left */}
        <div className="absolute left-0 top-0 bottom-0 w-[22%] hidden lg:flex flex-col gap-4 items-center justify-center py-24 pointer-events-none">
          <div className="w-44 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 rotate-[-6deg] translate-y-4 border border-white/10">
            <img src={IMGS.hero1} alt="Marketer" className="w-full object-cover" />
          </div>
          <div className="w-40 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 rotate-[4deg] -translate-y-2 border border-white/10">
            <img src={IMGS.hero3} alt="Campaign" className="w-full object-cover" />
          </div>
        </div>

        {/* Floating images right */}
        <div className="absolute right-0 top-0 bottom-0 w-[22%] hidden lg:flex flex-col gap-4 items-center justify-center py-24 pointer-events-none">
          <div className="w-44 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 rotate-[5deg] translate-y-2 border border-white/10">
            <img src={IMGS.hero2} alt="Entrepreneur" className="w-full object-cover" />
          </div>
          <div className="w-40 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 rotate-[-3deg] -translate-y-4 border border-white/10">
            <img src={IMGS.hero4} alt="Social manager" className="w-full object-cover" />
          </div>
        </div>

        {/* Center */}
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <Badge className="mb-6 bg-violet-500/20 text-violet-300 border-violet-500/30 rounded-full px-4 py-1.5 text-sm font-medium inline-flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Claude AI + 32 Marketing Tools
          </Badge>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            Your AI CMO That{" "}
            <span className="block">
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Actually Builds{" "}
              </span>
              <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                {heroWords[heroWord]}
              </span>
            </span>
          </h1>

          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop juggling 35 tools. Tell ARIA what you need in plain English — it builds campaigns, writes copy, schedules posts, analyzes competitors, and reports results.{" "}
            <span className="text-white font-semibold">One conversation. Full marketing execution.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a href={isAuthenticated ? "/aria" : loginUrl}>
              <Button size="lg" className="bg-violet-600 hover:bg-violet-500 text-white rounded-full px-8 h-14 text-base font-bold shadow-lg shadow-violet-500/30 gap-2">
                <Rocket className="w-5 h-5" />
                Start Free — No Credit Card
              </Button>
            </a>
            <a href="#demo">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base font-semibold border-white/20 text-white hover:bg-white/10 gap-2 bg-transparent">
                <Play className="w-4 h-4" />
                See ARIA in Action
              </Button>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-2">
                {[IMGS.t1, IMGS.t2, IMGS.t3, IMGS.t4].map((img, i) => (
                  <img key={i} src={img} alt="" className="w-7 h-7 rounded-full border-2 border-[#0a0a0f] object-cover" />
                ))}
              </div>
              <span className="text-white/70 font-medium ml-1">2,400+ marketers</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
              <span className="ml-1 text-white/70 font-medium">4.9/5 rating</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-green-400" />
              <span>SOC 2 Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT DEMO */}
      <section id="demo" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30 rounded-full px-4 py-1.5 text-sm">
              See It In Action
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              From blank prompt to{" "}
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                live campaign
              </span>
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              One message. ARIA handles the strategy, copy, creative, targeting, and launch.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-violet-500/10">
            <img src={IMGS.productDemo} alt="ARIA product demo" className="w-full object-cover" />
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="py-16 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: "35+", l: "Marketing Tools Replaced", icon: <Zap className="w-5 h-5" /> },
            { n: "3.2×", l: "Average ROAS Improvement", icon: <TrendingUp className="w-5 h-5" /> },
            { n: "2 hrs", l: "Saved Per Day Per Marketer", icon: <Clock className="w-5 h-5" /> },
            { n: "2,400+", l: "Brands Already Using ARIA", icon: <Users className="w-5 h-5" /> },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 mb-1">{s.icon}</div>
              <div className="text-4xl font-black bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{s.n}</div>
              <div className="text-sm text-white/50">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section id="benefits" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/20 text-green-300 border-green-500/30 rounded-full px-4 py-1.5 text-sm">
              Real Results, Not Features
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              What you actually{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                get out of ARIA
              </span>
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Not a list of features. Real outcomes that show up in your revenue, your time, and your sanity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { img: IMGS.benefitRevenue, icon: <DollarSign className="w-4 h-4 text-green-400" />, iconBg: "bg-green-500/20", label: "More Revenue", labelColor: "text-green-400", title: "Watch your revenue chart go up — without hiring a team", body: "ARIA optimizes every campaign in real-time, finds the audiences that convert, and kills the spend that doesn't. Your money works harder so you don't have to." },
              { img: IMGS.benefitSpeed, icon: <Zap className="w-4 h-4 text-yellow-400" />, iconBg: "bg-yellow-500/20", label: "Lightning Speed", labelColor: "text-yellow-400", title: "Launch a full campaign in the time it takes to drink your coffee", body: "What used to take a marketing team 2 weeks now takes ARIA 4 minutes. Strategy, copy, creative, targeting, scheduling — all done before your coffee gets cold." },
              { img: IMGS.benefitContent, icon: <MessageSquare className="w-4 h-4 text-blue-400" />, iconBg: "bg-blue-500/20", label: "Never Run Dry", labelColor: "text-blue-400", title: "30 days of content, scheduled and ready — every single month", body: "ARIA fills your content calendar automatically. Instagram, TikTok, LinkedIn, email — all on-brand, all scheduled, all done. You just show up and engage." },
            ].map((b, i) => (
              <div key={i} className="group rounded-3xl overflow-hidden border border-white/10 bg-white/[0.03] hover:border-violet-500/40 transition-all duration-300">
                <div className="aspect-video overflow-hidden">
                  <img src={b.img} alt={b.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-lg ${b.iconBg} flex items-center justify-center`}>{b.icon}</div>
                    <span className={`${b.labelColor} font-semibold text-sm`}>{b.label}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{b.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{b.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="group flex rounded-3xl border border-white/10 bg-white/[0.03] hover:border-violet-500/40 transition-all duration-300 overflow-hidden">
              <div className="w-48 shrink-0 overflow-hidden">
                <img src={IMGS.usecaseBrand} alt="Brand voice" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex flex-col justify-center">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center mb-3">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Your brand voice, perfectly preserved — forever</h3>
                <p className="text-white/50 text-sm leading-relaxed">ARIA builds a living memory of your brand: tone, audience, past wins, and what converts. Every campaign sounds unmistakably like you.</p>
              </div>
            </div>

            <div className="group flex rounded-3xl border border-white/10 bg-white/[0.03] hover:border-violet-500/40 transition-all duration-300 overflow-hidden">
              <div className="w-48 shrink-0 overflow-hidden">
                <img src={IMGS.usecaseAgency} alt="Analytics" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex flex-col justify-center">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center mb-3">
                  <BarChart3 className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Know exactly what's making you money — in plain English</h3>
                <p className="text-white/50 text-sm leading-relaxed">No more decoding dashboards. ARIA reads your analytics and tells you what's working, what to cut, and where to double down.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY STRIP */}
      <section id="gallery" className="py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-10 text-center">
          <Badge className="mb-4 bg-pink-500/20 text-pink-300 border-pink-500/30 rounded-full px-4 py-1.5 text-sm">
            What ARIA Creates
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            Every creative you'll ever need,{" "}
            <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              in one conversation
            </span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Ads, UGC videos, email campaigns, landing pages, social content — ARIA generates it all, on-brand, ready to publish.
          </p>
        </div>
        <div className="relative">
          <div className="flex gap-4 w-max" style={{ animation: "scroll 30s linear infinite" }}>
            {galleryImages.map((img, i) => (
              <div key={i} className="w-44 shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-xl shadow-black/40">
                <img src={img} alt={`Creative ${i + 1}`} className="w-full object-cover" />
              </div>
            ))}
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0a0f] to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none" />
        </div>
      </section>

      {/* USE CASES */}
      <section id="usecases" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-indigo-500/20 text-indigo-300 border-indigo-500/30 rounded-full px-4 py-1.5 text-sm">
              Built For Your World
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              What you can do{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">with ARIA</span>
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {USECASES.map((u, i) => (
              <button key={i} onClick={() => setActiveUsecase(i)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${activeUsecase === i ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"}`}>
                {u.label}
              </button>
            ))}
          </div>

          {USECASES.map((u, i) => (
            <div key={i} className={`grid md:grid-cols-2 gap-12 items-center ${activeUsecase === i ? "grid" : "hidden"}`}>
              <div>
                <h3 className="text-3xl sm:text-4xl font-black mb-5 leading-tight">{u.headline}</h3>
                <p className="text-white/60 text-lg leading-relaxed mb-8">{u.body}</p>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {u.stats.map((s, j) => (
                    <div key={j} className="text-center p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="text-2xl font-black bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">{s.n}</div>
                      <div className="text-xs text-white/50 mt-1">{s.l}</div>
                    </div>
                  ))}
                </div>
                <a href={isAuthenticated ? "/aria" : loginUrl}>
                  <Button className="bg-violet-600 hover:bg-violet-500 text-white rounded-full px-7 h-12 font-bold gap-2">
                    Start Free <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              </div>
              <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-violet-500/10">
                <img src={u.img} alt={u.label} className="w-full object-cover" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARISON */}
      <section className="py-24 px-4 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-red-500/20 text-red-300 border-red-500/30 rounded-full px-4 py-1.5 text-sm">
              ARIA vs. The Old Way
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Why marketers are{" "}
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">ditching their stack</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8">
              <div className="text-center mb-6">
                <div className="text-2xl font-black text-red-400 mb-1">The Old Way</div>
                <div className="text-white/40 text-sm">35 tools, 35 subscriptions, 35 logins</div>
              </div>
              <div className="space-y-3">
                {["Hootsuite for scheduling ($99/mo)", "Canva for creatives ($55/mo)", "HubSpot for CRM ($800/mo)", "SEMrush for SEO ($120/mo)", "Mailchimp for email ($150/mo)", "Sprout Social for analytics ($249/mo)", "...and 29 more tools"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-white/50 text-sm">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                      <span className="text-red-400 text-xs font-bold">✕</span>
                    </div>
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-red-500/20 text-center">
                <div className="text-3xl font-black text-red-400">$2,400+/mo</div>
                <div className="text-white/40 text-sm mt-1">Plus 20+ hours of your time</div>
              </div>
            </div>
            <div className="rounded-3xl border border-violet-500/40 bg-violet-500/10 p-8 relative">
              <div className="absolute top-4 right-4">
                <Badge className="bg-violet-500 text-white border-0 rounded-full text-xs font-bold">RECOMMENDED</Badge>
              </div>
              <div className="text-center mb-6">
                <div className="text-2xl font-black text-violet-400 mb-1">ARIA</div>
                <div className="text-white/40 text-sm">One AI. Every marketing channel.</div>
              </div>
              <div className="space-y-3">
                {["Campaigns, content & scheduling — done", "Brand voice that never drifts", "CRM + email + automation built in", "SEO, competitor intel & reporting", "DSP, paid media & ad creatives", "A/B tests, funnels & analytics", "All in one conversation with ARIA"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-white/80 text-sm">
                    <div className="w-5 h-5 rounded-full bg-violet-500/30 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-violet-400" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-violet-500/20 text-center">
                <div className="text-3xl font-black text-violet-400">Fraction of the cost</div>
                <div className="text-white/40 text-sm mt-1">And 2+ hours back every day</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-yellow-500/20 text-yellow-300 border-yellow-500/30 rounded-full px-4 py-1.5 text-sm">
              Real People. Real Results.
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Don't take our word for it —{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">hear from our users</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { img: IMGS.t1, name: "Marcus Rivera", role: "CMO, DTC Brand", quote: "ARIA replaced our entire $3,200/month marketing stack. Our ROAS went from 1.8x to 4.1x in 6 weeks. I genuinely don't know how we ran marketing before this." },
              { img: IMGS.t2, name: "Keisha Thompson", role: "Founder, E-commerce", quote: "I was spending 3 hours a day on content. Now I spend 10 minutes telling ARIA what I need and it handles everything. My content calendar is full for the next 3 months." },
              { img: IMGS.t3, name: "James Chen", role: "Digital Marketing Manager", quote: "The competitor intelligence alone is worth the price. ARIA tells me exactly what my competitors are doing, what's working for them, and how to beat them. Game changer." },
              { img: IMGS.t4, name: "Sarah Mitchell", role: "Agency Owner", quote: "I went from managing 5 clients to 18 clients with the same team size. ARIA handles the execution while my team focuses on strategy and relationships. Revenue is up 340%." },
            ].map((t, i) => (
              <div key={i} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-4 hover:border-violet-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-violet-500/30" />
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-white/40 text-xs">{t.role}</div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-white/70 text-sm leading-relaxed flex-1">"{t.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-4 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-violet-500/20 text-violet-300 border-violet-500/30 rounded-full px-4 py-1.5 text-sm">Simple Pricing</Badge>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Replace your entire stack{" "}
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">for less</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Starter", price: "$49", popular: false, features: ["ARIA AI Chat (100 msgs/mo)", "5 Campaigns", "Content Calendar", "Email Marketing", "Basic Analytics", "1 Brand Profile"], cta: "Start Free Trial" },
              { name: "Growth", price: "$149", popular: true, features: ["ARIA AI Chat (Unlimited)", "Unlimited Campaigns", "Full Content Suite", "DSP & Paid Media", "Competitor Intelligence", "CRM & Automations", "A/B Testing", "5 Brand Profiles"], cta: "Get Started Free" },
              { name: "Agency", price: "$399", popular: false, features: ["Everything in Growth", "Unlimited Clients", "White-label Reports", "Team Collaboration", "Priority Support", "Custom Integrations", "Dedicated Success Manager"], cta: "Contact Sales" },
            ].map((p, i) => (
              <div key={i} className={`rounded-3xl border p-8 relative ${p.popular ? "border-violet-500/60 bg-violet-500/10 shadow-2xl shadow-violet-500/20" : "border-white/10 bg-white/[0.03]"}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-violet-500 text-white border-0 rounded-full px-4 py-1 text-xs font-bold">MOST POPULAR</Badge>
                  </div>
                )}
                <div className="mb-6">
                  <div className="text-sm font-semibold text-white/50 mb-1">{p.name}</div>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black">{p.price}</span>
                    <span className="text-white/40 mb-1">/mo</span>
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  {p.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-2.5 text-sm text-white/70">
                      <Check className={`w-4 h-4 shrink-0 ${p.popular ? "text-violet-400" : "text-green-400"}`} />
                      {f}
                    </div>
                  ))}
                </div>
                <a href={isAuthenticated ? "/aria" : loginUrl}>
                  <Button className={`w-full rounded-full h-11 font-bold ${p.popular ? "bg-violet-600 hover:bg-violet-500 text-white" : "bg-white/10 hover:bg-white/20 text-white"}`}>
                    {p.cta}
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">Frequently asked questions</h2>
            <p className="text-white/50 text-lg">Everything you need to know about ARIA.</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors">
                  <span className="font-semibold text-white/90">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-white/40 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-white/60 text-sm leading-relaxed border-t border-white/5 pt-4">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-900/40 via-purple-900/30 to-[#0a0a0f]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-600/20 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-5xl sm:text-6xl font-black mb-6 leading-tight">
            Stop scaling your workload.{" "}
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Start scaling your results.
            </span>
          </h2>
          <p className="text-white/60 text-xl mb-10 max-w-xl mx-auto">
            Join 2,400+ marketers who replaced their entire marketing stack with one AI conversation.
          </p>
          <a href={isAuthenticated ? "/aria" : loginUrl}>
            <Button size="lg" className="bg-violet-600 hover:bg-violet-500 text-white rounded-full px-10 h-14 text-lg font-bold shadow-2xl shadow-violet-500/40 gap-2">
              <Rocket className="w-5 h-5" />
              Start Free — No Credit Card
            </Button>
          </a>
          <p className="text-white/30 text-sm mt-6">Free 14-day trial · Cancel anytime · Setup in 2 minutes</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold">ARIA</span>
            <span className="text-white/30 text-sm ml-2">© 2026 ARIA. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
