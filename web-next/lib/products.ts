export type ProductType = 'box' | 'product'
export type ProductCategory = 'avocados' | 'artisan' | 'produce' | 'honey-nuts'

export interface Product {
  id: string
  type: ProductType
  category: ProductCategory
  title: {
    es: string
    en: string
  }
  description: {
    es: string
    en: string
  }
  price: number
  currency?: string
  weight?: number // Weight in kg
  images: string[]
  icon?: string
  unit?: string
  features?: {
    es: string[]
    en: string[]
  }
  inStock?: boolean
}

export const products: Product[] = [
  // Avocado Boxes
  {
    id: 'box-3kg',
    type: 'box',
    category: 'avocados',
    title: {
      es: 'Caja Amandi 3 kg',
      en: 'Amandi 3 kg Box',
    },
    description: {
      es: 'Perfecto para parejas o uso semanal. 10–14 aguacates premium ecológicos cultivados en Asturias, sin cámaras, sin prisas. Cosechamos solo cuando el árbol decide — y te los enviamos directamente desde nuestra finca a tu cocina.',
      en: 'Perfect for couples or weekly use. 10–14 premium organic avocados grown in Asturias, no cold storage, no rush. We harvest only when the tree decides — and we send them directly from our farm to your kitchen.',
    },
    price: 18, // 3kg × 6€/kg
    currency: 'EUR',
    weight: 3, // 3 kg
    images: ['/assets/products/box3kg.png'],
    icon: '📦',
    unit: 'box',
    features: {
      es: ['10–14 aguacates', 'Envío directo', 'Ecológicos certificados'],
      en: ['10–14 avocados', 'Direct shipping', 'Certified organic']
    },
    inStock: true,
  },
  {
    id: 'box-5kg',
    type: 'box',
    category: 'avocados',
    title: {
      es: 'Caja Amandi 5 kg',
      en: 'Amandi 5 kg Box',
    },
    description: {
      es: 'Ideal para familias, foodies y meal-prep. 16–22 aguacates premium ecológicos cultivados en Asturias. Cada pieza se recolecta a mano, una a una, cuando el árbol indica que está lista.',
      en: 'Ideal for families, foodies and meal-prep. 16–22 premium organic avocados grown in Asturias. Each piece is harvested by hand, one by one, when the tree indicates it\'s ready.',
    },
    price: 30, // 5kg × 6€/kg
    currency: 'EUR',
    weight: 5, // 5 kg
    images: ['/assets/products/box5kg.png'],
    icon: '📦',
    unit: 'box',
    features: {
      es: ['16–22 aguacates', 'Envío directo', 'Ecológicos certificados'],
      en: ['16–22 avocados', 'Direct shipping', 'Certified organic']
    },
    inStock: true,
  },
  {
    id: 'subscription',
    type: 'box',
    category: 'avocados',
    title: {
      es: 'Suscripción anual',
      en: 'Yearly subscription',
    },
    description: {
      es: '2 cajas al año (Hass + Lamb Hass) con prioridad en envío y precio especial. Reservas tu caja ahora y te la enviamos en el momento exacto en el que nuestros árboles dan fruta lista para cortar.',
      en: '2 boxes per year (Hass + Lamb Hass) with priority shipping and special price. Reserve your box now and we\'ll send it to you at the exact moment when our trees produce fruit ready to cut.',
    },
    price: 43.2, // (18 + 30) × 0.9 = 43.2€ (2 boxes with 10% discount)
    currency: 'EUR',
    weight: 8, // 3kg + 5kg = 8kg total
    images: ['/assets/products/suscription.png'],
    icon: '🌱',
    unit: 'year',
    features: {
      es: ['2 cajas al año', 'Prioridad en envío', 'Precio especial'],
      en: ['2 boxes per year', 'Priority shipping', 'Special price']
    },
    inStock: false, // Hidden for now - subscription not implemented with Stripe yet
  },
  // Other Products
  {
    id: 'cutting-board',
    type: 'product',
    category: 'artisan',
    title: {
      es: 'Tabla de cortar de madera artesanal',
      en: 'Handmade wooden cutting board',
    },
    description: {
      es: 'Tabla de cortar de madera de roble asturiano, hecha a mano por artesanos locales. Perfecta para preparar tus aguacates. Cada tabla es única, con su propio grano y carácter natural. Acabado con aceite de oliva para proteger la madera.',
      en: 'Cutting board made from Asturian oak wood, handmade by local artisans. Perfect for preparing your avocados. Each board is unique, with its own grain and natural character. Finished with olive oil to protect the wood.',
    },
    price: 35,
    currency: 'EUR',
    weight: 0.8, // 800g
    images: ['/assets/products/board.png'],
    icon: '🪵',
    unit: 'unit',
    features: {
      es: ['Madera de roble asturiano', 'Hecho a mano', 'Acabado natural'],
      en: ['Asturian oak wood', 'Handmade', 'Natural finish']
    },
    inStock: true,
  },
  {
    id: 'olive-oil',
    type: 'product',
    category: 'produce',
    title: {
      es: 'Nuestro aceite de oliva',
      en: 'Our olive oil',
    },
    description: {
      es: 'Aceite de oliva virgen extra de España, prensado en frío. Ideal para acompañar tus aguacates. Este aceite conserva todo su sabor y propiedades naturales. Envase de vidrio oscuro para protegerlo de la luz.',
      en: 'Extra virgin olive oil from Spain, cold-pressed. Ideal to accompany your avocados. This oil retains all its flavor and natural properties. Dark glass container to protect it from light.',
    },
    price: 10,
    currency: 'EUR',
    weight: 0.5, // 500ml
    images: ['/assets/products/oliveoil.png'],
    icon: '🫒',
    unit: '500ml',
    features: {
      es: ['Virgen extra', 'Prensado en frío', 'Origen España'],
      en: ['Extra virgin', 'Cold-pressed', 'From Spain']
    },
    inStock: true,
  },
  {
    id: 'tote-bag',
    type: 'product',
    category: 'artisan',
    title: {
      es: 'Bolsa de tela',
      en: 'Tote bag',
    },
    description: {
      es: 'Bolsa de algodón orgánico con el logo de Amandi. Perfecta para llevar tus compras de forma sostenible. Resistente y lavable, ideal para el mercado o el día a día. Diseñada para durar y reducir el uso de plásticos.',
      en: 'Organic cotton bag with Amandi logo. Perfect for carrying your purchases sustainably. Durable and washable, ideal for the market or daily use. Designed to last and reduce plastic use.',
    },
    price: 12,
    currency: 'EUR',
    weight: 0.2, // 200g
    images: ['/assets/products/totebag.png'],
    icon: '👜',
    unit: 'unit',
    features: {
      es: ['Algodón orgánico', 'Lavable', 'Sostenible'],
      en: ['Organic cotton', 'Washable', 'Sustainable']
    },
    inStock: true,
  },
  {
    id: 'lemons',
    type: 'product',
    category: 'produce',
    title: {
      es: 'Limones',
      en: 'Lemons',
    },
    description: {
      es: 'Limones ecológicos de Asturias. Perfectos para acompañar tus aguacates y dar sabor a tus platos. Cultivados sin pesticidas, con todo su sabor natural. Ideales para zumos, postres y aderezos.',
      en: 'Organic lemons from Asturias. Perfect to accompany your avocados and flavor your dishes. Grown without pesticides, with all their natural flavor. Ideal for juices, desserts and dressings.',
    },
    price: 8,
    currency: 'EUR',
    weight: 1, // 1kg
    images: ['/assets/products/lemons.png'],
    icon: '🍋',
    unit: '1kg',
    features: {
      es: ['Ecológicos', 'Sin pesticidas', 'Sabor natural'],
      en: ['Organic', 'No pesticides', 'Natural flavor']
    },
    inStock: true,
  },
  {
    id: 'verdina',
    type: 'product',
    category: 'produce',
    title: {
      es: 'Verdina asturiana',
      en: 'Asturian verdina',
    },
    description: {
      es: 'Alubia verdina asturiana, una legumbre única de nuestra región. Tradicional y deliciosa. Cultivada en Asturias con métodos tradicionales, esta alubia es un ingrediente esencial de la cocina asturiana. Perfecta para guisos y potajes.',
      en: 'Asturian verdina bean, a unique legume from our region. Traditional and delicious. Grown in Asturias with traditional methods, this bean is an essential ingredient of Asturian cuisine. Perfect for stews and potages.',
    },
    price: 15,
    currency: 'EUR',
    weight: 0.65, // 650g
    images: ['/assets/products/verdinas.png'],
    icon: '🫘',
    unit: '650g',
    features: {
      es: ['Tradicional asturiana', 'Cultivo local', 'Alta calidad'],
      en: ['Traditional Asturian', 'Local cultivation', 'High quality']
    },
    inStock: true,
  },
  {
    id: 'honey',
    type: 'product',
    category: 'honey-nuts',
    title: {
      es: 'Miel',
      en: 'Honey',
    },
    description: {
      es: 'Miel cruda de Asturias, recolectada de nuestras colmenas. Natural y pura, sin procesar ni filtrar. Esta miel conserva todas sus propiedades naturales, enzimas y sabores únicos de las flores asturianas.',
      en: 'Raw honey from Asturias, harvested from our hives. Natural and pure, unprocessed and unfiltered. This honey retains all its natural properties, enzymes and unique flavors from Asturian flowers.',
    },
    price: 10,
    currency: 'EUR',
    weight: 0.5, // 500g
    images: ['/assets/products/honey.png'],
    icon: '🍯',
    unit: '500g',
    features: {
      es: ['Miel cruda', 'Sin procesar', '100% natural'],
      en: ['Raw honey', 'Unprocessed', '100% natural']
    },
    inStock: true,
  },
  {
    id: 'hazelnuts',
    type: 'product',
    category: 'honey-nuts',
    title: {
      es: 'Avellanas',
      en: 'Hazelnuts',
    },
    description: {
      es: 'Avellanas asturianas, tostadas y listas para disfrutar. Un aperitivo perfecto y saludable. Cultivadas en Asturias, estas avellanas tienen un sabor intenso y una textura crujiente. Perfectas para comer solas o añadir a tus recetas.',
      en: 'Asturian hazelnuts, roasted and ready to enjoy. A perfect and healthy snack. Grown in Asturias, these hazelnuts have an intense flavor and crunchy texture. Perfect to eat alone or add to your recipes.',
    },
    price: 12,
    currency: 'EUR',
    weight: 1, // 1kg
    images: ['/assets/products/hazelnuts.png'],
    icon: '🌰',
    unit: '1kg',
    features: {
      es: ['Tostadas', 'Origen Asturias', 'Alta calidad'],
      en: ['Roasted', 'From Asturias', 'High quality']
    },
    inStock: true,
  },
]

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id)
}

