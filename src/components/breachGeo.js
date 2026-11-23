// ─────────────────────────────────────────────────────────────────────────────
// THE BREACH MAP — geo-inference + visual helpers for live news stories.
//
// Google News headlines rarely carry coordinates, so each story is located
// with a transparent, tiered heuristic. The basis is always surfaced in the UI:
//   1. "mentioned" – a country / region / city is named in the story text
//   2. "entity"    – a well-known organisation is named (its home country)
//   3. "publisher" – the publisher's home country (weakest signal)
// Stories that match none of these are treated as GLOBAL and are not pinned.
// ─────────────────────────────────────────────────────────────────────────────

import { COUNTRY_ANCHORS } from './countryAnchors.js';

export const COUNTRY_NAMES = {
  us: 'United States', ca: 'Canada', mx: 'Mexico', br: 'Brazil', ar: 'Argentina', cl: 'Chile', co: 'Colombia',
  gb: 'United Kingdom', ie: 'Ireland', fr: 'France', de: 'Germany', nl: 'Netherlands', be: 'Belgium',
  it: 'Italy', es: 'Spain', pt: 'Portugal', ch: 'Switzerland', at: 'Austria', se: 'Sweden', no: 'Norway',
  fi: 'Finland', dk: 'Denmark', pl: 'Poland', cz: 'Czechia', ro: 'Romania', gr: 'Greece', ua: 'Ukraine',
  ru: 'Russia', by: 'Belarus', tr: 'Türkiye', il: 'Israel', ir: 'Iran', iq: 'Iraq', sa: 'Saudi Arabia',
  ae: 'United Arab Emirates', qa: 'Qatar', eg: 'Egypt', za: 'South Africa', ng: 'Nigeria', ke: 'Kenya',
  ma: 'Morocco', in: 'India', pk: 'Pakistan', lk: 'Sri Lanka', bd: 'Bangladesh', np: 'Nepal', cn: 'China',
  tw: 'Taiwan', jp: 'Japan', kr: 'South Korea', kp: 'North Korea', sg: 'Singapore', my: 'Malaysia',
  id: 'Indonesia', ph: 'Philippines', vn: 'Vietnam', th: 'Thailand', au: 'Australia', nz: 'New Zealand',
};

