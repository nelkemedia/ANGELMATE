import { useLoading } from '../context/LoadingContext';

export default function FishLoader() {
  const { loading } = useLoading();
  if (!loading) return null;

  return (
    <div className="fish-loader-overlay" aria-label="Lädt…" role="status">
      <div className="fish-loader-track">
        <div className="fish-loader-swimmer">
          <div className="fish-loader-bob">
            <svg
              className="fish-loader-svg"
              viewBox="0 0 90 48"
              width="110"
              height="58"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Tail — wags via CSS */}
              <polygon className="fish-loader-tail" points="20,24 4,9 4,39" fill="#5ecece" />
              {/* Body */}
              <ellipse cx="52" cy="24" rx="32" ry="16" fill="#0e7c7c" />
              {/* Dorsal fin */}
              <path d="M38 9 Q47 1 58 9" fill="#0a6262" />
              {/* Pectoral fin */}
              <path d="M46 37 Q53 45 61 39" fill="#0a6262" opacity="0.85" />
              {/* Scale arcs */}
              <path d="M38 18 Q44 24 38 30" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" fill="none" />
              <path d="M28 17 Q34 24 28 31" stroke="rgba(255,255,255,0.17)" strokeWidth="1.5" fill="none" />
              {/* Body highlight */}
              <ellipse cx="46" cy="17" rx="11" ry="4" fill="rgba(255,255,255,0.18)" transform="rotate(-15,46,17)" />
              {/* Eye */}
              <circle cx="68" cy="20" r="4.5" fill="white" />
              <circle cx="69" cy="20" r="2.2" fill="#063030" />
              <circle cx="70" cy="19" r="0.8" fill="white" />
              {/* Mouth */}
              <path d="M84 22 Q87 25 84 28" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
