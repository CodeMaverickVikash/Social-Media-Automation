// Claude-drawn product illustrations: used when the user has no product photo.
//
// Pure vector (SVG) fashion illustration of a garment on a headless mannequin, in a heritage
// arch setting. Rendered by scripts/draw-product.ts at full resolution (vector → never pixelated),
// then used like a product photo, normally in the `arch` post template.
//
// Coordinate system: figure drawn in x 0–900, y 0–1200, centred on x = 450. The stage is
// "wide" (3:2, x -450–1350) by default so the whole figure stays visible in the landscape
// arch windows of the post template (≈1.15:1 feed/story, ≈1.5:1 square), or "tall" (3:4).

export type Garment = 'sherwani' | 'kurta';
export type Occasion = 'wedding' | 'festive' | 'everyday';

export interface Palette {
  /** Backdrop gradient, top → bottom */
  backdrop: [string, string];
  /** Arch outline and fine lines on the backdrop */
  line: string;
  garment: string;
  /** Embroidery / zari / thread work */
  accent: string;
  bottoms: string;
  shoes: string;
  mannequin: string;
  /** Sherwani stole (dupatta); omit for none */
  stole?: string;
}

export interface IllustrationSpec {
  garment: Garment;
  occasion: Occasion;
  palette: Palette;
  /** Output width in px; height follows the stage */
  width: number;
  /** wide = 3:2 stage (default, for arch windows) · tall = 3:4 */
  stage?: 'wide' | 'tall';
}

/** Default look per catalogue product. */
export const PRESETS: Record<string, { garment: Garment; palette: Palette }> = {
  sherwani: {
    garment: 'sherwani',
    palette: {
      backdrop: ['#5E1A2B', '#2A0A12'], line: '#D6AE6B',
      garment: '#EADCC2', accent: '#B98B3E', bottoms: '#F3EBDC', shoes: '#C9A15A',
      mannequin: '#D8D0C4', stole: '#7A1F35',
    },
  },
  'kurta-pajama': {
    garment: 'kurta',
    palette: {
      backdrop: ['#F1E9DC', '#D9C6AE'], line: '#8E5E38',
      garment: '#223152', accent: '#E8DFCB', bottoms: '#F5F2EA', shoes: '#8E5E38',
      mannequin: '#E4DDD2',
    },
  },
};

const mirrorX = (d: string): string =>
  // Mirror absolute path coordinates around x = 450 (only "x,y" pairs; arcs are not used in mirrored shapes).
  d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x: string, y: string) => `${900 - Number(x)},${y}`);

function shapes(g: Garment) {
  const long = g === 'sherwani';
  const hemY = long ? 872 : 846;
  const hemDip = long ? 888 : 858;
  const body = long
    ? `M420,246 C380,252 336,262 308,282 C318,318 324,350 322,392 C320,440 330,480 332,520 C330,580 324,620 322,660 C316,740 304,810 294,${hemY} Q450,${hemDip} 606,${hemY} C596,810 584,740 578,660 C576,620 570,580 568,520 C570,480 580,440 578,392 C576,350 582,318 592,282 C564,262 520,252 480,246 Q450,262 420,246 Z`
    : `M420,246 C380,252 336,262 308,282 C318,318 324,350 322,392 C320,440 326,480 328,520 C328,580 324,620 322,660 C318,740 312,800 306,${hemY} Q450,${hemDip} 594,${hemY} C588,800 582,740 578,660 C576,620 572,580 572,520 C574,480 580,440 578,392 C576,350 582,318 592,282 C564,262 520,252 480,246 Q450,262 420,246 Z`;
  const sleeveL = 'M308,282 C288,296 280,330 278,392 L266,646 Q292,660 324,650 L334,392 Z';
  const legL = long ? 'M392,866 L446,866 L442,1072 L406,1072 Z' : 'M384,840 L448,840 L446,1074 L394,1074 Z';
  const shoeL = 'M402,1068 L446,1068 Q456,1092 444,1108 L404,1108 Q392,1092 402,1068 Z';
  return { body, hemY, sleeveL, sleeveR: mirrorX(sleeveL), legL, legR: mirrorX(legL), shoeL, shoeR: mirrorX(shoeL) };
}

