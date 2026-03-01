/**
 * Simple SVG line drawings for phonics words.
 * Each component renders a black-outline illustration that can be colored via the `color` prop.
 * Style matches the Primary Phonics workbook's simple, child-friendly aesthetic.
 */

interface Props {
  color?: string
}

function Svg({ children, color = 'currentColor' }: Props & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  )
}

function Cat({ color }: Props) {
  return (
    <Svg color={color}>
      {/* ears */}
      <polygon points="30,35 25,18 38,30" />
      <polygon points="70,35 75,18 62,30" />
      {/* head */}
      <ellipse cx="50" cy="40" rx="22" ry="18" />
      {/* eyes */}
      <circle cx="42" cy="37" r="2.5" fill={color || 'currentColor'} stroke="none" />
      <circle cx="58" cy="37" r="2.5" fill={color || 'currentColor'} stroke="none" />
      {/* nose + mouth */}
      <polygon points="50,43 48,46 52,46" fill={color || 'currentColor'} stroke="none" />
      <path d="M50 46 Q50 50 46 50" />
      <path d="M50 46 Q50 50 54 50" />
      {/* whiskers */}
      <line x1="30" y1="43" x2="42" y2="44" />
      <line x1="30" y1="48" x2="42" y2="47" />
      <line x1="58" y1="44" x2="70" y2="43" />
      <line x1="58" y1="47" x2="70" y2="48" />
      {/* body */}
      <ellipse cx="50" cy="70" rx="18" ry="16" />
      {/* tail */}
      <path d="M68 65 Q82 55 78 42" />
      {/* legs */}
      <line x1="40" y1="84" x2="40" y2="94" />
      <line x1="60" y1="84" x2="60" y2="94" />
    </Svg>
  )
}

function Bat({ color }: Props) {
  return (
    <Svg color={color}>
      {/* body */}
      <ellipse cx="50" cy="50" rx="10" ry="14" />
      {/* head */}
      <circle cx="50" cy="33" r="8" />
      {/* ears */}
      <polygon points="44,27 40,16 47,27" />
      <polygon points="56,27 60,16 53,27" />
      {/* eyes */}
      <circle cx="47" cy="32" r="1.5" fill={color || 'currentColor'} stroke="none" />
      <circle cx="53" cy="32" r="1.5" fill={color || 'currentColor'} stroke="none" />
      {/* wings */}
      <path d="M40 45 Q20 30 12 48 Q18 44 25 48 Q20 50 15 55 Q25 50 35 55" />
      <path d="M60 45 Q80 30 88 48 Q82 44 75 48 Q80 50 85 55 Q75 50 65 55" />
      {/* feet */}
      <line x1="45" y1="64" x2="45" y2="72" />
      <line x1="55" y1="64" x2="55" y2="72" />
    </Svg>
  )
}

function Hat({ color }: Props) {
  return (
    <Svg color={color}>
      {/* brim */}
      <ellipse cx="50" cy="70" rx="35" ry="8" />
      {/* crown */}
      <rect x="30" y="35" width="40" height="35" rx="3" />
      {/* band */}
      <rect x="30" y="58" width="40" height="6" />
    </Svg>
  )
}

function Pan({ color }: Props) {
  return (
    <Svg color={color}>
      {/* pan body */}
      <ellipse cx="45" cy="60" rx="28" ry="12" />
      <path d="M17 55 Q17 45 45 45 Q73 45 73 55" />
      {/* handle */}
      <line x1="73" y1="52" x2="95" y2="42" />
      <ellipse cx="95" cy="42" rx="4" ry="2" />
    </Svg>
  )
}

function Rat({ color }: Props) {
  return (
    <Svg color={color}>
      {/* body */}
      <ellipse cx="45" cy="62" rx="26" ry="15" />
      {/* head */}
      <ellipse cx="74" cy="54" rx="13" ry="11" />
      {/* large round ear — rats' most distinctive feature */}
      <circle cx="70" cy="38" r="9" />
      <circle cx="70" cy="38" r="5" />
      {/* pointed snout */}
      <path d="M86 52 Q94 55 86 58" />
      {/* eye */}
      <circle cx="79" cy="50" r="2.5" fill={color || 'currentColor'} stroke="none" />
      {/* nose */}
      <circle cx="93" cy="55" r="1.5" fill={color || 'currentColor'} stroke="none" />
      {/* whiskers */}
      <line x1="93" y1="53" x2="100" y2="49" />
      <line x1="93" y1="55" x2="101" y2="55" />
      <line x1="93" y1="57" x2="100" y2="61" />
      {/* long curly tail */}
      <path d="M20 60 Q8 48 10 35 Q12 22 22 25" strokeWidth="2" fill="none" />
      {/* legs */}
      <line x1="38" y1="76" x2="34" y2="88" />
      <line x1="52" y1="76" x2="56" y2="88" />
    </Svg>
  )
}

function Fan({ color }: Props) {
  return (
    <Svg color={color}>
      {/* fan blades */}
      <path d="M50 45 Q30 20 50 15 Q55 20 50 45" />
      <path d="M50 45 Q75 25 80 45 Q72 45 50 45" />
      <path d="M50 45 Q70 70 50 75 Q45 70 50 45" />
      <path d="M50 45 Q25 65 20 45 Q28 45 50 45" />
      {/* center */}
      <circle cx="50" cy="45" r="4" fill={color || 'currentColor'} />
      {/* handle */}
      <line x1="50" y1="49" x2="50" y2="90" strokeWidth="4" />
    </Svg>
  )
}

function Man({ color }: Props) {
  return (
    <Svg color={color}>
      {/* head */}
      <circle cx="50" cy="22" r="12" />
      {/* eyes */}
      <circle cx="46" cy="20" r="1.5" fill={color || 'currentColor'} stroke="none" />
      <circle cx="54" cy="20" r="1.5" fill={color || 'currentColor'} stroke="none" />
      {/* smile */}
      <path d="M46 26 Q50 30 54 26" />
      {/* body */}
      <line x1="50" y1="34" x2="50" y2="62" strokeWidth="3" />
      {/* arms */}
      <line x1="50" y1="42" x2="30" y2="55" />
      <line x1="50" y1="42" x2="70" y2="55" />
      {/* legs */}
      <line x1="50" y1="62" x2="35" y2="90" />
      <line x1="50" y1="62" x2="65" y2="90" />
    </Svg>
  )
}

function Van({ color }: Props) {
  return (
    <Svg color={color}>
      {/* body */}
      <rect x="15" y="40" width="70" height="30" rx="4" />
      {/* cab windshield */}
      <line x1="60" y1="40" x2="60" y2="70" />
      <path d="M60 40 L75 28 Q85 28 85 40" />
      {/* window */}
      <rect x="22" y="46" width="14" height="10" rx="2" />
      <rect x="40" y="46" width="14" height="10" rx="2" />
      {/* wheels */}
      <circle cx="30" cy="72" r="8" />
      <circle cx="30" cy="72" r="3" />
      <circle cx="70" cy="72" r="8" />
      <circle cx="70" cy="72" r="3" />
    </Svg>
  )
}

function Can({ color }: Props) {
  return (
    <Svg color={color}>
      {/* top rim */}
      <ellipse cx="50" cy="25" rx="20" ry="7" />
      {/* body */}
      <line x1="30" y1="25" x2="30" y2="75" />
      <line x1="70" y1="25" x2="70" y2="75" />
      {/* bottom */}
      <ellipse cx="50" cy="75" rx="20" ry="7" />
      {/* label line */}
      <line x1="30" y1="45" x2="70" y2="45" />
      <line x1="30" y1="55" x2="70" y2="55" />
    </Svg>
  )
}

