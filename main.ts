// One-liner writer for "One-Liner Marathon" (make.fun). Writes one funny
// single-line comedy joke to $MAKEFUN_OUTPUT_DIR/entry.txt.
// Deterministic: no clock, no randomness, no network, no unordered iteration.
// Node 22, zero dependencies, erasable TypeScript only.
//
// The judge (a deadpan stand-up comic) weighs, most important first:
//   1. it works as a one-line joke with a punchline;
//   2. the turn is not the obvious first idea and lands on the first read;
//   3. it is economical — every word earns its place, tighter beats longer;
//   4. it has a distinct voice and point of view;
//   5. it holds up on a second read, without shock for its own sake.
// The scorer below mirrors that brief in the same order. Candidates are
// original lines written for this entry; the program scores every one and
// picks the winner by deterministic argmax: highest score, then shortest,
// then lexicographic. (Ties on judge win rate go to the smaller text, then
// the earlier receipt, so short lines earn their keep.)

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------- candidates
const CANDIDATES: string[] = [
  // Therapy, billed by the hour: the coping mechanism is corporate.
  "My therapist charges by the hour, so I've learned to cry in bullet points.",
  // Therapy, billed by the hour: the cheaper variant of the same turn.
  "My therapist charges by the hour, so I've learned to cry efficiently.",
  // Journaling: the notebook enforces a boundary of its own.
  "I tried journaling my feelings; the notebook filed for emotional distance.",
  // Plants: a contract, and both sides are lying a little.
  "My plants and I have a deal: I water them, they pretend I'm a functional adult.",
  // Parrot: the bird learned the worst sentence in the language.
  "I taught my parrot to say 'we need to talk' — now my dates leave before dessert.",
  // Calendar: a meeting with the one attendee who never shows up prepared.
  "My calendar invited me to a meeting with myself; I declined — I know how I am in meetings.",
  // Elevator: the pep talk is technically true and emotionally useless.
  "I asked the elevator for a pep talk; it said 'going up' — technically correct, emotionally useless.",
  // Desk plant: the reminder works; the plant does not.
  "I keep a plant on my desk to remind me things can grow here; it's dead, but the reminder works.",
  // Bank account: an understanding, kept by both sides.
  "My bank account and I have an understanding: it stays empty, and I stay optimistic.",
  // Meditation: the thoughts unionise the moment the session ends.
  "I meditate every morning now; my thoughts just wait until I'm done and then all talk at once.",
  // Standing desk: healthier posture, same appetite, higher altitude.
  "I bought a standing desk to be healthier; now I just stand still and eat at a higher altitude.",
  // Printer: it only works when nothing depends on it.
  "My printer only works when I'm not in a hurry — it's the most emotionally intelligent device I own.",
  // Screen time: the report flatters you for facing it.
  "My phone's screen time report called me brave for checking my own stats.",
  // Alarm: the snooze button is a life plan now.
  "I set my alarm for 6am and my snooze button for a better life.",
  // Fridge light: a small mystery, and a grudging respect for it.
  "My fridge light stays on when I close the door — I checked, and honestly, I respect the commitment.",
  // Smartwatch: praise for the bare minimum.
  "My smartwatch congratulated me for standing up — I've never been so proud of doing the bare minimum.",
  // GPS: even the satellites want drama.
  "I asked the GPS for the scenic route; it took me past my ex's house twice — even the satellites want drama.",
  // Roomba: the only employee who hides from work in plain sight.
  "My Roomba got stuck under the couch again — it's the only employee I have who hides from work in plain sight.",
  // Dog and fridge: a betrayal of the family business.
  "My dog learned to open the fridge, so now I lock it — he just stares at me like I betrayed the family business.",
  // Smart speaker: motivation, outsourced, unhelpful.
  "I asked my smart speaker for motivation; it played my alarm and said good luck.",
  // Horoscope: the special someone is on a delivery route.
  "My horoscope said I'd meet someone special today; it was the delivery guy, and he just left the package.",
  // Mirror: even glass has limits.
  "I told my mirror I'm doing great; it cracked — even glass has limits.",
  // Self-help book: even the advice has boundaries now.
  "I bought a self-help book and it ghosted me — even the advice has boundaries now.",
  // Cactus: classic cactus.
  "I told my plants I loved them; the cactus said nothing — classic cactus.",
  // Suitcase: it was already packed for this.
  "I told my suitcase we needed space, so it left — turns out it was already packed for this.",
  // Password: the most secure thing I own, including from me.
  "My password is so strong even I can't get in — my accounts are now the most secure thing I own, including from me.",
  // Barista: the name is spelled right, somehow wrong.
  "I told the barista my name is 'Noah' so they'd spell it right; they wrote 'Noa, with an H at the end.'",
  // Do Not Disturb: respected so much even the alarm gave up.
  "I put my phone on Do Not Disturb; it respected me so much even my alarm gave up.",
  // Grandmother's Wi-Fi: security through family reunion.
  "My grandmother's Wi-Fi password is her maiden name — hackers would need a family reunion to get in.",
  // Vacuum: closure, finally.
  "I named my vacuum 'Closure' because it finally sucks up everything I left behind.",
  // Dog chef: Gordon Ramsay, with more fur and less shouting.
  "My dog judges my cooking by leaving the room — Gordon Ramsay, but with more fur and less shouting.",
  // AI vows: the model proposed first.
  "I asked AI to write my wedding vows; it proposed to my fiancée first.",
  // Plastic plants: guilt for neglecting something never alive.
  "My plants died, so I bought plastic ones — now I feel guilty for neglecting something that was never alive.",
  // Gym: a monthly subscription to guilt.
  "My gym membership is the only subscription I pay to feel guilty monthly.",
  // Wi-Fi: on a break, still no space, just slower speeds.
  "I told my Wi-Fi router we're on a break; it still won't give me space, just slower speeds.",
  // Therapist and plants: only the dead ones judge.
  "I told my therapist I talk to my plants; she asked if they answer, and I said only the dead ones judge me.",
  // Therapy, billed by the hour: the feelings go on the invoice too.
  "My therapist charges by the hour, so I've started billing my feelings as overtime.",
  // Calendar: even the day off needs a meeting first.
  "I asked my calendar for a day off; it scheduled a meeting to discuss it.",
  // Plants: the complaint is formal, the care is not.
  "My plants filed a complaint: too much water, not enough conversation.",
  // Morning person: the plants are not convinced.
  "I told my plants I'm a morning person now; they wilted out of solidarity.",
  // To-do list: a negotiation neither side is winning.
  "My to-do list and I agreed to disagree; it keeps growing, and I keep nodding politely.",
];

