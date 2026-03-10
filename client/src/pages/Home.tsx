import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl, getGoogleLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  ArrowRight, Star, Check, Zap, Brain, TrendingUp,
  BarChart3, Users, Sparkles, Play, Cpu,
  Target, Mail, Globe, Video, Calendar, Search,
  FileText, ChevronRight, ChevronDown
} from "lucide-react";

const CDN = {
  logo: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-logo_1be63f43.png",
  hero1: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-hero-1_29aa26fa.png",
  hero2: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-hero-2_c99c2c17.png",
  hero3: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-hero-3_f7679fe7.png",
  hero4: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-hero-4_93a6c565.png",
  hero5: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-hero-5_afb09b19.png",
  gallery1: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-gallery-1_6b4d91f5.png",
  gallery2: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-gallery-2_579c0dd7.png",
  gallery3: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-gallery-3_b7cc9f26.png",
  gallery4: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-gallery-4_1b8089ea.png",
  gallery5: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-gallery-5_e088e961.png",
  gallery6: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-gallery-6_7bad971a.png",
  gallery7: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-gallery-7_1f01c396.png",
  gallery8: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-gallery-8_cb354a8c.png",
  gallery9: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-gallery-9_9b142309.png",
  t1: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-testimonial-1_6633d2b9.png",
  t2: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-testimonial-2_0534c8b4.png",
  t3: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-testimonial-3_6fb48227.png",
  t4: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-testimonial-4_de6b064d.png",
  benefitRevenue: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-benefit-revenue_a864aee0.png",
  benefitSpeed: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-benefit-speed_1cd0c2a6.png",
  benefitContent: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-benefit-content_8fcb9f11.png",
  benefitAnalytics: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-benefit-analytics_2a0b79e5.png",
  productDemo: "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-product-demo_67277068.png",
};

const GALLERY = [CDN.gallery1,CDN.gallery2,CDN.gallery3,CDN.gallery4,CDN.gallery5,CDN.gallery6,CDN.gallery7,CDN.gallery8,CDN.gallery9];

const BENEFITS = [
  { icon: Zap, color: "text-yellow-500", bg: "bg-yellow-50 border-yellow-100", badge: "Speed", title: "Launch Campaigns in 3 Minutes", desc: "Stop spending days briefing agencies. Tell ARIA your goal, your product, your audience — and watch a full multi-channel campaign appear. Ads, emails, landing pages, social posts — all done.", img: CDN.benefitSpeed },
  { icon: TrendingUp, color: "text-green-500", bg: "bg-green-50 border-green-100", badge: "Revenue", title: "Make More Money From Every Dollar", desc: "ARIA continuously analyzes your ad performance, finds what's working, kills what's not, and reallocates your budget automatically. Your ROAS goes up while you sleep.", img: CDN.benefitRevenue },
  { icon: FileText, color: "text-violet-500", bg: "bg-violet-50 border-violet-100", badge: "Content", title: "Never Run Out of Content Again", desc: "One conversation with ARIA produces a month of content — blog posts, social captions, email sequences, video scripts, ad copy — all in your brand voice, all ready to publish.", img: CDN.benefitContent },
  { icon: BarChart3, color: "text-blue-500", bg: "bg-blue-50 border-blue-100", badge: "Insights", title: "Know Exactly What's Working", desc: "ARIA reads your analytics, spots trends before they peak, flags underperforming campaigns, and tells you exactly what to do next. No more guessing. No more spreadsheets.", img: CDN.benefitAnalytics },
];

const CAPS = [
  { icon: Target, label: "Campaign Builder", desc: "Full multi-channel campaigns in one conversation" },
  { icon: Mail, label: "Email Sequences", desc: "12-step nurture flows that convert" },
  { icon: Globe, label: "Landing Pages", desc: "High-converting pages built and published instantly" },
  { icon: Video, label: "Video Ads", desc: "Scripts, storyboards, and production briefs" },
  { icon: Search, label: "SEO Audits", desc: "Full site audits with actionable fixes" },
  { icon: Brain, label: "Competitor Intel", desc: "Know what competitors are doing before you" },
  { icon: Calendar, label: "Social Scheduler", desc: "Plan and publish across all platforms" },
  { icon: Cpu, label: "Automations", desc: "Set it and forget it marketing workflows" },
  { icon: Users, label: "CRM & Leads", desc: "Track every lead from first touch to close" },
  { icon: BarChart3, label: "Analytics", desc: "Real-time performance across all channels" },
  { icon: Sparkles, label: "Review Management", desc: "Respond to reviews with AI-crafted replies" },
  { icon: Star, label: "A/B Testing", desc: "Test everything, optimize automatically" },
];