function Sad({ color }: Props) {
  return (
    <Svg color={color}>
      {/* face */}
      <circle cx="50" cy="45" r="28" />
      {/* eyes */}
      <circle cx="40" cy="40" r="3" fill={color || 'currentColor'} stroke="none" />
      <circle cx="60" cy="40" r="3" fill={color || 'currentColor'} stroke="none" />
      {/* sad mouth */}
      <path d="M38 58 Q50 50 62 58" />
      {/* tear */}
      <path d="M62 44 Q64 50 62 52" fill={color || 'currentColor'} stroke="none" />
    </Svg>
  )
}

function Dad({ color }: Props) {
  return (
    <Svg color={color}>
      {/* head */}
      <circle cx="50" cy="22" r="12" />
      {/* eyes */}
      <circle cx="46" cy="20" r="1.5" fill={color || 'currentColor'} stroke="none" />
      <circle cx="54" cy="20" r="1.5" fill={color || 'currentColor'} stroke="none" />
      {/* smile */}
      <path d="M46 26 Q50 30 54 26" />
      {/* hair short */}
      <path d="M38 18 Q50 8 62 18" />
      {/* body */}
      <line x1="50" y1="34" x2="50" y2="62" strokeWidth="3" />
      {/* tie */}
      <polygon points="50,36 47,42 50,45 53,42" fill={color || 'currentColor'} stroke="none" />
      {/* arms */}
      <line x1="50" y1="42" x2="30" y2="55" />
      <line x1="50" y1="42" x2="70" y2="55" />
      {/* legs */}
      <line x1="50" y1="62" x2="35" y2="90" />
      <line x1="50" y1="62" x2="65" y2="90" />
    </Svg>
  )
}

function Pad({ color }: Props) {
  return (
    <Svg color={color}>
      {/* notepad */}
      <rect x="25" y="15" width="50" height="70" rx="3" />
      {/* spiral binding */}
      <circle cx="32" cy="20" r="2" />
      <circle cx="42" cy="20" r="2" />
      <circle cx="52" cy="20" r="2" />
      <circle cx="62" cy="20" r="2" />
      {/* lines */}
      <line x1="32" y1="35" x2="68" y2="35" />
      <line x1="32" y1="45" x2="68" y2="45" />
      <line x1="32" y1="55" x2="68" y2="55" />
      <line x1="32" y1="65" x2="68" y2="65" />
    </Svg>
  )
}

function Mad({ color }: Props) {
  return (
    <Svg color={color}>
      {/* face */}
      <circle cx="50" cy="45" r="28" />
      {/* angry eyebrows */}
      <line x1="33" y1="32" x2="43" y2="36" />
      <line x1="67" y1="32" x2="57" y2="36" />
      {/* eyes */}
      <circle cx="40" cy="40" r="3" fill={color || 'currentColor'} stroke="none" />
      <circle cx="60" cy="40" r="3" fill={color || 'currentColor'} stroke="none" />
      {/* mad mouth */}
      <path d="M38 58 Q50 52 62 58" />
    </Svg>
  )
}

function Ham({ color }: Props) {
  return (
    <Svg color={color}>
      {/* meat — large round ham portion */}
      <circle cx="42" cy="55" r="30" />
      {/* diamond score pattern on the surface */}
      <line x1="28" y1="40" x2="56" y2="68" />
      <line x1="38" y1="30" x2="66" y2="58" />
      <line x1="18" y1="50" x2="46" y2="78" />
      <line x1="20" y1="62" x2="62" y2="40" />
      <line x1="22" y1="74" x2="68" y2="48" />
      <line x1="24" y1="85" x2="66" y2="62" />
      {/* bone stick */}
      <line x1="66" y1="55" x2="88" y2="55" strokeWidth="5" />
      {/* classic cartoon bone knobs at the end */}
      <circle cx="90" cy="50" r="5" />
      <circle cx="90" cy="60" r="5" />
      {/* knob at meat end */}
      <circle cx="66" cy="50" r="4" />
      <circle cx="66" cy="60" r="4" />
    </Svg>
  )
}

export const COLOR_FILTERS: Record<string, string> = {
  red: 'invert(16%) sepia(96%) saturate(7482%) hue-rotate(357deg) brightness(97%) contrast(118%)',
  blue: 'invert(23%) sepia(94%) saturate(2084%) hue-rotate(199deg) brightness(97%) contrast(102%)',
  green: 'invert(44%) sepia(83%) saturate(1070%) hue-rotate(74deg) brightness(95%) contrast(101%)',
  brown: 'invert(24%) sepia(77%) saturate(996%) hue-rotate(350deg) brightness(91%) contrast(88%)',
  black: 'none',
  pink: 'invert(72%) sepia(21%) saturate(1126%) hue-rotate(289deg) brightness(100%) contrast(97%)',
  orange: 'invert(63%) sepia(89%) saturate(1371%) hue-rotate(358deg) brightness(101%) contrast(103%)',
  purple: 'invert(24%) sepia(75%) saturate(3273%) hue-rotate(265deg) brightness(90%) contrast(92%)',
}

export const COLOR_OPTIONS = Object.keys(COLOR_FILTERS)

function getColorFilter(color?: string): string | undefined {
  if (!color) return undefined
  return COLOR_FILTERS[color.toLowerCase()]
}

