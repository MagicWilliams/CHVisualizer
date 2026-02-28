/**
 * Continental origin mapping for Cooper Hewitt collection objects.
 * Country names are normalized (lowercase, trimmed) for lookup.
 */

export type Continent =
  | "africa"
  | "asia"
  | "europe"
  | "north-america"
  | "oceania"
  | "south-america"
  | "unknown";

export type ShapeType =
  | "circle"
  | "square"
  | "triangle"
  | "diamond"
  | "pentagon"
  | "hexagon"
  | "x";

/** Country name (lowercase) -> continent */
const COUNTRY_TO_CONTINENT: Record<string, Continent> = {
  // Africa
  algeria: "africa",
  angola: "africa",
  benin: "africa",
  botswana: "africa",
  "burkina faso": "africa",
  burundi: "africa",
  cameroon: "africa",
  "cape verde": "africa",
  "central african republic": "africa",
  chad: "africa",
  comoros: "africa",
  congo: "africa",
  "democratic republic of the congo": "africa",
  djibouti: "africa",
  egypt: "africa",
  "equatorial guinea": "africa",
  eritrea: "africa",
  eswatini: "africa",
  ethiopia: "africa",
  gabon: "africa",
  gambia: "africa",
  ghana: "africa",
  guinea: "africa",
  "guinea-bissau": "africa",
  "ivory coast": "africa",
  kenya: "africa",
  lesotho: "africa",
  liberia: "africa",
  libya: "africa",
  madagascar: "africa",
  malawi: "africa",
  mali: "africa",
  mauritania: "africa",
  mauritius: "africa",
  morocco: "africa",
  mozambique: "africa",
  namibia: "africa",
  niger: "africa",
  nigeria: "africa",
  rwanda: "africa",
  "são tomé and príncipe": "africa",
  senegal: "africa",
  seychelles: "africa",
  "sierra leone": "africa",
  somalia: "africa",
  "south africa": "africa",
  "south sudan": "africa",
  sudan: "africa",
  tanzania: "africa",
  togo: "africa",
  tunisia: "africa",
  uganda: "africa",
  zambia: "africa",
  zimbabwe: "africa",

  // Asia
  afghanistan: "asia",
  armenia: "asia",
  azerbaijan: "asia",
  bahrain: "asia",
  bangladesh: "asia",
  bhutan: "asia",
  brunei: "asia",
  cambodia: "asia",
  china: "asia",
  georgia: "asia",
  india: "asia",
  indonesia: "asia",
  iran: "asia",
  iraq: "asia",
  israel: "asia",
  japan: "asia",
  jordan: "asia",
  kazakhstan: "asia",
  kuwait: "asia",
  kyrgyzstan: "asia",
  laos: "asia",
  lebanon: "asia",
  malaysia: "asia",
  maldives: "asia",
  mongolia: "asia",
  myanmar: "asia",
  nepal: "asia",
  "north korea": "asia",
  oman: "asia",
  pakistan: "asia",
  palestine: "asia",
  philippines: "asia",
  qatar: "asia",
  "saudi arabia": "asia",
  singapore: "asia",
  "south korea": "asia",
  "sri lanka": "asia",
  syria: "asia",
  taiwan: "asia",
  tajikistan: "asia",
  thailand: "asia",
  "timor-leste": "asia",
  turkey: "asia",
  turkmenistan: "asia",
  "united arab emirates": "asia",
  uzbekistan: "asia",
  vietnam: "asia",
  yemen: "asia",

  // Europe
  albania: "europe",
  andorra: "europe",
  austria: "europe",
  belarus: "europe",
  belgium: "europe",
  "bosnia and herzegovina": "europe",
  bulgaria: "europe",
  croatia: "europe",
  cyprus: "europe",
  "czech republic": "europe",
  czechia: "europe",
  denmark: "europe",
  estonia: "europe",
  finland: "europe",
  france: "europe",
  germany: "europe",
  greece: "europe",
  hungary: "europe",
  iceland: "europe",
  ireland: "europe",
  italy: "europe",
  kosovo: "europe",
  latvia: "europe",
  liechtenstein: "europe",
  lithuania: "europe",
  luxembourg: "europe",
  malta: "europe",
  moldova: "europe",
  monaco: "europe",
  montenegro: "europe",
  netherlands: "europe",
  "north macedonia": "europe",
  norway: "europe",
  poland: "europe",
  portugal: "europe",
  romania: "europe",
  russia: "europe",
  "san marino": "europe",
  serbia: "europe",
  slovakia: "europe",
  slovenia: "europe",
  spain: "europe",
  sweden: "europe",
  switzerland: "europe",
  ukraine: "europe",
  "united kingdom": "europe",
  "great britain": "europe",
  england: "europe",
  scotland: "europe",
  wales: "europe",
  vatican: "europe",
  "vatican city": "europe",

  // North America
  antigua: "north-america",
  "antigua and barbuda": "north-america",
  bahamas: "north-america",
  barbados: "north-america",
  belize: "north-america",
  canada: "north-america",
  "costa rica": "north-america",
  cuba: "north-america",
  dominica: "north-america",
  "dominican republic": "north-america",
  "el salvador": "north-america",
  grenada: "north-america",
  guatemala: "north-america",
  haiti: "north-america",
  honduras: "north-america",
  jamaica: "north-america",
  mexico: "north-america",
  nicaragua: "north-america",
  panama: "north-america",
  "saint kitts and nevis": "north-america",
  "saint lucia": "north-america",
  "saint vincent and the grenadines": "north-america",
  "trinidad and tobago": "north-america",
  "united states": "north-america",
  usa: "north-america",
  "u.s.": "north-america",
  "united states of america": "north-america",

  // Oceania
  australia: "oceania",
  fiji: "oceania",
  kiribati: "oceania",
  "marshall islands": "oceania",
  micronesia: "oceania",
  nauru: "oceania",
  "new zealand": "oceania",
  palau: "oceania",
  "papua new guinea": "oceania",
  samoa: "oceania",
  "solomon islands": "oceania",
  tonga: "oceania",
  tuvalu: "oceania",
  vanuatu: "oceania",

  // South America
  argentina: "south-america",
  bolivia: "south-america",
  brazil: "south-america",
  chile: "south-america",
  colombia: "south-america",
  ecuador: "south-america",
  guyana: "south-america",
  paraguay: "south-america",
  peru: "south-america",
  suriname: "south-america",
  uruguay: "south-america",
  venezuela: "south-america",
};

export const CONTINENT_SHAPES: Record<Continent, ShapeType> = {
  africa: "triangle",
  asia: "square",
  europe: "circle",
  "north-america": "diamond",
  oceania: "pentagon",
  "south-america": "hexagon",
  unknown: "x",
};

export const CONTINENT_LABELS: Record<Continent, string> = {
  africa: "Africa",
  asia: "Asia",
  europe: "Europe",
  "north-america": "North America",
  oceania: "Oceania",
  "south-america": "South America",
  unknown: "Unknown",
};

export const CONTINENTS: readonly Continent[] = [
  "africa",
  "asia",
  "europe",
  "north-america",
  "oceania",
  "south-america",
  "unknown",
];

export function getContinent(country: string | null): Continent {
  if (!country || typeof country !== "string") return "unknown";
  const key = country.toLowerCase().trim();
  if (!key) return "unknown";
  return COUNTRY_TO_CONTINENT[key] ?? "unknown";
}

export function getContinentLabel(continent: Continent): string {
  return CONTINENT_LABELS[continent];
}

export function getShapeForContinent(continent: Continent): ShapeType {
  return CONTINENT_SHAPES[continent];
}
