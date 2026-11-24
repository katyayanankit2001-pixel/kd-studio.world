import {ArrowDown, ArrowUpRight, ChevronsDown, Instagram, RotateCcw} from 'lucide-react';
import {useReducedMotion} from 'motion/react';
import {useCallback, useEffect, useRef, useState} from 'react';
import {HERO_FORTUNER_IMAGES, STUDIO_INFO} from '../data/studioData';
import {type CurtainImpulse, PolyesterCurtainCanvas} from './PolyesterCurtainCanvas';

interface CurtainRevealProps {
  onBookClick: () => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function CurtainReveal({onBookClick}: CurtainRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  const shouldStartOpen =
    Boolean(prefersReducedMotion) ||
    (typeof window !== 'undefined' &&
      (window.scrollY > 40 || (window.location.hash.length > 1 && window.location.hash !== '#home')));

  const [isRevealed, setIsRevealed] = useState<boolean>(shouldStartOpen);

  // Refs for smooth 60–120fps coordination between input, Three.js cloth physics, and hero unveil
  const stageRef = useRef<HTMLDivElement | null>(null);
  const curtainLayerRef = useRef<HTMLDivElement | null>(null);
  const introOverlayRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const carLayerRef = useRef<HTMLDivElement | null>(null);
  const carVeilRef = useRef<HTMLDivElement | null>(null);
  const heroCopyRef = useRef<HTMLDivElement | null>(null);

  const currentProgressRef = useRef<number>(shouldStartOpen ? 1 : 0);
  const targetProgressRef = useRef<number>(shouldStartOpen ? 1 : 0);
  const isRevealedRef = useRef<boolean>(shouldStartOpen);
  const unlockScrollAtRef = useRef<number>(0);

  // Shared impulse queue read by the 3D Verlet polyester cloth engine
  const impulseQueueRef = useRef<CurtainImpulse[]>([]);

  const touchLastYRef = useRef<number | null>(null);
  const touchLastXRef = useRef<number | null>(null);
  const pointerLastRef = useRef<{nx: number; ny: number} | null>(null);
  const pointerDraggingRef = useRef<boolean>(false);

  const pushImpulse = useCallback((clientX: number, clientY: number, poke = 0) => {
    const stage = stageRef.current;
    if (!stage || isRevealedRef.current) return;
    const rect = stage.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const nx = clamp((clientX - rect.left) / rect.width, 0, 1);
    const ny = clamp((clientY - rect.top) / rect.height, 0, 1);
    const prev = pointerLastRef.current;
    const vx = prev ? clamp(nx - prev.nx, -0.14, 0.14) : 0;
    const vy = prev ? clamp(ny - prev.ny, -0.14, 0.14) : 0;
    pointerLastRef.current = {nx, ny};

    if (impulseQueueRef.current.length > 10) {
      impulseQueueRef.current.shift();
    }
    impulseQueueRef.current.push({nx, ny, vx, vy, poke});
  }, []);

  const applyOverlayState = useCallback((p: number) => {
    const t = clamp(p, 0, 1);

    if (curtainLayerRef.current) {
      curtainLayerRef.current.style.visibility = t >= 0.995 ? 'hidden' : 'visible';
    }

    // Center emblem & pull button lift away cleanly as soon as the curtains part
    if (introOverlayRef.current) {
      const introAlpha = clamp(1 - t / 0.26, 0, 1);
      const introLift = -t * 64;
      introOverlayRef.current.style.opacity = introAlpha.toFixed(3);
      introOverlayRef.current.style.transform = `translate3d(0, ${introLift.toFixed(1)}px, 0)`;
      introOverlayRef.current.style.visibility = introAlpha <= 0.01 ? 'hidden' : 'visible';
    }

    if (progressBarRef.current) {
      progressBarRef.current.style.transform = `scaleX(${t.toFixed(4)})`;
    }

    // Glossy Black Fortuner smooth showroom zoom-settle & spotlight reveal
    if (carLayerRef.current) {
      const scale = 1.08 - t * 0.08;
      carLayerRef.current.style.transform = `scale(${scale.toFixed(4)})`;
    }
    if (carVeilRef.current) {
      const veilAlpha = clamp(0.55 - t * 0.51, 0.04, 0.55);
      carVeilRef.current.style.opacity = veilAlpha.toFixed(3);
    }

    // Hero typography & CTAs glide in smoothly as the polyester folds sweep past the headlights
    if (heroCopyRef.current) {
      const copyProgress = clamp((t - 0.42) / 0.45, 0, 1);
      const easedCopy = 1 - Math.pow(1 - copyProgress, 3);
      heroCopyRef.current.style.opacity = easedCopy.toFixed(3);
      heroCopyRef.current.style.transform = `translate3d(0, ${((1 - easedCopy) * 24).toFixed(1)}px, 0)`;
    }
  }, []);

  // Trigger brisk, silky premium curtain opening with an initial lively cloth ripple
  const triggerSmoothReveal = useCallback(() => {
    impulseQueueRef.current.push(
      {nx: 0.44, ny: 0.48, vx: -0.06, vy: 0, poke: 0.95},
      {nx: 0.56, ny: 0.48, vx: 0.06, vy: 0, poke: 0.95}
    );
    targetProgressRef.current = 1;
  }, []);

  // Re-close the red polyester curtains on demand
  const handleReplayReveal = useCallback(() => {
    window.scrollTo({top: 0, behavior: 'smooth'});
    isRevealedRef.current = false;
    setIsRevealed(false);
    targetProgressRef.current = 0;
    impulseQueueRef.current.push(
      {nx: 0.3, ny: 0.5, vx: 0.04, vy: 0, poke: 0.5},
      {nx: 0.7, ny: 0.5, vx: -0.04, vy: 0, poke: 0.5}
    );
  }, []);

  // Smooth premium reveal progress driver (~1.25s brisk silky unveil, zero harsh snapping)
  useEffect(() => {
    if (prefersReducedMotion) return;

    let rafId = 0;
    let lastTime = performance.now();
    applyOverlayState(currentProgressRef.current);

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const cur = currentProgressRef.current;
      const target = targetProgressRef.current;
      const diff = target - cur;

      if (Math.abs(diff) > 0.0005) {
        // Fast yet luxurious showroom pull speed (~1.25s full reveal)
        const MAX_CLOTH_SPEED = 0.78;
        const desiredVel = diff * 5.2;
        const clampedVel = clamp(desiredVel, -MAX_CLOTH_SPEED, MAX_CLOTH_SPEED);
        const next = clamp(cur + clampedVel * dt, 0, 1);
        currentProgressRef.current = next;

        if (next >= 0.992 && target >= 0.99) {
          currentProgressRef.current = 1;
          targetProgressRef.current = 1;
          if (!isRevealedRef.current) {
            isRevealedRef.current = true;
            // Brief 280ms settle breath absorbs trailing scroll momentum so Fortuner stays framed
            unlockScrollAtRef.current = now + 280;
            setIsRevealed(true);
          }
        }
      }

      applyOverlayState(currentProgressRef.current);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [prefersReducedMotion, applyOverlayState]);

  // Controlled scroll & touch interception (smooth fast reveal, no blasting past curtains)
  useEffect(() => {
    if (prefersReducedMotion) return;

    const isAtHeroTop = () => window.scrollY <= 4;

    const onWheel = (e: WheelEvent) => {
      const now = performance.now();

      if (isRevealedRef.current && now < unlockScrollAtRef.current && isAtHeroTop() && e.deltaY > 0) {
        e.preventDefault();
        return;
      }

      if (!isRevealedRef.current && isAtHeroTop()) {
        if (e.deltaY > 0) {
          e.preventDefault();
          const clampedDelta = clamp(e.deltaY, 10, 68);
          targetProgressRef.current = clamp(
            targetProgressRef.current + clampedDelta * 0.0038,
            0,
            1
          );
          // Subtle lively polyester ripple as scrolling pulls the curtains apart
          impulseQueueRef.current.push(
            {nx: 0.42, ny: 0.48, vx: -0.025, vy: 0, poke: 0.22},
            {nx: 0.58, ny: 0.48, vx: 0.025, vy: 0, poke: 0.22}
          );
        } else if (e.deltaY < 0 && targetProgressRef.current > 0) {
          e.preventDefault();
          const clampedDelta = clamp(e.deltaY, -68, -10);
          targetProgressRef.current = clamp(
            targetProgressRef.current + clampedDelta * 0.0038,
            0,
            1
          );
        }
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      touchLastYRef.current = touch.clientY;
      touchLastXRef.current = touch.clientX;
      pointerLastRef.current = null;
      // Instant bouncy poke ripple right where finger touches the polyester curtain!
      pushImpulse(touch.clientX, touch.clientY, 1.35);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const now = performance.now();
      const touch = e.touches[0];
      const y = touch.clientY;
      const x = touch.clientX;
      const prevY = touchLastYRef.current ?? y;
      const prevX = touchLastXRef.current ?? x;
      const deltaY = prevY - y;
      const deltaX = Math.abs(x - prevX);
      touchLastYRef.current = y;
      touchLastXRef.current = x;

      if (!isRevealedRef.current) {
        // Continuous tactile bouncy jiggle along finger trail on the polyester cloth
        pushImpulse(x, y, 0.35);
      }

      if (isRevealedRef.current && now < unlockScrollAtRef.current && isAtHeroTop() && deltaY > 0) {
        e.preventDefault();
        return;
      }

      if (!isRevealedRef.current && isAtHeroTop()) {
        // Vertical swipe UP smoothly parts the curtains; gentle horizontal rubs let users play with the bouncy jiggle!
        const pullDrive = deltaY > 2 ? clamp(deltaY, 0, 44) : 0;
        const strongSidePull = deltaX > 18 ? clamp(deltaX - 18, 0, 28) * 0.6 : 0;

        if (pullDrive > 0 || strongSidePull > 0) {
          e.preventDefault();
          targetProgressRef.current = clamp(
            targetProgressRef.current + (pullDrive + strongSidePull) * 0.0052,
            0,
            1
          );
        } else if (deltaY < -2 && targetProgressRef.current > 0) {
          e.preventDefault();
          targetProgressRef.current = clamp(
            targetProgressRef.current + clamp(deltaY, -44, 0) * 0.0052,
            0,
            1
          );
        } else {
          // Keep page anchored while user jiggles the cloth with their finger
          e.preventDefault();
        }
      }
    };

    const onTouchEnd = () => {
      touchLastYRef.current = null;
      touchLastXRef.current = null;
      pointerLastRef.current = null;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isRevealedRef.current || !isAtHeroTop()) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        targetProgressRef.current = clamp(targetProgressRef.current + 0.35, 0, 1);
      } else if (e.key === 'ArrowUp' && targetProgressRef.current > 0) {
        e.preventDefault();
        targetProgressRef.current = clamp(targetProgressRef.current - 0.35, 0, 1);
      } else if (e.key === 'Escape') {
        targetProgressRef.current = 1;
      }
    };

    const onDocumentClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (href && href !== '#' && href !== '#home') {
        currentProgressRef.current = 1;
        targetProgressRef.current = 1;
        isRevealedRef.current = true;
        unlockScrollAtRef.current = 0;
        setIsRevealed(true);
      }
    };

    window.addEventListener('wheel', onWheel, {passive: false});
    window.addEventListener('touchstart', onTouchStart, {passive: true});
    window.addEventListener('touchmove', onTouchMove, {passive: false});
    window.addEventListener('touchend', onTouchEnd, {passive: true});
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', onDocumentClick, true);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('click', onDocumentClick, true);
    };
  }, [prefersReducedMotion, pushImpulse]);

  // Mouse hover brush, click-poke bounce, horizontal drag-to-pull, and post-reveal Fortuner parallax
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || prefersReducedMotion) return;

    let dragStartX = 0;
    let lastDragX = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (isRevealedRef.current) return;
      if ((e.target as HTMLElement | null)?.closest('button, a')) return;
      // Big satisfying bouncy polyester poke on press!
      pushImpulse(e.clientX, e.clientY, 1.75);
      if (e.pointerType === 'mouse') {
        pointerDraggingRef.current = true;
        dragStartX = e.clientX;
        lastDragX = e.clientX;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isRevealedRef.current) {
        // Real-time bouncy jiggle-wiggle as cursor brushes across the polyester cloth!
        if (e.pointerType === 'mouse') {
          pushImpulse(e.clientX, e.clientY, pointerDraggingRef.current ? 0.65 : 0.22);
        }
        if (pointerDraggingRef.current) {
          const totalMoved = Math.abs(e.clientX - dragStartX);
          const dx = Math.abs(e.clientX - lastDragX);
          lastDragX = e.clientX;
          // Only pull curtains open after deliberate outward drag (> 48px), so small clicks/wiggles bounce freely!
          if (totalMoved > 48 && dx > 0) {
            targetProgressRef.current = clamp(targetProgressRef.current + dx * 0.0045, 0, 1);
          }
        }
        return;
      }

      if (e.pointerType !== 'mouse' || window.innerWidth < 1024) return;
      const rect = stage.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
      const py = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
      stage.style.setProperty('--px', `${px.toFixed(1)}px`);
      stage.style.setProperty('--py', `${py.toFixed(1)}px`);
    };

    const onPointerUp = () => {
      pointerDraggingRef.current = false;
    };

    const onPointerLeave = () => {
      pointerDraggingRef.current = false;
      pointerLastRef.current = null;
      stage.style.setProperty('--px', '0px');
      stage.style.setProperty('--py', '0px');
    };

    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    stage.addEventListener('pointerleave', onPointerLeave);
    return () => {
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      stage.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [prefersReducedMotion, pushImpulse]);

  const heroContent = (
    <>
      <div className="mx-auto w-[92%] sm:w-[88%] max-w-[1320px] flex-1 flex flex-col lg:flex-row lg:items-center justify-end lg:justify-between gap-5 lg:gap-12 pt-20 pb-4 sm:pt-24 sm:pb-8 lg:pt-28 lg:pb-16">
        {/* Hero Copy */}
        <div className="max-w-xl">
          <p className="flex items-center gap-3 text-[11px] font-mono tracking-[0.18em] text-[#dfc28d] mb-3 sm:mb-4">
            <span className="w-6 h-px bg-[#c5a36c]" aria-hidden="true" />
            Arrah, Bihar · Automotive Care
          </p>

          <h1
            id="hero-title"
            className="font-serif text-[38px] sm:text-6xl lg:text-[78px] font-normal leading-[1.01] tracking-[-0.03em] text-[#f7f4ef] text-balance mb-3.5 sm:mb-5 drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)]"
          >
            Every surface.
            <br />
            Every detail.
            <br />
            <em className="italic text-[#d9bc89]">Perfected.</em>
          </h1>

          <p className="text-sm sm:text-lg text-[#e1e6ec] leading-relaxed max-w-md mb-5 sm:mb-7">
            Detailing, paint protection, and custom finishes for the car you care about.
          </p>

          {/* Hero Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onBookClick}
              className="inline-flex items-center justify-between sm:justify-center gap-3 min-h-[46px] sm:min-h-[48px] px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-[#d3b27b] hover:bg-[#e7cb99] text-[#17120c] text-sm font-semibold whitespace-nowrap transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] active:scale-[0.99]"
            >
              <span>Book your visit</span>
              <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
            <a
              href="#services"
              className="inline-flex items-center justify-between sm:justify-center gap-3 min-h-[46px] sm:min-h-[48px] px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg kd-glass-media hover:bg-white/15 text-[#f2f3f5] text-sm font-semibold whitespace-nowrap transition-colors"
            >
              <span>Explore services</span>
              <ArrowDown className="w-4 h-4 shrink-0" aria-hidden="true" />
            </a>
          </div>

          {/* Clean Typographic Index */}
          <div className="mt-5 sm:mt-7 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[10px] sm:text-[11px] tracking-[0.14em] text-[#cfd7df]">
            <span>
              <strong className="text-[#d3b27b] font-normal">01</strong> Protect
            </span>
            <span aria-hidden="true" className="text-white/30">
              ·
            </span>
            <span>
              <strong className="text-[#d3b27b] font-normal">02</strong> Restore
            </span>
            <span aria-hidden="true" className="text-white/30">
              ·
            </span>
            <span>
              <strong className="text-[#d3b27b] font-normal">03</strong> Personalise
            </span>
          </div>
        </div>

        {/* Floating Finish Lab Preview Card (Desktop / Tablet) */}
        <aside className="hidden md:block kd-glass-media rounded-xl p-4 sm:p-5 w-full lg:w-[320px] lg:self-end shrink-0">
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.16em] text-[#e2c897] mb-3">
            <span>The Finish Lab</span>
            <span className="text-[#c7d2dd] tabular-nums">01 / 03</span>
          </div>
          <div className="grid grid-cols-[64px_1fr] gap-3 items-center mb-3.5">
            <div className="mini-layers" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <div>
              <strong className="block text-[15px] font-medium text-[#f7f4ef] leading-snug">
                Care starts at the surface.
              </strong>
              <p className="text-xs text-[#b9c1ca] leading-relaxed mt-1">
                Discover the difference between ceramic coating and PPF.
              </p>
            </div>
          </div>
          <a
            href="#lab"
            className="flex items-center justify-between pt-3 border-t border-white/12 text-xs font-medium text-[#e8c994] hover:text-[#f7e1b3] transition-colors min-h-[36px]"
          >
            <span>Inspect the layers</span>
            <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </a>
        </aside>
      </div>

      {/* Hero Bottom Strip */}
      <div className="mx-auto w-[92%] sm:w-[88%] max-w-[1320px] border-t border-[#dbe8f6]/18 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] sm:text-[11px] tracking-[0.14em] text-[#cfd7df]">
        <span>{STUDIO_INFO.locationShort}</span>
        <a
          href={STUDIO_INFO.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[#e8c994] hover:text-[#f7e1b3] transition-colors"
        >
          <Instagram className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{STUDIO_INFO.instagramHandle}</span>
        </a>
        <div className="flex items-center gap-4">
          <a
            href={STUDIO_INFO.phoneHref}
            className="hidden sm:inline-flex items-center gap-1.5 hover:text-[#f7f4ef] transition-colors tabular-nums"
          >
            <span>{STUDIO_INFO.phoneDisplay}</span>
          </a>
          {!prefersReducedMotion && isRevealed && (
            <button
              type="button"
              onClick={handleReplayReveal}
              className="inline-flex items-center gap-1.5 text-[#c7d2dd] hover:text-[#f7f4ef] transition-colors cursor-pointer"
              title="Close curtains and replay reveal"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              <span>Replay curtain</span>
            </button>
          )}
        </div>
      </div>
    </>
  );

  if (prefersReducedMotion) {
    return (
      <section
        aria-labelledby="hero-title"
        className="relative isolate flex flex-col justify-between min-h-[100svh] lg:max-h-[1080px] overflow-hidden bg-[#090b0e] text-[#f2f3f5]"
      >
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-[#090b0e]">
          <picture className="block w-full h-full">
            <source media="(max-width: 767px)" srcSet={HERO_FORTUNER_IMAGES.mobile} />
            <img
              src={HERO_FORTUNER_IMAGES.desktop}
              alt="Glossy black Toyota Fortuner inside King Detailing Studio"
              fetchPriority="high"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center lg:object-[72%_54%]"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-[#090b0e] via-[#090b0e]/45 to-[#090b0e]/45 lg:bg-[linear-gradient(90deg,#090b0eed_0%,#090b0eb3_32%,#090b0e36_58%,transparent_84%),linear-gradient(0deg,#090b0e_0%,#090b0e80_14%,transparent_36%),linear-gradient(180deg,#090b0e66,transparent_26%)]" />
        </div>
        {heroContent}
      </section>
    );
  }

  return (
    <section
      ref={stageRef}
      aria-labelledby="hero-title"
      className={`relative isolate flex flex-col justify-between min-h-[100svh] h-[100svh] lg:max-h-[1080px] w-full overflow-hidden bg-[#090b0e] text-[#f2f3f5] ${
        !isRevealed ? 'select-none touch-none cursor-grab active:cursor-grabbing' : ''
      }`}
      style={{'--px': '0px', '--py': '0px'} as React.CSSProperties}
    >
      {/* Layer 1: Gleaming Black Shiny Fortuner Underneath */}
      <div
        ref={carLayerRef}
        className="absolute inset-0 -z-10 will-change-transform bg-[#090b0e]"
        style={{transform: shouldStartOpen ? 'scale(1)' : 'scale(1.08)'}}
      >
        <picture
          className="block w-full h-full lg:scale-[1.03] transition-transform duration-300 ease-out"
          style={{
            transform: 'translate3d(calc(var(--px) * -0.4), calc(var(--py) * -0.35), 0)',
          }}
        >
          <source media="(max-width: 767px)" srcSet={HERO_FORTUNER_IMAGES.mobile} />
          <img
            src={HERO_FORTUNER_IMAGES.desktop}
            alt="Glossy black Toyota Fortuner revealed inside King Detailing Studio"
            fetchPriority="high"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-[50%_36%] sm:object-center lg:object-[72%_54%]"
          />
        </picture>

        {/* Measured Contrast Scrims for Hero Copy */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#090b0e] via-[#090b0e]/50 to-[#090b0e]/35 lg:bg-[linear-gradient(90deg,#090b0eef_0%,#090b0eb8_32%,#090b0e36_58%,transparent_84%),linear-gradient(0deg,#090b0e_0%,#090b0e80_14%,transparent_36%),linear-gradient(180deg,#090b0e66,transparent_26%)]"
        />
        <div
          ref={carVeilRef}
          aria-hidden="true"
          className="absolute inset-0 bg-[#050608] pointer-events-none"
          style={{opacity: shouldStartOpen ? 0.04 : 0.55}}
        />
      </div>

      {/* Layer 2: Unveiled Hero Interface Content */}
      <div
        ref={heroCopyRef}
        className={`relative z-10 flex flex-col justify-between h-full will-change-transform ${
          isRevealed ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        style={{
          opacity: shouldStartOpen ? 1 : 0,
          transform: shouldStartOpen ? 'translate3d(0, 0, 0)' : 'translate3d(0, 24px, 0)',
        }}
      >
        {heroContent}
      </div>

      {/* Layer 3: Real-Time 3D Verlet Physics Bouncy Crimson Polyester Curtains */}
      <div
        ref={curtainLayerRef}
        aria-hidden="true"
        className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
        style={{
          visibility: shouldStartOpen ? 'hidden' : 'visible',
        }}
      >
        <PolyesterCurtainCanvas
          progressRef={currentProgressRef}
          impulseQueueRef={impulseQueueRef}
          active={!isRevealed}
        />
        {/* Subtle overhead showroom track shadow */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/70 via-black/25 to-transparent" />
      </div>

      {/* Layer 4: Center Emblem & Tactile Pull-Curtain Prompt (No backdrop-blur over WebGL) */}
      <div
        ref={introOverlayRef}
        className={`absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center will-change-transform ${
          isRevealed ? 'pointer-events-none' : 'pointer-events-none'
        }`}
        style={{
          opacity: shouldStartOpen ? 0 : 1,
          visibility: shouldStartOpen ? 'hidden' : 'visible',
        }}
      >
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#07080a] border-2 border-[#e3c99b]/80 p-2 shadow-[0_24px_70px_rgba(0,0,0,0.8)] mb-6 flex items-center justify-center">
          <img
            src={STUDIO_INFO.logoPath}
            alt="King Detailing Studio emblem"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
          />
        </div>

        <p className="font-serif text-4xl sm:text-6xl text-[#fff9f2] leading-[1.06] max-w-2xl text-balance drop-shadow-[0_6px_28px_rgba(0,0,0,0.8)]">
          King Detailing Car Studio
        </p>

        <p className="mt-2.5 text-xs sm:text-sm font-mono tracking-[0.14em] text-[#f3ddc0]/85 drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]">
          Touch the fabric · Scroll or drag to unveil
        </p>

        <button
          type="button"
          onClick={triggerSmoothReveal}
          className={`mt-6 inline-flex items-center gap-2.5 min-h-[48px] px-6 py-3 rounded-lg bg-[#090b0f]/82 hover:bg-[#090b0f]/95 border border-[#e3c99b]/65 text-[#fff6e5] font-mono text-xs tracking-[0.16em] transition-colors cursor-pointer shadow-[0_14px_40px_rgba(0,0,0,0.6)] ${
            isRevealed ? 'pointer-events-none' : 'pointer-events-auto'
          }`}
        >
          <span>Reveal the Fortuner</span>
          <ChevronsDown className="w-4 h-4 text-[#e3c99b]" aria-hidden="true" />
        </button>

        {/* Delicate Gold Progress Thread While Parting the Curtains */}
        <div
          aria-hidden="true"
          className="mt-5 w-36 h-[2px] rounded-full bg-white/20 overflow-hidden"
        >
          <div
            ref={progressBarRef}
            className="h-full w-full origin-left bg-[#e3c99b]"
            style={{transform: 'scaleX(0)'}}
          />
        </div>
      </div>
    </section>
  );
}