function marigolds(wide: boolean): string {
  const flower = (x: number, y: number, i: number) =>
    `<circle cx="${x}" cy="${y}" r="13" fill="${i % 3 === 1 ? '#F2B233' : '#E58A1F'}"/>` +
    `<circle cx="${x - 3}" cy="${y - 3}" r="6" fill="#FFFFFF" opacity=".18"/>` +
    `<circle cx="${x}" cy="${y}" r="13" fill="url(#petals)" opacity=".5"/>`;
  let out = '';
  // Swag across the top
  const steps = wide ? 44 : 26;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = (wide ? -170 : 90) + t * (wide ? 1240 : 720);
    const y = 36 + 4 * t * (1 - t) * 70;
    out += flower(x, y, i);
  }
  // Hanging strings at both sides
  for (const x of wide ? [-170, 90, 810, 1070] : [90, 810]) {
    for (let i = 0; i < 24; i++) out += flower(x, 62 + i * 25, i);
    out += `<path d="M${x - 8},668 l8,22 l8,-22 Z" fill="#5E7A3A"/>`;
  }
  return out;
}

export function illustrationSvg(spec: IllustrationSpec): string {
  const { garment: g, occasion, palette: p } = spec;
  const wide = (spec.stage ?? 'wide') === 'wide';
  const [vx, vw] = wide ? [-450, 1800] : [0, 900];
  const W = spec.width, H = Math.round(spec.width * 1200 / vw);
  const s = shapes(g);
  const long = g === 'sherwani';
  const dark = isDark(p.backdrop[1]);

  const buttons = (long ? [290, 332, 374, 416, 458, 500, 542, 584] : [286, 332, 378, 424])
    .map(y => `<circle cx="450" cy="${y}" r="6.5" fill="${p.accent}"/><circle cx="448" cy="${y - 2}" r="2.4" fill="#FFFFFF" opacity=".55"/>`).join('');

  const ruching = long
    ? [996, 1006, 1016, 1026, 1036, 1046, 1056].map(y =>
        `<path d="M407,${y} Q424,${y + 6} 441,${y}" stroke="#000" stroke-opacity=".13" stroke-width="2" fill="none"/>` +
        `<path d="M459,${y} Q476,${y + 6} 493,${y}" stroke="#000" stroke-opacity=".13" stroke-width="2" fill="none"/>`).join('')
    : `<path d="M420,860 L421,1068" stroke="#000" stroke-opacity=".08" stroke-width="2"/><path d="M480,860 L479,1068" stroke="#000" stroke-opacity=".08" stroke-width="2"/>`;

  const placket = long
    ? `<rect x="438" y="252" width="24" height="640" fill="${p.accent}" clip-path="url(#bodyClip)"/>
       <rect x="438" y="252" width="24" height="640" fill="url(#zari)" clip-path="url(#bodyClip)"/>`
    : `<path d="M422,258 L478,258 L478,486 Q450,504 422,486 Z" fill="url(#thread)"/>
       <path d="M440,258 L460,258 L460,470 Q450,478 440,470 Z" fill="${p.garment}" stroke="${p.accent}" stroke-width="2"/>`;

  const hemBorder = long
    ? `<g clip-path="url(#bodyClip)"><rect x="280" y="836" width="340" height="70" fill="${p.accent}"/><rect x="280" y="836" width="340" height="70" fill="url(#zari)"/>
       <rect x="280" y="830" width="340" height="3" fill="${p.accent}"/></g>`
    : `<g clip-path="url(#bodyClip)"><rect x="290" y="822" width="320" height="3" fill="${p.accent}" opacity=".9"/><rect x="290" y="830" width="320" height="2" fill="${p.accent}" opacity=".6"/></g>
       <path d="M318,770 L306,${s.hemY} L328,${s.hemY + 3} Z" fill="${p.bottoms}"/><path d="M582,770 L594,${s.hemY} L572,${s.hemY + 3} Z" fill="${p.bottoms}"/>`;

  const cuffs = long
    ? `<g clip-path="url(#sleeveClip)"><rect x="250" y="608" width="400" height="60" fill="${p.accent}"/><rect x="250" y="608" width="400" height="60" fill="url(#zari)"/></g>`
    : `<g clip-path="url(#sleeveClip)"><rect x="250" y="616" width="400" height="3" fill="${p.accent}"/><rect x="250" y="626" width="400" height="2" fill="${p.accent}" opacity=".7"/></g>`;

  const stole = long && p.stole ? `
    <g>
      <path id="stole" d="M316,272 C336,264 362,266 380,278 C374,420 368,620 362,904 L304,910 C308,640 310,430 316,272 Z" fill="${p.stole}"/>
      <path d="M316,272 C336,264 362,266 380,278 C374,420 368,620 362,904 L304,910 C308,640 310,430 316,272 Z" fill="url(#buti)" opacity=".7"/>
      <path d="M324,276 C318,440 316,640 312,904" stroke="${p.accent}" stroke-width="4" fill="none"/>
      <path d="M372,282 C366,440 360,640 354,904" stroke="${p.accent}" stroke-width="4" fill="none"/>
      <path d="M305,874 L363,870 L362,904 L304,910 Z" fill="${p.accent}"/>
      <path d="M305,874 L363,870 L362,904 L304,910 Z" fill="url(#zari)"/>
      ${Array.from({ length: 9 }, (_, i) => `<path d="M${308 + i * 6.6},${909 - i * 0.7} l0,24" stroke="${p.accent}" stroke-width="2.4" stroke-linecap="round"/>`).join('')}
      <path d="M316,272 C336,264 362,266 380,278 C374,420 368,620 362,904 L304,910 C308,640 310,430 316,272 Z" fill="url(#shade)"/>
    </g>` : '';

  const folds = `
    <path d="M372,560 C366,660 356,760 344,${s.hemY - 6}" stroke="#000" stroke-opacity=".07" stroke-width="3" fill="none"/>
    <path d="M528,560 C534,660 544,760 556,${s.hemY - 6}" stroke="#000" stroke-opacity=".07" stroke-width="3" fill="none"/>
    <path d="M410,600 C406,700 402,780 398,${s.hemY - 2}" stroke="#FFF" stroke-opacity=".08" stroke-width="4" fill="none"/>
    <path d="M286,470 Q300,478 318,472" stroke="#000" stroke-opacity=".1" stroke-width="2.5" fill="none"/>
    <path d="M614,470 Q600,478 582,472" stroke="#000" stroke-opacity=".1" stroke-width="2.5" fill="none"/>`;

  const archLine = `
    <path d="M196,1110 V430 A254,254 0 0 1 704,430 V1110" fill="${dark ? '#FFFFFF' : '#FFFFFF'}" fill-opacity="${dark ? '.05' : '.35'}" stroke="${p.line}" stroke-opacity=".55" stroke-width="3"/>
    <path d="M218,1110 V432 A232,232 0 0 1 682,432 V1110" fill="none" stroke="${p.line}" stroke-opacity=".3" stroke-width="1.5"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="${vx} 0 ${vw} 1200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.backdrop[0]}"/><stop offset="1" stop-color="${p.backdrop[1]}"/></linearGradient>
    <radialGradient id="glow" cx=".5" cy=".45" r=".55"><stop offset="0" stop-color="#FFFFFF" stop-opacity="${dark ? '.16' : '.45'}"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
    <radialGradient id="vignette" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${dark ? '.35' : '.12'}"/></radialGradient>
    <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity=".24"/><stop offset=".2" stop-color="#000" stop-opacity=".04"/>
      <stop offset=".46" stop-color="#FFF" stop-opacity=".12"/><stop offset=".8" stop-color="#000" stop-opacity=".05"/>
      <stop offset="1" stop-color="#000" stop-opacity=".26"/>
    </linearGradient>
    <linearGradient id="topLight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF" stop-opacity=".10"/><stop offset=".5" stop-color="#FFF" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".10"/></linearGradient>
    <pattern id="buti" width="34" height="40" patternUnits="userSpaceOnUse">
      <g fill="${p.accent}" opacity=".75">
        <circle cx="8" cy="7" r="1.8"/><circle cx="8" cy="13" r="1.8"/><circle cx="5" cy="10" r="1.8"/><circle cx="11" cy="10" r="1.8"/><circle cx="8" cy="10" r="1.1"/>
        <circle cx="25" cy="27" r="1.8"/><circle cx="25" cy="33" r="1.8"/><circle cx="22" cy="30" r="1.8"/><circle cx="28" cy="30" r="1.8"/><circle cx="25" cy="30" r="1.1"/>
      </g>
    </pattern>
    <pattern id="zari" width="18" height="18" patternUnits="userSpaceOnUse">
      <path d="M9,2 L16,9 L9,16 L2,9 Z" fill="none" stroke="#5A3A12" stroke-opacity=".45" stroke-width="1.4"/>
      <circle cx="9" cy="9" r="2" fill="#FFF3D6" fill-opacity=".7"/>
    </pattern>
    <pattern id="thread" width="14" height="14" patternUnits="userSpaceOnUse">
      <rect width="14" height="14" fill="${p.garment}"/>
      <circle cx="7" cy="7" r="2.2" fill="none" stroke="${p.accent}" stroke-width="1.1"/>
      <circle cx="0" cy="0" r="1" fill="${p.accent}"/><circle cx="14" cy="14" r="1" fill="${p.accent}"/>
    </pattern>
    <pattern id="petals" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.4" fill="#B5560E"/></pattern>
    <clipPath id="bodyClip"><path d="${s.body}"/></clipPath>
    <clipPath id="sleeveClip"><path d="${s.sleeveL}"/><path d="${s.sleeveR}"/></clipPath>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
    <filter id="drop" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="9"/><feOffset dx="0" dy="8"/><feComponentTransfer><feFuncA type="linear" slope=".35"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>

  <rect x="${vx}" width="${vw}" height="1200" fill="url(#bg)"/>
  <rect x="${vx}" y="1100" width="${vw}" height="100" fill="#000" opacity="${dark ? '.22' : '.06'}"/>
  ${archLine}
  <rect x="${vx}" width="${vw}" height="1200" fill="url(#glow)"/>
  ${occasion !== 'everyday' ? marigolds(wide) : ''}
  <ellipse cx="450" cy="1112" rx="170" ry="18" fill="#000" opacity="${dark ? '.55' : '.25'}" filter="url(#soft)"/>

  <g filter="url(#drop)">
    <!-- mannequin neck -->
    <path d="M424,258 L426,198 Q450,186 474,198 L476,258 Z" fill="${p.mannequin}"/>
    <ellipse cx="450" cy="198" rx="24" ry="7" fill="#000" opacity=".12"/>
    <path d="M424,258 L426,198 Q450,186 474,198 L476,258 Z" fill="url(#shade)"/>

    <!-- bottoms + shoes -->
    <path d="${s.legL}" fill="${p.bottoms}"/><path d="${s.legR}" fill="${p.bottoms}"/>
    <path d="${s.legL}" fill="url(#shade)"/><path d="${s.legR}" fill="url(#shade)"/>
    ${ruching}
    <path d="${s.shoeL}" fill="${p.shoes}"/><path d="${s.shoeR}" fill="${p.shoes}"/>
    ${long ? `<path d="${s.shoeL}" fill="url(#zari)"/><path d="${s.shoeR}" fill="url(#zari)"/>` : ''}
    <path d="${s.shoeL}" fill="url(#shade)"/><path d="${s.shoeR}" fill="url(#shade)"/>

    <!-- sleeves -->
    <path d="${s.sleeveL}" fill="${p.garment}"/><path d="${s.sleeveR}" fill="${p.garment}"/>
    ${long ? `<g clip-path="url(#sleeveClip)"><rect x="250" y="270" width="400" height="400" fill="url(#buti)"/></g>` : ''}
    ${cuffs}
    <path d="${s.sleeveL}" fill="url(#shade)"/><path d="${s.sleeveR}" fill="url(#shade)"/>

    <!-- body -->
    <path d="${s.body}" fill="${p.garment}"/>
    ${long ? `<g clip-path="url(#bodyClip)"><rect x="280" y="240" width="340" height="660" fill="url(#buti)"/></g>` : ''}
    ${hemBorder}
    ${placket}
    ${buttons}
    ${folds}
    <path d="${s.body}" fill="url(#shade)"/>
    <path d="${s.body}" fill="url(#topLight)"/>

    <!-- collar -->
    <path d="M420,232 Q450,226 480,232 L482,258 Q450,266 418,258 Z" fill="${long ? p.accent : p.garment}"/>
    ${long ? `<path d="M420,232 Q450,226 480,232 L482,258 Q450,266 418,258 Z" fill="url(#zari)"/>` : ''}
    <path d="M420,232 Q450,226 480,232 L482,258 Q450,266 418,258 Z" fill="none" stroke="${p.accent}" stroke-width="2"/>

    ${stole}
  </g>
  <rect x="${vx}" width="${vw}" height="1200" fill="url(#vignette)"/>
</svg>`;
}

function isDark(hex: string): boolean {
  const n = parseInt(hex.replace('#', ''), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 128;
}
