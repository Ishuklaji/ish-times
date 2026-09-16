import * as Astronomy from "astronomy-engine";
import { synthesizeJson } from "./anthropic";
import { drawRandomTarotCard } from "./tarot-deck";
import { NATAL_CHART } from "../../../lib/natal-chart";
import type { AstrologyBody } from "../../../lib/types";

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];

const ASCENDANT_SIGN_INDEX = SIGNS.indexOf("Cancer"); // 3

/** Linear approximation of the Lahiri (Chitrapaksha) ayanamsa, in degrees. */
function lahiriAyanamsa(date: Date): number {
  const decimalYear = date.getUTCFullYear() + (date.getUTCMonth() + 1) / 12;
  const ayanamsaAt2000 = 23.85;
  const arcsecPerYear = 50.29;
  return ayanamsaAt2000 + (decimalYear - 2000) * (arcsecPerYear / 3600);
}

function toSidereal(tropicalLon: number, ayanamsa: number): number {
  return ((tropicalLon - ayanamsa) % 360 + 360) % 360;
}

function houseFromSignIndex(signIndex: number): number {
  return ((signIndex - ASCENDANT_SIGN_INDEX + 12) % 12) + 1;
}

/** Meeus mean lunar ascending node longitude (tropical), degrees. */
function meanNodeLongitude(date: Date): number {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;
  const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  return ((omega % 360) + 360) % 360;
}

export interface TransitPlacement {
  planet: string;
  sign: string;
  house: number;
  nakshatra?: string;
}

export function computeTodaysTransits(date: Date = new Date()): TransitPlacement[] {
  const ayanamsa = lahiriAyanamsa(date);

  const sunLon = Astronomy.SunPosition(date).elon;
  const moonLon = Astronomy.EclipticGeoMoon(date).lon;

  const bodies: { name: string; body: Astronomy.Body }[] = [
    { name: "Mercury", body: Astronomy.Body.Mercury },
    { name: "Venus", body: Astronomy.Body.Venus },
    { name: "Mars", body: Astronomy.Body.Mars },
    { name: "Jupiter", body: Astronomy.Body.Jupiter },
    { name: "Saturn", body: Astronomy.Body.Saturn },
  ];

  const placements: TransitPlacement[] = [];

  const pushPlacement = (name: string, tropicalLon: number, withNakshatra = false) => {
    const siderealLon = toSidereal(tropicalLon, ayanamsa);
    const signIndex = Math.floor(siderealLon / 30);
    const placement: TransitPlacement = {
      planet: name,
      sign: SIGNS[signIndex],
      house: houseFromSignIndex(signIndex),
    };
    if (withNakshatra) {
      const nakIndex = Math.floor(siderealLon / (360 / 27));
      placement.nakshatra = NAKSHATRAS[nakIndex];
    }
    placements.push(placement);
  };

  pushPlacement("Sun", sunLon);
  pushPlacement("Moon", moonLon, true);
  for (const b of bodies) {
    pushPlacement(b.name, Astronomy.EclipticLongitude(b.body, date));
  }

  const rahuTropical = meanNodeLongitude(date);
  pushPlacement("Rahu", rahuTropical);
  pushPlacement("Ketu", (rahuTropical + 180) % 360);

  return placements;
}

export async function buildAstrologySection(date: Date = new Date()): Promise<AstrologyBody> {
  const transits = computeTodaysTransits(date);
  const { card, orientation } = drawRandomTarotCard();
  const meaning = orientation === "upright" ? card.uprightMeaning : card.reversedMeaning;

  const result = await synthesizeJson<{
    transitSummary: string;
    suggestion: string;
    dailyThemeConnection: string;
    reflectiveQuestion: string;
  }>(
    "You write the Astrology Corner for a personal daily newspaper, in the traditional Jyotish (Vedic astrology) and tarot idiom of a real newspaper column: interpretive and reflective, never deterministic fact, never a guarantee.",
    `Natal chart (fixed): Ascendant ${NATAL_CHART.ascendant}; ${NATAL_CHART.moon}; ${NATAL_CHART.mars}; ${NATAL_CHART.jupiterSaturn}; ${NATAL_CHART.rahu}. Currently running: ${NATAL_CHART.currentDasha}.\n\n` +
      `Today's computed sidereal transits (Lahiri ayanamsa), given as planet/sign/house-relative-to-the-Cancer-ascendant:\n` +
      transits.map((t) => `${t.planet} in ${t.sign} (house ${t.house}${t.nakshatra ? `, ${t.nakshatra} nakshatra` : ""})`).join("; ") +
      `\n\nWrite 3-4 sentences connecting today's transits to likely daily themes (career/relationships/communication/finances), referencing the active Rahu-Mars Antardasha where relevant. End with one grounded, practical suggestion.\n\n` +
      `Today's tarot draw: "${card.name}" (${orientation}). Traditional meaning: ${meaning}\n` +
      `Write a 2-3 sentence connection of this card to a likely daily theme, then a reflective (not directive) question.\n\n` +
      `Return JSON: {"transitSummary": "...", "suggestion": "...", "dailyThemeConnection": "...", "reflectiveQuestion": "..."}`,
  );

  return {
    vedic: { transitSummary: result.transitSummary, suggestion: result.suggestion },
    tarot: {
      card: card.name,
      orientation,
      traditionalMeaning: meaning,
      dailyThemeConnection: result.dailyThemeConnection,
      reflectiveQuestion: result.reflectiveQuestion,
    },
    disclaimer:
      "Offered as a traditional interpretive practice for reflection, not a guaranteed forecast.",
  };
}
