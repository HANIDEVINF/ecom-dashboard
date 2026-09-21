import React from 'react';

interface AlgerianSealStampProps {
  companyName: string;
  legalForm: string;
  rcNumber: string;
  nif: string;
  wilaya: string;
  date?: string;
  size?: 'sm' | 'md' | 'lg';
  inkColor?: 'blue' | 'purple' | 'red';
  className?: string;
}

export const AlgerianSealStamp: React.FC<AlgerianSealStampProps> = ({
  companyName,
  legalForm,
  rcNumber,
  nif,
  wilaya,
  date,
  size = 'md',
  inkColor = 'blue',
  className = ''
}) => {
  // Color presets tailored for realistic Algerian rubber/ink stamps (Cachet Humide)
  const colorStyles = {
    blue: {
      border: 'border-blue-800/85',
      text: 'text-blue-900/90',
      svgStroke: '#1e3a8a',
      svgFill: '#1e3a8a',
      bgTint: 'bg-blue-50/20'
    },
    purple: {
      border: 'border-indigo-900/85',
      text: 'text-indigo-950/90',
      svgStroke: '#312e81',
      svgFill: '#312e81',
      bgTint: 'bg-indigo-50/20'
    },
    red: {
      border: 'border-red-800/85',
      text: 'text-red-900/90',
      svgStroke: '#991b1b',
      svgFill: '#991b1b',
      bgTint: 'bg-red-50/20'
    }
  }[inkColor];

  // Dimension scaling
  const dimensions = {
    sm: 'w-32 h-32 text-[8px]',
    md: 'w-44 h-44 text-[10px]',
    lg: 'w-52 h-52 text-[11px]'
  }[size];

  const currentDate = date || new Date().toISOString().slice(0, 10);
  const formattedWilaya = (wilaya || 'ALGER').toUpperCase();
  const truncatedName = (companyName || 'ENTREPRISE').toUpperCase();

  return (
    <div 
      id="algerian-seal-stamp"
      className={`relative inline-flex items-center justify-center select-none font-mono transition-transform rotate-[-3deg] hover:rotate-0 print:rotate-[-2deg] ${dimensions} ${className}`}
      title="Cachet Humide Officiel de l'Entreprise"
    >
      {/* Authentic SVG Seal with concentric rings, star ornaments and curved text */}
      <svg 
        viewBox="0 0 200 200" 
        className="w-full h-full drop-shadow-2xs opacity-90 overflow-visible"
      >
        <defs>
          {/* Top Arc Path for Company Name & Legal Form */}
          <path
            id="stampTopArc"
            d="M 22 100 A 78 78 0 0 1 178 100"
            fill="none"
          />
          {/* Bottom Arc Path for RC and NIF */}
          <path
            id="stampBottomArc"
            d="M 178 100 A 78 78 0 0 1 22 100"
            fill="none"
          />
        </defs>

        {/* Outer Gritty Double Border */}
        <circle 
          cx="100" 
          cy="100" 
          r="95" 
          fill="none" 
          stroke={colorStyles.svgStroke} 
          strokeWidth="3.5" 
          strokeDasharray="180 1.5 80 1"
          opacity="0.85"
        />
        <circle 
          cx="100" 
          cy="100" 
          r="90" 
          fill="none" 
          stroke={colorStyles.svgStroke} 
          strokeWidth="1.2" 
          opacity="0.75"
        />

        {/* Inner Solid Border */}
        <circle 
          cx="100" 
          cy="100" 
          r="66" 
          fill="none" 
          stroke={colorStyles.svgStroke} 
          strokeWidth="2" 
          strokeDasharray="40 0.8"
          opacity="0.8"
        />

        {/* Top Arc Text: Company Name */}
        <text 
          fill={colorStyles.svgFill} 
          fontSize="10.5" 
          fontWeight="900" 
          letterSpacing="1.5"
          className="uppercase tracking-widest font-sans"
        >
          <textPath href="#stampTopArc" startOffset="50%" textAnchor="middle">
            ★ {truncatedName} • {legalForm} ★
          </textPath>
        </text>

        {/* Bottom Arc Text: Wilaya & Algérie */}
        <text 
          fill={colorStyles.svgFill} 
          fontSize="9.5" 
          fontWeight="800" 
          letterSpacing="1.2"
          className="uppercase font-sans"
        >
          <textPath href="#stampBottomArc" startOffset="50%" textAnchor="middle">
            RC: {rcNumber.slice(0, 14)} • {formattedWilaya}
          </textPath>
        </text>

        {/* Center Content: NIF, Date and Algerian Seal Motif */}
        <g transform="translate(100, 100)" textAnchor="middle">
          {/* NIF Badge */}
          <text 
            y="-22" 
            fill={colorStyles.svgFill} 
            fontSize="8.5" 
            fontWeight="bold" 
            fontFamily="monospace"
            letterSpacing="0.5"
          >
            NIF: {nif ? nif.slice(0, 15) : '002016000000000'}
          </text>

          {/* Central Star / Crescent Motif */}
          <circle cx="0" cy="-6" r="3" fill={colorStyles.svgFill} opacity="0.6" />
          <line x1="-32" y1="-6" x2="-8" y2="-6" stroke={colorStyles.svgStroke} strokeWidth="1" strokeDasharray="3 2" />
          <line x1="8" y1="-6" x2="32" y2="-6" stroke={colorStyles.svgStroke} strokeWidth="1" strokeDasharray="3 2" />

          {/* Cursive Signature Graphic Representation */}
          <path 
            d="M -26 12 Q -12 2, -2 14 T 18 10 Q 28 8, 30 18" 
            fill="none" 
            stroke={colorStyles.svgStroke} 
            strokeWidth="2.2" 
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Official Mention */}
          <text 
            y="26" 
            fill={colorStyles.svgFill} 
            fontSize="8" 
            fontWeight="800" 
            letterSpacing="0.8"
            className="uppercase tracking-wider font-sans"
          >
            POUR LA GÉRANCE
          </text>

          {/* Date Stamped in Center */}
          <text 
            y="37" 
            fill={colorStyles.svgFill} 
            fontSize="7" 
            fontFamily="monospace"
            fontWeight="bold"
            opacity="0.8"
          >
            {currentDate}
          </text>
        </g>
      </svg>
    </div>
  );
};
