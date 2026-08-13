export const LogoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 40 40"
    width="40"
    height="40"
    role="img"
    aria-label="The Yellow Network"
  >
    {/* Background */}
    <rect width="40" height="40" fill="#0d1b2e" rx="6" />

    {/* Yellow highlight box */}
    <rect x="4" y="8" width="32" height="24" rx="4" fill="#c8e600" />

    {/* "Y" letter */}
    <text
      x="20"
      y="27"
      fontFamily="'Arial Black', Arial, sans-serif"
      fontWeight="900"
      fontSize="20"
      fill="#0d1b2e"
      textAnchor="middle"
    >
      Y
    </text>
  </svg>
);
