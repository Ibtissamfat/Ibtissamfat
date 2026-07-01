const COUNTRY_ISO2: Record<string, string> = {
  argentina: "AR",
  brazil: "BR",
  france: "FR",
  england: "GB-ENG",
  spain: "ES",
  germany: "DE",
  portugal: "PT",
  netherlands: "NL",
  belgium: "BE",
  croatia: "HR",
  morocco: "MA",
  japan: "JP",
  "south korea": "KR",
  "korea republic": "KR",
  usa: "US",
  "united states": "US",
  mexico: "MX",
  canada: "CA",
  uruguay: "UY",
  colombia: "CO",
  ecuador: "EC",
  senegal: "SN",
  ghana: "GH",
  nigeria: "NG",
  cameroon: "CM",
  tunisia: "TN",
  egypt: "EG",
  algeria: "DZ",
  "saudi arabia": "SA",
  qatar: "QA",
  iran: "IR",
  australia: "AU",
  "new zealand": "NZ",
  switzerland: "CH",
  italy: "IT",
  poland: "PL",
  denmark: "DK",
  sweden: "SE",
  norway: "NO",
  serbia: "RS",
  "bosnia and herzegovina": "BA",
  bosnia: "BA",
  wales: "GB-WLS",
  scotland: "GB-SCT",
  ukraine: "UA",
  turkey: "TR",
  türkiye: "TR",
  austria: "AT",
  czechia: "CZ",
  "czech republic": "CZ",
  "ivory coast": "CI",
  "côte d'ivoire": "CI",
  jamaica: "JM",
  panama: "PA",
  "costa rica": "CR",
  peru: "PE",
  paraguay: "PY",
  chile: "CL",
  venezuela: "VE",
  bolivia: "BO",
  "south africa": "ZA",
  "dr congo": "CD",
  jordan: "JO",
  uzbekistan: "UZ",
  "cape verde": "CV",
  curacao: "CW",
  haiti: "HT",
  honduras: "HN",
  "trinidad and tobago": "TT",
  suriname: "SR",
  finland: "FI",
  slovenia: "SI",
  slovakia: "SK",
  hungary: "HU",
  romania: "RO",
  bulgaria: "BG",
  greece: "GR",
  israel: "IL",
  iraq: "IQ",
  china: "CN",
  "china pr": "CN",
  india: "IN",
  bahrain: "BH",
  kuwait: "KW",
  oman: "OM",
  uae: "AE",
  "united arab emirates": "AE",
  gabon: "GA",
  mali: "ML",
  guinea: "GN",
  zambia: "ZM",
  angola: "AO",
  benin: "BJ",
  mozambique: "MZ",
  namibia: "NA",
  libya: "LY",
  comoros: "KM",
  madagascar: "MG",
  niger: "NE",
  "burkina faso": "BF",
};

const FLAG_LETTER_OFFSET = 127397;

function letterToRegionalIndicator(letter: string): string {
  return String.fromCodePoint(FLAG_LETTER_OFFSET + letter.charCodeAt(0));
}

function iso2ToFlagEmoji(iso2: string): string {
  const base = iso2.split("-")[0];
  return base
    .toUpperCase()
    .split("")
    .map(letterToRegionalIndicator)
    .join("");
}

export function flagForTeam(teamName: string): string {
  const key = teamName.trim().toLowerCase();
  const iso2 = COUNTRY_ISO2[key];
  if (!iso2) return "⚽";
  if (iso2 === "GB-ENG") return "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}";
  if (iso2 === "GB-SCT") return "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}";
  if (iso2 === "GB-WLS") return "\u{1F3F4}\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}";
  return iso2ToFlagEmoji(iso2);
}