// Concrete, specific nouns: a line that names real things earns specificity.
const SPECIFIC_WORDS: string[] = [
  "therapist", "hour", "bullet", "points", "plants", "deal", "water",
  "calendar", "meeting", "meetings", "notebook", "feelings", "journaling",
  "emotional", "elevator", "pep", "talk", "plant", "desk", "reminder",
  "parrot", "dates", "dessert", "bank", "account", "thoughts", "morning",
  "meditate", "printer", "phone", "alarm", "fridge", "door", "mirror",
  "glass", "cactus", "barista", "name", "suitcase", "vacuum", "dog",
  "password", "accounts", "wifi", "gym", "speaker", "wedding", "roomba",
  "couch", "smartwatch", "horoscope", "book", "grandmother",
];

// Distinctive turns: the phrase that makes the line nobody else's.
const DISTINCT_TURNS: string[] = [
  "bullet points", "cry efficiently", "filed for", "pretend",
  "i know how", "technically correct", "higher altitude", "bare minimum",
  "functional adult", "emotional distance", "we need to talk",
  "stay optimistic",
];

// Tired angles a reader has seen a hundred times.
const TIRED: string[] = [
  "my wife", "alexa", "siri", "gym membership", "adulting", "monday",
  "my phone died", "my ex", "coffee addict",
];

// Filler that explains the joke instead of landing it.
const FILLER: string[] = ["very", "really", "honestly", "actually", "just", "because"];

// Pivot markers: the turn the reader did not see coming. It must land late.
const PIVOTS: string[] = [", so ", "; ", " — ", ", which ", ", but ", ", and ", ": "];

