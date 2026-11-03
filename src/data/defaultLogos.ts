// Logos vectoriales predeterminados para la Provincia de Jujuy y la Oficina Anticorrupción
// Representados en Data URIs SVG de alta fidelidad, listos para encabezado y marca de agua

export const DEFAULT_LOGO_GOBIERNO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="100%" height="100%">
  <defs>
    <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="70%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </radialGradient>
    <linearGradient id="cieloJujuy" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4B9CD3" />
      <stop offset="100%" stop-color="#72B6E8" />
    </linearGradient>
    <linearGradient id="blancoPabellon" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#E2E8F0" />
    </linearGradient>
    <filter id="shadowDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#082032" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Sol Naciente de Mayo (Jujuy) -->
  <g id="sol" transform="translate(100, 52)">
    <circle cx="0" cy="0" r="22" fill="url(#sunGlow)" stroke="#B45309" stroke-width="1.5" />
    <!-- Rayos -->
    <path d="M0 -34 L0 -24 M0 24 L0 34 M-34 0 L-24 0 M24 0 L34 0" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
    <path d="M-24 -24 L-17 -17 M17 17 L24 24 M-24 24 L-17 17 M17 -17 L24 -24" stroke="#F59E0B" stroke-width="3" stroke-linecap="round" />
    <path d="M-12 -31 L-9 -23 M9 23 L12 31 M-31 -12 L-23 -9 M23 9 L31 12" stroke="#D97706" stroke-width="2" stroke-linecap="round" />
    <path d="M12 -31 L9 -23 M-9 23 L-12 31 M31 -12 L23 -9 M-23 9 L-31 12" stroke="#D97706" stroke-width="2" stroke-linecap="round" />
    <!-- Rostro sutil del sol -->
    <circle cx="-6" cy="-3" r="2" fill="#78350F" />
    <circle cx="6" cy="-3" r="2" fill="#78350F" />
    <path d="M-6 8 Q0 13 6 8" stroke="#78350F" stroke-width="2" fill="none" stroke-linecap="round" />
  </g>

  <!-- Laureles circundantes -->
  <g id="laureles" stroke="#15803D" stroke-width="2" fill="#22C55E">
    <!-- Izquierda -->
    <path d="M 35 120 C 30 70 60 50 80 45" fill="none" stroke-width="2.5" />
    <ellipse cx="40" cy="65" rx="5" ry="9" transform="rotate(-30 40 65)" />
    <ellipse cx="32" cy="85" rx="5" ry="9" transform="rotate(-15 32 85)" />
    <ellipse cx="32" cy="108" rx="5" ry="9" transform="rotate(10 32 108)" />
    <ellipse cx="40" cy="130" rx="5" ry="9" transform="rotate(30 40 130)" />
    <ellipse cx="56" cy="150" rx="5" ry="9" transform="rotate(50 56 150)" />
    <!-- Derecha -->
    <path d="M 165 120 C 170 70 140 50 120 45" fill="none" stroke-width="2.5" />
    <ellipse cx="160" cy="65" rx="5" ry="9" transform="rotate(30 160 65)" />
    <ellipse cx="168" cy="85" rx="5" ry="9" transform="rotate(15 168 85)" />
    <ellipse cx="168" cy="108" rx="5" ry="9" transform="rotate(-10 168 108)" />
    <ellipse cx="160" cy="130" rx="5" ry="9" transform="rotate(-30 160 130)" />
    <ellipse cx="144" cy="150" rx="5" ry="9" transform="rotate(-50 144 150)" />
  </g>

  <!-- Óvalo Escudo Provincial -->
  <g id="ovalo" filter="url(#shadowDrop)">
    <!-- Marco Dorado -->
    <ellipse cx="100" cy="120" rx="58" ry="70" fill="#B45309" />
    <ellipse cx="100" cy="120" rx="55" ry="67" fill="#FBBF24" />
    <!-- Interior dividido en 2 campos -->
    <clipPath id="escudoClip">
      <ellipse cx="100" cy="120" rx="52" ry="64" />
    </clipPath>
    <g clip-path="url(#escudoClip)">
      <!-- Campo superior azul celeste -->
      <rect x="40" y="50" width="120" height="70" fill="url(#cieloJujuy)" />
      <!-- Campo inferior blanco -->
      <rect x="40" y="120" width="120" height="70" fill="url(#blancoPabellon)" />
      
      <!-- Pica de madera vertical -->
      <line x1="100" y1="80" x2="100" y2="165" stroke="#78350F" stroke-width="4.5" stroke-linecap="round" />
      
      <!-- Manos entrelazadas (Diestras estrechadas) -->
      <g transform="translate(100, 120)">
        <ellipse cx="-12" cy="0" rx="10" ry="6" fill="#FBBF24" stroke="#78350F" stroke-width="1.5" />
        <ellipse cx="12" cy="0" rx="10" ry="6" fill="#FBBF24" stroke="#78350F" stroke-width="1.5" />
        <circle cx="0" cy="0" r="7" fill="#FDE68A" stroke="#78350F" stroke-width="1.5" />
      </g>

      <!-- Gorro Frigio Rojo Punzó -->
      <g transform="translate(100, 84)">
        <path d="M -13 8 C -14 2, -6 -10, 0 -12 C 6 -10, 14 2, 13 8 Z" fill="#DC2626" stroke="#991B1B" stroke-width="1.5" />
        <path d="M 0 -12 C 4 -16, 12 -14, 11 -8 C 10 -4, 4 -2, 0 -2 Z" fill="#B91C1C" />
        <ellipse cx="0" cy="8" rx="13" ry="3.5" fill="#EF4444" />
      </g>
    </g>
  </g>

  <!-- Moño cinta celeste y blanca al pie -->
  <g id="mono" transform="translate(100, 192)">
    <path d="M -25 -2 C -18 10, -30 24, -38 28 C -30 20, -18 18, -10 6 Z" fill="#38BDF8" stroke="#0284C7" stroke-width="1" />
    <path d="M 25 -2 C 18 10, 30 24, 38 28 C 30 20, 18 18, 10 6 Z" fill="#38BDF8" stroke="#0284C7" stroke-width="1" />
    <circle cx="0" cy="0" r="7" fill="#FFFFFF" stroke="#0284C7" stroke-width="2" />
    <circle cx="0" cy="0" r="4" fill="#38BDF8" />
  </g>

  <!-- Texto Inferior Oficial -->
  <text x="100" y="222" font-family="'Times New Roman', serif" font-size="11" font-weight="bold" fill="#082032" text-anchor="middle" letter-spacing="1">PROVINCIA DE JUJUY</text>
  <text x="100" y="234" font-family="'Times New Roman', serif" font-size="8" font-weight="600" fill="#64748B" text-anchor="middle" letter-spacing="0.5">GOBIERNO CONSTITUCIONAL</text>