export const getProductsByType = (type: ProductType): Product[] => {
  return products.filter(p => p.type === type && (p.inStock !== false))
}

export const getProductsByCategory = (category: ProductCategory): Product[] => {
  return products.filter(p => p.category === category && (p.inStock !== false))
}

export const getRelatedProducts = (productId: string, limit: number = 4): Product[] => {
  const product = getProductById(productId)
  if (!product) return []
  
  // If viewing a box, recommend complementary products (honey, olive oil, etc.)
  if (product.type === 'box') {
    const complementaryProductIds = ['honey', 'olive-oil', 'cutting-board', 'hazelnuts']
    const complementaryProducts = complementaryProductIds
      .map(id => getProductById(id))
      .filter((p): p is Product => p !== undefined && p.inStock !== false)
    
    // Also include other boxes (excluding current one and hidden products)
    const otherBoxes = products
      .filter(p => p.type === 'box' && p.id !== productId && p.inStock !== false)
      .slice(0, 2)
    
    // Mix: 2 complementary products + 2 other boxes
    return [...complementaryProducts.slice(0, 2), ...otherBoxes].slice(0, limit)
  }
  
  // For other products, show products from same category or type (excluding hidden products)
  return products
    .filter(p => p.id !== productId && (p.category === product.category || p.type === product.type) && p.inStock !== false)
    .slice(0, limit)
}