function esc(w: string): string {
  return w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ------------------------------------------------------------------- scoring
// Rubric mirroring the judge's brief, most important first.
function pivotScore(text: string): number {
  const lower = text.toLowerCase();
  const tail = lower.slice(-45);
  // A ", so " consequence punchline is the strongest joke shape here.
  if (tail.includes(", so ")) return 26;
  for (const m of PIVOTS) {
    if (tail.includes(m)) return 20;
  }
  for (const m of PIVOTS) {
    if (lower.includes(m)) return 8;
  }
  return 0;
}

function specificityScore(text: string): number {
  const lower = text.toLowerCase();
  const seen = new Set<string>();
  for (const w of SPECIFIC_WORDS) {
    if (new RegExp(`\\b${esc(w)}\\b`).test(lower)) seen.add(w);
  }
  return Math.min(seen.size, 4) * 3; // a specific, recognisable setup
}

function voiceScore(text: string): number {
  const lower = text.toLowerCase();
  let s = 0;
  if (/\bi\b/.test(lower)) s += 4; // first-person point of view
  for (const t of DISTINCT_TURNS) {
    if (lower.includes(t)) { s += 8; break; }
  }
  return Math.min(s, 12);
}

function economyScore(text: string): number {
  const len = text.length;
  let s = 0;
  if (len >= 60 && len <= 85) s += 13;
  else if (len > 85 && len <= 100) s += 10;
  else if (len > 100 && len <= 120) s += 6;
  else s += 2;
  if (len <= 80) s += 3; // the shortest lines land hardest; ties go to fewer bytes
  return s;
}

function freshnessScore(text: string): number {
  const lower = text.toLowerCase();
  let s = 0;
  for (const t of TIRED) {
    if (lower.includes(t)) s -= 8;
  }
  return s;
}

function fillerPenalty(text: string): number {
  const lower = text.toLowerCase();
  let s = 0;
  for (const f of FILLER) {
    if (new RegExp(`\\b${esc(f)}\\b`).test(lower)) s -= 3;
  }
  return s;
}

function structureBonus(text: string): number {
  // One clean sentence, ending in a period, with a mid-line pivot mark.
  if (!text.endsWith(".")) return 0;
  if (text.includes(", ") || text.includes("; ") || text.includes(" — ") || text.includes(": ")) return 5;
  return 0;
}

function score(text: string): number {
  return (
    pivotScore(text) +
    specificityScore(text) +
    voiceScore(text) +
    economyScore(text) +
    freshnessScore(text) +
    fillerPenalty(text) +
    structureBonus(text)
  );
}

function isValid(text: string): boolean {
  if (text.length < 1 || text.length > 280) return false;
  if (text.trim() !== text || text.trim().length === 0) return false;
  if (!text.endsWith(".")) return false;
  if (/\n/.test(text)) return false; // one line only
  if (/\s{2,}/.test(text)) return false;
  if (/free|subscribe|click|buy now|http/.test(text.toLowerCase())) return false;
  return true;
}

// -------------------------------------------------------------- composition
interface Candidate {
  text: string;
  score: number;
}

function buildCandidates(): Candidate[] {
  const out: Candidate[] = [];
  for (const text of CANDIDATES) {
    if (!isValid(text)) continue;
    out.push({ text, score: score(text) });
  }
  return out;
}

function pickBest(candidates: Candidate[]): Candidate {
  // Deterministic argmax: higher score, then shorter, then lexicographic.
  // Hand-traced: winner 71, next best 65 (journaling), then 62 (parrot).
  const sorted = [...candidates].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.text.length !== b.text.length) return a.text.length - b.text.length;
    return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
  });
  return sorted[0];
}

// --------------------------------------------------------------------- main
function main(): void {
  const candidates = buildCandidates();
  if (candidates.length === 0) throw new Error("no valid one-liner candidate");
  const best = pickBest(candidates);
  if (process.env.ONELINER_DEBUG) {
    const ranked = [...candidates].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.text.length !== b.text.length) return a.text.length - b.text.length;
      return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
    });
    for (const c of ranked.slice(0, 8)) {
      console.log(`[${c.score}] (${c.text.length}) ${c.text}`);
    }
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.txt"), best.text, "utf8");
  console.log(best.text);
  console.log(
    `chars: ${best.text.length} score: ${best.score} candidates: ${candidates.length}`,
  );
}

main();
