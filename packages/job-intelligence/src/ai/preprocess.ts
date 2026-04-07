// Strips noise from job descriptions before sending to LLM
// to reduce token cost and improve extraction quality.
const NOISE_PATTERNS = [
  // Benefits blocks
  /we offer[:\s].*?(?=\n\n|\z)/gsi,
  /benefits include[:\s].*?(?=\n\n|\z)/gsi,
  /perks[:\s].*?(?=\n\n|\z)/gsi,
  // EEO / legal boilerplate
  /equal opportunity employer.*$/gsi,
  /we are an equal.*$/gsi,
  /eeo.*$/gsi,
  /accommodation.*?request.*?$/gim,
  // Company "about us" fluff
  /about us[:\s].*?(?=\n\n)/gsi,
  /who we are[:\s].*?(?=\n\n)/gsi,
  // Compensation legals
  /base salary range.*?$/gim,
  /compensation.*?depends on.*?$/gim,
];

export function preprocessDescription(raw: string): string {
  let text = raw;
  for (const pattern of NOISE_PATTERNS) {
    text = text.replace(pattern, '');
  }
  // Collapse multiple blank lines
  text = text.replace(/\n{3,}/g, '\n\n').trim();
  // Truncate at 2000 chars — single-job fallback limit
  return text.slice(0, 2000);
}
