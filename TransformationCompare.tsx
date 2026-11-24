import {ArrowUpRight, MoveHorizontal} from 'lucide-react';
import {useState} from 'react';

interface TransformationCompareProps {
  onOpenGallery: () => void;
}

export function TransformationCompare({onOpenGallery}: TransformationCompareProps) {
  const [split, setSplit] = useState<number>(50);

  return (
    <section
      id="transformations"
      className="mx-auto w-[92%] sm:w-[88%] max-w-[1320px] py-16 sm:py-24 lg:py-28"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 sm:mb-12">
        <div>
          <p className="flex items-center gap-3 text-[11px] font-mono tracking-[0.18em] text-[#8c6628] dark:text-[#dfc28d] mb-3">
            <span className="w-6 h-px bg-[#8c6628] dark:bg-[#c5a36c]" aria-hidden="true" />
            04. Transformation
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#14171c] dark:text-[#f7f4ef] leading-[1.04] text-balance">
            The difference
            <br />
            <em className="italic text-[#8c6628] dark:text-[#d9bc89]">is in the detail.</em>
          </h2>
        </div>
        <p className="text-sm sm:text-[15px] leading-relaxed text-[#525d6b] dark:text-[#b9c1ca] max-w-md">
          Slide left or right across the panel to compare swirl-dulled paint against a corrected,
          high-clarity mirror surface.
        </p>
      </div>

      {/* Interactive Touch-Friendly Comparison Frame */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[620px] rounded-xl overflow-hidden border border-neutral-900/15 dark:border-[#dbe8f6]/18 bg-[#0d131a] select-none shadow-[0_14px_40px_rgba(20,23,28,0.12)] dark:shadow-none">
        {/* After Image (Full background) */}
        <img
          src="/assets/kd/comparison-after.webp"
          alt="Corrected high-gloss automotive paint surface after detailing"
          referrerPolicy="no-referrer"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Before Image (Clipped to slider split) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{clipPath: `inset(0 ${100 - split}% 0 0)`}}
        >
          <img
            src="/assets/kd/comparison-before.webp"
            alt="Untreated lower-clarity automotive paint surface before detailing"
            referrerPolicy="no-referrer"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Vertical Divider Line + Handle */}
        <div
          aria-hidden="true"
          className="absolute top-0 bottom-0 w-0.5 bg-[#f7f4ef]/90 shadow-[0_0_20px_rgba(0,0,0,0.65)] pointer-events-none"
          style={{left: `${split}%`}}
        >
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#0b1118]/90 border border-[#e3c99b] text-[#f7f4ef] flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
            <MoveHorizontal className="w-5 h-5" />
          </div>
        </div>

        {/* Top Corner Labels */}
        <span className="absolute top-3 left-3 sm:top-4 sm:left-4 px-2.5 py-1 rounded bg-[#090b0e]/80 font-mono text-[10px] sm:text-xs tracking-[0.14em] text-[#f0f3f6] pointer-events-none">
          Before
        </span>
        <span className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2.5 py-1 rounded bg-[#090b0e]/80 font-mono text-[10px] sm:text-xs tracking-[0.14em] text-[#e3c99b] pointer-events-none">
          After
        </span>

        {/* Accessible Full-Area Touch Slider */}
        <input
          type="range"
          min={0}
          max={100}
          value={split}
          onChange={(e) => setSplit(Number(e.target.value))}
          aria-label="Before and after comparison position"
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize touch-none m-0 z-10"
        />

        <span className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 px-2.5 py-1 rounded bg-[#090b0e]/75 font-mono text-[9px] sm:text-[10px] tracking-[0.12em] text-[#c7d1da] pointer-events-none">
          Drag slider to compare · Surface reflection study
        </span>
      </div>

      {/* Footer Strip */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
        <span className="text-[#525d6b] dark:text-[#b9c1ca]">
          Surface appearance study ·{' '}
          <span className="font-mono text-[#8c6628] dark:text-[#e3c99b] tabular-nums">{split}%</span>{' '}
          split
        </span>
        <button
          type="button"
          onClick={onOpenGallery}
          className="inline-flex items-center justify-between sm:justify-start gap-3 min-h-[44px] py-2 border-b border-[#8c6628]/55 dark:border-[#c5a36c]/55 text-[#8c6628] dark:text-[#e7c88f] hover:text-[#6e4d18] dark:hover:text-[#f5dfa9] transition-colors text-left"
        >
          <span>Inspect side-by-side images</span>
          <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