const TESTIMONIALS = [
  { img: CDN.t1, name: "Sarah Chen", role: "E-commerce Founder", quote: "ARIA replaced my entire marketing team. I went from spending $8k/month on agencies to $299/month on ARIA — and my revenue doubled in 90 days.", stars: 5 },
  { img: CDN.t2, name: "Marcus Williams", role: "Digital Agency Owner", quote: "I use ARIA to run 40 client accounts simultaneously. What used to take my team a week now takes 20 minutes. My profit margin went from 30% to 78%.", stars: 5 },
  { img: CDN.t3, name: "Priya Sharma", role: "SaaS Marketing Director", quote: "Our CAC dropped 52% in the first month. ARIA found targeting angles we never would have thought of and built the entire funnel in one afternoon.", stars: 5 },
  { img: CDN.t4, name: "Jake Torres", role: "DTC Brand Founder", quote: "I told ARIA 'launch my product' and it built 6 ad variations, 3 landing pages, an email sequence, and a social calendar. All in 8 minutes. I cried.", stars: 5 },
];

const PLANS = [
  { name: "Starter", price: "$99", desc: "Solo founders & small businesses", features: ["100 AI conversations/mo","10 campaigns","5 landing pages","Email campaigns","Basic analytics","1 user"], cta: "Start Free Trial", highlight: false },
  { name: "Growth", price: "$299", desc: "Growing brands that need full power", features: ["Unlimited AI conversations","Unlimited campaigns","Unlimited landing pages","DSP advertising","Advanced analytics","5 users","Social scheduling","A/B testing"], cta: "Start Free Trial", highlight: true, badge: "Most Popular" },
  { name: "Agency", price: "$799", desc: "Run multiple brands & client accounts", features: ["Everything in Growth","Unlimited users","White-label reports","Client workspaces","Priority support","API access","Custom integrations"], cta: "Contact Sales", highlight: false },
];

