export default function HeroWave() {
  return (
    <div className="hero-wave">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 56" preserveAspectRatio="none">
        <path
          className="wave wave-1"
          d="M0,28 C360,56 720,0 1080,28 C1260,42 1360,14 1440,28 L1440,56 L0,56 Z"
          fill="#f8fafb"
        />
        <path
          className="wave wave-2"
          d="M0,28 C360,56 720,0 1080,28 C1260,42 1360,14 1440,28 L1440,56 L0,56 Z"
          fill="#f8fafb"
          opacity="0.6"
        />
        <path
          className="wave wave-3"
          d="M0,28 C360,56 720,0 1080,28 C1260,42 1360,14 1440,28 L1440,56 L0,56 Z"
          fill="#f8fafb"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}