// Ordered: the first match wins, so specific places come before broad regions.
const MENTION_TERMS = [
  ['kp', /\b(north korea|pyongyang|dprk)\b/i],
  ['kr', /\b(south korea|korean|seoul|busan)\b/i],
  ['us', /\b(united states|u\.s\.|usa|american|washington,? d\.?c\.?|pentagon|fbi|cisa|white house|new york|california|texas|florida|virginia|silicon valley|nasa)\b/i],
  ['us', /\bUS\b/],
  ['gb', /\b(united kingdom|u\.k\.|britain|british|england|scotland|wales|london|nhs)\b/i],
  ['gb', /\bUK\b/],
  ['ie', /\b(ireland|irish|dublin)\b/i],
  ['ca', /\b(canada|canadian|toronto|ottawa|vancouver|montreal)\b/i],
  ['mx', /\b(mexico|mexican)\b/i],
  ['br', /\b(brazil|brazilian|são paulo|sao paulo|rio de janeiro)\b/i],
  ['ar', /\b(argentina|argentine|buenos aires)\b/i],
  ['cl', /\b(chile|chilean)\b/i],
  ['co', /\b(colombia|colombian|bogot[aá])\b/i],
  ['fr', /\b(france|french|paris)\b/i],
  ['de', /\b(germany|german|berlin|munich|frankfurt)\b/i],
  ['nl', /\b(netherlands|dutch|amsterdam|the hague)\b/i],
  ['it', /\b(italy|italian|milan)\b/i],
  ['es', /\b(spain|spanish|madrid|barcelona)\b/i],
  ['pt', /\b(portugal|portuguese|lisbon)\b/i],
  ['ch', /\b(switzerland|swiss|geneva|zurich)\b/i],
  ['at', /\b(austria|austrian|vienna)\b/i],
  ['se', /\b(sweden|swedish|stockholm)\b/i],
  ['no', /\b(norway|norwegian|oslo)\b/i],
  ['fi', /\b(finland|finnish|helsinki)\b/i],
  ['dk', /\b(denmark|danish|copenhagen)\b/i],
  ['pl', /\b(poland|polish|warsaw)\b/i],
  ['cz', /\b(czech|czechia|prague)\b/i],
  ['ro', /\b(romania|romanian|bucharest)\b/i],
  ['gr', /\b(greece|greek|athens)\b/i],
  ['ua', /\b(ukraine|ukrainian|kyiv|kiev)\b/i],
  ['ru', /\b(russia|russian|moscow|kremlin)\b/i],
  ['by', /\b(belarus|belarusian|minsk)\b/i],
  ['tr', /\b(turkey|turkish|türkiye|istanbul|ankara)\b/i],
  ['il', /\b(israel|israeli|tel aviv)\b/i],
  ['ir', /\b(iran|iranian|tehran)\b/i],
  ['iq', /\b(iraq|iraqi|baghdad)\b/i],
  ['sa', /\b(saudi|riyadh)\b/i],
  ['ae', /\b(uae|emirati|dubai|abu dhabi|united arab emirates)\b/i],
  ['qa', /\b(qatar|qatari|doha)\b/i],
  ['eg', /\b(egypt|egyptian|cairo)\b/i],
  ['za', /\b(south africa|south african|johannesburg|cape town)\b/i],
  ['ng', /\b(nigeria|nigerian|lagos|abuja)\b/i],
  ['ke', /\b(kenya|kenyan|nairobi)\b/i],
  ['ma', /\b(morocco|moroccan)\b/i],
  ['in', /\b(india|indian|delhi|mumbai|bengaluru|bangalore|hyderabad|chennai)\b/i],
  ['pk', /\b(pakistan|pakistani|karachi|islamabad)\b/i],
  ['lk', /\b(sri lanka|sri lankan|colombo)\b/i],
  ['bd', /\b(bangladesh|bangladeshi|dhaka)\b/i],
  ['np', /\b(nepal|nepali|kathmandu)\b/i],
  ['tw', /\b(taiwan|taiwanese|taipei)\b/i],
  ['cn', /\b(china|chinese|beijing|shanghai|shenzhen|hong kong)\b/i],
  ['jp', /\b(japan|japanese|tokyo|osaka)\b/i],
  ['sg', /\b(singapore|singaporean)\b/i],
  ['my', /\b(malaysia|malaysian|kuala lumpur)\b/i],
  ['id', /\b(indonesia|indonesian|jakarta)\b/i],
  ['ph', /\b(philippines|filipino|manila)\b/i],
  ['vn', /\b(vietnam|vietnamese|hanoi)\b/i],
  ['th', /\b(thailand|thai|bangkok)\b/i],
  ['au', /\b(australia|australian|sydney|melbourne|canberra)\b/i],
  ['nz', /\b(new zealand|auckland|wellington)\b/i],
  ['be', /\b(europe|european|eu|brussels|belgium|belgian|enisa)\b/i],
];

// Well-known organisations frequently named in cyber news → home country.
const ENTITY_TERMS = [
  ['us', /\b(microsoft|outlook|azure|google|gmail|apple|icloud|amazon|aws|meta|facebook|instagram|whatsapp|uber|cursor|openai|chatgpt|anthropic|nvidia|cisco|oracle|ibm|intel|crowdstrike|okta|salesforce|vanderbilt|harvard|stanford|at&t|verizon|t-mobile|comcast|ticketmaster|unitedhealth|change healthcare|walmart|tesla|fortinet|ivanti|citrix|vmware|broadcom|palo alto networks|cloudflare|github|linkedin|goldman|jpmorgan|boeing|lockheed|snowflake|moveit|solarwinds|kaseya)\b/i],
  ['kr', /\b(coinone|upbit|bithumb|samsung|sk telecom|naver|kakao|coupang|hyundai)\b/i],
  ['jp', /\b(toyota|sony|nintendo|fujitsu|panasonic|kadokawa|japan airlines|asahi)\b/i],
  ['cn', /\b(alibaba|tencent|huawei|baidu|bytedance|tiktok|xiaomi|deepseek)\b/i],
  ['in', /\b(infosys|wipro|reliance jio|airtel|aiims|hdfc|icici|paytm)\b/i],
  ['gb', /\b(bbc|marks (&|and) spencer|harrods|jaguar land rover|british airways|bt group)\b/i],
  ['de', /\b(siemens|deutsche telekom|volkswagen|bmw)\b/i],
  ['fr', /\b(airbus|thales|renault)\b/i],
  ['au', /\b(qantas|optus|medibank|telstra)\b/i],
  ['ca', /\b(shopify|rogers communications|bell canada)\b/i],
  ['nl', /\b(asml|philips)\b/i],
  ['il', /\b(check point|wiz)\b/i],
  ['se', /\b(ericsson|spotify|volvo)\b/i],
  ['fi', /\b(nokia)\b/i],
  ['ch', /\b(world triathlon|fifa|uefa|ubs|nestl[eé])\b/i],
  ['tw', /\b(tsmc|foxconn|acer|asus)\b/i],
];