</svg>
`)}`;

export const DEFAULT_LOGO_REPARTICION_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="100%" height="100%">
  <defs>
    <linearGradient id="navyEscudo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F2C44" />
      <stop offset="100%" stop-color="#082032" />
    </linearGradient>
    <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FCD34D" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <linearGradient id="redAccent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#EF4444" />
      <stop offset="100%" stop-color="#991B1B" />
    </linearGradient>
    <filter id="shadowOA" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#082032" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Escudo Heráldico de la Oficina Anticorrupción -->
  <g filter="url(#shadowOA)" transform="translate(100, 95)">
    <!-- Contorno Exterior Dorado -->
    <path d="M 0 -75 L 56 -52 C 56 15, 38 60, 0 78 C -38 60, -56 15, -56 -52 Z" fill="url(#goldGradient)" />
    <!-- Cuerpo Azul Marino -->
    <path d="M 0 -70 L 51 -49 C 51 12, 34 54, 0 71 C -34 54, -51 12, -51 -49 Z" fill="url(#navyEscudo)" />
    <!-- Ribete Rojo Institucional Superior -->
    <path d="M 0 -70 L 51 -49 L 45 -42 L 0 -63 L -45 -42 L -51 -49 Z" fill="url(#redAccent)" />

    <!-- Balanza de la Justicia (Símbolo de Probidad y Control) -->
    <g id="balanza" transform="translate(0, -5)">
      <!-- Pilar Central -->
      <line x1="0" y1="-32" x2="0" y2="35" stroke="url(#goldGradient)" stroke-width="3.5" stroke-linecap="round" />
      <!-- Remate Superior Cruz / Pomo -->
      <circle cx="0" cy="-35" r="4.5" fill="url(#goldGradient)" />
      <!-- Base sólida de la columna -->
      <path d="M -16 35 L 16 35 L 12 30 L -12 30 Z" fill="url(#goldGradient)" />
      <line x1="-20" y1="38" x2="20" y2="38" stroke="url(#goldGradient)" stroke-width="2" stroke-linecap="round" />

      <!-- Brazo Horizontal oscilante -->
      <line x1="-36" y1="-20" x2="36" y2="-20" stroke="url(#goldGradient)" stroke-width="3" stroke-linecap="round" />
      <circle cx="0" cy="-20" r="3.5" fill="#FFFFFF" />
      
      <!-- Platillo Izquierdo -->
      <line x1="-36" y1="-20" x2="-45" y2="2" stroke="#FDE68A" stroke-width="1.2" />
      <line x1="-36" y1="-20" x2="-27" y2="2" stroke="#FDE68A" stroke-width="1.2" />
      <path d="M -47 2 Q -36 10 -25 2 Z" fill="url(#goldGradient)" />
      
      <!-- Platillo Derecho -->
      <line x1="36" y1="-20" x2="27" y2="2" stroke="#FDE68A" stroke-width="1.2" />
      <line x1="36" y1="-20" x2="45" y2="2" stroke="#FDE68A" stroke-width="1.2" />
      <path d="M 25 2 Q 36 10 47 2 Z" fill="url(#goldGradient)" />

      <!-- Ojo Vigilante de la Transparencia -->
      <circle cx="0" cy="2" r="5" fill="#EF4444" stroke="#FFFFFF" stroke-width="1" />
    </g>
  </g>

  <!-- Lazo / Cinta "LEY PROVINCIAL 5886" -->
  <g transform="translate(100, 185)">
    <rect x="-70" y="0" width="140" height="15" rx="3" fill="#082032" stroke="#F59E0B" stroke-width="1" />
    <text x="0" y="11" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#FDE68A" text-anchor="middle" letter-spacing="1.2">REPARTICIÓN 2100 • OA</text>
  </g>

  <!-- Tipografía Oficial -->
  <text x="100" y="215" font-family="'Times New Roman', serif" font-size="12" font-weight="900" fill="#082032" text-anchor="middle" letter-spacing="0.5">OFICINA ANTICORRUPCIÓN</text>
  <text x="100" y="228" font-family="'Times New Roman', serif" font-size="8.5" font-weight="bold" fill="#B71C1C" text-anchor="middle" letter-spacing="1">PROVINCIA DE JUJUY</text>
