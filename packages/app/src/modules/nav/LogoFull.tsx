export const LogoFull = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 240 52"
    width="240"
    height="52"
    role="img"
    aria-label="The Yellow Network"
  >
    {/* Background */}
    <rect width="240" height="52" fill="#0d1b2e" rx="4" />

    {/* "the " text */}
    <text
      x="8"
      y="28"
      fontFamily="'Arial Black', Arial, sans-serif"
      fontWeight="900"
      fontSize="18"
      fill="#ffffff"
      letterSpacing="-0.3"
    >
      the{' '}
    </text>

    {/* "yellow" highlight box */}
    <rect x="49" y="11" width="68" height="22" rx="4" fill="#c8e600" />
    <text
      x="53"
      y="28"
      fontFamily="'Arial Black', Arial, sans-serif"
      fontWeight="900"
      fontSize="18"
      fill="#0d1b2e"
    >
      yellow
    </text>

    {/* " network" text */}
    <text
      x="120"
      y="28"
      fontFamily="'Arial Black', Arial, sans-serif"
      fontWeight="900"
      fontSize="18"
      fill="#ffffff"
      letterSpacing="-0.3"
    >
      {' '}network
    </text>

    {/* Tagline */}
    <text
      x="8"
      y="45"
      fontFamily="Arial, sans-serif"
      fontWeight="700"
      fontSize="8"
      fill="#ffffff"
      letterSpacing="2.5"
      opacity="0.85"
    >
      GET THINGS DONE
    </text>
  </svg>
);
