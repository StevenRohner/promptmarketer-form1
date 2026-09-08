// Pure, shared IBAN validation for browser build and Railway server.
// Format metadata: SWIFT IBAN Registry release 102 (June 2026), 89 prefixes.
// Reference provenance and exclusions are documented in docs/international-iban.md.
// This validates syntax + MOD-97, NOT bank existence, ownership, or payment eligibility.
export const IBAN_REGISTRY_VERSION = 'SWIFT-102-2026-06';
export const IBAN_FORMATS = Object.freeze({
  AD: Object.freeze([24, '4!n4!n12!c']),
  AE: Object.freeze([23, '3!n16!n']),
  AL: Object.freeze([28, '8!n16!c']),
  AT: Object.freeze([20, '5!n11!n']),
  AZ: Object.freeze([28, '4!a20!c']),
  BA: Object.freeze([20, '3!n3!n8!n2!n']),
  BE: Object.freeze([16, '3!n7!n2!n']),
  BG: Object.freeze([22, '4!a4!n2!n8!c']),
  BH: Object.freeze([22, '4!a14!c']),
  BI: Object.freeze([27, '5!n5!n11!n2!n']),
  BR: Object.freeze([29, '8!n5!n10!n1!a1!c']),
  BY: Object.freeze([28, '4!c4!n16!c']),
  CH: Object.freeze([21, '5!n12!c']),
  CR: Object.freeze([22, '4!n14!n']),
  CY: Object.freeze([28, '3!n5!n16!c']),
  CZ: Object.freeze([24, '4!n6!n10!n']),
  DE: Object.freeze([22, '8!n10!n']),
  DJ: Object.freeze([27, '5!n5!n11!n2!n']),
  DK: Object.freeze([18, '4!n9!n1!n']),
  DO: Object.freeze([28, '4!c20!n']),
  EE: Object.freeze([20, '2!n2!n11!n1!n']),
  EG: Object.freeze([29, '4!n4!n17!n']),
  ES: Object.freeze([24, '4!n4!n1!n1!n10!n']),
  FI: Object.freeze([18, '3!n11!n']),
  FK: Object.freeze([18, '2!a12!n']),
  FO: Object.freeze([18, '4!n9!n1!n']),
  FR: Object.freeze([27, '5!n5!n11!c2!n']),
  GB: Object.freeze([22, '4!a6!n8!n']),
  GE: Object.freeze([22, '2!a16!n']),
  GI: Object.freeze([23, '4!a15!c']),
  GL: Object.freeze([18, '4!n9!n1!n']),
  GR: Object.freeze([27, '3!n4!n16!c']),
  GT: Object.freeze([28, '4!c20!c']),
  HN: Object.freeze([28, '4!a20!n']),
  HR: Object.freeze([21, '7!n10!n']),
  HU: Object.freeze([28, '3!n4!n1!n15!n1!n']),
  IE: Object.freeze([22, '4!a6!n8!n']),
  IL: Object.freeze([23, '3!n3!n13!n']),
  IQ: Object.freeze([23, '4!a3!n12!n']),
  IS: Object.freeze([26, '4!n2!n6!n10!n']),
  IT: Object.freeze([27, '1!a5!n5!n12!c']),
  JO: Object.freeze([30, '4!a4!n18!c']),
  KW: Object.freeze([30, '4!a22!c']),
  KZ: Object.freeze([20, '3!n13!c']),
  LB: Object.freeze([28, '4!n20!c']),
  LC: Object.freeze([32, '4!a24!c']),
  LI: Object.freeze([21, '5!n12!c']),
  LT: Object.freeze([20, '5!n11!n']),
  LU: Object.freeze([20, '3!n13!c']),
  LV: Object.freeze([21, '4!a13!c']),
  LY: Object.freeze([25, '3!n3!n15!n']),
  MC: Object.freeze([27, '5!n5!n11!c2!n']),
  MD: Object.freeze([24, '2!c18!c']),
  ME: Object.freeze([22, '3!n13!n2!n']),
  MK: Object.freeze([19, '3!n10!c2!n']),
  MN: Object.freeze([20, '4!n12!n']),
  MR: Object.freeze([27, '5!n5!n11!n2!n']),
  MT: Object.freeze([31, '4!a5!n18!c']),
  MU: Object.freeze([30, '4!a2!n2!n12!n3!n3!a']),
  NI: Object.freeze([28, '4!a20!n']),
  NL: Object.freeze([18, '4!a10!n']),
  NO: Object.freeze([15, '4!n6!n1!n']),
  OM: Object.freeze([23, '3!n16!c']),
  PK: Object.freeze([24, '4!a16!c']),
  PL: Object.freeze([28, '8!n16!n']),
  PS: Object.freeze([29, '4!a21!c']),
  PT: Object.freeze([25, '4!n4!n11!n2!n']),
  QA: Object.freeze([29, '4!a21!c']),
  RO: Object.freeze([24, '4!a16!c']),
  RS: Object.freeze([22, '3!n13!n2!n']),
  RU: Object.freeze([33, '9!n5!n15!c']),
  SA: Object.freeze([24, '2!n18!c']),
  SC: Object.freeze([31, '4!a2!n2!n16!n3!a']),
  SD: Object.freeze([18, '2!n12!n']),
  SE: Object.freeze([24, '3!n16!n1!n']),
  SI: Object.freeze([19, '5!n8!n2!n']),
  SK: Object.freeze([24, '4!n6!n10!n']),
  SM: Object.freeze([27, '1!a5!n5!n12!c']),
  SO: Object.freeze([23, '4!n3!n12!n']),
  ST: Object.freeze([25, '4!n4!n11!n2!n']),
  SV: Object.freeze([28, '4!a20!n']),
  TL: Object.freeze([23, '3!n14!n2!n']),
  TN: Object.freeze([24, '2!n3!n13!n2!n']),
  TR: Object.freeze([26, '5!n1!n16!c']),
  UA: Object.freeze([29, '6!n19!c']),
  VA: Object.freeze([22, '3!n15!n']),
  VG: Object.freeze([24, '4!a16!n']),
  XK: Object.freeze([20, '4!n10!n2!n']),
  YE: Object.freeze([30, '4!a4!n18!c']),
});
const IBAN_PATTERNS = new Map(Object.entries(IBAN_FORMATS).map(([code, [, spec]]) => {
  const alphabet = {n: '[0-9]', a: '[A-Z]', c: '[A-Z0-9]'};
  const pattern = spec.replace(/(\d+)!([nac])/g, (_, count, type) => alphabet[type] + '{' + count + '}');
  return [code, new RegExp('^' + pattern + '$')];
}));