</svg>
`)}`;

export const DEFAULT_CONFIG_INSTITUCIONAL = {
  logoGobiernoUrl: DEFAULT_LOGO_GOBIERNO_SVG,
  logoReparticionUrl: DEFAULT_LOGO_REPARTICION_SVG,
  nombreGobierno: 'GOBIERNO DE LA PROVINCIA DE JUJUY',
  lemaGobierno: 'Poder Ejecutivo • Secretaría de Gestión Pública',
  nombreReparticion: 'OFICINA ANTICORRUPCIÓN',
  subtituloReparticion: 'Repartición Oficial 2100 • Órgano Constitucional de Control',
  codigoReparticion: '2100',
  mostrarLogoGobiernoEncabezado: true,
  mostrarLogoReparticionEncabezado: true,
  habilitarMarcaDeAgua: true,
  marcaDeAguaTipo: 'gobierno' as const, // 'gobierno' | 'reparticion' | 'ambos'
  marcaDeAguaOpacidad: 0.08, // 8% de opacidad para que no interrumpa la lectura
  marcaDeAguaEscala: 65, // % del ancho/alto del documento
  marcaDeAguaPosicion: 'centro' as const, // 'centro' | 'diagonal'
  textoPiePagina: 'Documento Oficial Digitalizado • Sistema SIGED • Validez Jurídica según Ley Pcial. N° 5886',
};