const FAQS = [
  { q: "What exactly is ARIA?", a: "ARIA is your AI Chief Marketing Officer — a single conversational interface that replaces 35 separate marketing tools. You describe what you want in plain English, and ARIA builds campaigns, writes copy, schedules posts, analyzes competitors, and reports results — all without you touching a dashboard." },
  { q: "How is ARIA different from other AI marketing tools?", a: "Other tools give you AI-assisted features inside a complex dashboard. ARIA eliminates the dashboard entirely. You talk to ARIA like a CMO, and it uses 32 specialized tools behind the scenes to execute your entire marketing strategy." },
  { q: "Do I need marketing expertise to use ARIA?", a: "No. ARIA is designed for founders, small teams, and busy marketers who don't have time to be experts in every channel. You describe your goals, ARIA asks smart questions, and then executes." },
  { q: "Does ARIA really learn my brand voice?", a: "Yes. ARIA builds a persistent brand memory that includes your tone, audience, products, past campaigns, and what has worked. Every conversation builds on the last, so ARIA gets smarter and more on-brand over time." },
];

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeBenefit, setActiveBenefit] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && isAuthenticated) navigate("/aria");
  }, [isAuthenticated, loading, navigate]);

  const loginUrl = getLoginUrl();
  const googleLoginUrl = getGoogleLoginUrl();

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={CDN.logo} alt="ARIA" className="w-9 h-9 object-contain" />
            <span className="text-xl font-black bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">ARIA</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#benefits" className="hover:text-gray-900 transition-colors">Benefits</a>
            <a href="#capabilities" className="hover:text-gray-900 transition-colors">What ARIA Does</a>
            <a href="#testimonials" className="hover:text-gray-900 transition-colors">Stories</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <a href={loginUrl} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">Sign In</a>
            <a href={loginUrl}>
              <Button className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-0 hover:opacity-90 rounded-full px-5 h-9 text-sm font-semibold shadow-md shadow-violet-200">
                Get Started Free
              </Button>
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-full px-4 py-2 text-sm font-semibold text-violet-700 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Powered by Claude AI + GPT-4
            </div>
            <h1 className="text-5xl lg:text-6xl font-black leading-[1.1] mb-6 text-gray-900">
              Your Entire{" "}
              <span className="bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                Marketing Team
              </span>
              <br />in One Conversation
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Tell ARIA what you want to achieve. Watch it build campaigns, write content, launch ads, analyze performance, and grow your revenue — all without you lifting a finger.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <a href={loginUrl}>
                <Button size="lg" className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-0 hover:opacity-90 rounded-full px-8 text-base font-bold h-14 shadow-xl shadow-violet-200">
                  Start Free — No Credit Card
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
              <Button size="lg" variant="outline" className="rounded-full px-8 text-base font-semibold h-14 border-gray-200 text-gray-700 hover:bg-gray-50 bg-white">
                <Play className="w-5 h-5 mr-2 text-violet-600" />
                Watch 2-Min Demo
              </Button>
            </div>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">or sign in with</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <a href={googleLoginUrl} className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm text-sm font-medium text-gray-700">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>
            <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500">
              {["No setup required", "Cancel anytime", "14-day free trial"].map(t => (
                <div key={t} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-500" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Floating images */}
          <div className="relative h-[480px] hidden lg:block">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-48 rounded-2xl overflow-hidden shadow-2xl border-4 border-white z-10" style={{animation:"float 4s ease-in-out infinite"}}>
              <img src={CDN.productDemo} alt="ARIA" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-6 left-2 w-44 h-56 rounded-2xl overflow-hidden shadow-xl border-4 border-white" style={{animation:"float 5s ease-in-out infinite 0.5s"}}>
              <img src={CDN.hero1} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-2 right-6 w-40 h-52 rounded-2xl overflow-hidden shadow-xl border-4 border-white" style={{animation:"float 6s ease-in-out infinite 1s"}}>
              <img src={CDN.hero2} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-6 left-14 w-36 h-48 rounded-2xl overflow-hidden shadow-xl border-4 border-white" style={{animation:"float 4.5s ease-in-out infinite 1.5s"}}>
              <img src={CDN.hero3} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-2 right-14 w-40 h-52 rounded-2xl overflow-hidden shadow-xl border-4 border-white" style={{animation:"float 5.5s ease-in-out infinite 0.8s"}}>
              <img src={CDN.hero4} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-1/3 -left-2 w-32 h-40 rounded-2xl overflow-hidden shadow-lg border-4 border-white" style={{animation:"float 7s ease-in-out infinite 2s"}}>
              <img src={CDN.hero5} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-white text-center">
          {[
            { v: "10,000+", l: "Campaigns Launched" },
            { v: "3 min", l: "Avg. Campaign Build Time" },
            { v: "47%", l: "Avg. ROAS Improvement" },
            { v: "32", l: "AI Marketing Tools" },
          ].map(s => (
            <div key={s.l}>
              <div className="text-3xl font-black mb-1">{s.v}</div>
              <div className="text-sm text-white/80">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── GALLERY STRIP ── */}
      <section className="py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Everything ARIA Creates For You</p>
          <h2 className="text-3xl font-black text-gray-900">Campaigns. Content. Creatives. All of it.</h2>
        </div>
        <div className="flex gap-4" style={{animation:"marquee 30s linear infinite", width:"max-content"}}>
          {[...GALLERY,...GALLERY].map((src,i) => (
            <div key={i} className="w-48 h-64 rounded-2xl overflow-hidden flex-shrink-0 shadow-md hover:scale-105 transition-transform duration-300">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section id="benefits" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-4 py-2 text-sm font-semibold text-green-700 mb-4">
              <TrendingUp className="w-3.5 h-3.5" />
              Real Results, Real Fast
            </div>
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900">
              Stop Working <span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">Harder.</span>
              <br />Start Growing <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">Faster.</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">ARIA doesn't just save you time — it makes you more money. Here's how.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {BENEFITS.map((b, i) => (
              <button key={b.badge} onClick={() => setActiveBenefit(i)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${activeBenefit === i ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {b.badge}
              </button>
            ))}
          </div>

          {BENEFITS.map((b, i) => i === activeBenefit && (
            <div key={b.badge} className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="rounded-3xl overflow-hidden shadow-2xl aspect-video border border-gray-100">
                <img src={b.img} alt={b.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${b.bg} mb-6`}>
                  <b.icon className={`w-5 h-5 ${b.color}`} />
                  <span className={`text-sm font-bold ${b.color}`}>{b.badge}</span>
                </div>
                <h3 className="text-3xl lg:text-4xl font-black mb-4 text-gray-900">{b.title}</h3>
                <p className="text-lg text-gray-600 leading-relaxed mb-8">{b.desc}</p>
                <a href={loginUrl}>
                  <Button className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-0 hover:opacity-90 rounded-full px-8 h-12 font-semibold">
                    See It In Action <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CAPABILITIES ── */}
      <section id="capabilities" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 text-sm font-semibold text-blue-700 mb-4">
              <Cpu className="w-3.5 h-3.5" />
              32 AI Tools, One Interface
            </div>
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900">
              One Conversation.{" "}
              <span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">Infinite Possibilities.</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Ask ARIA anything. It has 32 specialized marketing tools ready to deploy the moment you need them.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CAPS.map(cap => (
              <div key={cap.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center mb-3">
                  <cap.icon className="w-5 h-5 text-violet-600" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{cap.label}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900">
              Three Words:{" "}
              <span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">Just Ask ARIA</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">No dashboards to learn. No settings to configure. Just type what you want.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", color: "from-violet-500 to-purple-600", title: "Tell ARIA Your Goal", desc: '"Build me a campaign for my product launch targeting women 25-45 in the US with a $5k budget." That\'s it. That\'s the brief.' },
              { step: "02", color: "from-blue-500 to-cyan-600", title: "ARIA Gets to Work", desc: "In under 3 minutes, ARIA builds your campaigns, writes your copy, designs your funnels, and prepares everything for launch." },
              { step: "03", color: "from-green-500 to-emerald-600", title: "Watch Revenue Grow", desc: "ARIA monitors performance 24/7, optimizes automatically, and tells you exactly what's working — so you can do more of it." },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <span className="text-white text-xl font-black">{s.step}</span>
                </div>
                <h3 className="text-xl font-black mb-3 text-gray-900">{s.title}</h3>
                <p className="text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-100 rounded-full px-4 py-2 text-sm font-semibold text-yellow-700 mb-4">
              <Star className="w-3.5 h-3.5 fill-yellow-500" />
              Real People, Real Results
            </div>
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900">
              They Said It Would Never Work.{" "}
              <span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">Then They Tried ARIA.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex gap-1 mb-4">
                  {Array.from({length:t.stars}).map((_,i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-bold text-sm text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4 text-gray-900">
              Less Than One Freelancer.{" "}
              <span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">100x the Output.</span>
            </h2>
            <p className="text-xl text-gray-600">Start free. Scale when you're ready. Cancel anytime.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PLANS.map(plan => (
              <div key={plan.name} className={`rounded-3xl p-8 border transition-all hover:-translate-y-1 ${plan.highlight ? "bg-gradient-to-br from-violet-600 to-cyan-500 text-white border-transparent shadow-2xl shadow-violet-200 scale-105" : "bg-white border-gray-200 shadow-sm"}`}>
                {plan.badge && <div className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">{plan.badge}</div>}
                <h3 className={`text-xl font-black mb-1 ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
                <p className={`text-sm mb-6 ${plan.highlight ? "text-white/80" : "text-gray-500"}`}>{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className={`text-5xl font-black ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? "text-white/70" : "text-gray-500"}`}>/mo</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlight ? "bg-white/20" : "bg-violet-100"}`}>
                        <Check className={`w-3 h-3 ${plan.highlight ? "text-white" : "text-violet-600"}`} />
                      </div>
                      <span className={plan.highlight ? "text-white/90" : "text-gray-700"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a href={loginUrl} className="block">
                  <Button className={`w-full rounded-full h-12 font-semibold ${plan.highlight ? "bg-white text-violet-600 hover:bg-white/90" : "bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-0 hover:opacity-90"}`}>
                    {plan.cta}
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-gray-50 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-12 text-gray-900">Everything You Want to Know</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <button className="w-full flex items-center justify-between p-6 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-bold text-gray-900">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-4 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && <div className="px-6 pb-6 text-gray-600 leading-relaxed">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center mx-auto mb-8">
            <img src={CDN.logo} alt="ARIA" className="w-12 h-12 object-contain" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-black mb-6">
            Your Competitors Are Already Using AI.
            <br />Are You?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">Every day you wait is a day your competitors are building campaigns, writing content, and growing their audience with ARIA. Start your free trial today.</p>
          <a href={loginUrl}>
            <Button size="lg" className="bg-white text-violet-600 hover:bg-white/90 rounded-full px-10 h-14 text-base font-bold shadow-xl">
              Get Started Free — No Credit Card
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </a>
          <p className="text-white/60 text-sm mt-6">14-day free trial · Cancel anytime · Setup in 60 seconds</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <img src={CDN.logo} alt="ARIA" className="w-7 h-7 object-contain" />
            <span className="text-white font-bold">ARIA</span>
            <span className="text-gray-600 text-sm ml-2">AI Marketing Intelligence</span>
          </div>
          <div className="flex gap-8 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
          <p className="text-sm">© 2025 ARIA. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      `}</style>
    </div>
  );
}
