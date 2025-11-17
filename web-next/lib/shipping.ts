import type { CountryCode } from './countries'

export interface ShippingCost {
  country: CountryCode
  baseCost: number // Base shipping cost in EUR
  costPerKg: number // Additional cost per kg in EUR
  maxCost: number // Maximum shipping cost ceiling in EUR
  currency: string
  estimatedDays: string // e.g., "2-3 days"
  freeShippingThreshold?: number // Free shipping for orders above this amount (EUR)
}

// Shipping costs based on GLS pricing structure for Europe
// Base cost + per kg pricing with maximum ceiling
export const shippingCosts: Record<CountryCode, ShippingCost> = {
  es: {
    country: 'es',
    baseCost: 5.00, // Base cost for small packages
    costPerKg: 1.50, // Additional cost per kg
    maxCost: 15.00, // Maximum shipping cost ceiling
    currency: 'EUR',
    estimatedDays: '2-3 días',
    freeShippingThreshold: 30, // Free shipping for orders >30€
  },
  pt: {
    country: 'pt',
    baseCost: 6.00, // Base cost (Zone Euro II)
    costPerKg: 2.00,
    maxCost: 25.00, // Ceiling based on GLS Zone Euro II pricing
    currency: 'EUR',
    estimatedDays: '2-4 días',
  },
  fr: {
    country: 'fr',
    baseCost: 7.00, // Zone Euro I
    costPerKg: 2.50,
    maxCost: 30.00, // Based on GLS Zone Euro I (M-L size)
    currency: 'EUR',
    estimatedDays: '2-4 jours',
  },
  de: {
    country: 'de',
    baseCost: 7.00, // Zone Euro I
    costPerKg: 2.50,
    maxCost: 30.00, // Based on GLS Zone Euro I
    currency: 'EUR',
    estimatedDays: '3-5 Tage',
  },
  be: {
    country: 'be',
    baseCost: 8.00, // Zone Euro II
    costPerKg: 2.50,
    maxCost: 35.00, // Based on GLS Zone Euro II
    currency: 'EUR',
    estimatedDays: '3-5 jours',
  },
  dk: {
    country: 'dk',
    baseCost: 10.00, // Zone Euro II
    costPerKg: 3.00,
    maxCost: 40.00, // Based on GLS Zone Euro II (L-XL size)
    currency: 'EUR',
    estimatedDays: '4-6 dage',
  },
  nl: {
    country: 'nl',
    baseCost: 8.00, // Zone Euro II
    costPerKg: 2.50,
    maxCost: 35.00, // Based on GLS Zone Euro II
    currency: 'EUR',
    estimatedDays: '3-5 dagen',
  },
  se: {
    country: 'se',
    baseCost: 12.00, // Zone Euro III
    costPerKg: 4.00,
    maxCost: 65.00, // Based on GLS Zone Euro III (M-L size)
    currency: 'EUR',
    estimatedDays: '5-7 dagar',
  },
  fi: {
    country: 'fi',
    baseCost: 12.00, // Zone Euro III
    costPerKg: 4.00,
    maxCost: 65.00, // Based on GLS Zone Euro III
    currency: 'EUR',
    estimatedDays: '5-7 päivää',
  },
  no: {
    country: 'no',
    baseCost: 15.00, // Zone Euro III
    costPerKg: 4.50,
    maxCost: 75.00, // Based on GLS Zone Euro III (L-XL size)
    currency: 'EUR',
    estimatedDays: '5-7 dager',
  },
  gb: {
    country: 'gb',
    baseCost: 10.00, // Zone Euro II
    costPerKg: 3.00,
    maxCost: 40.00, // Based on GLS Zone Euro II
    currency: 'EUR',
    estimatedDays: '3-5 days',
  },
}

export function getShippingCost(countryCode: CountryCode): ShippingCost {
  return shippingCosts[countryCode] || shippingCosts.es // Default to Spain
}

export function calculateShippingCost(
  countryCode: CountryCode, 
  totalWeight: number, 
  subtotal: number = 0
): number {
  const shippingInfo = getShippingCost(countryCode)
  
  // Check if free shipping applies (e.g., Spain >30€)
  if (shippingInfo.freeShippingThreshold && subtotal >= shippingInfo.freeShippingThreshold) {
    return 0
  }
  
  // Calculate shipping: base cost + (weight * cost per kg)
  // Ensure minimum weight of 0.5kg for calculation
  const effectiveWeight = Math.max(totalWeight, 0.5)
  const calculatedCost = shippingInfo.baseCost + (effectiveWeight * shippingInfo.costPerKg)
  
  // Apply maximum ceiling
  return Math.min(Math.ceil(calculatedCost), shippingInfo.maxCost)
}

