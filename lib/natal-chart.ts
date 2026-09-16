import type { VedicChart } from "./types";

/**
 * Fixed natal chart for the Astrology Corner section. Stored once so the
 * daily fetch never needs to ask for birth details again.
 */
export const NATAL_CHART: VedicChart = {
  ascendant: "Cancer Lagna",
  moon: "Exalted Moon in Taurus, 11th house, Rohini nakshatra",
  mars: "Yogakaraka Mars in Pisces, 9th house",
  jupiterSaturn: "Jupiter and Saturn both in Aries, 10th house",
  rahu: "Rahu in the 1st house",
  currentDasha: "Rahu Mahadasha (through April 2027), Rahu-Mars Antardasha",
};
