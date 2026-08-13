import { categoryColor } from "@/lib/bug-book";
import styles from "./BugThumbnail.module.css";

// Abstract per-category thumbnails (spec §6). Real screenshots contain
// customer PII, so the art direction is a stylized browser-window frame
// with a glitch motif per category, tinted with the category accent —
// the same color the chips use, so chips ↔ thumbnails stay consistent.

type MotifProps = { accent: string };

/** UI/UX — misaligned boxes. */
function UiUxMotif({ accent }: MotifProps) {
  return (
    <g>
      <rect x="86" y="72" width="66" height="44" rx="6" fill={accent} opacity="0.28" />
      <rect x="122" y="86" width="66" height="44" rx="6" fill={accent} opacity="0.55" transform="rotate(-4 155 108)" />
      <rect x="168" y="70" width="66" height="44" rx="6" fill={accent} transform="rotate(3 201 92)" />
      <line x1="86" y1="140" x2="234" y2="140" stroke={accent} strokeOpacity="0.35" strokeWidth="3" strokeDasharray="7 6" />
    </g>
  );
}

/** Copy — scrambled letter blocks. */
function CopyMotif({ accent }: MotifProps) {
  const letters = ["T", "Y", "P", "O", "?"];
  return (
    <g fontFamily="ui-monospace, Menlo, monospace" fontSize="22" fontWeight="700">
      {letters.map((letter, i) => {
        const x = 92 + i * 30;
        const y = 100 + (i % 2 === 0 ? -6 : 8);
        const tilt = i % 2 === 0 ? -8 : 7;
        return (
          <g key={i} transform={`rotate(${tilt} ${x + 11} ${y + 11})`}>
            <rect x={x} y={y} width="26" height="28" rx="6" fill={accent} opacity={i === 4 ? 1 : 0.18 + i * 0.16} />
            <text x={x + 13} y={y + 20} textAnchor="middle" fill={i >= 3 ? "#ffffff" : accent}>
              {letter}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Content — placeholder boxes. */
function ContentMotif({ accent }: MotifProps) {
  return (
    <g>
      <rect x="88" y="66" width="64" height="46" rx="6" fill={accent} opacity="0.2" />
      <path d="M96 104l14-16 10 10 9-11 15 17Z" fill={accent} opacity="0.6" />
      <circle cx="103" cy="79" r="5" fill={accent} opacity="0.6" />
      <rect x="164" y="68" width="70" height="8" rx="4" fill={accent} opacity="0.5" />
      <rect x="164" y="84" width="56" height="8" rx="4" fill={accent} opacity="0.35" />
      <rect x="164" y="100" width="63" height="8" rx="4" fill={accent} opacity="0.2" />
      <rect x="88" y="124" width="146" height="10" rx="5" fill={accent} opacity="0.14" />
      <text x="161" y="133" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="9" fontWeight="600" fill={accent}>
        lorem ipsum…
      </text>
    </g>
  );
}

/** Links — snapped chain. */
function LinksMotif({ accent }: MotifProps) {
  return (
    <g stroke={accent} strokeWidth="7" fill="none" strokeLinecap="round">
      <rect x="92" y="86" width="46" height="26" rx="13" transform="rotate(-14 115 99)" />
      <rect x="182" y="90" width="46" height="26" rx="13" transform="rotate(14 205 103)" opacity="0.6" />
      <path d="M146 84l6 10M158 82l2 12M170 88l-4 10" strokeWidth="4" opacity="0.8" />
      <text x="160" y="140" textAnchor="middle" stroke="none" fill={accent} fontFamily="ui-monospace, Menlo, monospace" fontSize="15" fontWeight="700">
        404
      </text>
    </g>
  );
}

/** Mobile — cracked viewport. */
function MobileMotif({ accent }: MotifProps) {
  return (
    <g>
      <rect x="132" y="56" width="56" height="92" rx="10" fill="none" stroke={accent} strokeWidth="5" />
      <path d="M140 70l14 16-10 10 16 14-8 14" fill="none" stroke={accent} strokeWidth="3.5" strokeLinejoin="round" opacity="0.85" />
      <path d="M168 62l-9 14 12 9-14 13" fill="none" stroke={accent} strokeWidth="2.5" strokeLinejoin="round" opacity="0.5" />
      <rect x="150" y="138" width="20" height="4" rx="2" fill={accent} opacity="0.6" />
    </g>
  );
}

/** Interactions — dead cursor. */
function InteractionsMotif({ accent }: MotifProps) {
  return (
    <g>
      <rect x="94" y="80" width="86" height="34" rx="17" fill={accent} opacity="0.22" />
      <rect x="106" y="92" width="62" height="10" rx="5" fill={accent} opacity="0.4" />
      <path d="M188 84l26 62 9-25 25-8Z" fill={accent} stroke="#ffffff" strokeWidth="3" />
      <g stroke={accent} strokeWidth="3" strokeLinecap="round" opacity="0.7">
        <line x1="180" y1="76" x2="172" y2="68" />
        <line x1="196" y1="70" x2="194" y2="60" />
        <line x1="176" y1="94" x2="165" y2="93" />
      </g>
    </g>
  );
}

/** Checkout — derailed cart. */
function CheckoutMotif({ accent }: MotifProps) {
  return (
    <g>
      <line x1="86" y1="128" x2="176" y2="128" stroke={accent} strokeWidth="4" strokeLinecap="round" opacity="0.35" />
      <line x1="182" y1="130" x2="234" y2="142" stroke={accent} strokeWidth="4" strokeLinecap="round" strokeDasharray="8 7" opacity="0.5" />
      <g transform="rotate(11 176 102)">
        <path d="M136 74h12l8 34h44l8-26h-52" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="160" cy="120" r="6" fill={accent} />
        <circle cx="192" cy="120" r="6" fill={accent} />
      </g>
      <text x="130" y="66" fontFamily="ui-monospace, Menlo, monospace" fontSize="13" fontWeight="700" fill={accent} opacity="0.8">
        !
      </text>
    </g>
  );
}

/** Pricing — wrong price tag. */
function PricingMotif({ accent }: MotifProps) {
  return (
    <g>
      <g transform="rotate(-8 150 100)">
        <path d="M112 78h56l26 24-26 24h-56Z" fill={accent} opacity="0.16" stroke={accent} strokeWidth="4" strokeLinejoin="round" />
        <circle cx="126" cy="102" r="5" fill={accent} />
        <text x="158" y="109" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="17" fontWeight="700" fill={accent}>
          $0
        </text>
      </g>
      <line x1="138" y1="118" x2="182" y2="86" stroke={accent} strokeWidth="4" strokeLinecap="round" />
      <text x="204" y="88" fontFamily="ui-monospace, Menlo, monospace" fontSize="14" fontWeight="700" fill={accent}>
        $99?
      </text>
    </g>
  );
}

/** Performance — melting loading bar. */
function PerformanceMotif({ accent }: MotifProps) {
  return (
    <g>
      <rect x="92" y="84" width="136" height="18" rx="9" fill="none" stroke={accent} strokeWidth="4" />
      <rect x="97" y="89" width="52" height="8" rx="4" fill={accent} />
      <path d="M118 102c0 12-3 16-3 24a6 6 0 0 0 12 0" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" opacity="0.75" />
      <path d="M140 102c0 8-2 10-2 16a5 5 0 0 0 10 0" fill="none" stroke={accent} strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
      <text x="196" y="132" textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace" fontSize="12" fontWeight="700" fill={accent} opacity="0.85">
        99+ s
      </text>
    </g>
  );
}

/** Feature Request — megaphone. */
function FeatureRequestMotif({ accent }: MotifProps) {
  return (
    <g>
      <path d="M104 92v20l14 2v-24Z" fill={accent} opacity="0.5" />
      <path d="M118 88l52-24v76l-52-24Z" fill={accent} opacity="0.85" />
      <path d="M112 114l6 24 12-2-6-22" fill={accent} opacity="0.35" />
      <g stroke={accent} strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M184 84c6 6 6 18 0 24" opacity="0.7" />
        <path d="M196 74c12 12 12 32 0 44" opacity="0.45" />
        <path d="M208 64c18 18 18 46 0 64" opacity="0.25" />
      </g>
    </g>
  );
}

/** Security — exposed key. */
function SecurityMotif({ accent }: MotifProps) {
  return (
    <g>
      <circle cx="128" cy="96" r="20" fill="none" stroke={accent} strokeWidth="6" />
      <line x1="144" y1="108" x2="196" y2="140" stroke={accent} strokeWidth="6" strokeLinecap="round" />
      <line x1="176" y1="128" x2="168" y2="140" stroke={accent} strokeWidth="6" strokeLinecap="round" />
      <line x1="192" y1="138" x2="185" y2="150" stroke={accent} strokeWidth="6" strokeLinecap="round" />
      <text x="188" y="82" fontFamily="ui-monospace, Menlo, monospace" fontSize="13" fontWeight="700" fill={accent} opacity="0.8">
        ••••••
      </text>
    </g>
  );
}

/** SEO - a search/share preview card with its image slot missing. */
function SeoMotif({ accent }: MotifProps) {
  return (
    <g>
      <rect x="88" y="62" width="72" height="54" rx="8" fill="none" stroke={accent} strokeWidth="3" strokeDasharray="7 6" opacity="0.7" />
      <path d="M108 100l12-13 8 8 7-8 13 13Z" fill={accent} opacity="0.25" />
      <path d="M104 76l16 16M120 76l-16 16" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      <rect x="172" y="64" width="64" height="9" rx="4.5" fill={accent} opacity="0.75" />
      <rect x="172" y="80" width="44" height="7" rx="3.5" fill={accent} opacity="0.35" />
      <rect x="172" y="94" width="62" height="6" rx="3" fill={accent} opacity="0.2" />
      <rect x="172" y="106" width="50" height="6" rx="3" fill={accent} opacity="0.2" />
      <g transform="translate(88 128)">
        <circle cx="9" cy="9" r="8" fill="none" stroke={accent} strokeWidth="3" opacity="0.6" />
        <line x1="15" y1="15" x2="22" y2="22" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      </g>
      <text x="120" y="143" fontFamily="ui-monospace, Menlo, monospace" fontSize="11" fontWeight="700" fill={accent} opacity="0.75">
        AI ?
      </text>
    </g>
  );
}

const MOTIFS: Record<string, (props: MotifProps) => React.ReactElement> = {
  "UI/UX": UiUxMotif,
  Copy: CopyMotif,
  Content: ContentMotif,
  Links: LinksMotif,
  Mobile: MobileMotif,
  Interactions: InteractionsMotif,
  Checkout: CheckoutMotif,
  Pricing: PricingMotif,
  Performance: PerformanceMotif,
  "Feature Request": FeatureRequestMotif,
  Security: SecurityMotif,
  SEO: SeoMotif,
};

/**
 * Stylized browser-window frame + per-category glitch motif. Decorative
 * only (`aria-hidden`) — the card headline carries the meaning.
 */
export default function BugThumbnail({ category }: { category: string }) {
  const { accent, tint } = categoryColor(category);
  const Motif = MOTIFS[category] ?? UiUxMotif;

  return (
    <div className={styles.wrap} style={{ background: tint }} aria-hidden="true">
      <svg
        className={styles.svg}
        viewBox="0 0 320 200"
        preserveAspectRatio="xMidYMid meet"
        role="presentation"
      >
        {/* Browser window frame */}
        <rect x="52" y="26" width="216" height="152" rx="12" fill="#ffffff" stroke={accent} strokeOpacity="0.22" strokeWidth="2" />
        <line x1="52" y1="52" x2="268" y2="52" stroke={accent} strokeOpacity="0.16" strokeWidth="2" />
        <circle cx="68" cy="39" r="4" fill={accent} opacity="0.4" />
        <circle cx="82" cy="39" r="4" fill={accent} opacity="0.28" />
        <circle cx="96" cy="39" r="4" fill={accent} opacity="0.18" />
        <rect x="112" y="33" width="120" height="12" rx="6" fill={accent} opacity="0.1" />

        <Motif accent={accent} />

        {/* Superflow comment pin */}
        <g transform="translate(244 132)">
          <path
            d="M14 0a14 14 0 0 1 14 14c0 7.7-6.3 14-14 14H1.6A1.6 1.6 0 0 1 0 26.4V14A14 14 0 0 1 14 0Z"
            fill={accent}
            transform="rotate(180 14 14)"
          />
          <circle cx="14" cy="14" r="5.4" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}
