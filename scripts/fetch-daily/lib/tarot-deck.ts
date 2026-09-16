export interface TarotCard {
  name: string;
  uprightMeaning: string;
  reversedMeaning: string;
}

const MAJOR_ARCANA: TarotCard[] = [
  { name: "The Fool", uprightMeaning: "New beginnings, spontaneity, a leap of faith into the unknown.", reversedMeaning: "Recklessness, hesitation, a risk taken without preparation." },
  { name: "The Magician", uprightMeaning: "Resourcefulness, willpower, turning ideas into action.", reversedMeaning: "Manipulation, untapped talent, scattered focus." },
  { name: "The High Priestess", uprightMeaning: "Intuition, hidden knowledge, quiet inner knowing.", reversedMeaning: "Secrets surfacing, disconnection from instinct." },
  { name: "The Empress", uprightMeaning: "Abundance, nurturing, creative growth.", reversedMeaning: "Neglect, creative block, overdependence." },
  { name: "The Emperor", uprightMeaning: "Structure, authority, disciplined leadership.", reversedMeaning: "Rigidity, domineering control, instability." },
  { name: "The Hierophant", uprightMeaning: "Tradition, mentorship, shared belief systems.", reversedMeaning: "Questioning convention, unconventional paths." },
  { name: "The Lovers", uprightMeaning: "Partnership, alignment of values, meaningful choice.", reversedMeaning: "Misalignment, imbalance in a relationship, indecision." },
  { name: "The Chariot", uprightMeaning: "Willpower, focused drive, victory through discipline.", reversedMeaning: "Lack of direction, scattered effort, self-doubt." },
  { name: "Strength", uprightMeaning: "Quiet courage, patience, mastery through gentleness.", reversedMeaning: "Self-doubt, forced control, low resilience." },
  { name: "The Hermit", uprightMeaning: "Introspection, solitude, seeking inner guidance.", reversedMeaning: "Isolation, withdrawal, avoiding needed reflection." },
  { name: "Wheel of Fortune", uprightMeaning: "Cycles turning, change arriving, a shift in fortune.", reversedMeaning: "Resistance to change, feeling stuck in a cycle." },
  { name: "Justice", uprightMeaning: "Fairness, accountability, cause and effect made clear.", reversedMeaning: "Imbalance, avoided responsibility, an unresolved matter." },
  { name: "The Hanged Man", uprightMeaning: "A pause, surrender, seeing things from a new angle.", reversedMeaning: "Stalling, resistance to a needed pause." },
  { name: "Death", uprightMeaning: "Ending one phase to allow another to begin.", reversedMeaning: "Resistance to necessary change, prolonged transition." },
  { name: "Temperance", uprightMeaning: "Balance, patience, blending opposites into harmony.", reversedMeaning: "Excess, impatience, imbalance between areas of life." },
  { name: "The Devil", uprightMeaning: "Attachment, old patterns, facing what binds you.", reversedMeaning: "Releasing a limiting pattern, reclaiming agency." },
  { name: "The Tower", uprightMeaning: "Sudden disruption that clears away what wasn't stable.", reversedMeaning: "Delayed upheaval, avoiding an overdue collapse." },
  { name: "The Star", uprightMeaning: "Hope, renewal, quiet faith after difficulty.", reversedMeaning: "Discouragement, disconnection from hope." },
  { name: "The Moon", uprightMeaning: "Uncertainty, intuition working through unclear signals.", reversedMeaning: "Clarity emerging after confusion, facing a hidden fear." },
  { name: "The Sun", uprightMeaning: "Clarity, vitality, genuine success.", reversedMeaning: "Temporary clouding of an otherwise good outlook." },
  { name: "Judgement", uprightMeaning: "Reckoning, a call to a higher purpose, honest self-assessment.", reversedMeaning: "Self-doubt, avoiding a needed reassessment." },
  { name: "The World", uprightMeaning: "Completion, integration, a cycle reaching fulfillment.", reversedMeaning: "Unfinished business, a delayed sense of closure." },
];

const SUITS: { name: string; theme: string }[] = [
  { name: "Wands", theme: "creativity, ambition, and action" },
  { name: "Cups", theme: "emotion, relationships, and intuition" },
  { name: "Swords", theme: "thought, conflict, and communication" },
  { name: "Pentacles", theme: "material life, work, and resources" },
];

const RANKS: { name: string; upright: string; reversed: string }[] = [
  { name: "Ace", upright: "a fresh spark", reversed: "a false start" },
  { name: "Two", upright: "a choice or a partnership forming", reversed: "indecision or imbalance" },
  { name: "Three", upright: "early collaboration or growth", reversed: "a group effort stalling" },
  { name: "Four", upright: "stability, a pause to consolidate", reversed: "stagnation or boredom" },
  { name: "Five", upright: "friction or competition", reversed: "conflict finally easing" },
  { name: "Six", upright: "progress and recognition", reversed: "delayed or unacknowledged progress" },
  { name: "Seven", upright: "a test of resolve", reversed: "exhaustion or overwhelm" },
  { name: "Eight", upright: "swift movement or change", reversed: "movement blocked or scattered" },
  { name: "Nine", upright: "near-completion, close to the goal", reversed: "anxiety near the finish line" },
  { name: "Ten", upright: "culmination, a cycle's end", reversed: "burden carried too long" },
  { name: "Page", upright: "a curious, early-stage message", reversed: "immaturity or a stalled start" },
  { name: "Knight", upright: "momentum toward a goal", reversed: "impulsiveness or misdirected energy" },
  { name: "Queen", upright: "mature, intuitive command of the theme", reversed: "insecurity around the theme" },
  { name: "King", upright: "confident mastery of the theme", reversed: "overcontrol or misuse of authority" },
];

function buildMinorArcana(): TarotCard[] {
  const cards: TarotCard[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({
        name: `${rank.name} of ${suit.name}`,
        uprightMeaning: `In matters of ${suit.theme}: ${rank.upright}.`,
        reversedMeaning: `In matters of ${suit.theme}: ${rank.reversed}.`,
      });
    }
  }
  return cards;
}

export const TAROT_DECK: TarotCard[] = [...MAJOR_ARCANA, ...buildMinorArcana()];

export function drawRandomTarotCard(): { card: TarotCard; orientation: "upright" | "reversed" } {
  const index = Math.floor(Math.random() * TAROT_DECK.length);
  const orientation = Math.random() < 0.5 ? "upright" : "reversed";
  return { card: TAROT_DECK[index], orientation };
}
