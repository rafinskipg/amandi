// Knowledge base for the chatbot
import { products } from './products'
import { shippingCosts, calculateShippingCost } from './shipping'
import type { CountryCode } from './countries'
import { isVarietyInSeason, getSeasonDescription, varietySeasons, type AvocadoVariety } from './varieties'

export interface ChatbotContext {
  farmInfo: {
    name: string
    location: string
    philosophy: string
    practices: string[]
    history: string
  }
  products: Array<{
    id: string
    name: string
    description: string
    price: number
    currency: string
    weight?: number
    unit?: string
    inStock: boolean
  }>
  shipping: {
    countries: Array<{
      code: string
      name: string
      baseCost: number
      costPerKg: number
      maxCost: number
      estimatedDays: string
      freeShippingThreshold?: number
    }>
    calculation: string
  }
}

export function getChatbotContext(lang: 'es' | 'en' = 'en'): string {
  const isSpanish = lang === 'es'

  // Check current season status
  const hassInSeason = isVarietyInSeason('hass')
  const lambHassInSeason = isVarietyInSeason('lamb-hass')
  const hassSeason = getSeasonDescription('hass', lang)
  const lambHassSeason = getSeasonDescription('lamb-hass', lang)

  // Farm information
  const farmInfo = isSpanish
    ? `Información sobre la finca Amandi:
- Ubicación: Amandi, Asturias, España
- Filosofía: Cultivamos aguacates como antes se cultivaban las cosas: sin cámaras frigoríficas, sin acelerar procesos, y sin cortar la fruta verde. Queremos evitar los aguacates que vienen del otro lado del mundo.
- Prácticas: Cada pieza se recolecta a mano, una a una, cuando el árbol indica que está lista. Sin pesticidas, con agricultura regenerativa que cuida el suelo y los polinizadores. Riego natural con lluvia atlántica. Cero herbicidas. Suelo vivo con cobertura vegetal permanente.
- Historia: En Amandi, Asturias, cultivamos aguacates premium ecológicos. Nuestros árboles crecen rodeados de prados verdes, manzanos, lluvia atlántica y aire cántabro. Sin monocultivo extremo y con prácticas de agricultura regenerativa.
- Variedades: Cultivamos Hass y Lamb Hass, dos variedades premium adaptadas al clima atlántico. Solo cortamos cuando la fruta alcanza el porcentaje mínimo de materia seca, garantía de sabor y textura premium.
- Temporadas:
  * Hass: ${hassSeason} ${hassInSeason ? '(ACTUALMENTE EN TEMPORADA)' : '(FUERA DE TEMPORADA - Disponible para preorden)'}
  * Lamb Hass: ${lambHassSeason} ${lambHassInSeason ? '(ACTUALMENTE EN TEMPORADA)' : '(FUERA DE TEMPORADA - Disponible para preorden)'}
- IMPORTANTE: Si un cliente pregunta sobre una variedad que NO está en temporada, informa que pueden hacer una PREORDEN y les enviaremos la caja cuando llegue el momento de la temporada. Si alguien ordena ambas variedades (Hass y Lamb Hass), necesitarán 2 envíos separados porque tienen temporadas diferentes.`
    : `Farm Information about Amandi:
- Location: Amandi, Asturias, Spain
- Philosophy: We grow avocados the way things used to be grown: without cold storage, without accelerating processes, and without cutting green fruit. We want to avoid avocados shipped from the other side of the world.
- Practices: Each piece is harvested by hand, one by one, when the tree indicates it's ready. No pesticides, with regenerative agriculture that cares for the soil and pollinators. Natural irrigation with Atlantic rain. Zero herbicides. Living soil with permanent vegetative cover.
- History: At Amandi, Asturias, we grow premium organic avocados. Our trees grow surrounded by green meadows, apple trees, Atlantic rain and Cantabrian air. Without extreme monoculture and with regenerative agriculture practices.
- Varieties: We grow Hass and Lamb Hass, two premium varieties adapted to the Atlantic climate. We only cut when the fruit reaches the minimum percentage of dry matter, guarantee of premium flavor and texture.
- Seasons:
  * Hass: ${hassSeason} ${hassInSeason ? '(CURRENTLY IN SEASON)' : '(OUT OF SEASON - Available for preorder)'}
  * Lamb Hass: ${lambHassSeason} ${lambHassInSeason ? '(CURRENTLY IN SEASON)' : '(OUT OF SEASON - Available for preorder)'}
- IMPORTANT: If a customer asks about a variety that is NOT in season, inform them they can PREORDER and we will ship the box when the season arrives. If someone orders both varieties (Hass and Lamb Hass), they will need 2 separate shipments because they have different seasons.`

  // Products information
  const productsList = products.map(p => {
    const name = p.title[lang] || p.title.en
    const description = p.description[lang] || p.description.en
    return {
      id: p.id,
      name,
      description,
      price: p.price,
      currency: p.currency || 'EUR',
      weight: p.weight,
      unit: p.unit,
      inStock: p.inStock ?? true,
    }
  })

  const productsInfo = isSpanish
    ? `Productos disponibles:\n${productsList.map(p =>
      `- ${p.name} (ID: ${p.id}): ${p.description}. Precio: ${p.price}${p.currency}${p.weight ? `, Peso: ${p.weight}kg` : ''}${p.unit ? `, Unidad: ${p.unit}` : ''}. ${p.inStock ? 'En stock' : 'Agotado'}`
    ).join('\n')}`
    : `Available products:\n${productsList.map(p =>
      `- ${p.name} (ID: ${p.id}): ${p.description}. Price: ${p.price}${p.currency}${p.weight ? `, Weight: ${p.weight}kg` : ''}${p.unit ? `, Unit: ${p.unit}` : ''}. ${p.inStock ? 'In stock' : 'Out of stock'}`
    ).join('\n')}`

  // Shipping information
  const shippingInfo = isSpanish
    ? `Información de envío:
Países disponibles: ${Object.values(shippingCosts).map(s => s.country.toUpperCase()).join(', ')}
Cálculo de envío: Coste base + (peso en kg × coste por kg), con un máximo establecido por país.
Envío gratis en España para pedidos superiores a 30€.
${Object.values(shippingCosts).map(s =>
      `- ${s.country.toUpperCase()}: Coste base ${s.baseCost}€, ${s.costPerKg}€/kg, máximo ${s.maxCost}€, entrega estimada ${s.estimatedDays}${s.freeShippingThreshold ? `, envío gratis >${s.freeShippingThreshold}€` : ''}`
    ).join('\n')}`
    : `Shipping information:
Available countries: ${Object.values(shippingCosts).map(s => s.country.toUpperCase()).join(', ')}
Shipping calculation: Base cost + (weight in kg × cost per kg), with a maximum ceiling per country.
Free shipping in Spain for orders over 30€.
${Object.values(shippingCosts).map(s =>
      `- ${s.country.toUpperCase()}: Base cost ${s.baseCost}€, ${s.costPerKg}€/kg, maximum ${s.maxCost}€, estimated delivery ${s.estimatedDays}${s.freeShippingThreshold ? `, free shipping >${s.freeShippingThreshold}€` : ''}`
    ).join('\n')}`

  return `${farmInfo}\n\n${productsInfo}\n\n${shippingInfo}`
}

export function calculateShippingForChatbot(
  country: string,
  weight: number,
  subtotal: number = 0
): { cost: number; info: string } {
  try {
    const countryCode = country.toLowerCase() as CountryCode
    const cost = calculateShippingCost(countryCode, weight, subtotal)
    const shippingInfo = shippingCosts[countryCode]

    if (!shippingInfo) {
      return {
        cost: 0,
        info: `Country ${country} not found. Available countries: ${Object.keys(shippingCosts).join(', ')}`
      }
    }

    const info = cost === 0 && shippingInfo.freeShippingThreshold
      ? `Free shipping (order over ${shippingInfo.freeShippingThreshold}€)`
      : `Shipping cost: ${cost}€ (base: ${shippingInfo.baseCost}€ + ${weight}kg × ${shippingInfo.costPerKg}€/kg, max: ${shippingInfo.maxCost}€). Estimated delivery: ${shippingInfo.estimatedDays}`

    return { cost, info }
  } catch (error) {
    return {
      cost: 0,
      info: `Error calculating shipping: ${error}`
    }
  }
}

