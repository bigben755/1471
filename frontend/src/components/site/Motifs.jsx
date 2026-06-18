// Brand-safe decorative motifs: RAF roundel + aviation swoosh divider.

export const Roundel = ({ className = "", style = {} }) => (
  <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
    <circle cx="50" cy="50" r="48" fill="#002F5F" />
    <circle cx="50" cy="50" r="32" fill="#FFFFFF" />
    <circle cx="50" cy="50" r="16" fill="#C60C30" />
  </svg>
);

// Sweeping curve used to transition between light and dark sections.
export const SwooshDivider = ({ fill = "#002F5F", flip = false, className = "" }) => (
  <div className={`w-full overflow-hidden leading-[0] ${className}`} aria-hidden="true">
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className={`w-full h-[60px] md:h-[110px] ${flip ? "rotate-180" : ""}`}
    >
      <path
        d="M0,64 C360,140 720,0 1080,32 C1260,48 1380,80 1440,72 L1440,120 L0,120 Z"
        fill={fill}
      />
    </svg>
  </div>
);

export const RouteLine = ({ className = "" }) => (
  <svg viewBox="0 0 600 200" className={className} fill="none" aria-hidden="true">
    <path
      d="M10,160 C140,40 260,180 380,90 C460,30 540,70 590,30"
      stroke="#C60C30"
      strokeWidth="2"
      strokeDasharray="6 8"
    />
    <circle cx="10" cy="160" r="5" fill="#C60C30" />
    <circle cx="590" cy="30" r="5" fill="#C60C30" />
  </svg>
);