function PrimaryPhonicsImage({ word, color }: { word: string; color?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/primary_phonics/${word}.png`}
      alt={word}
      className="w-full h-full object-contain"
      style={{ filter: getColorFilter(color) }}
    />
  )
}

const PRIMARY_PHONICS_IMAGE_WORDS = [
  'bed', 'bib', 'big', 'box', 'chat', 'chin', 'clap', 'cot', 'crab', 'dig',
  'dog', 'drum', 'duck', 'fin', 'flag', 'fog', 'frog', 'hem', 'hen', 'hit',
  'hop', 'jet', 'jump', 'kid', 'leg', 'lid', 'lip', 'log', 'milk', 'mop',
  'net', 'nod', 'peg', 'pen', 'pet', 'pig', 'pin', 'pot', 'red', 'ring',
  'rod', 'ship', 'shop', 'sit', 'sled', 'sob', 'spin', 'stop', 'ten', 'top',
  'tub', 'vet', 'web', 'whip', 'zip',
] as const

const primaryPhonicsIllustrations = Object.fromEntries(
  PRIMARY_PHONICS_IMAGE_WORDS.map(word => [
    word,
    ({ color }: Props) => <PrimaryPhonicsImage word={word} color={color} />,
  ]),
) as Record<(typeof PRIMARY_PHONICS_IMAGE_WORDS)[number], (props: Props) => React.JSX.Element>

// Ram uses an external SVG image; apply CSS filter so sentence_match colors can still work.
function Ram({ color }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/ram.svg"
      alt="ram"
      className="w-full h-full object-contain"
      style={{ filter: getColorFilter(color) }}
    />
  )
}

function Dam({ color }: Props) {
  return (
    <Svg color={color}>
      {/* water */}
      <path d="M5 55 Q15 50 25 55 Q35 60 45 55 Q55 50 65 55 Q75 60 85 55 L95 55 L95 90 L5 90 Z" strokeWidth="1.5" />
      {/* dam wall */}
      <rect x="40" y="20" width="20" height="40" rx="1" />
      {/* bricks */}
      <line x1="40" y1="30" x2="60" y2="30" />
      <line x1="40" y1="40" x2="60" y2="40" />
      <line x1="40" y1="50" x2="60" y2="50" />
      <line x1="50" y1="20" x2="50" y2="30" />
      <line x1="50" y1="40" x2="50" y2="50" />
    </Svg>
  )
}

function Jam({ color }: Props) {
  return (
    <Svg color={color}>
      {/* jar body */}
      <rect x="28" y="35" width="44" height="45" rx="5" />
      {/* jar neck */}
      <rect x="35" y="25" width="30" height="12" rx="2" />
      {/* lid */}
      <rect x="32" y="20" width="36" height="8" rx="3" />
      {/* label */}
      <rect x="34" y="48" width="32" height="16" rx="2" />
      {/* J on label */}
      <text x="50" y="60" fontSize="12" fill={color || 'currentColor'} stroke="none" textAnchor="middle" fontWeight="bold">JAM</text>
    </Svg>
  )
}

function Mat({ color }: Props) {
  return (
    <Svg color={color}>
      {/* mat body */}
      <rect x="10" y="28" width="80" height="44" rx="4" />
      {/* inner border */}
      <rect x="17" y="35" width="66" height="30" rx="2" />
      {/* horizontal stripes inside */}
      <line x1="17" y1="43" x2="83" y2="43" />
      <line x1="17" y1="50" x2="83" y2="50" />
      <line x1="17" y1="57" x2="83" y2="57" />
      {/* fringe left */}
      <line x1="10" y1="32" x2="2"  y2="32" />
      <line x1="10" y1="38" x2="2"  y2="38" />
      <line x1="10" y1="44" x2="2"  y2="44" />
      <line x1="10" y1="50" x2="2"  y2="50" />
      <line x1="10" y1="56" x2="2"  y2="56" />
      <line x1="10" y1="62" x2="2"  y2="62" />
      <line x1="10" y1="68" x2="2"  y2="68" />
      {/* fringe right */}
      <line x1="90" y1="32" x2="98" y2="32" />
      <line x1="90" y1="38" x2="98" y2="38" />
      <line x1="90" y1="44" x2="98" y2="44" />
      <line x1="90" y1="50" x2="98" y2="50" />
      <line x1="90" y1="56" x2="98" y2="56" />
      <line x1="90" y1="62" x2="98" y2="62" />
      <line x1="90" y1="68" x2="98" y2="68" />
    </Svg>
  )
}

function Bag({ color }: Props) {
  return (
    <Svg color={color}>
      {/* bag body */}
      <rect x="25" y="35" width="50" height="45" rx="4" />
      {/* handles */}
      <path d="M35 35 Q35 18 50 18 Q65 18 65 35" />
      {/* pocket */}
      <rect x="38" y="55" width="24" height="15" rx="2" />
    </Svg>
  )
}

function Tag({ color }: Props) {
  return (
    <Svg color={color}>
      {/* tag shape */}
      <path d="M25 30 L65 30 L80 50 L65 70 L25 70 Z" />
      {/* hole */}
      <circle cx="32" cy="50" r="4" />
      {/* string */}
      <line x1="28" y1="50" x2="12" y2="35" />
      {/* lines on tag */}
      <line x1="45" y1="42" x2="68" y2="42" />
      <line x1="45" y1="50" x2="68" y2="50" />
      <line x1="45" y1="58" x2="60" y2="58" />
    </Svg>
  )
}

function Cap({ color }: Props) {
  return (
    <Svg color={color}>
      {/* cap dome */}
      <path d="M20 55 Q20 25 50 25 Q80 25 80 55" />
      {/* brim */}
      <path d="M10 55 Q10 65 50 65 Q90 65 90 55 L80 55 Q80 60 50 60 Q20 60 20 55 Z" />
      {/* button */}
      <circle cx="50" cy="25" r="3" fill={color || 'currentColor'} stroke="none" />
    </Svg>
  )
}

function MapIllustration({ color }: Props) {
  return (
    <Svg color={color}>
      {/* paper */}
      <rect x="15" y="20" width="70" height="60" rx="2" />
      {/* fold lines */}
      <line x1="40" y1="20" x2="40" y2="80" strokeDasharray="3" />
      <line x1="65" y1="20" x2="65" y2="80" strokeDasharray="3" />
      {/* path */}
      <path d="M25 35 Q35 45 45 35 Q55 25 65 40 Q75 55 80 50" />
      {/* X marks spot */}
      <line x1="72" y1="45" x2="80" y2="53" />
      <line x1="80" y1="45" x2="72" y2="53" />
    </Svg>
  )
}

function Cab({ color }: Props) {
  return (
    <Svg color={color}>
      {/* body */}
      <rect x="15" y="45" width="70" height="25" rx="5" />
      {/* roof */}
      <path d="M30 45 L35 28 L65 28 L70 45" />
      {/* windows */}
      <rect x="37" y="32" width="12" height="11" rx="2" />
      <rect x="52" y="32" width="12" height="11" rx="2" />
      {/* taxi sign */}
      <rect x="43" y="22" width="14" height="6" rx="2" />
      {/* wheels */}
      <circle cx="30" cy="72" r="8" />
      <circle cx="30" cy="72" r="3" />
      <circle cx="70" cy="72" r="8" />
      <circle cx="70" cy="72" r="3" />
    </Svg>
  )
}

function Gas({ color }: Props) {
  return (
    <Svg color={color}>
      {/* pump body */}
      <rect x="30" y="25" width="30" height="50" rx="3" />
      {/* display */}
      <rect x="36" y="32" width="18" height="12" rx="2" />
      {/* nozzle */}
      <path d="M60 40 L72 35 L75 42 L68 44" />
      {/* hose */}
      <path d="M60 45 Q72 48 70 55 Q68 62 60 60" />
      {/* base */}
      <rect x="25" y="75" width="40" height="5" rx="2" />
    </Svg>
  )
}

function Nap({ color }: Props) {
  return (
    <Svg color={color}>
      {/* pillow */}
      <ellipse cx="50" cy="55" rx="35" ry="12" />
      {/* head */}
      <circle cx="45" cy="45" r="14" />
      {/* closed eyes */}
      <path d="M38 44 Q40 46 44 44" />
      <path d="M48 44 Q50 46 54 44" />
      {/* sleeping mouth */}
      <ellipse cx="46" cy="51" rx="3" ry="2" />
      {/* Z's */}
      <text x="68" y="30" fontSize="12" fill={color || 'currentColor'} stroke="none" fontWeight="bold">Z</text>
      <text x="76" y="22" fontSize="9" fill={color || 'currentColor'} stroke="none" fontWeight="bold">z</text>
    </Svg>
  )
}

function Rag({ color }: Props) {
  return (
    <Svg color={color}>
      {/* cloth shape - wrinkled */}
      <path d="M20 30 Q40 25 60 32 Q80 38 85 35 L88 65 Q70 70 50 65 Q30 60 15 68 Z" />
      {/* wrinkle lines */}
      <path d="M30 40 Q45 38 55 42" />
      <path d="M25 52 Q40 48 60 54" />
    </Svg>
  )
}

function Bud({ color }: Props) {
  return (
    <Svg color={color}>
      {/* stem */}
      <line x1="50" y1="50" x2="50" y2="85" strokeWidth="3" />
      {/* leaf */}
      <path d="M50 65 Q60 58 65 65 Q60 72 50 65" />
      {/* bud petals */}
      <path d="M50 30 Q45 20 40 30 Q38 40 50 50 Q62 40 60 30 Q55 20 50 30" />
      {/* center */}
      <ellipse cx="50" cy="38" rx="4" ry="6" />
    </Svg>
  )
}

function Bun({ color }: Props) {
  return (
    <Svg color={color}>
      {/* top bun */}
      <path d="M20 50 Q20 25 50 25 Q80 25 80 50" />
      {/* bottom bun */}
      <path d="M20 55 Q20 75 50 75 Q80 75 80 55" />
      {/* seeds */}
      <ellipse cx="40" cy="38" rx="2" ry="3" transform="rotate(-20 40 38)" fill={color || 'currentColor'} stroke="none" />
      <ellipse cx="55" cy="34" rx="2" ry="3" transform="rotate(15 55 34)" fill={color || 'currentColor'} stroke="none" />
      <ellipse cx="65" cy="42" rx="2" ry="3" transform="rotate(-10 65 42)" fill={color || 'currentColor'} stroke="none" />
      {/* middle line */}
      <line x1="18" y1="52" x2="82" y2="52" />
    </Svg>
  )
}

function Hut({ color }: Props) {
  return (
    <Svg color={color}>
      {/* roof */}
      <polygon points="50,15 15,45 85,45" />
      {/* walls */}
      <rect x="22" y="45" width="56" height="38" />
      {/* door */}
      <rect x="42" y="55" width="16" height="28" rx="2" />
      <circle cx="54" cy="70" r="1.5" fill={color || 'currentColor'} stroke="none" />
      {/* window */}
      <rect x="26" y="52" width="12" height="10" rx="1" />
      <line x1="32" y1="52" x2="32" y2="62" />
    </Svg>
  )
}

function Bug({ color }: Props) {
  return (
    <Svg color={color}>
      {/* body */}
      <ellipse cx="50" cy="55" rx="18" ry="22" />
      {/* head */}
      <circle cx="50" cy="30" r="10" />
      {/* eyes */}
      <circle cx="46" cy="28" r="2" fill={color || 'currentColor'} stroke="none" />
      <circle cx="54" cy="28" r="2" fill={color || 'currentColor'} stroke="none" />
      {/* antennae */}
      <line x1="46" y1="22" x2="38" y2="12" />
      <circle cx="38" cy="12" r="2" fill={color || 'currentColor'} stroke="none" />
      <line x1="54" y1="22" x2="62" y2="12" />
      <circle cx="62" cy="12" r="2" fill={color || 'currentColor'} stroke="none" />
      {/* wing line */}
      <line x1="50" y1="35" x2="50" y2="75" />
      {/* spots */}
      <circle cx="42" cy="50" r="3" />
      <circle cx="58" cy="50" r="3" />
      <circle cx="44" cy="64" r="3" />
      <circle cx="56" cy="64" r="3" />
      {/* legs */}
      <line x1="34" y1="48" x2="22" y2="42" />
      <line x1="34" y1="58" x2="22" y2="58" />
      <line x1="34" y1="68" x2="22" y2="74" />
      <line x1="66" y1="48" x2="78" y2="42" />
      <line x1="66" y1="58" x2="78" y2="58" />
      <line x1="66" y1="68" x2="78" y2="74" />
    </Svg>
  )
}

function Cup({ color }: Props) {
  return (
    <Svg color={color}>
      {/* cup body */}
      <path d="M25 30 L30 75 Q50 82 70 75 L75 30" />
      {/* rim */}
      <line x1="25" y1="30" x2="75" y2="30" />
      {/* handle */}
      <path d="M75 40 Q90 40 90 52 Q90 64 75 64" />
    </Svg>
  )
}

function Mug({ color }: Props) {
  return (
    <Svg color={color}>
      {/* mug body */}
      <rect x="22" y="30" width="48" height="45" rx="5" />
      {/* rim */}
      <line x1="22" y1="30" x2="70" y2="30" strokeWidth="3" />
      {/* handle */}
      <path d="M70 40 Q88 40 88 52 Q88 64 70 64" />
      {/* steam */}
      <path d="M35 25 Q35 18 40 18" />
      <path d="M50 25 Q50 15 55 15" />
    </Svg>
  )
}

function Rug({ color }: Props) {
  return (
    <Svg color={color}>
      {/* rug body */}
      <rect x="12" y="30" width="76" height="40" rx="2" />
      {/* pattern - diamond */}
      <polygon points="50,35 65,50 50,65 35,50" />
      {/* inner diamond */}
      <polygon points="50,40 58,50 50,60 42,50" />
      {/* fringes top */}
      <line x1="18" y1="30" x2="16" y2="22" />
      <line x1="30" y1="30" x2="28" y2="22" />
      <line x1="42" y1="30" x2="40" y2="22" />
      <line x1="54" y1="30" x2="52" y2="22" />
      <line x1="66" y1="30" x2="64" y2="22" />
      <line x1="78" y1="30" x2="76" y2="22" />
      {/* fringes bottom */}
      <line x1="18" y1="70" x2="16" y2="78" />
      <line x1="30" y1="70" x2="28" y2="78" />
      <line x1="42" y1="70" x2="40" y2="78" />
      <line x1="54" y1="70" x2="52" y2="78" />
      <line x1="66" y1="70" x2="64" y2="78" />
      <line x1="78" y1="70" x2="76" y2="78" />
    </Svg>
  )
}

function Sun({ color }: Props) {
  return (
    <Svg color={color}>
      {/* center */}
      <circle cx="50" cy="50" r="16" />
      {/* rays */}
      <line x1="50" y1="10" x2="50" y2="28" />
      <line x1="50" y1="72" x2="50" y2="90" />
      <line x1="10" y1="50" x2="28" y2="50" />
      <line x1="72" y1="50" x2="90" y2="50" />
      <line x1="22" y1="22" x2="38" y2="38" />
      <line x1="62" y1="62" x2="78" y2="78" />
      <line x1="78" y1="22" x2="62" y2="38" />
      <line x1="22" y1="78" x2="38" y2="62" />
      {/* smile */}
      <circle cx="44" cy="46" r="2" fill={color || 'currentColor'} stroke="none" />
      <circle cx="56" cy="46" r="2" fill={color || 'currentColor'} stroke="none" />
      <path d="M42 54 Q50 60 58 54" />
    </Svg>
  )
}

function Run({ color }: Props) {
  return (
    <Svg color={color}>
      {/* head */}
      <circle cx="55" cy="18" r="10" />
      {/* body - leaning forward */}
      <line x1="55" y1="28" x2="48" y2="52" strokeWidth="3" />
      {/* arms - running pose */}
      <line x1="52" y1="35" x2="35" y2="28" />
      <line x1="52" y1="35" x2="68" y2="45" />
      {/* legs - running */}
      <line x1="48" y1="52" x2="30" y2="70" />
      <line x1="30" y1="70" x2="25" y2="82" />
      <line x1="48" y1="52" x2="65" y2="72" />
      <line x1="65" y1="72" x2="75" y2="82" />
      {/* speed lines */}
      <line x1="15" y1="35" x2="28" y2="35" strokeWidth="1" />
      <line x1="12" y1="45" x2="25" y2="45" strokeWidth="1" />
    </Svg>
  )
}

function Gum({ color }: Props) {
  return (
    <Svg color={color}>
      {/* outer wrapper — full stick */}
      <rect x="8" y="36" width="84" height="28" rx="6" />
      {/* left wrapper flap */}
      <rect x="8" y="36" width="22" height="28" rx="6" />
      <line x1="30" y1="36" x2="30" y2="64" />
      {/* right wrapper flap */}
      <rect x="70" y="36" width="22" height="28" rx="6" />
      <line x1="70" y1="36" x2="70" y2="64" />
      {/* gum piece in the center — slightly inset */}
      <rect x="32" y="40" width="36" height="20" rx="3" />
      {/* score line down the middle of gum */}
      <line x1="50" y1="40" x2="50" y2="60" />
    </Svg>
  )
}

function Cot({ color }: Props) {
  return (
    <Svg color={color}>
      <rect x="12" y="40" width="76" height="28" rx="3" />
      <line x1="20" y1="68" x2="20" y2="86" />
      <line x1="80" y1="68" x2="80" y2="86" />
      <rect x="18" y="45" width="18" height="12" rx="2" />
    </Svg>
  )
}

function Hot({ color }: Props) {
  return (
    <Svg color={color}>
      <rect x="40" y="22" width="20" height="52" rx="10" />
      <circle cx="50" cy="74" r="10" />
      <line x1="50" y1="10" x2="50" y2="18" />
      <line x1="30" y1="20" x2="36" y2="24" />
      <line x1="70" y1="20" x2="64" y2="24" />
      <line x1="30" y1="84" x2="37" y2="80" />
      <line x1="70" y1="84" x2="63" y2="80" />
    </Svg>
  )
}

function Pot({ color }: Props) {
  return (
    <Svg color={color}>
      <rect x="24" y="38" width="52" height="30" rx="6" />
      <line x1="20" y1="45" x2="24" y2="45" />
      <line x1="76" y1="45" x2="80" y2="45" />
      <rect x="28" y="32" width="44" height="6" rx="2" />
      <line x1="50" y1="20" x2="50" y2="28" />
    </Svg>
  )
}

function TopWord({ color }: Props) {
  return (
    <Svg color={color}>
      <circle cx="50" cy="40" r="6" />
      <path d="M50 46 L66 58 L50 84 L34 58 Z" />
      <line x1="50" y1="16" x2="50" y2="34" />
      <line x1="30" y1="30" x2="24" y2="24" />
      <line x1="70" y1="30" x2="76" y2="24" />
    </Svg>
  )
}

function Mop({ color }: Props) {
  return (
    <Svg color={color}>
      <line x1="62" y1="14" x2="42" y2="64" strokeWidth="4" />
      <path d="M20 64 Q42 58 64 64" />
      <line x1="24" y1="64" x2="24" y2="86" />
      <line x1="32" y1="64" x2="32" y2="88" />
      <line x1="40" y1="64" x2="40" y2="90" />
      <line x1="48" y1="64" x2="48" y2="88" />
      <line x1="56" y1="64" x2="56" y2="86" />
    </Svg>
  )
}

function Hop({ color }: Props) {
  return (
    <Svg color={color}>
      <circle cx="42" cy="40" r="14" />
      <ellipse cx="60" cy="54" rx="20" ry="13" />
      <ellipse cx="33" cy="24" rx="4" ry="10" />
      <ellipse cx="43" cy="22" rx="4" ry="10" />
      <line x1="66" y1="64" x2="82" y2="56" />
      <line x1="66" y1="70" x2="84" y2="68" />
    </Svg>
  )
}

function Dog({ color }: Props) {
  return (
    <Svg color={color}>
      <ellipse cx="44" cy="58" rx="24" ry="15" />
      <ellipse cx="72" cy="50" rx="14" ry="11" />
      <ellipse cx="65" cy="35" rx="6" ry="10" transform="rotate(-20 65 35)" />
      <circle cx="77" cy="48" r="2" fill={color || 'currentColor'} stroke="none" />
      <circle cx="85" cy="52" r="2" fill={color || 'currentColor'} stroke="none" />
      <line x1="35" y1="72" x2="33" y2="88" />
      <line x1="52" y1="72" x2="54" y2="88" />
      <path d="M22 56 Q10 46 14 36" />
    </Svg>
  )
}

function Log({ color }: Props) {
  return (
    <Svg color={color}>
      <rect x="14" y="42" width="72" height="22" rx="11" />
      <circle cx="24" cy="53" r="7" />
      <circle cx="24" cy="53" r="3" />
      <line x1="40" y1="48" x2="70" y2="48" />
      <line x1="38" y1="58" x2="72" y2="58" />
    </Svg>
  )
}

function Fog({ color }: Props) {
  return (
    <Svg color={color}>
      <path d="M22 50 Q22 38 34 38 Q38 28 50 30 Q60 28 66 36 Q78 36 78 50" />
      <line x1="14" y1="62" x2="86" y2="62" />
      <line x1="18" y1="70" x2="82" y2="70" />
      <line x1="22" y1="78" x2="78" y2="78" />
    </Svg>
  )
}

function Box({ color }: Props) {
  return (
    <Svg color={color}>
      <polygon points="22,34 50,22 78,34 50,46" />
      <polygon points="22,34 22,68 50,82 50,46" />
      <polygon points="78,34 78,68 50,82 50,46" />
      <line x1="50" y1="22" x2="50" y2="46" />
    </Svg>
  )
}

function Pig({ color }: Props) {
  return (
    <Svg color={color}>
      <ellipse cx="48" cy="55" rx="25" ry="16" />
      <circle cx="73" cy="52" r="11" />
      <circle cx="77" cy="50" r="4" />
      <circle cx="76" cy="50" r="1" fill={color || 'currentColor'} stroke="none" />
      <circle cx="79" cy="50" r="1" fill={color || 'currentColor'} stroke="none" />
      <polygon points="66,44 62,34 70,40" />
      <line x1="36" y1="70" x2="34" y2="86" />
      <line x1="52" y1="70" x2="54" y2="86" />
      <path d="M24 56 Q14 50 18 42" />
    </Svg>
  )
}

function Big({ color }: Props) {
  return (
    <Svg color={color}>
      <circle cx="50" cy="50" r="22" />
      <line x1="50" y1="8" x2="50" y2="24" />
      <line x1="50" y1="92" x2="50" y2="76" />
      <line x1="8" y1="50" x2="24" y2="50" />
      <line x1="92" y1="50" x2="76" y2="50" />
      <line x1="18" y1="18" x2="30" y2="30" />
      <line x1="82" y1="18" x2="70" y2="30" />
      <line x1="18" y1="82" x2="30" y2="70" />
      <line x1="82" y1="82" x2="70" y2="70" />
    </Svg>
  )
}

function Dig({ color }: Props) {
  return (
    <Svg color={color}>
      <line x1="66" y1="16" x2="42" y2="64" strokeWidth="4" />
      <path d="M36 64 L54 64 L50 78 L30 78 Z" />
      <path d="M20 82 Q36 72 50 82" />
    </Svg>
  )
}

function Lid({ color }: Props) {
  return (
    <Svg color={color}>
      <ellipse cx="50" cy="56" rx="30" ry="10" />
      <line x1="20" y1="56" x2="80" y2="56" />
      <circle cx="50" cy="44" r="5" />
      <line x1="50" y1="49" x2="50" y2="56" />
    </Svg>
  )
}

function Kid({ color }: Props) {
  return (
    <Svg color={color}>
      <circle cx="50" cy="24" r="11" />
      <path d="M40 18 Q50 10 60 18" />
      <line x1="50" y1="35" x2="50" y2="62" strokeWidth="3" />
      <line x1="50" y1="42" x2="34" y2="54" />
      <line x1="50" y1="42" x2="66" y2="54" />
      <line x1="50" y1="62" x2="38" y2="88" />
      <line x1="50" y1="62" x2="62" y2="88" />
    </Svg>
  )
}

function Fin({ color }: Props) {
  return (
    <Svg color={color}>
      <path d="M22 68 Q50 20 78 68 Z" />
      <line x1="50" y1="20" x2="50" y2="68" />
      <line x1="36" y1="54" x2="50" y2="40" />
      <line x1="64" y1="54" x2="50" y2="40" />
    </Svg>
  )
}

function Pin({ color }: Props) {
  return (
    <Svg color={color}>
      <circle cx="50" cy="28" r="11" />
      <path d="M44 38 L56 38 L52 56 L48 56 Z" />
      <line x1="50" y1="56" x2="50" y2="88" />
      <line x1="50" y1="88" x2="46" y2="94" />
    </Svg>
  )
}

function Sit({ color }: Props) {
  return (
    <Svg color={color}>
      <rect x="24" y="42" width="26" height="24" />
      <line x1="24" y1="42" x2="24" y2="22" />
      <line x1="50" y1="42" x2="50" y2="22" />
      <circle cx="66" cy="34" r="8" />
      <line x1="66" y1="42" x2="56" y2="52" />
      <line x1="56" y1="52" x2="46" y2="52" />
      <line x1="56" y1="52" x2="62" y2="70" />
    </Svg>
  )
}

function Hit({ color }: Props) {
  return (
    <Svg color={color}>
      <rect x="22" y="24" width="24" height="12" rx="2" />
      <line x1="44" y1="34" x2="76" y2="66" strokeWidth="4" />
      <circle cx="30" cy="74" r="9" />
      <line x1="36" y1="66" x2="44" y2="58" />
      <line x1="38" y1="78" x2="48" y2="78" />
    </Svg>
  )
}

function Lip({ color }: Props) {
  return (
    <Svg color={color}>
      <path d="M18 50 Q34 36 50 50 Q66 36 82 50" />
      <path d="M18 50 Q34 66 50 50 Q66 66 82 50" />
      <line x1="30" y1="50" x2="70" y2="50" />
    </Svg>
  )
}

function Bed({ color }: Props) {
  return (
    <Svg color={color}>
      <rect x="14" y="42" width="72" height="24" rx="3" />
      <line x1="14" y1="42" x2="14" y2="24" />
      <line x1="86" y1="42" x2="86" y2="24" />
      <line x1="22" y1="66" x2="22" y2="86" />
      <line x1="78" y1="66" x2="78" y2="86" />
      <rect x="20" y="47" width="18" height="12" rx="2" />
    </Svg>
  )
}

function Red({ color }: Props) {
  return (
    <Svg color={color}>
      <circle cx="50" cy="54" r="22" />
      <path d="M50 32 Q58 20 68 24" />
      <path d="M50 28 Q42 22 34 28 Q38 34 46 34" />
    </Svg>
  )
}

function Pen({ color }: Props) {
  return (
    <Svg color={color}>
      <polygon points="22,70 66,26 78,38 34,82 20,84" />
      <line x1="66" y1="26" x2="74" y2="18" />
      <line x1="40" y1="56" x2="52" y2="68" />
    </Svg>
  )
}

function Hen({ color }: Props) {
  return (
    <Svg color={color}>
      <ellipse cx="48" cy="58" rx="24" ry="16" />
      <circle cx="72" cy="48" r="10" />
      <polygon points="82,48 90,52 82,56" fill={color || 'currentColor'} stroke="none" />
      <circle cx="76" cy="46" r="1.5" fill={color || 'currentColor'} stroke="none" />
      <path d="M66 38 L70 30 L74 38" />
      <line x1="42" y1="72" x2="40" y2="88" />
      <line x1="54" y1="72" x2="56" y2="88" />
    </Svg>
  )
}

function Ten({ color }: Props) {
  return (
    <Svg color={color}>
      <circle cx="30" cy="34" r="4" />
      <circle cx="50" cy="34" r="4" />
      <circle cx="70" cy="34" r="4" />
      <circle cx="20" cy="50" r="4" />
      <circle cx="40" cy="50" r="4" />
      <circle cx="60" cy="50" r="4" />
      <circle cx="80" cy="50" r="4" />
      <circle cx="30" cy="66" r="4" />
      <circle cx="50" cy="66" r="4" />
      <circle cx="70" cy="66" r="4" />
    </Svg>
  )
}

function Net({ color }: Props) {
  return (
    <Svg color={color}>
      <circle cx="42" cy="52" r="24" />
      <line x1="42" y1="28" x2="42" y2="76" />
      <line x1="18" y1="52" x2="66" y2="52" />
      <line x1="26" y1="36" x2="58" y2="68" />
      <line x1="26" y1="68" x2="58" y2="36" />
      <line x1="66" y1="52" x2="84" y2="34" />
    </Svg>
  )
}

function Pet({ color }: Props) {
  return (
    <Svg color={color}>
      <circle cx="50" cy="62" r="10" />
      <circle cx="34" cy="44" r="6" />
      <circle cx="46" cy="38" r="6" />
      <circle cx="58" cy="38" r="6" />
      <circle cx="70" cy="44" r="6" />
    </Svg>
  )
}

function Leg({ color }: Props) {
  return (
    <Svg color={color}>
      <path d="M42 18 L58 18 L54 56 L66 82 L52 86 L40 58 Z" />
      <path d="M66 82 Q72 84 72 90 L50 90" />
    </Svg>
  )
}

function Peg({ color }: Props) {
  return (
    <Svg color={color}>
      <rect x="32" y="24" width="16" height="54" rx="4" />
      <rect x="52" y="24" width="16" height="54" rx="4" />
      <circle cx="50" cy="52" r="5" fill={color || 'currentColor'} stroke="none" />
      <line x1="40" y1="30" x2="60" y2="30" />
    </Svg>
  )
}

function Web({ color }: Props) {
  return (
    <Svg color={color}>
      <line x1="50" y1="14" x2="50" y2="86" />
      <line x1="14" y1="50" x2="86" y2="50" />
      <line x1="24" y1="24" x2="76" y2="76" />
      <line x1="24" y1="76" x2="76" y2="24" />
      <path d="M22 50 Q50 22 78 50" />
      <path d="M28 50 Q50 30 72 50" />
      <path d="M22 50 Q50 78 78 50" />
      <path d="M28 50 Q50 70 72 50" />
    </Svg>
  )
}

function Rod({ color }: Props) {
  return (
    <Svg color={color}>
      <line x1="18" y1="82" x2="72" y2="22" strokeWidth="3" />
      <line x1="72" y1="22" x2="84" y2="28" />
      <path d="M84 28 Q88 34 84 40" />
      <line x1="84" y1="40" x2="84" y2="58" />
      <path d="M84 58 Q86 62 90 60" />
    </Svg>
  )
}

function Nod({ color }: Props) {
  return (
    <Svg color={color}>
      <circle cx="50" cy="42" r="18" />
      <line x1="36" y1="78" x2="50" y2="60" />
      <line x1="64" y1="78" x2="50" y2="60" />
      <line x1="50" y1="10" x2="50" y2="22" />
      <line x1="46" y1="18" x2="50" y2="22" />
      <line x1="54" y1="18" x2="50" y2="22" />
    </Svg>
  )
}

function Sob({ color }: Props) {
  return (
    <Svg color={color}>
      <circle cx="50" cy="45" r="26" />
      <circle cx="40" cy="40" r="2.5" fill={color || 'currentColor'} stroke="none" />
      <circle cx="60" cy="40" r="2.5" fill={color || 'currentColor'} stroke="none" />
      <path d="M38 58 Q50 52 62 58" />
      <path d="M35 46 Q33 54 36 60" />
      <path d="M65 46 Q67 54 64 60" />
    </Svg>
  )
}

function Zip({ color }: Props) {
  return (
    <Svg color={color}>
      <line x1="50" y1="20" x2="50" y2="80" />
      <line x1="42" y1="24" x2="50" y2="30" />
      <line x1="58" y1="24" x2="50" y2="30" />
      <line x1="42" y1="36" x2="50" y2="42" />
      <line x1="58" y1="36" x2="50" y2="42" />
      <line x1="42" y1="48" x2="50" y2="54" />
      <line x1="58" y1="48" x2="50" y2="54" />
      <rect x="44" y="58" width="12" height="12" rx="2" />
    </Svg>
  )
}

function Bib({ color }: Props) {
  return (
    <Svg color={color}>
      <path d="M38 20 Q50 10 62 20" />
      <path d="M32 22 Q50 28 68 22 L62 78 Q50 86 38 78 Z" />
      <circle cx="50" cy="50" r="6" />
    </Svg>
  )
}

function Dim({ color }: Props) {
  return (
    <Svg color={color}>
      <path d="M50 20 Q34 20 34 36 Q34 46 42 52 L42 62 L58 62 L58 52 Q66 46 66 36 Q66 20 50 20" />
      <line x1="42" y1="66" x2="58" y2="66" />
      <line x1="44" y1="72" x2="56" y2="72" />
      <line x1="24" y1="30" x2="18" y2="26" />
      <line x1="76" y1="30" x2="82" y2="26" />
    </Svg>
  )
}

function Vet({ color }: Props) {
  return (
    <Svg color={color}>
      <rect x="22" y="34" width="56" height="40" rx="4" />
      <line x1="40" y1="34" x2="40" y2="24" />
      <line x1="60" y1="34" x2="60" y2="24" />
      <circle cx="50" cy="54" r="8" />
      <line x1="50" y1="48" x2="50" y2="60" />
      <line x1="44" y1="54" x2="56" y2="54" />
      <circle cx="34" cy="58" r="4" />
      <circle cx="66" cy="58" r="4" />
    </Svg>
  )
}

function Jet({ color }: Props) {
  return (
    <Svg color={color}>
      <path d="M14 56 L70 44 L86 50 L70 56 L14 56 Z" />
      <path d="M46 44 L54 28 L58 44" />
      <path d="M44 56 L50 72 L56 56" />
      <line x1="20" y1="48" x2="14" y2="42" />
    </Svg>
  )
}

function Hem({ color }: Props) {
  return (
    <Svg color={color}>
      <rect x="18" y="50" width="64" height="22" rx="2" />
      <line x1="18" y1="58" x2="82" y2="58" strokeDasharray="3" />
      <line x1="28" y1="24" x2="52" y2="48" />
      <line x1="24" y1="28" x2="36" y2="16" />
      <circle cx="56" cy="52" r="2" fill={color || 'currentColor'} stroke="none" />
    </Svg>
  )
}

function Tub({ color }: Props) {
  return (
    <Svg color={color}>
      <path d="M14 56 Q14 76 50 76 Q86 76 86 56" />
      <line x1="24" y1="76" x2="24" y2="86" />
      <line x1="76" y1="76" x2="76" y2="86" />
      <line x1="72" y1="42" x2="72" y2="56" />
      <path d="M72 42 Q72 34 80 34" />
    </Svg>
  )
}

function Flag({ color }: Props) {
  return (
    <Svg color={color}>
      <line x1="24" y1="16" x2="24" y2="88" strokeWidth="3" />
      <path d="M24 20 Q44 12 66 20 L66 46 Q44 38 24 46 Z" />
    </Svg>
  )
}

function Clap({ color }: Props) {
  return (
    <Svg color={color}>
      <path d="M24 62 Q24 44 38 44 Q50 44 50 60 Q50 74 38 74 Q24 74 24 62" />
      <path d="M50 58 Q50 40 64 40 Q76 40 76 56 Q76 72 64 72 Q50 72 50 58" />
      <line x1="40" y1="34" x2="44" y2="26" />
      <line x1="52" y1="30" x2="56" y2="22" />
      <line x1="64" y1="34" x2="68" y2="26" />
    </Svg>
  )
}

function Crab({ color }: Props) {
  return (
    <Svg color={color}>
      <ellipse cx="50" cy="56" rx="20" ry="14" />
      <line x1="34" y1="66" x2="24" y2="76" />
      <line x1="42" y1="68" x2="34" y2="82" />
      <line x1="58" y1="68" x2="66" y2="82" />
      <line x1="66" y1="66" x2="76" y2="76" />
      <path d="M34 44 Q24 34 18 42 Q22 50 32 48" />
      <path d="M66 44 Q76 34 82 42 Q78 50 68 48" />
      <circle cx="44" cy="50" r="2" fill={color || 'currentColor'} stroke="none" />
      <circle cx="56" cy="50" r="2" fill={color || 'currentColor'} stroke="none" />
    </Svg>
  )
}

function Frog({ color }: Props) {
  return (
    <Svg color={color}>
      <ellipse cx="50" cy="58" rx="22" ry="14" />
      <circle cx="40" cy="42" r="6" />
      <circle cx="60" cy="42" r="6" />
      <circle cx="40" cy="42" r="2" fill={color || 'currentColor'} stroke="none" />
      <circle cx="60" cy="42" r="2" fill={color || 'currentColor'} stroke="none" />
      <line x1="34" y1="66" x2="24" y2="78" />
      <line x1="66" y1="66" x2="76" y2="78" />
      <path d="M42 60 Q50 66 58 60" />
    </Svg>
  )
}

function Stop({ color }: Props) {
  return (
    <Svg color={color}>
      <polygon points="34,18 66,18 82,34 82,66 66,82 34,82 18,66 18,34" />
      <line x1="34" y1="50" x2="66" y2="50" />
      <line x1="50" y1="34" x2="50" y2="66" />
    </Svg>
  )
}

function Sled({ color }: Props) {
  return (
    <Svg color={color}>
      <line x1="24" y1="64" x2="72" y2="64" />
      <line x1="30" y1="50" x2="30" y2="64" />
      <line x1="52" y1="50" x2="52" y2="64" />
      <line x1="30" y1="50" x2="52" y2="50" />
      <path d="M20 72 Q48 84 80 72" />
      <path d="M20 72 Q22 78 28 76" />
      <path d="M80 72 Q78 78 72 76" />
    </Svg>
  )
}

function Spin({ color }: Props) {
  return (
    <Svg color={color}>
      <path d="M50 18 Q72 18 72 38 Q72 56 54 56 Q40 56 40 44 Q40 34 50 34 Q58 34 58 42" />
      <path d="M50 82 Q28 82 28 62 Q28 44 46 44" />
      <line x1="74" y1="30" x2="82" y2="26" />
      <line x1="26" y1="70" x2="18" y2="74" />
    </Svg>
  )
}

function Drum({ color }: Props) {
  return (
    <Svg color={color}>
      <ellipse cx="50" cy="34" rx="22" ry="8" />
      <line x1="28" y1="34" x2="28" y2="66" />
      <line x1="72" y1="34" x2="72" y2="66" />
      <ellipse cx="50" cy="66" rx="22" ry="8" />
      <line x1="34" y1="40" x2="66" y2="60" />
      <line x1="66" y1="40" x2="34" y2="60" />
      <line x1="20" y1="24" x2="34" y2="36" />
      <line x1="80" y1="24" x2="66" y2="36" />
    </Svg>
  )
}

function Jump({ color }: Props) {
  return (
    <Svg color={color}>
      <circle cx="50" cy="20" r="9" />
      <line x1="50" y1="30" x2="50" y2="56" strokeWidth="3" />
      <line x1="50" y1="40" x2="32" y2="30" />
      <line x1="50" y1="40" x2="68" y2="30" />
      <line x1="50" y1="56" x2="34" y2="74" />
      <line x1="50" y1="56" x2="66" y2="74" />
      <line x1="24" y1="86" x2="76" y2="86" />
    </Svg>
  )
}

function Milk({ color }: Props) {
  return (
    <Svg color={color}>
      <path d="M34 24 L58 24 L66 34 L66 80 L34 80 Z" />
      <line x1="58" y1="24" x2="58" y2="34" />
      <line x1="34" y1="44" x2="66" y2="44" />
      <line x1="42" y1="52" x2="58" y2="52" />
      <line x1="42" y1="60" x2="58" y2="60" />
    </Svg>
  )
}

function Ship({ color }: Props) {
  return (
    <Svg color={color}>
      <path d="M20 62 L78 62 L68 76 L30 76 Z" />
      <rect x="36" y="40" width="22" height="12" />
      <line x1="48" y1="18" x2="48" y2="62" />
      <polygon points="48,20 66,30 48,40" />
      <line x1="14" y1="84" x2="86" y2="84" />
    </Svg>
  )
}

function Shop({ color }: Props) {
  return (
    <Svg color={color}>
      <rect x="20" y="34" width="60" height="44" />
      <path d="M16 34 L84 34 L78 22 L22 22 Z" />
      <line x1="30" y1="22" x2="30" y2="34" />
      <line x1="40" y1="22" x2="40" y2="34" />
      <line x1="50" y1="22" x2="50" y2="34" />
      <line x1="60" y1="22" x2="60" y2="34" />
      <line x1="70" y1="22" x2="70" y2="34" />
      <rect x="30" y="50" width="16" height="28" />
      <rect x="52" y="46" width="18" height="12" />
    </Svg>
  )
}

function Chat({ color }: Props) {
  return (
    <Svg color={color}>
      <path d="M18 28 H58 Q68 28 68 38 V52 Q68 62 58 62 H40 L28 72 V62 H18 Q8 62 8 52 V38 Q8 28 18 28 Z" />
      <path d="M48 14 H82 Q90 14 90 22 V34 Q90 42 82 42 H72 L64 50 V42 H48 Q40 42 40 34 V22 Q40 14 48 14 Z" />
    </Svg>
  )
}

function Chin({ color }: Props) {
  return (
    <Svg color={color}>
      <circle cx="50" cy="42" r="24" />
      <circle cx="42" cy="38" r="2" fill={color || 'currentColor'} stroke="none" />
      <circle cx="58" cy="38" r="2" fill={color || 'currentColor'} stroke="none" />
      <path d="M42 50 Q50 56 58 50" />
      <path d="M40 62 Q50 74 60 62" strokeWidth="3" />
    </Svg>
  )
}

function Thin({ color }: Props) {
  return (
    <Svg color={color}>
      <rect x="44" y="14" width="12" height="72" rx="2" />
      <line x1="20" y1="20" x2="36" y2="20" />
      <line x1="80" y1="80" x2="64" y2="80" />
    </Svg>
  )
}

function This({ color }: Props) {
  return (
    <Svg color={color}>
      <circle cx="64" cy="52" r="12" />
      <path d="M18 58 L44 58 L44 50 L64 50" />
      <line x1="18" y1="58" x2="18" y2="44" />
      <line x1="18" y1="44" x2="30" y2="44" />
    </Svg>
  )
}

function That({ color }: Props) {
  return (
    <Svg color={color}>
      <circle cx="82" cy="40" r="10" />
      <path d="M16 64 L42 64 L42 56 L72 56 L72 40" />
      <line x1="16" y1="64" x2="16" y2="50" />
      <line x1="16" y1="50" x2="28" y2="50" />
    </Svg>
  )
}

function Whip({ color }: Props) {
  return (
    <Svg color={color}>
      <rect x="18" y="62" width="22" height="8" rx="4" />
      <path d="M40 66 Q60 56 68 42 Q74 32 84 34 Q90 36 86 42 Q80 50 88 58" />
      <path d="M88 58 Q92 62 88 66" />
    </Svg>
  )
}

function Ring({ color }: Props) {
  return (
    <Svg color={color}>
      <circle cx="50" cy="56" r="22" />
      <circle cx="50" cy="56" r="12" />
      <polygon points="50,20 56,32 50,38 44,32" />
    </Svg>
  )
}

function Duck({ color }: Props) {
  return (
    <Svg color={color}>
      <ellipse cx="48" cy="60" rx="24" ry="14" />
      <circle cx="72" cy="50" r="10" />
      <path d="M80 52 Q88 52 90 56 Q88 60 80 60 Z" />
      <circle cx="74" cy="48" r="1.5" fill={color || 'currentColor'} stroke="none" />
      <path d="M28 56 Q20 48 24 40" />
      <line x1="42" y1="72" x2="40" y2="84" />
      <line x1="54" y1="72" x2="56" y2="84" />
    </Svg>
  )
}

// Map of word → illustration component
export const illustrations: Record<string, (props: Props) => React.JSX.Element> = {
  cat: Cat,
  bat: Bat,
  hat: Hat,
  pan: Pan,
  rat: Rat,
  fan: Fan,
  man: Man,
  van: Van,
  can: Can,
  sad: Sad,
  dad: Dad,
  pad: Pad,
  mad: Mad,
  ham: Ham,
  ram: Ram,
  dam: Dam,
  jam: Jam,
  mat: Mat,
  bag: Bag,
  tag: Tag,
  cap: Cap,
  map: MapIllustration,
  cab: Cab,
  gas: Gas,
  nap: Nap,
  rag: Rag,
  bud: Bud,
  bun: Bun,
  hut: Hut,
  bug: Bug,
  cup: Cup,
  mug: Mug,
  rug: Rug,
  sun: Sun,
  run: Run,
  gum: Gum,
  cot: Cot,
  hot: Hot,
  pot: Pot,
  top: TopWord,
  mop: Mop,
  hop: Hop,
  dog: Dog,
  log: Log,
  fog: Fog,
  box: Box,
  pig: Pig,
  big: Big,
  dig: Dig,
  lid: Lid,
  kid: Kid,
  fin: Fin,
  pin: Pin,
  sit: Sit,
  hit: Hit,
  lip: Lip,
  bed: Bed,
  red: Red,
  pen: Pen,
  hen: Hen,
  ten: Ten,
  net: Net,
  pet: Pet,
  leg: Leg,
  peg: Peg,
  web: Web,
  rod: Rod,
  nod: Nod,
  sob: Sob,
  zip: Zip,
  bib: Bib,
  dim: Dim,
  vet: Vet,
  jet: Jet,
  hem: Hem,
  tub: Tub,
  flag: Flag,
  clap: Clap,
  crab: Crab,
  frog: Frog,
  stop: Stop,
  sled: Sled,
  spin: Spin,
  drum: Drum,
  jump: Jump,
  milk: Milk,
  ship: Ship,
  shop: Shop,
  chat: Chat,
  chin: Chin,
  thin: Thin,
  this: This,
  that: That,
  whip: Whip,
  ring: Ring,
  duck: Duck,
  ...primaryPhonicsIllustrations,
}