// Publisher → home country (only used when the story itself gives no location).
const PUBLISHER_TERMS = [
  ['us', /(wsj|wall street journal|wired|washington post|new york times|nytimes|cnn|cnbc|reuters|bloomberg|associated press|ap news|axios|techcrunch|the verge|ars technica|zdnet|securityweek|dark reading|bleepingcomputer|the record|cyberscoop|forbes|nbc|abc news|cbs|politico|the hill|npr|usa today|los alamos|rome sentinel|govtech|federal news|krebs)/i],
  ['gb', /(bbc|the guardian|the register|financial times|sky news|the independent|telegraph|computer weekly|inside the games|infosecurity magazine|itpro)/i],
  ['fr', /(france 24|le monde|afp|les echos)/i],
  ['in', /(economic times|et government|etciso|times of india|hindustan times|the hindu|ndtv|livemint|india today|business standard)/i],
  ['kr', /(chosun|korea herald|korea times|yonhap|joongang|[가-힯])/i],
  ['jp', /(japan times|nikkei|kyodo|[぀-ヿ])/i],
  ['au', /(sydney morning herald|the australian|itnews|crikey|abc\.net\.au)/i],
  ['ca', /(cbc|globe and mail|toronto star|national post)/i],
  ['de', /(heise|spiegel|deutsche welle)/i],
  ['be', /(eu perspectives|euractiv|euronews|politico europe)/i],
  ['sg', /(straits times|channel newsasia)/i],
  ['lk', /(daily mirror|daily ft|economynext|newsfirst|ada derana)/i],
  ['il', /(jerusalem post|times of israel|haaretz)/i],
];

// Threat-actor attribution named in the story → origin country.
const ACTOR_TERMS = [
  ['ru', /\b(russian[- ](state|backed|linked|speaking|hackers?|apt|gru|intelligence|threat actors?)|russia[- ](linked|backed|nexus)|kremlin[- ]backed|apt ?28|apt ?29|fancy bear|cozy bear|sandworm|turla|gamaredon|killnet|star blizzard|midnight blizzard)\b/i],
  ['cn', /\b(chinese[- ](state|backed|linked|hackers?|apt|espionage|threat actors?|nation[- ]state)|china[- ](linked|backed|nexus)|beijing[- ]backed|volt typhoon|salt typhoon|silk typhoon|apt ?41|apt ?40|apt ?31|mustang panda)\b/i],
  ['kp', /\b(north korean[- ]?(hackers?|state|apt|it workers?)?|lazarus|kimsuky|apt ?38|andariel|famous chollima)\b/i],
  ['ir', /\b(iranian[- ](state|backed|linked|hackers?|apt|threat actors?)|iran[- ](linked|backed|nexus)|charming kitten|apt ?33|apt ?35|muddywater)\b/i],
];

const SEVERITY_ORDER = { critical: 4, high: 3, medium: 2, low: 1 };

export const SEVERITY_COLORS = {
  critical: '#ff1744',
  high: '#ff9100',
  medium: '#00b0ff',
  low: '#00e676',
};

export const severityRank = (s) => SEVERITY_ORDER[(s || '').toLowerCase()] || 1;

const PHOTOS = {
  server: '/images/mega_breach.jpg',
  warning: '/images/ransomware_alert.jpg',
  globe: '/images/state_hacking.jpg',
};

/**
 * Colour + photo "looks" per news category. Each category has two looks (a photo
 * plus a colour grade) so a grid of same-category stories doesn't repeat one image.
 */
export const CATEGORY_STYLE = {
  'Data Breaches': {
    color: '#00e5ff', label: 'DATA BREACH',
    looks: [{ photo: PHOTOS.server, filter: 'saturate(1.1)' }, { photo: PHOTOS.globe, filter: 'hue-rotate(-12deg) saturate(1.15)' }],
  },
  Ransomware: {
    color: '#ff1744', label: 'RANSOMWARE',
    looks: [{ photo: PHOTOS.warning, filter: 'saturate(1.15)' }, { photo: PHOTOS.server, filter: 'hue-rotate(160deg) saturate(1.4)' }],
  },
  Malware: {
    color: '#c084fc', label: 'MALWARE',
    looks: [{ photo: PHOTOS.warning, filter: 'hue-rotate(275deg) saturate(1.2)' }, { photo: PHOTOS.globe, filter: 'hue-rotate(95deg) saturate(1.2)' }],
  },
  Vulnerabilities: {
    color: '#ff9100', label: 'VULNERABILITY',
    looks: [{ photo: PHOTOS.server, filter: 'hue-rotate(205deg) saturate(1.3)' }, { photo: PHOTOS.warning, filter: 'hue-rotate(28deg) saturate(1.2)' }],
  },
  'Network Security': {
    color: '#00b0ff', label: 'NETWORK',
    looks: [{ photo: PHOTOS.globe, filter: 'saturate(1.1)' }, { photo: PHOTOS.server, filter: 'hue-rotate(18deg) saturate(1.2)' }],
  },
  'AI Security': {
    color: '#a78bfa', label: 'AI SECURITY',
    looks: [{ photo: PHOTOS.globe, filter: 'hue-rotate(85deg) saturate(1.2)' }, { photo: PHOTOS.server, filter: 'hue-rotate(75deg) saturate(1.3)' }],
  },
};

