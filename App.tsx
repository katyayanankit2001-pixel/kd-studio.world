import {APIProvider} from '@vis.gl/react-google-maps';
import {
  ArrowUp,
  ArrowUpRight,
  Clock,
  FileCheck2,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import {useCallback, useEffect, useState} from 'react';
import {CurtainReveal} from './components/CurtainReveal';
import {GoogleReviewsSection, LiveStudioPlace} from './components/GoogleReviewsSection';
import {InstagramShowcase} from './components/InstagramShowcase';
import {Navbar, ThemeMode} from './components/Navbar';
import {ProtectionLab} from './components/ProtectionLab';
import {
  BookingRequestModal,
  ComparisonGalleryModal,
  RequestModalKind,
  ServiceDetailModal,
} from './components/StudioModals';
import {StudioMap} from './components/StudioMap';
import {TransformationCompare} from './components/TransformationCompare';
import {SERVICES, ServiceItem, STUDIO_INFO, STUDIO_PROCESS} from './data/studioData';

declare const __GOOGLE_MAPS_FALLBACK_KEY__: string;

const GOOGLE_MAPS_API_KEY: string =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  (typeof __GOOGLE_MAPS_FALLBACK_KEY__ !== 'undefined' ? __GOOGLE_MAPS_FALLBACK_KEY__ : '');

const FEATURED_SERVICES = SERVICES.slice(0, 2);
const EXPLORER_SERVICES = SERVICES.slice(2);

function getInitialTheme(): ThemeMode {
  try {
    const saved = window.localStorage.getItem('kd-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Ignore storage access errors
  }
  return 'dark';
}

function StudioContent({hasApiKey}: {hasApiKey: boolean}) {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [activeSection, setActiveSection] = useState<string>('services');
  const [selectedExplorerService, setSelectedExplorerService] = useState<ServiceItem>(
    EXPLORER_SERVICES[0],
  );
  const [activeServiceModal, setActiveServiceModal] = useState<ServiceItem | null>(null);
  const [requestModal, setRequestModal] = useState<{
    open: boolean;
    kind: RequestModalKind;
    service: string;
    notes: string;
  }>({
    open: false,
    kind: 'appointment',
    service: SERVICES[0].name,
    notes: '',
  });
  const [galleryOpen, setGalleryOpen] = useState<boolean>(false);
  const [livePlace, setLivePlace] = useState<LiveStudioPlace | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  // Sync theme state to <html> class, colorScheme, theme-color meta, and localStorage
  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = theme;
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', isDark ? '#090b0e' : '#f6f4ef');
    }
    try {
      window.localStorage.setItem('kd-theme', theme);
    } catch {
      // Ignore storage access errors
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Listen for Google Maps Platform quota events at top-level app state
  useEffect(() => {
    const onQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  // Active nav highlight via IntersectionObserver
  useEffect(() => {
    const ids = ['services', 'lab', 'transformations', 'reviews', 'contact'];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      {rootMargin: '-25% 0px -55% 0px'},
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const openRequest = useCallback(
    (kind: RequestModalKind, serviceName = SERVICES[0].name, notes = '') => {
      setActiveServiceModal(null);
      setRequestModal({open: true, kind, service: serviceName, notes});
    },
    [],
  );

  const handlePlaceLoaded = useCallback((place: LiveStudioPlace) => {
    setLivePlace(place);
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f4ef] dark:bg-[#090b0e] text-[#14171c] dark:text-[#f2f3f5] overflow-x-clip transition-colors duration-200">
      {/* Compact Sticky Quota Banner (Demo Key Defense) */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Skip link */}
      <a
        href="#services"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded-md"
      >
        Skip to services
      </a>

      {/* 3-Zone Responsive Navigation Bar with Uploaded DK Logo & Light/Dark Toggle */}
      <Navbar
        activeSection={activeSection}
        onBookClick={() => openRequest('appointment')}
        hasQuotaBanner={quotaExceeded}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main id="home">
        {/* ================= HERO RED-CURTAIN BLACK FORTUNER REVEAL ================= */}
        <CurtainReveal onBookClick={() => openRequest('appointment')} />

        {/* ================= 01. THE STUDIO (INTRO) ================= */}
        <section className="mx-auto w-[92%] sm:w-[88%] max-w-[1320px] py-16 sm:py-24 border-b border-neutral-900/12 dark:border-[#dbe8f6]/15 grid grid-cols-1 lg:grid-cols-[0.9fr_2fr_0.75fr] gap-6 lg:gap-10 items-start">
          <p className="flex items-center gap-3 text-[11px] font-mono tracking-[0.18em] text-[#8c6628] dark:text-[#dfc28d]">
            <span className="w-6 h-px bg-[#8c6628] dark:bg-[#c5a36c]" aria-hidden="true" />
            01. The Studio
          </p>

          <div>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#14171c] dark:text-[#f7f4ef] leading-[1.06] text-balance mb-5">
              Care that goes
              <br />
              <em className="italic text-[#8c6628] dark:text-[#d9bc89]">beyond the shine.</em>
            </h2>
            <p className="text-sm sm:text-base text-[#525d6b] dark:text-[#b9c1ca] leading-relaxed max-w-lg">
              From the first safe foam wash to the final gloss inspection, choose the treatment that
              fits your vehicle, its paint condition, and the way you drive across Bihar.
            </p>
          </div>

          <div className="hidden lg:flex flex-col gap-3 font-mono text-[11px] tracking-[0.18em] text-[#64707d] dark:text-[#a6b3bd] pt-2">
            <span className="border-b border-neutral-900/12 dark:border-white/12 pb-3">Protect</span>
            <span className="border-b border-neutral-900/12 dark:border-white/12 pb-3">Restore</span>
            <span className="border-b border-neutral-900/12 dark:border-white/12 pb-3">
              Personalise
            </span>
          </div>
        </section>

        {/* ================= 02. TREATMENTS (SERVICES) ================= */}
        <section
          id="services"
          className="mx-auto w-[92%] sm:w-[88%] max-w-[1320px] py-16 sm:py-24 lg:py-28"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-14">
            <div>
              <p className="flex items-center gap-3 text-[11px] font-mono tracking-[0.18em] text-[#8c6628] dark:text-[#dfc28d] mb-3">
                <span className="w-6 h-px bg-[#8c6628] dark:bg-[#c5a36c]" aria-hidden="true" />
                02. Treatments
              </p>
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#14171c] dark:text-[#f7f4ef] leading-[1.04]">
                Choose your finish.
              </h2>
            </div>
            <p className="text-sm sm:text-[15px] text-[#525d6b] dark:text-[#b9c1ca] leading-relaxed max-w-sm">
              Seven dedicated ways to care for your vehicle. Explore each treatment, then request a
              tailored consultation.
            </p>
          </div>

          {/* Featured Services: 01 Ceramic & 02 PPF */}
          <div className="space-y-8 sm:space-y-14">
            {FEATURED_SERVICES.map((item, idx) => {
              const isReversed = idx === 1;
              return (
                <article
                  key={item.id}
                  className={`relative isolate flex flex-col lg:flex-row items-stretch lg:items-center lg:min-h-[420px] lg:py-10 ${
                    isReversed ? 'lg:justify-start' : 'lg:justify-end'
                  }`}
                >
                  {/* Feature Background Image */}
                  <div
                    className={`relative lg:absolute lg:inset-y-0 aspect-[16/10] lg:aspect-auto rounded-xl lg:rounded-lg overflow-hidden border border-neutral-900/12 dark:border-[#a5b6c1]/20 -z-10 ${
                      isReversed ? 'lg:left-[8%] lg:right-0' : 'lg:left-0 lg:right-[8%]'
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.imageAlt}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover brightness-90 dark:brightness-85 contrast-105"
                    />
                    <div
                      aria-hidden="true"
                      className={`absolute inset-0 ${
                        isReversed
                          ? 'bg-gradient-to-l from-transparent via-black/15 to-black/55 dark:via-[#090b0e]/25 dark:to-[#090b0e]/75'
                          : 'bg-gradient-to-r from-transparent via-black/15 to-black/55 dark:via-[#090b0e]/25 dark:to-[#090b0e]/75'
                      }`}
                    />
                  </div>

                  {/* Floating Glass Content Card */}
                  <div
                    className={`kd-glass-strong rounded-xl p-6 sm:p-8 w-[94%] sm:w-[88%] lg:w-[430px] -mt-8 lg:mt-0 z-10 ${
                      isReversed ? 'mr-auto' : 'ml-auto'
                    }`}
                  >
                    <span className="font-mono text-[11px] tracking-[0.15em] text-[#8c6628] dark:text-[#cdb58c]">
                      {item.number} · {item.category}
                    </span>
                    <h3 className="font-serif text-3xl sm:text-5xl text-[#14171c] dark:text-[#f7f4ef] leading-[1.05] mt-2 mb-3">
                      {item.name}.
                    </h3>
                    <p className="text-sm text-[#4b5563] dark:text-[#c4cdd6] leading-relaxed mb-5">
                      {item.tagline}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveServiceModal(item)}
                      className="inline-flex items-center justify-between gap-4 min-h-[44px] py-2 border-b border-[#8c6628]/60 dark:border-[#b99c65]/60 text-sm font-medium text-[#8c6628] dark:text-[#e7c88f] hover:text-[#6e4d18] dark:hover:text-[#f7e1b3] transition-colors"
                    >
                      <span>Discover {item.name.toLowerCase()}</span>
                      <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Interactive Service Explorer (Treatments 03 - 07) */}
          <div className="mt-14 sm:mt-20 grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-6 lg:gap-10 items-stretch">
            {/* Active Treatment Visual Card (Dark scrim photography) */}
            <div className="relative isolate min-h-[340px] sm:min-h-[420px] rounded-xl overflow-hidden border border-neutral-900/12 dark:border-[#dbe8f6]/18 flex flex-col justify-end p-6 sm:p-8 bg-[#0e141b]">
              <img
                src={selectedExplorerService.image}
                alt={selectedExplorerService.imageAlt}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover -z-20 transition-opacity duration-300"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#090d12]/95 via-[#090d12]/55 to-transparent -z-10"
              />
              <div className="max-w-md space-y-3">
                <span className="font-mono text-[11px] tracking-[0.15em] text-[#e2c897]">
                  {selectedExplorerService.number} · {selectedExplorerService.category}
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl text-[#f7f4ef] leading-tight">
                  {selectedExplorerService.name}
                </h3>
                <p className="text-sm text-[#d0d8e0] leading-relaxed">
                  {selectedExplorerService.tagline}
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveServiceModal(selectedExplorerService)}
                    className="inline-flex items-center justify-between gap-3 min-h-[46px] px-5 py-2.5 rounded-lg kd-glass-media hover:bg-white/15 text-sm font-semibold text-[#f2f3f5] transition-colors"
                  >
                    <span>Treatment details</span>
                    <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Selectable Treatments List */}
            <div
              role="group"
              aria-label="Additional studio treatments"
              className="flex flex-col justify-center divide-y divide-neutral-900/12 dark:divide-[#dbe8f6]/15 border-y border-neutral-900/12 dark:border-[#dbe8f6]/15"
            >
              {EXPLORER_SERVICES.map((svc) => {
                const isSelected = selectedExplorerService.id === svc.id;
                return (
                  <button
                    key={svc.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedExplorerService(svc)}
                    className={`grid grid-cols-[36px_1fr_24px] items-center gap-3 min-h-[58px] py-4 px-2 text-left transition-all duration-200 ${
                      isSelected
                        ? 'text-[#8c6628] dark:text-[#e3c58f] pl-4 bg-neutral-900/[0.04] dark:bg-white/[0.03]'
                        : 'text-[#1c2128] dark:text-[#e1e6ec] hover:text-[#8c6628] dark:hover:text-[#e3c58f] hover:pl-3'
                    }`}
                  >
                    <span className="font-mono text-xs text-[#64707d] dark:text-[#9aa8b5] tabular-nums">
                      {svc.number}
                    </span>
                    <span className="text-base sm:text-lg font-medium tracking-tight">
                      {svc.name}
                    </span>
                    <ArrowUpRight
                      className={`w-4 h-4 justify-self-end transition-transform ${
                        isSelected
                          ? 'text-[#8c6628] dark:text-[#e3c58f] translate-x-0.5 -translate-y-0.5'
                          : 'text-[#8c6628]/60 dark:text-[#b8a178]/70'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= 03. THE PROTECTION LAB ================= */}
        <ProtectionLab
          onRequestTreatment={(serviceName, notes) => openRequest('quote', serviceName, notes)}
        />

        {/* ================= 04. TRANSFORMATION COMPARE ================= */}
        <TransformationCompare onOpenGallery={() => setGalleryOpen(true)} />

        {/* ================= 05. INSIDE THE STUDIO ================= */}
        <section
          id="studio"
          className="relative isolate min-h-[520px] sm:min-h-[600px] flex items-center border-y border-neutral-900/12 dark:border-[#dbe8f6]/15 overflow-hidden"
        >
          <div aria-hidden="true" className="absolute inset-0 -z-10">
            <img
              src="/assets/kd/studio.webp"
              alt="Automotive machine polishing inside detailing studio"
              referrerPolicy="no-referrer"
              loading="lazy"
              className="w-full h-full object-cover brightness-85 dark:brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#090b0e]/80 via-[#090b0e]/50 to-[#090b0e]/25 dark:from-[#090b0e]/92 dark:via-[#090b0e]/65 dark:to-[#090b0e]/35" />
          </div>

          <div className="mx-auto w-[92%] sm:w-[88%] max-w-[1320px] py-14 sm:py-20">
            <div className="kd-glass-strong rounded-2xl p-6 sm:p-10 max-w-2xl">
              <p className="flex items-center gap-3 text-[11px] font-mono tracking-[0.18em] text-[#8c6628] dark:text-[#dfc28d] mb-3">
                <span className="w-6 h-px bg-[#8c6628] dark:bg-[#c5a36c]" aria-hidden="true" />
                05. Inside the Studio
              </p>
              <h2 className="font-serif text-4xl sm:text-5xl text-[#14171c] dark:text-[#f7f4ef] leading-[1.06] mb-3">
                From inspection
                <br />
                <em className="italic text-[#8c6628] dark:text-[#d9bc89]">to handover.</em>
              </h2>
              <p className="text-sm sm:text-[15px] text-[#4b5563] dark:text-[#c7d0da] leading-relaxed mb-7 max-w-lg">
                Every vehicle goes through a structured four-step studio journey so paint depth,
                prep chemistry, and curing stay consistent.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-7">
                {STUDIO_PROCESS.map((item) => (
                  <div
                    key={item.step}
                    className="rounded-lg border border-neutral-900/12 dark:border-white/12 bg-white/80 dark:bg-[#0a1016]/75 p-3.5"
                  >
                    <span className="font-mono text-xs text-[#8c6628] dark:text-[#d3b27b] tabular-nums block mb-1">
                      {item.step}
                    </span>
                    <strong className="text-sm font-semibold text-[#14171c] dark:text-[#f7f4ef] block">
                      {item.label}
                    </strong>
                    <p className="text-[11px] text-[#525d6b] dark:text-[#a7b3bf] leading-snug mt-1 hidden sm:block">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => openRequest('appointment')}
                className="inline-flex items-center justify-between gap-4 min-h-[48px] px-6 py-3 rounded-lg bg-[#d3b27b] hover:bg-[#e5c792] text-[#17120c] text-sm font-semibold transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] w-full sm:w-auto"
              >
                <span>Plan a studio visit</span>
                <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        {/* ================= 06. LIVE GOOGLE MAPS FEEDBACKS ================= */}
        <GoogleReviewsSection hasApiKey={hasApiKey} onPlaceLoaded={handlePlaceLoaded} />

        {/* ================= INSTAGRAM SHOWCASE (@king_detailing0707) ================= */}
        <InstagramShowcase />

        {/* ================= 07. BOOKING & CONSULTATION ================= */}
        <section
          id="booking"
          className="border-y border-neutral-900/12 dark:border-[#dbe8f6]/15 bg-[#ede9e0] dark:bg-[#0d1218] py-16 sm:py-24 transition-colors duration-200"
        >
          <div className="mx-auto w-[92%] sm:w-[88%] max-w-[1320px] grid grid-cols-1 lg:grid-cols-[1.1fr_0.95fr] gap-8 lg:gap-14 items-center">
            <div>
              <p className="flex items-center gap-3 text-[11px] font-mono tracking-[0.18em] text-[#8c6628] dark:text-[#dfc28d] mb-3">
                <span className="w-6 h-px bg-[#8c6628] dark:bg-[#c5a36c]" aria-hidden="true" />
                07. Your Next Visit
              </p>
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#14171c] dark:text-[#f7f4ef] leading-[1.04] mb-4 text-balance">
                Tell us about
                <br />
                <em className="italic text-[#8c6628] dark:text-[#d9bc89]">your car.</em>
              </h2>
              <p className="text-sm sm:text-[15px] text-[#4b5563] dark:text-[#b9c1ca] leading-relaxed max-w-md mb-7">
                Choose your treatment. Request a studio appointment or a personalized quotation
                directly from our team in Arrah.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => openRequest('appointment')}
                  className="inline-flex items-center justify-between sm:justify-center gap-3 min-h-[48px] px-6 py-3 rounded-lg bg-[#d3b27b] hover:bg-[#e5c792] text-[#17120c] text-sm font-semibold whitespace-nowrap transition-colors"
                >
                  <span>Request appointment</span>
                  <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => openRequest('quote')}
                  className="inline-flex items-center justify-between sm:justify-center gap-3 min-h-[48px] px-6 py-3 rounded-lg kd-glass hover:bg-white dark:hover:bg-white/10 text-[#14171c] dark:text-[#f2f3f5] text-sm font-semibold whitespace-nowrap transition-colors"
                >
                  <span>Request quotation</span>
                  <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </button>
              </div>
              <p className="text-xs text-[#64707d] dark:text-[#909eab] mt-4">
                Appointments and final pricing are confirmed by the studio after vehicle review.
              </p>
            </div>

            <div className="kd-glass rounded-2xl p-6 sm:p-8 space-y-5">
              <span className="font-mono text-[11px] tracking-[0.16em] text-[#8c6628] dark:text-[#e2c897] block">
                Studio Consultation Flow
              </span>
              <div className="space-y-4 divide-y divide-neutral-900/10 dark:divide-white/10">
                <div className="flex items-start gap-4 pt-1">
                  <span className="font-mono text-sm text-[#8c6628] dark:text-[#d3b27b] tabular-nums pt-0.5">
                    01
                  </span>
                  <div>
                    <p className="text-sm sm:text-base font-medium text-[#14171c] dark:text-[#f7f4ef]">
                      Choose a treatment
                    </p>
                    <p className="text-xs text-[#525d6b] dark:text-[#a9b5c1] mt-0.5">
                      Protection, paint restoration, wrapping, or maintenance care.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 pt-4">
                  <span className="font-mono text-sm text-[#8c6628] dark:text-[#d3b27b] tabular-nums pt-0.5">
                    02
                  </span>
                  <div>
                    <p className="text-sm sm:text-base font-medium text-[#14171c] dark:text-[#f7f4ef]">
                      Tell us about your vehicle
                    </p>
                    <p className="text-xs text-[#525d6b] dark:text-[#a9b5c1] mt-0.5">
                      Share your car make, model, and current paint condition.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 pt-4">
                  <span className="font-mono text-sm text-[#8c6628] dark:text-[#d3b27b] tabular-nums pt-0.5">
                    03
                  </span>
                  <div>
                    <p className="text-sm sm:text-base font-medium text-[#14171c] dark:text-[#f7f4ef]">
                      Confirm your preferred visit
                    </p>
                    <p className="text-xs text-[#525d6b] dark:text-[#a9b5c1] mt-0.5">
                      Receive bay confirmation directly via WhatsApp or phone call.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 08. FIND US & INTERACTIVE GOOGLE MAP ================= */}
        <section
          id="contact"
          className="mx-auto w-[92%] sm:w-[88%] max-w-[1320px] py-16 sm:py-24"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.15fr] gap-8 lg:gap-12 items-start">
            <div className="space-y-6">
              <div>
                <p className="flex items-center gap-3 text-[11px] font-mono tracking-[0.18em] text-[#8c6628] dark:text-[#dfc28d] mb-3">
                  <span className="w-6 h-px bg-[#8c6628] dark:bg-[#c5a36c]" aria-hidden="true" />
                  08. Find Us
                </p>
                <h2 className="font-serif text-4xl sm:text-5xl text-[#14171c] dark:text-[#f7f4ef] leading-[1.06] mb-4">
                  Visit the studio.
                </h2>
                <div className="space-y-2.5 text-sm sm:text-[15px] text-[#4b5563] dark:text-[#c7d0da]">
                  <p className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#8c6628] dark:text-[#d3b27b] shrink-0 mt-1" aria-hidden="true" />
                    <span>{STUDIO_INFO.addressLine}</span>
                  </p>
                  <p className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-[#8c6628] dark:text-[#d3b27b] shrink-0 mt-1" aria-hidden="true" />
                    <span>{STUDIO_INFO.hours}</span>
                  </p>
                  <p className="flex items-start gap-2.5">
                    <FileCheck2
                      className="w-4 h-4 text-[#8c6628] dark:text-[#d3b27b] shrink-0 mt-1"
                      aria-hidden="true"
                    />
                    <span>
                      GSTIN:{' '}
                      <span className="font-mono text-[#14171c] dark:text-[#f2f3f5] tracking-wide tabular-nums">
                        {STUDIO_INFO.gstin}
                      </span>
                    </span>
                  </p>
                </div>
              </div>

              {/* Primary Contact Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={livePlace?.googleMapsUri || STUDIO_INFO.googleMapsShortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between gap-3 min-h-[48px] px-5 py-3 rounded-lg bg-[#d3b27b] hover:bg-[#e5c792] text-[#17120c] text-sm font-semibold transition-colors"
                >
                  <span>Get directions</span>
                  <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </a>
                <a
                  href={STUDIO_INFO.phoneHref}
                  className="inline-flex items-center justify-between gap-3 min-h-[48px] px-5 py-3 rounded-lg kd-glass hover:bg-white dark:hover:bg-white/10 text-[#14171c] dark:text-[#f2f3f5] text-sm font-semibold transition-colors"
                >
                  <span className="inline-flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#8c6628] dark:text-[#e3c99b]" aria-hidden="true" />
                    <span>Call studio</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                </a>
              </div>

              {/* Direct Social & Messaging Channels */}
              <div className="divide-y divide-neutral-900/12 dark:divide-[#dbe8f6]/15 border-y border-neutral-900/12 dark:border-[#dbe8f6]/15">
                <a
                  href={STUDIO_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between min-h-[56px] py-3.5 text-[#14171c] dark:text-[#f2f3f5] hover:text-[#8c6628] dark:hover:text-[#e8c994] transition-colors group"
                >
                  <span className="flex items-center gap-3">
                    <Instagram className="w-5 h-5 text-[#8c6628] dark:text-[#d3b27b]" aria-hidden="true" />
                    <span>
                      <span className="block text-sm sm:text-base font-medium">Instagram</span>
                      <span className="block text-xs font-mono text-[#64707d] dark:text-[#9aa8b5]">
                        {STUDIO_INFO.instagramHandle}
                      </span>
                    </span>
                  </span>
                  <ArrowUpRight
                    className="w-4 h-4 text-[#8c6628] dark:text-[#b8a178] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </a>

                <a
                  href={STUDIO_INFO.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between min-h-[56px] py-3.5 text-[#14171c] dark:text-[#f2f3f5] hover:text-[#8c6628] dark:hover:text-[#e8c994] transition-colors group"
                >
                  <span className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-[#8c6628] dark:text-[#d3b27b]" aria-hidden="true" />
                    <span>
                      <span className="block text-sm sm:text-base font-medium">WhatsApp Desk</span>
                      <span className="block text-xs font-mono text-[#64707d] dark:text-[#9aa8b5] tabular-nums">
                        +91 62017 13029
                      </span>
                    </span>
                  </span>
                  <ArrowUpRight
                    className="w-4 h-4 text-[#8c6628] dark:text-[#b8a178] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>

            {/* Interactive Google Map */}
            <StudioMap hasApiKey={hasApiKey} livePlace={livePlace} />
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-neutral-900/12 dark:border-[#dbe8f6]/15 bg-[#ece8df] dark:bg-[#07090c] transition-colors duration-200">
        <div className="mx-auto w-[92%] sm:w-[88%] max-w-[1320px] py-8 sm:py-10 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-3.5">
              <span className="w-11 h-11 rounded-lg overflow-hidden bg-black border border-black/15 dark:border-white/15 p-0.5 shrink-0 flex items-center justify-center">
                <img
                  src={STUDIO_INFO.logoPath}
                  alt="King Detailing Studio logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              </span>
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-[#14171c] dark:text-[#f6f3ef]">
                  {STUDIO_INFO.shortName}
                </p>
                <p className="text-xs text-[#525d6b] dark:text-[#9aa8b5] mt-0.5 max-w-md">
                  {STUDIO_INFO.addressLine}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs text-[#4b5563] dark:text-[#b9c1ca]">
              <a
                href={STUDIO_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#8c6628] dark:hover:text-[#e8c994] transition-colors inline-flex items-center gap-1.5"
              >
                <Instagram className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{STUDIO_INFO.instagramHandle}</span>
              </a>
              <a
                href={STUDIO_INFO.googleMapsShortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#8c6628] dark:hover:text-[#e8c994] transition-colors"
              >
                Google Maps
              </a>
              <a
                href="#home"
                className="inline-flex items-center gap-1 text-[#8c6628] dark:text-[#e8c994] hover:text-[#6e4d18] dark:hover:text-[#f7e1b3] transition-colors"
              >
                <span>Back to top</span>
                <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="pt-5 border-t border-neutral-900/10 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-[#5a6573] dark:text-[#8f9eab]">
            <p>
              © {STUDIO_INFO.copyrightYear} {STUDIO_INFO.name}. All rights reserved.
            </p>
            <p className="font-mono text-[11px] tracking-wider text-[#3b444f] dark:text-[#aebac5] tabular-nums">
              GSTIN: {STUDIO_INFO.gstin}
            </p>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      <ServiceDetailModal
        service={activeServiceModal}
        onClose={() => setActiveServiceModal(null)}
        onBook={(serviceName) => openRequest('appointment', serviceName)}
        onQuote={(serviceName) => openRequest('quote', serviceName)}
      />

      <BookingRequestModal
        open={requestModal.open}
        kind={requestModal.kind}
        initialService={requestModal.service}
        initialNotes={requestModal.notes}
        onClose={() => setRequestModal((prev) => ({...prev, open: false}))}
      />

      <ComparisonGalleryModal open={galleryOpen} onClose={() => setGalleryOpen(false)} />
    </div>
  );
}

export default function App() {
  const hasApiKey = Boolean(GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY.trim().length > 0);

  if (!hasApiKey) {
    return <StudioContent hasApiKey={false} />;
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} language="en" region="IN">
      <StudioContent hasApiKey={true} />
    </APIProvider>
  );
}
