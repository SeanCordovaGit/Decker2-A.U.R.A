/**
 * Small offline lexicon sentiment scorer (research R8).
 * Returns null for entries shorter than 3 words.
 */
const POSITIVE: Record<string, number> = {
  good: 1, great: 2, fine: 1, okay: 0.5, ok: 0.5, happy: 2, calm: 1.5, rested: 1.5,
  energized: 2, excited: 2, grateful: 2, proud: 1.5, relaxed: 1.5, well: 1, better: 1,
  amazing: 2.5, wonderful: 2.5, love: 2, enjoy: 1.5, enjoyed: 1.5, focused: 1.5,
  productive: 1.5, motivated: 1.5, strong: 1, hopeful: 1.5, peaceful: 1.5, fun: 1.5,
  confident: 1.5, smooth: 1, beautiful: 2, awesome: 2.5, nice: 1, thankful: 2,
};

const NEGATIVE: Record<string, number> = {
  bad: -1.5, tired: -1.5, exhausted: -2.5, sad: -2, lonely: -2.5, homesick: -2.5,
  anxious: -2, stressed: -2, stress: -1.5, angry: -2, frustrated: -2, worried: -2,
  sick: -2, pain: -2, hurt: -2, headache: -1.5, cant: -0.5, cannot: -0.5, insomnia: -2,
  overwhelmed: -2.5, depressed: -3, hopeless: -3, irritated: -1.5, conflict: -1.5,
  argument: -1.5, miss: -1, missing: -1, afraid: -2, scared: -2, terrible: -2.5,
  awful: -2.5, bored: -1, isolated: -2, drained: -2, nauseous: -2, dizzy: -1.5,
  annoyed: -1.5, upset: -2, fatigue: -2, fatigued: -2, sleepless: -2, struggling: -2,
};

const NEGATORS = new Set(["not", "never", "no", "dont", "didnt", "isnt", "wasnt", "cant", "couldnt", "wont", "hardly"]);
const INTENSIFIERS: Record<string, number> = { very: 1.5, really: 1.4, so: 1.3, extremely: 1.8, super: 1.5, totally: 1.4 };

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[’']/g, "")
    .split(/[^a-z]+/)
    .filter(Boolean);
}

export function scoreSentiment(text: string): { sentiment: number; score: number } | null {
  const tokens = tokenize(text);
  if (tokens.length < 3) return null;

  let total = 0;
  let hits = 0;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    let v = POSITIVE[t] ?? NEGATIVE[t];
    if (v === undefined) continue;
    const window = tokens.slice(Math.max(0, i - 3), i);
    const mult = window.reduce((m, w) => m * (INTENSIFIERS[w] ?? 1), 1);
    v *= mult;
    if (window.some((w) => NEGATORS.has(w))) v *= -0.7;
    total += v;
    hits++;
  }

  if (hits === 0) return { sentiment: 0, score: 50 };
  // Normalize: average intensity squashed into −1..1
  const avg = total / hits;
  const sentiment = Math.max(-1, Math.min(1, Math.tanh(avg / 1.5)));
  return { sentiment, score: Math.round((sentiment + 1) * 50) };
}
