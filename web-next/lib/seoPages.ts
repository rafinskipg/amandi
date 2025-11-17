/**
 * Special SEO pages that are not country-specific
 */

export type SpecialSeoPageType = 'maternity'

export interface SpecialSeoPage {
  type: SpecialSeoPageType
  paths: {
    es: string
    en: string
  }
}

export const specialSeoPages: Record<SpecialSeoPageType, SpecialSeoPage> = {
  'maternity': {
    type: 'maternity',
    paths: {
      es: '/es/aguacates-embarazadas-bebes',
      en: '/en/avocados-pregnant-babies'
    }
  }
}

export function getSpecialSeoPageByPath(path: string): SpecialSeoPage | null {
  for (const page of Object.values(specialSeoPages)) {
    if (page.paths.es === path || page.paths.en === path) {
      return page
    }
  }
  return null
}

export function getAllSpecialSeoPaths(): Array<{ path: string; page: SpecialSeoPage }> {
  const paths: Array<{ path: string; page: SpecialSeoPage }> = []
  Object.values(specialSeoPages).forEach(page => {
    paths.push({ path: page.paths.es, page })
    paths.push({ path: page.paths.en, page })
  })
  return paths
}

