export type CountryCode = 'es' | 'pt' | 'fr' | 'de' | 'be' | 'dk' | 'nl' | 'se' | 'fi' | 'no' | 'gb'

export interface CountryConfig {
  code: CountryCode
  name: string
  language: 'es' | 'en'
  seoPaths: {
    order: string
    ecological: string
    [key: string]: string
  }
  images?: {
    hero?: string
    testimonial?: string
    farm?: string
  }
  customContent?: {
    heroSubtext?: string
    testimonial?: {
      name: string
      text: string
      image?: string
    }
  }
}

export const countries: Record<CountryCode, CountryConfig> = {
  es: {
    code: 'es',
    name: 'España',
    language: 'es',
    seoPaths: {
      order: '/es/comprar-aguacates-online-espana',
      ecological: '/es/aguacates-ecologicos-espana'
    }
  },
  pt: {
    code: 'pt',
    name: 'Portugal',
    language: 'es',
    seoPaths: {
      order: '/pt/comprar-abacates-online-portugal',
      ecological: '/pt/abacates-ecologicos-portugal'
    }
  },
  fr: {
    code: 'fr',
    name: 'France',
    language: 'en',
    seoPaths: {
      order: '/en/order-avocados-online-france',
      ecological: '/en/ecological-avocados-france'
    }
  },
  de: {
    code: 'de',
    name: 'Germany',
    language: 'en',
    seoPaths: {
      order: '/en/order-avocados-online-germany',
      ecological: '/en/ecological-avocados-germany'
    }
  },
  be: {
    code: 'be',
    name: 'Belgium',
    language: 'en',
    seoPaths: {
      order: '/en/order-avocados-online-belgium',
      ecological: '/en/ecological-avocados-belgium'
    }
  },
  dk: {
    code: 'dk',
    name: 'Denmark',
    language: 'en',
    seoPaths: {
      order: '/en/order-avocados-online-denmark',
      ecological: '/en/ecological-avocados-denmark'
    }
  },
  nl: {
    code: 'nl',
    name: 'Netherlands',
    language: 'en',
    seoPaths: {
      order: '/en/order-avocados-online-netherlands',
      ecological: '/en/ecological-avocados-netherlands'
    }
  },
  se: {
    code: 'se',
    name: 'Sweden',
    language: 'en',
    seoPaths: {
      order: '/en/order-avocados-online-sweden',
      ecological: '/en/ecological-avocados-sweden'
    }
  },
  fi: {
    code: 'fi',
    name: 'Finland',
    language: 'en',
    seoPaths: {
      order: '/en/order-avocados-online-finland',
      ecological: '/en/ecological-avocados-finland'
    },
    customContent: {
      testimonial: {
        name: 'Marja',
        text: 'Amazing avocados from Asturias! Perfect for our Finnish kitchen.',
        image: '/assets/testimonials/finland.jpg'
      }
    }
  },
  no: {
    code: 'no',
    name: 'Norway',
    language: 'en',
    seoPaths: {
      order: '/en/order-avocados-online-norway',
      ecological: '/en/ecological-avocados-norway'
    }
  },
  gb: {
    code: 'gb',
    name: 'United Kingdom',
    language: 'en',
    seoPaths: {
      order: '/en/order-avocados-online-uk',
      ecological: '/en/ecological-avocados-uk'
    }
  }
}

export const getCountryByPath = (path: string): CountryConfig | null => {
  for (const country of Object.values(countries)) {
    if (Object.values(country.seoPaths).some(seoPath => path.includes(seoPath))) {
      return country
    }
  }
  return null
}

export const getAllSeoPaths = (): Array<{ path: string; country: CountryConfig; type: string }> => {
  const paths: Array<{ path: string; country: CountryConfig; type: string }> = []
  Object.values(countries).forEach(country => {
    Object.entries(country.seoPaths).forEach(([type, path]) => {
      paths.push({ path, country, type })
    })
  })
  return paths
}

export const getCountryImage = (countryCode: CountryCode): string => {
  // Try country-specific image, fallback to demo.png
  return `/assets/countries/${countryCode}.png`
}

export const getCountryImageOrDemo = (countryCode: CountryCode): string => {
  // This will be handled client-side to check if image exists
  // For now, return the country-specific path
  return `/assets/countries/${countryCode}.png`
}
