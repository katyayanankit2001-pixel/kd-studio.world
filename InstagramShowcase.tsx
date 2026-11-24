import {ArrowUpRight, Check, Copy, Instagram} from 'lucide-react';
import {useState} from 'react';
import {INSTAGRAM_HIGHLIGHTS, STUDIO_INFO} from '../data/studioData';

export function InstagramShowcase() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(STUDIO_INFO.instagramHandle);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      id="instagram"
      className="mx-auto w-[92%] sm:w-[88%] max-w-[1320px] py-16 sm:py-24 border-t border-neutral-900/12 dark:border-[#dbe8f6]/12"
    >
      {/* Profile Access Header */}
      <div className="kd-glass rounded-2xl p-5 sm:p-8 mb-6 sm:mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-black border border-[#8c6628]/40 dark:border-[#e3c99b]/40 shrink-0 p-1">
            <img
              src={STUDIO_INFO.logoPath}
              alt="King Detailing Studio Instagram profile logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-mono tracking-[0.16em] text-[#8c6628] dark:text-[#dfc28d] mb-1">
              Official Studio Instagram
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#14171c] dark:text-[#f7f4ef] leading-tight truncate">
              {STUDIO_INFO.instagramHandle}
            </h2>
            <p className="text-xs sm:text-sm text-[#525d6b] dark:text-[#b9c1ca] mt-1">
              Daily vehicle deliveries, ceramic coating reels, PPF installations, and custom wraps
              from Arrah.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 min-h-[46px] px-4 py-2.5 rounded-lg border border-neutral-900/15 dark:border-white/15 bg-white dark:bg-white/[0.04] hover:bg-neutral-100 dark:hover:bg-white/10 text-sm font-medium text-[#14171c] dark:text-[#e8edf2] whitespace-nowrap transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#8c6628] dark:text-[#e3c99b]" aria-hidden="true" />
                <span>Handle copied</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#525d6b] dark:text-[#b9c1ca]" aria-hidden="true" />
                <span>Copy {STUDIO_INFO.instagramHandle}</span>
              </>
            )}
          </button>

          <a
            href={STUDIO_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 min-h-[46px] px-5 py-2.5 rounded-lg bg-[#d3b27b] hover:bg-[#e5c792] text-[#17120c] text-sm font-semibold whitespace-nowrap transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
          >
            <Instagram className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Open Instagram</span>
            <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* 4 Direct-Access Visual Tiles (Dark scrim over photography ensures crisp white legibility in both themes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {INSTAGRAM_HIGHLIGHTS.map((item) => (
          <a
            key={item.id}
            href={STUDIO_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-[4/3] sm:aspect-[4/5] rounded-xl overflow-hidden border border-neutral-900/12 dark:border-[#dbe8f6]/15 bg-[#101419] flex flex-col justify-end p-4 sm:p-5 transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-[#8c6628] dark:focus-visible:outline-[#e3c99b]"
          >
            <img
              src={item.image}
              alt={item.imageAlt}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#090b0e]/95 via-[#090b0e]/45 to-transparent"
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#e2c897] mb-1.5">
                <span>{item.category}</span>
                <ArrowUpRight
                  className="w-4 h-4 opacity-75 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-serif text-2xl text-[#f7f4ef] leading-tight mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-[#c6cfd8] leading-relaxed line-clamp-2">
                {item.caption}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
