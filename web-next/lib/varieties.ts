/**
 * Avocado variety types
 */
export type AvocadoVariety = 'hass' | 'lamb-hass'

/**
 * Season information for each variety
 */
export interface VarietySeason {
  variety: AvocadoVariety
  seasonStart: number // Month (1-12)
  seasonEnd: number // Month (1-12)
  peakStart: number // Month (1-12)
  peakEnd: number // Month (1-12)
}

/**
 * Season definitions for Asturias
 * Hass: February - March (peak in March)
 * Lamb Hass: May - June (peak in June)
 */
export const varietySeasons: Record<AvocadoVariety, VarietySeason> = {
  'hass': {
    variety: 'hass',
    seasonStart: 2, // February
    seasonEnd: 3, // March
    peakStart: 3, // March
    peakEnd: 3, // March
  },
  'lamb-hass': {
    variety: 'lamb-hass',
    seasonStart: 5, // May
    seasonEnd: 6, // June
    peakStart: 6, // June
    peakEnd: 6, // June
  },
}

/**
 * Check if a variety is currently in season
 */
export function isVarietyInSeason(variety: AvocadoVariety): boolean {
  const now = new Date()
  const currentMonth = now.getMonth() + 1 // JavaScript months are 0-indexed
  const season = varietySeasons[variety]
  
  return currentMonth >= season.seasonStart && currentMonth <= season.seasonEnd
}

/**
 * Get the variety that is currently in season
 * Returns null if neither is in season
 */
export function getInSeasonVariety(): AvocadoVariety | null {
  if (isVarietyInSeason('hass')) return 'hass'
  if (isVarietyInSeason('lamb-hass')) return 'lamb-hass'
  return null
}

/**
 * Get the default variety (in season, or hass if neither is in season)
 */
export function getDefaultVariety(): AvocadoVariety {
  return getInSeasonVariety() || 'hass'
}

/**
 * Get season description text for a variety
 */
export function getSeasonDescription(variety: AvocadoVariety, lang: 'es' | 'en'): string {
  const season = varietySeasons[variety]
  
  if (lang === 'es') {
    const months = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return `${months[season.seasonStart]} - ${months[season.seasonEnd]}`
  } else {
    const months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return `${months[season.seasonStart]} - ${months[season.seasonEnd]}`
  }
}

