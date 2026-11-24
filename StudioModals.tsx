import {ArrowUpRight, CheckCircle2, MessageCircle, X} from 'lucide-react';
import {FormEvent, useEffect, useState} from 'react';
import {
  PAINT_CONDITIONS,
  SERVICES,
  ServiceItem,
  STUDIO_INFO,
  VEHICLE_CATEGORIES,
} from '../data/studioData';

export type RequestModalKind = 'appointment' | 'quote';

interface ServiceModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onBook: (serviceName: string) => void;
  onQuote: (serviceName: string) => void;
}

export function ServiceDetailModal({service, onClose, onBook, onQuote}: ServiceModalProps) {
  useEffect(() => {
    if (!service) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [service, onClose]);

  if (!service) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 dark:bg-[#04070b]/80 backdrop-blur-md p-0 sm:p-4"
    >
      <div className="w-full sm:max-w-xl max-h-[90dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[#fbfaf7] dark:bg-[#131b24] border border-neutral-900/15 dark:border-[#9eafc1]/30 shadow-[0_30px_100px_rgba(0,0,0,0.45)] dark:shadow-[0_30px_100px_rgba(0,0,0,0.7)] p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4 mb-4">
          <span className="font-mono text-[11px] tracking-[0.16em] text-[#8c6628] dark:text-[#dfc28d]">
            {service.number} · {service.category}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close treatment details"
            className="w-11 h-11 rounded-lg bg-neutral-900/[0.06] dark:bg-[#1d2834] border border-neutral-900/12 dark:border-white/15 flex items-center justify-center text-[#14171c] dark:text-[#f2f3f5] hover:bg-neutral-900/12 dark:hover:bg-[#273545] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="aspect-[16/9] rounded-xl overflow-hidden border border-neutral-900/10 dark:border-white/10 mb-5 bg-[#0a0f14]">
          <img
            src={service.image}
            alt={service.imageAlt}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <h2
          id="service-modal-title"
          className="font-serif text-3xl sm:text-4xl text-[#14171c] dark:text-[#f7f4ef] leading-tight mb-3"
        >
          {service.name}
        </h2>
        <p className="text-sm sm:text-[15px] text-[#4b5563] dark:text-[#c7d0da] leading-relaxed mb-5">
          {service.description}
        </p>

        <ul className="space-y-2.5 mb-6 border-y border-neutral-900/10 dark:border-white/10 py-4">
          {service.highlights.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-[#1f2630] dark:text-[#e1e7ee]">
              <span className="text-[#8c6628] dark:text-[#d3b27b] font-mono text-xs mt-1">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="text-xs text-[#64707d] dark:text-[#9aa7b5] mb-5">
          The studio confirms suitability, process timeline, and final pricing after inspecting your
          vehicle in person.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onBook(service.name)}
            className="min-h-[48px] px-4 py-3 rounded-lg bg-[#d3b27b] hover:bg-[#e5c792] text-[#17120c] text-sm font-semibold flex items-center justify-between transition-colors"
          >
            <span>Request a visit</span>
            <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onQuote(service.name)}
            className="min-h-[48px] px-4 py-3 rounded-lg border border-neutral-900/15 dark:border-white/18 bg-white dark:bg-white/[0.05] hover:bg-neutral-100 dark:hover:bg-white/10 text-[#14171c] dark:text-[#f2f3f5] text-sm font-semibold flex items-center justify-between transition-colors"
          >
            <span>Request quotation</span>
            <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface RequestModalProps {
  open: boolean;
  kind: RequestModalKind;
  initialService: string;
  initialNotes: string;
  onClose: () => void;
}

export function BookingRequestModal({
  open,
  kind,
  initialService,
  initialNotes,
  onClose,
}: RequestModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [category, setCategory] = useState<string>(VEHICLE_CATEGORIES[2]);
  const [service, setService] = useState<string>(initialService || SERVICES[0].name);
  const [condition, setCondition] = useState<string>(PAINT_CONDITIONS[0]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('11:00');
  const [notes, setNotes] = useState(initialNotes);
  const [consent, setConsent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const todayIST = new Date().toLocaleDateString('en-CA', {timeZone: 'Asia/Kolkata'});

  useEffect(() => {
    if (!open) return;
    setService(initialService || SERVICES[0].name);
    setNotes(initialNotes || '');
    setErrorMsg('');
    setSubmitted(false);
  }, [open, initialService, initialNotes, kind]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const buildWhatsappUrl = () => {
    const lines = [
      `Hello King Detailing Studio! I would like to request ${
        kind === 'appointment' ? 'a studio appointment' : 'a treatment quotation'
      }.`,
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      `Vehicle: ${vehicle.trim()} (${category})`,
      `Treatment: ${service}`,
      `Paint condition: ${condition}`,
      kind === 'appointment' && date ? `Preferred visit: ${date} at ${time} IST` : '',
      notes.trim() ? `Notes: ${notes.trim()}` : '',
    ].filter(Boolean);

    return `${STUDIO_INFO.whatsappHref}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (name.trim().length < 2) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (digits.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (vehicle.trim().length < 2) {
      setErrorMsg('Please enter your vehicle make and model.');
      return;
    }
    if (kind === 'appointment' && !date) {
      setErrorMsg('Please choose your preferred visit date.');
      return;
    }
    if (!consent) {
      setErrorMsg('Please confirm permission to share these details with the studio.');
      return;
    }
    setErrorMsg('');
    setSubmitted(true);
  };

  const inputClass =
    'min-h-[46px] rounded-lg border border-neutral-900/18 dark:border-[#8ea0b0]/30 bg-white dark:bg-[#0b121a] px-3.5 py-2.5 text-[16px] sm:text-sm text-[#14171c] dark:text-[#f2f3f5] placeholder:text-[#8692a0] dark:placeholder:text-[#6f7e8d] focus:border-[#8c6628] dark:focus:border-[#d3b27b] focus:outline-none';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 dark:bg-[#04070b]/82 backdrop-blur-md p-0 sm:p-4"
    >
      <div className="w-full sm:max-w-2xl max-h-[92dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[#fbfaf7] dark:bg-[#131b24] border border-neutral-900/15 dark:border-[#9eafc1]/30 shadow-[0_30px_100px_rgba(0,0,0,0.45)] dark:shadow-[0_30px_100px_rgba(0,0,0,0.75)] p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2.5">
            <img
              src={STUDIO_INFO.logoPath}
              alt="King Detailing Studio"
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded bg-black object-contain p-0.5 border border-black/15 dark:border-white/15"
            />
            <span className="font-mono text-[11px] tracking-[0.16em] text-[#8c6628] dark:text-[#dfc28d]">
              Studio Consultation · Arrah
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking form"
            className="w-11 h-11 rounded-lg bg-neutral-900/[0.06] dark:bg-[#1d2834] border border-neutral-900/12 dark:border-white/15 flex items-center justify-center text-[#14171c] dark:text-[#f2f3f5] hover:bg-neutral-900/12 dark:hover:bg-[#273545] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h2
          id="request-modal-title"
          className="font-serif text-3xl sm:text-4xl text-[#14171c] dark:text-[#f7f4ef] leading-tight mb-1.5"
        >
          {kind === 'appointment' ? 'Request a visit.' : 'Request a quotation.'}
        </h2>
        <p className="text-sm text-[#525d6b] dark:text-[#b9c1ca] mb-5">
          {kind === 'appointment'
            ? 'Choose your treatment and preferred slot. Send your summary directly to the studio via WhatsApp for instant confirmation.'
            : 'Share your vehicle and desired treatment. The studio will follow up with a tailored estimate.'}
        </p>

        {submitted ? (
          <div className="rounded-xl border border-[#8c6628]/35 dark:border-[#d3b27b]/40 bg-white dark:bg-[#0d141c] p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="w-6 h-6 text-[#8c6628] dark:text-[#e3c99b] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-base font-semibold text-[#14171c] dark:text-[#f7f4ef]">
                  Inquiry prepared for {STUDIO_INFO.name}
                </h3>
                <p className="text-sm text-[#525d6b] dark:text-[#b9c1ca] mt-1">
                  Tap below to send your pre-filled vehicle details directly to our WhatsApp desk (
                  <span className="font-mono text-[#8c6628] dark:text-[#e3c99b]">
                    +91 62017 13029
                  </span>
                  ) or call{' '}
                  <a href={STUDIO_INFO.phoneHref} className="underline text-[#14171c] dark:text-[#f2f3f5]">
                    {STUDIO_INFO.phoneDisplay}
                  </a>
                  .
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-y border-neutral-900/10 dark:border-white/10 py-4">
              <div>
                <dt className="text-[#64707d] dark:text-[#8e9ca9]">Customer</dt>
                <dd className="text-[#14171c] dark:text-[#f2f3f5] font-medium mt-0.5">
                  {name} · {phone}
                </dd>
              </div>
              <div>
                <dt className="text-[#64707d] dark:text-[#8e9ca9]">Vehicle</dt>
                <dd className="text-[#14171c] dark:text-[#f2f3f5] font-medium mt-0.5">
                  {vehicle} ({category})
                </dd>
              </div>
              <div>
                <dt className="text-[#64707d] dark:text-[#8e9ca9]">Treatment</dt>
                <dd className="text-[#8c6628] dark:text-[#e3c99b] font-medium mt-0.5">{service}</dd>
              </div>
              {kind === 'appointment' && date && (
                <div>
                  <dt className="text-[#64707d] dark:text-[#8e9ca9]">Preferred Slot</dt>
                  <dd className="text-[#14171c] dark:text-[#f2f3f5] font-mono mt-0.5">
                    {date} · {time} IST
                  </dd>
                </div>
              )}
            </dl>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={buildWhatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[48px] px-5 py-3 rounded-lg bg-[#d3b27b] hover:bg-[#e5c792] text-[#17120c] text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Send via WhatsApp</span>
                <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="min-h-[48px] px-4 py-3 rounded-lg border border-neutral-900/15 dark:border-white/15 bg-neutral-900/[0.04] dark:bg-white/5 hover:bg-neutral-900/10 dark:hover:bg-white/10 text-sm font-medium text-[#14171c] dark:text-[#e8edf2] transition-colors"
              >
                Edit details
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <label className="flex flex-col gap-1.5 text-xs font-medium text-[#2c343e] dark:text-[#dce4ec]">
                <span>Your name *</span>
                <input
                  type="text"
                  required
                  maxLength={80}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-medium text-[#2c343e] dark:text-[#dce4ec]">
                <span>Mobile number *</span>
                <input
                  type="tel"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-medium text-[#2c343e] dark:text-[#dce4ec]">
                <span>Email (optional)</span>
                <input
                  type="email"
                  maxLength={150}
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-medium text-[#2c343e] dark:text-[#dce4ec]">
                <span>Vehicle make &amp; model *</span>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  placeholder="e.g. Hyundai Creta, Mahindra Scorpio-N"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-medium text-[#2c343e] dark:text-[#dce4ec]">
                <span>Vehicle category</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClass}
                >
                  {VEHICLE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-medium text-[#2c343e] dark:text-[#dce4ec]">
                <span>Treatment</span>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className={inputClass}
                >
                  {SERVICES.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-medium text-[#2c343e] dark:text-[#dce4ec]">
                <span>Paint condition</span>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className={inputClass}
                >
                  {PAINT_CONDITIONS.map((pc) => (
                    <option key={pc} value={pc}>
                      {pc}
                    </option>
                  ))}
                </select>
              </label>

              {kind === 'appointment' && (
                <>
                  <label className="flex flex-col gap-1.5 text-xs font-medium text-[#2c343e] dark:text-[#dce4ec]">
                    <span>Preferred date *</span>
                    <input
                      type="date"
                      required
                      min={todayIST}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={inputClass}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-xs font-medium text-[#2c343e] dark:text-[#dce4ec] sm:col-span-2">
                    <span>Preferred time (IST · 09:00 – 20:00)</span>
                    <input
                      type="time"
                      min="09:00"
                      max="20:00"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className={inputClass}
                    />
                  </label>
                </>
              )}

              <label className="flex flex-col gap-1.5 text-xs font-medium text-[#2c343e] dark:text-[#dce4ec] sm:col-span-2">
                <span>Additional requirements</span>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share colour, specific panels, scratches, or questions..."
                  className="rounded-lg border border-neutral-900/18 dark:border-[#8ea0b0]/30 bg-white dark:bg-[#0b121a] px-3.5 py-2.5 text-[16px] sm:text-sm text-[#14171c] dark:text-[#f2f3f5] placeholder:text-[#8692a0] dark:placeholder:text-[#6f7e8d] focus:border-[#8c6628] dark:focus:border-[#d3b27b] focus:outline-none resize-y"
                />
              </label>
            </div>

            <label className="flex items-start gap-3 text-xs text-[#4b5563] dark:text-[#c7d1da] cursor-pointer py-1">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#8c6628] dark:accent-[#c5a36c] shrink-0"
              />
              <span>
                I agree to share these details with King Detailing Studio so they can respond to my
                consultation request.
              </span>
            </label>

            {errorMsg && (
              <p
                role="alert"
                className="text-xs font-medium text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/10 border border-amber-400/40 dark:border-amber-400/25 rounded-lg px-3.5 py-2.5"
              >
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full min-h-[48px] px-5 py-3 rounded-lg bg-[#d3b27b] hover:bg-[#e5c792] text-[#17120c] text-sm font-semibold flex items-center justify-between transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
            >
              <span>Prepare consultation request</span>
              <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

interface GalleryModalProps {
  open: boolean;
  onClose: () => void;
}

export function ComparisonGalleryModal({open, onClose}: GalleryModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 dark:bg-[#04070b]/82 backdrop-blur-md p-0 sm:p-4"
    >
      <div className="w-full sm:max-w-4xl max-h-[90dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-[#fbfaf7] dark:bg-[#131b24] border border-neutral-900/15 dark:border-[#9eafc1]/30 shadow-[0_30px_100px_rgba(0,0,0,0.45)] dark:shadow-[0_30px_100px_rgba(0,0,0,0.75)] p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2 id="gallery-modal-title" className="font-serif text-3xl text-[#14171c] dark:text-[#f7f4ef]">
            Comparison study
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comparison gallery"
            className="w-11 h-11 rounded-lg bg-neutral-900/[0.06] dark:bg-[#1d2834] border border-neutral-900/12 dark:border-white/15 flex items-center justify-center text-[#14171c] dark:text-[#f2f3f5] hover:bg-neutral-900/12 dark:hover:bg-[#273545] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <figure className="space-y-2">
            <img
              src="/assets/kd/comparison-before.webp"
              alt="Before treatment comparison"
              referrerPolicy="no-referrer"
              className="w-full aspect-[4/3] object-cover rounded-xl border border-neutral-900/10 dark:border-white/10"
            />
            <figcaption className="text-xs font-mono text-[#525d6b] dark:text-[#b9c1ca]">
              Before · Swirls and muted gloss
            </figcaption>
          </figure>
          <figure className="space-y-2">
            <img
              src="/assets/kd/comparison-after.webp"
              alt="After treatment comparison"
              referrerPolicy="no-referrer"
              className="w-full aspect-[4/3] object-cover rounded-xl border border-neutral-900/10 dark:border-white/10"
            />
            <figcaption className="text-xs font-mono text-[#8c6628] dark:text-[#e3c99b]">
              After · Corrected high-clarity reflection
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
}