// Accept printed IBANs and lowercase ASCII; never silently remove punctuation,
// transliterate lookalike letters, or coerce numbers (leading zeroes matter).
export function normaliseIban(raw) {
  if (typeof raw !== 'string' || raw.length > 128) return '';
  const compact = raw.replace(/\s/gu, '');
  return /^[A-Za-z0-9]*$/.test(compact) ? compact.toUpperCase() : '';
}
export function inspectIban(raw) {
  const iban = normaliseIban(raw);
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(iban)) return {valid:false,error:'format'};
  const country = iban.slice(0, 2), rule = IBAN_FORMATS[country];
  if (!rule) return {valid:false,error:'country',country};
  if (iban.length !== rule[0]) return {valid:false,error:'length',country,length:rule[0]};
  if (!IBAN_PATTERNS.get(country).test(iban.slice(4))) return {valid:false,error:'structure',country};
  const check = Number(iban.slice(2, 4));
  if (check < 2 || check > 98) return {valid:false,error:'checksum',country};
  let remainder = 0;
  for (const ch of iban.slice(4) + iban.slice(0, 4)) {
    const digits = ch >= 'A' && ch <= 'Z' ? String(ch.charCodeAt(0) - 55) : ch;
    for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1 ? {valid:true,iban,country} : {valid:false,error:'checksum',country};
}
export function ibanValid(raw) { return inspectIban(raw).valid; }