const DEFAULT_STYLE = { color: '#00ffd5', label: 'CYBER', looks: [{ photo: PHOTOS.globe, filter: 'none' }] };

const CROPS = ['center', '20% 50%', '80% 45%', '50% 30%', '35% 70%', '65% 60%'];

/** Small stable hash so each story keeps the same crop between renders. */
const hash = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export function storyVisual(story) {
  const style = CATEGORY_STYLE[story.category] || DEFAULT_STYLE;
  const h = hash(story.title || story.id || '');
  const look = style.looks[(h >> 3) % style.looks.length];
  return {
    color: style.color,
    label: style.label,
    photo: look.photo,
    filter: look.filter,
    crop: CROPS[h % CROPS.length],
    zoom: 1 + (h % 4) * 0.06,
  };
}

const firstMatch = (terms, text) => {
  for (const [iso, re] of terms) {
    const m = text.match(re);
    if (m) return { iso, evidence: m[0].trim() };
  }
  return null;
};

/** Locate a story. Returns the enriched story with geo/actor/visual fields. */
export function enrichStory(story) {
  const source = story.source || '';
  // Google's description usually repeats "title + publisher"; strip the publisher
  // so e.g. "Rome Sentinel" doesn't geolocate a New York story to Italy.
  let text = `${story.title || ''}. ${story.summary || ''}`;
  if (source) text = text.split(source).join(' ');

  const actorHit = firstMatch(ACTOR_TERMS, text);
  const textForTarget = actorHit ? text.replace(actorHit.evidence, ' ') : text;

  const candidates = [
    { terms: MENTION_TERMS, basis: 'mentioned', input: textForTarget },
    { terms: ENTITY_TERMS, basis: 'entity', input: textForTarget },
    { terms: PUBLISHER_TERMS, basis: 'publisher', input: source },
  ];

  let geo = null;
  for (const c of candidates) {
    const hit = firstMatch(c.terms.filter(([iso]) => iso !== actorHit?.iso), c.input);
    if (hit && COUNTRY_ANCHORS[hit.iso]) {
      // EU-level stories are pinned at Brussels but named as Europe.
      const isEurope = hit.iso === 'be' && /europ|^eu$|enisa|euractiv|euronews|eu perspectives/i.test(hit.evidence);
      geo = {
        ...hit,
        basis: c.basis,
        name: isEurope ? 'Europe (EU)' : COUNTRY_NAMES[hit.iso] || hit.iso.toUpperCase(),
        code: isEurope ? 'EU' : hit.iso.toUpperCase(),
      };
      break;
    }
  }

  const actor = actorHit && COUNTRY_ANCHORS[actorHit.iso]
    ? { ...actorHit, name: COUNTRY_NAMES[actorHit.iso] || actorHit.iso.toUpperCase() }
    : null;

  const severity = (story.severity || 'low').toLowerCase();

  return {
    ...story,
    severityKey: severity,
    severityColor: SEVERITY_COLORS[severity] || SEVERITY_COLORS.low,
    geo,
    actor,
    anchor: geo ? COUNTRY_ANCHORS[geo.iso] : null,
    visual: storyVisual(story),
  };
}

export function geoBasisLabel(geo, source) {
  if (!geo) return 'No location in report — global story';
  if (geo.basis === 'mentioned') return `Named in report (“${geo.evidence}”)`;
  if (geo.basis === 'entity') return `Inferred from “${geo.evidence}” (home country)`;
  return `Publisher location (${source})`;
}

/** Hubs used only for the clearly-labelled simulated background traffic. */
export const TRAFFIC_HUBS = ['us', 'ca', 'br', 'gb', 'de', 'nl', 'fr', 'ru', 'ua', 'tr', 'ir', 'in', 'cn', 'kr', 'jp', 'sg', 'au', 'za', 'ng', 'ae'];
