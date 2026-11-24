import {ArrowUpRight, Instagram, Menu, MessageCircle, Moon, Phone, Sun, X} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {STUDIO_INFO} from '../data/studioData';

export type ThemeMode = 'dark' | 'light';

interface NavbarProps {
  activeSection: string;
  onBookClick: () => void;
  hasQuotaBanner?: boolean;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

const NAV_LINKS = [
  {id: 'services', label: 'Services'},
  {id: 'lab', label: 'Protection Lab'},
  {id: 'transformations', label: 'Transformations'},
  {id: 'reviews', label: 'Reviews'},
  {id: 'contact', label: 'Contact'},
];

export function Navbar({
  activeSection,
  onBookClick,
  hasQuotaBanner,
  theme,
  onToggleTheme,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [menuOpen]);

  const isDark = theme === 'dark';

  return (
    <header
      ref={headerRef}
      className={`fixed left-3 right-3 sm:left-[4%] sm:right-[4%] z-40 transition-all duration-300 ${
        hasQuotaBanner ? 'top-12 sm:top-14' : 'top-2.5 sm:top-5'
      }`}
    >
      <div
        className={`mx-auto max-w-[1360px] rounded-xl px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-3 lg:gap-8 transition-colors duration-300 ${
          scrolled
            ? 'bg-white/95 dark:bg-[#0b1016]/92 border border-neutral-900/12 dark:border-[#dbe8f6]/18 shadow-[0_10px_30px_rgba(20,23,28,0.1)] dark:shadow-[0_10px_34px_rgba(0,0,0,0.55)] backdrop-blur-xl'
            : 'kd-glass'
        }`}
      >
        {/* Zone 1: Brand mark with uploaded logo */}
        <a
          href="#home"
          onClick={() => setMenuOpen(false)}
          aria-label="King Detailing Studio home"
          className="flex items-center gap-2.5 sm:gap-3 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#8c6628] dark:focus-visible:outline-[#e3c99b] focus-visible:outline-offset-4 rounded-md"
        >
          <span className="h-9 w-9 sm:h-11 sm:w-11 rounded-lg overflow-hidden bg-black border border-black/15 dark:border-white/15 shrink-0 flex items-center justify-center">
            <img
              src={STUDIO_INFO.logoPath}
              alt="King Detailing Studio logo"
              referrerPolicy="no-referrer"
              className="h-full w-full object-contain p-0.5"
            />
          </span>
          <span className="font-sans text-xs sm:text-base font-semibold tracking-[0.18em] text-[#14171c] dark:text-[#f6f3ef] whitespace-nowrap">
            {STUDIO_INFO.shortName}
          </span>
        </a>

        {/* Zone 2: Clean single-line desktop nav links */}
        <nav
          aria-label="Main navigation"
          className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-[#434c57] dark:text-[#d8dee6]"
        >
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`py-2 whitespace-nowrap shrink-0 transition-colors duration-200 border-b ${
                  isActive
                    ? 'text-[#8c6628] dark:text-[#e8c994] border-[#8c6628] dark:border-[#d3b27b]'
                    : 'border-transparent hover:text-[#14171c] dark:hover:text-[#f0d3a0] hover:border-[#8c6628]/40 dark:hover:border-[#d3b27b]/40'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Theme Toggle + Primary CTA + Mobile Menu Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={!isDark}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-lg border border-neutral-900/15 dark:border-white/15 bg-neutral-900/[0.04] dark:bg-white/[0.06] text-[#14171c] dark:text-[#f2f3f5] hover:bg-neutral-900/10 dark:hover:bg-white/12 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-[#8c6628] dark:focus-visible:outline-[#e3c99b] focus-visible:outline-offset-2"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[#e3c99b]" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4 text-[#14171c]" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onBookClick();
            }}
            className="inline-flex items-center justify-center gap-2 min-h-[40px] sm:min-h-[42px] px-3 sm:px-5 py-2 rounded-lg bg-[#d3b27b] hover:bg-[#e5c792] text-[#17120c] text-xs sm:text-[13px] font-semibold tracking-tight whitespace-nowrap shrink-0 transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] active:scale-[0.98]"
          >
            <span>Book your visit</span>
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0 hidden sm:block" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-lg border border-neutral-900/15 dark:border-white/15 bg-neutral-900/[0.04] dark:bg-white/[0.06] text-[#14171c] dark:text-[#f2f3f5] hover:bg-neutral-900/10 dark:hover:bg-white/12 transition-colors shrink-0"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {menuOpen && (
        <div
          id="mobile-nav-drawer"
          className="lg:hidden mt-2 mx-auto max-w-[1360px] rounded-xl bg-white/98 dark:bg-[#0e151e]/98 border border-neutral-900/12 dark:border-[#dbe8f6]/18 shadow-[0_24px_60px_rgba(20,23,28,0.18)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.72)] backdrop-blur-2xl overflow-hidden"
        >
          <nav
            aria-label="Mobile navigation"
            className="flex flex-col px-4 py-2 divide-y divide-neutral-900/10 dark:divide-white/10"
          >
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between min-h-[48px] py-3 text-[15px] font-medium transition-colors ${
                    isActive
                      ? 'text-[#8c6628] dark:text-[#e8c994]'
                      : 'text-[#1c2128] dark:text-[#e8edf2] hover:text-[#8c6628] dark:hover:text-[#e8c994]'
                  }`}
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-50" aria-hidden="true" />
                </a>
              );
            })}
          </nav>

          {/* Direct mobile user-access quick bar: Instagram, WhatsApp, Call */}
          <div className="px-4 py-3.5 bg-neutral-900/[0.03] dark:bg-white/[0.03] border-t border-neutral-900/10 dark:border-white/10">
            <p className="text-[11px] font-mono text-[#525d6b] dark:text-[#b9c1ca] mb-2.5">
              Quick studio access · {STUDIO_INFO.locationShort}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <a
                href={STUDIO_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 min-h-[44px] px-2.5 rounded-lg border border-neutral-900/12 dark:border-white/15 bg-white dark:bg-white/[0.04] hover:bg-neutral-100 dark:hover:bg-white/10 text-xs font-medium text-[#14171c] dark:text-[#f2f3f5] transition-colors"
              >
                <Instagram className="w-4 h-4 text-[#8c6628] dark:text-[#e3c99b] shrink-0" aria-hidden="true" />
                <span>Instagram</span>
              </a>
              <a
                href={STUDIO_INFO.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 min-h-[44px] px-2.5 rounded-lg border border-neutral-900/12 dark:border-white/15 bg-white dark:bg-white/[0.04] hover:bg-neutral-100 dark:hover:bg-white/10 text-xs font-medium text-[#14171c] dark:text-[#f2f3f5] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#8c6628] dark:text-[#e3c99b] shrink-0" aria-hidden="true" />
                <span>WhatsApp</span>
              </a>
              <a
                href={STUDIO_INFO.phoneHref}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 min-h-[44px] px-2.5 rounded-lg border border-neutral-900/12 dark:border-white/15 bg-white dark:bg-white/[0.04] hover:bg-neutral-100 dark:hover:bg-white/10 text-xs font-medium text-[#14171c] dark:text-[#f2f3f5] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#8c6628] dark:text-[#e3c99b] shrink-0" aria-hidden="true" />
                <span>Call</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
