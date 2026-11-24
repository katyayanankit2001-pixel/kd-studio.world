import {ArrowUpRight} from 'lucide-react';
import {useEffect, useState} from 'react';
import {PAINT_SWATCHES} from '../data/studioData';

type ProtectionLayerType = 'ceramic' | 'ppf';
type FinishType = 'gloss' | 'satin' | 'matte';

interface ProtectionLabProps {
  onRequestTreatment: (serviceName: string, notes: string) => void;
}

const SHEEN_BY_FINISH: Record<FinishType, number> = {
  gloss: 0.9,
  satin: 0.5,
  matte: 0.16,
};

export function ProtectionLab({onRequestTreatment}: ProtectionLabProps) {
  const [layerType, setLayerType] = useState<ProtectionLayerType>('ceramic');
  const [spread, setSpread] = useState<number>(68);
  const [paintHex, setPaintHex] = useState<string>(PAINT_SWATCHES[0].hex);
  const [finish, setFinish] = useState<FinishType>('gloss');
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const spreadPx = Math.round(spread * (isMobile ? 0.42 : 0.72));
  const sheen = SHEEN_BY_FINISH[finish];
  const protectionTint = layerType === 'ceramic' ? '#9cd9ed' : '#dbc69d';
  const selectedSwatch = PAINT_SWATCHES.find((s) => s.hex === paintHex) ?? PAINT_SWATCHES[0];

  const handleRequestQuote = () => {
    const serviceName = layerType === 'ceramic' ? 'Ceramic coating' : 'Paint protection film';
    const note = `Protection Lab study: ${serviceName}, ${finish} finish, ${selectedSwatch.name} paint reference.`;
    onRequestTreatment(serviceName, note);
  };

  return (
    <section
      id="lab"
      className="kd-lab-bg relative overflow-hidden border-y border-neutral-900/12 dark:border-[#dbe8f6]/15 py-16 sm:py-24 lg:py-28"
    >
      <div className="mx-auto w-[92%] sm:w-[88%] max-w-[1320px]">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-mono tracking-[0.18em] text-[#8c6628] dark:text-[#dfc28d] mb-3">
              <span className="w-6 h-px bg-[#8c6628] dark:bg-[#c5a36c]" aria-hidden="true" />
              03. The Protection Lab
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#14171c] dark:text-[#f7f4ef] leading-[1.04] text-balance">
              Look beneath
              <br />
              <em className="italic text-[#8c6628] dark:text-[#d9bc89]">the surface.</em>
            </h2>
          </div>
          <p className="text-sm sm:text-[15px] leading-relaxed text-[#525d6b] dark:text-[#b9c1ca] max-w-md">
            Compare two distinct approaches to protecting automotive paint. Adjust layer separation,
            colour, and finish to preview how each system sits above factory clearcoat.
          </p>
        </div>

        {/* Interactive Stage */}
        <div className="relative grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-8 lg:gap-10 items-center isolate">
          {/* Ambient orbit ring */}
          <div
            aria-hidden="true"
            className="hidden sm:block pointer-events-none absolute inset-y-4 -left-[8%] right-[28%] rounded-full border border-[#2b6f8c]/15 dark:border-[#b2dceb]/10 -rotate-12 -z-10"
          />

          {/* 3D Isometric Layers Visual */}
          <div className="lab-perspective relative min-h-[290px] sm:min-h-[420px] lg:min-h-[480px] rounded-2xl border border-neutral-900/12 dark:border-[#b2dceb]/15 bg-[#121a24] dark:bg-[#090f16]/45 flex flex-col items-center justify-center px-4 py-10 overflow-hidden shadow-[0_14px_38px_rgba(20,23,28,0.12)] dark:shadow-none">
            <div
              className="layer-model w-[210px] sm:w-[310px] lg:w-[360px] aspect-[1.45]"
              aria-label="Interactive paint protection layers diagram"
            >
              {/* Layer 1: Vehicle Panel */}
              <div className="lab-slab lab-slab-s1" style={{transform: 'translateZ(0px)'}}>
                <span className="absolute right-2.5 bottom-2.5 px-2 py-1 rounded bg-[#0c1723]/80 font-mono text-[9px] sm:text-[10px] tracking-wider text-[#f0f5f7]">
                  Vehicle panel
                </span>
              </div>

              {/* Layer 2: Base Paint */}
              <div
                className="lab-slab lab-slab-s2"
                style={{
                  transform: `translateZ(${spreadPx}px)`,
                  background: `linear-gradient(120deg, rgba(255,255,255,0.34), transparent 36%, rgba(0,0,0,0.32) 72%), ${paintHex}`,
                }}
              >
                <span className="absolute right-2.5 bottom-2.5 px-2 py-1 rounded bg-[#0c1723]/80 font-mono text-[9px] sm:text-[10px] tracking-wider text-[#f0f5f7]">
                  Base paint
                </span>
              </div>

              {/* Layer 3: Clearcoat */}
              <div
                className="lab-slab lab-slab-s3"
                style={{
                  transform: `translateZ(${spreadPx * 2}px)`,
                  opacity: 0.42 + sheen * 0.52,
                  background:
                    'linear-gradient(130deg, rgba(204,233,250,0.44), transparent 42%, rgba(178,220,235,0.18) 80%)',
                }}
              >
                <span className="absolute right-2.5 bottom-2.5 px-2 py-1 rounded bg-[#0c1723]/80 font-mono text-[9px] sm:text-[10px] tracking-wider text-[#f0f5f7]">
                  Clearcoat
                </span>
              </div>

              {/* Layer 4: Top Protection (Ceramic or PPF) */}
              <div
                className="lab-slab lab-slab-s4"
                style={{
                  transform: `translateZ(${spreadPx * 3}px)`,
                  borderColor: protectionTint,
                  background:
                    layerType === 'ceramic'
                      ? `linear-gradient(125deg, rgba(178,220,235,${0.22 + sheen * 0.28}), rgba(255,255,255,0.08) 45%, rgba(156,217,237,0.18))`
                      : `linear-gradient(125deg, rgba(219,198,157,${0.28 + sheen * 0.22}), rgba(255,255,255,0.1) 45%, rgba(219,198,157,0.22))`,
                }}
              >
                <span className="absolute right-2.5 bottom-2.5 px-2 py-1 rounded bg-[#0c1723]/85 font-mono text-[9px] sm:text-[10px] tracking-wider text-[#f0f5f7]">
                  {layerType === 'ceramic' ? 'Ceramic coating' : 'Paint protection film'}
                </span>
              </div>
            </div>

            <p className="absolute bottom-3 left-4 right-4 text-center sm:text-left font-mono text-[10px] tracking-[0.14em] text-[#a5bcc9]">
              Interactive perspective study · {selectedSwatch.name} · {finish} finish
            </p>
          </div>

          {/* Control Panel */}
          <div className="kd-glass rounded-xl p-5 sm:p-7 flex flex-col gap-5">
            <div className="flex items-center justify-between text-[11px] font-mono tracking-[0.14em] text-[#8c6628] dark:text-[#e2c897]">
              <span>Material study</span>
              <span className="text-[#525d6b] dark:text-[#c7d2dd] tabular-nums">
                {layerType === 'ceramic' ? '01 / 02' : '02 / 02'}
              </span>
            </div>

            {/* Ceramic vs PPF Segmented Toggle */}
            <div
              role="group"
              aria-label="Protection type"
              className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-neutral-900/[0.06] dark:bg-[#090e14]/80 border border-neutral-900/10 dark:border-white/10"
            >
              <button
                type="button"
                aria-pressed={layerType === 'ceramic'}
                onClick={() => setLayerType('ceramic')}
                className={`min-h-[44px] rounded-md text-xs sm:text-sm font-semibold transition-all ${
                  layerType === 'ceramic'
                    ? 'bg-[#d3b27b] text-[#17120c] shadow-sm'
                    : 'text-[#4b5563] dark:text-[#c9d3dc] hover:text-[#14171c] dark:hover:text-white'
                }`}
              >
                Ceramic coating
              </button>
              <button
                type="button"
                aria-pressed={layerType === 'ppf'}
                onClick={() => setLayerType('ppf')}
                className={`min-h-[44px] rounded-md text-xs sm:text-sm font-semibold transition-all ${
                  layerType === 'ppf'
                    ? 'bg-[#d3b27b] text-[#17120c] shadow-sm'
                    : 'text-[#4b5563] dark:text-[#c9d3dc] hover:text-[#14171c] dark:hover:text-white'
                }`}
              >
                PPF film
              </button>
            </div>

            <div>
              <h3 className="font-serif text-3xl sm:text-4xl text-[#14171c] dark:text-[#f7f4ef] leading-tight mb-2">
                {layerType === 'ceramic' ? 'Ceramic coating' : 'Paint protection film'}
              </h3>
              <p className="text-sm text-[#525d6b] dark:text-[#b9c1ca] leading-relaxed">
                {layerType === 'ceramic'
                  ? 'A chemical surface treatment that enhances deep gloss and hydrophobic water repellency. It simplifies routine washing, though it is not a substitute for impact-resistant film.'
                  : 'A transparent physical urethane film applied to high-impact or full-body painted panels to shield against gravel, stone chips, and minor road rash.'}
              </p>
            </div>

            {/* Layer Separation Slider */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#2b333d] dark:text-[#d6dee6]">
                <label htmlFor="lab-spread-range" className="font-medium">
                  Separate layers
                </label>
                <output
                  htmlFor="lab-spread-range"
                  className="font-mono text-[#8c6628] dark:text-[#e3c99b] tabular-nums"
                >
                  {spread}%
                </output>
              </div>
              <input
                id="lab-spread-range"
                type="range"
                min={0}
                max={100}
                value={spread}
                onChange={(e) => setSpread(Number(e.target.value))}
                className="kd-range"
              />
            </div>

            {/* Paint Colour Swatches */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#2b333d] dark:text-[#d6dee6]">
                <span className="font-medium">Paint colour reference</span>
                <span className="text-[#5a6573] dark:text-[#9fb0be]">{selectedSwatch.name}</span>
              </div>
              <div role="group" aria-label="Paint colour" className="flex items-center gap-3">
                {PAINT_SWATCHES.map((swatch) => {
                  const active = paintHex === swatch.hex;
                  return (
                    <button
                      key={swatch.id}
                      type="button"
                      aria-label={swatch.name}
                      aria-pressed={active}
                      onClick={() => setPaintHex(swatch.hex)}
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-95 ${
                        active
                          ? 'ring-2 ring-[#8c6628] dark:ring-[#e3c99b] ring-offset-2 ring-offset-white dark:ring-offset-[#101820]'
                          : 'ring-1 ring-neutral-900/20 dark:ring-white/20 hover:ring-neutral-900/45 dark:hover:ring-white/45'
                      }`}
                      style={{backgroundColor: swatch.hex}}
                    />
                  );
                })}
              </div>
            </div>

            {/* Finish Selector */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-[#2b333d] dark:text-[#d6dee6] block">
                Surface finish
              </span>
              <div
                role="group"
                aria-label="Surface finish"
                className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-neutral-900/[0.06] dark:bg-[#090e14]/80 border border-neutral-900/10 dark:border-white/10"
              >
                {(['gloss', 'satin', 'matte'] as FinishType[]).map((mode) => {
                  const active = finish === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFinish(mode)}
                      className={`min-h-[42px] rounded-md text-xs font-semibold capitalize transition-colors ${
                        active
                          ? 'bg-white dark:bg-white/15 text-[#14171c] dark:text-[#f7f4ef] border border-neutral-900/12 dark:border-white/20 shadow-xs'
                          : 'text-[#525d6b] dark:text-[#aebac5] hover:text-[#14171c] dark:hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleRequestQuote}
              className="w-full min-h-[48px] px-5 py-3 rounded-lg bg-[#d3b27b] hover:bg-[#e5c792] text-[#17120c] text-sm font-semibold flex items-center justify-between transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] active:scale-[0.99]"
            >
              <span>Request this treatment</span>
              <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
