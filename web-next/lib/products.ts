export type ProductType = 'box' | 'product'
export type ProductCategory = 'avocados' | 'artisan' | 'produce' | 'honey-nuts'
export type SupportedLanguage = 'es' | 'en' | 'pt' | 'fr' | 'de' | 'nl' | 'da' | 'sv' | 'fi' | 'no'

export interface Product {
  id: string
  type: ProductType
  category: ProductCategory
  title: Record<SupportedLanguage, string>
  description: Record<SupportedLanguage, string>
  price: number
  currency?: string
  weight?: number // Weight in kg
  images: string[]
  icon?: string
  unit?: string
  features?: Record<SupportedLanguage, string[]>
  inStock?: boolean
}

// Helper function to get product text in the correct language
export function getProductText(product: Product, lang: SupportedLanguage, field: 'title' | 'description'): string {
  return product[field][lang] || product[field].en || product[field].es || ''
}

// Helper function to get product features in the correct language
export function getProductFeatures(product: Product, lang: SupportedLanguage): string[] {
  if (!product.features) return []
  return product.features[lang] || product.features.en || product.features.es || []
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
      pt: 'Caixa Amandi 3 kg',
      fr: 'Caisse Amandi 3 kg',
      de: 'Amandi 3 kg Box',
      nl: 'Amandi 3 kg Doos',
      da: 'Amandi 3 kg Kasse',
      sv: 'Amandi 3 kg Låda',
      fi: 'Amandi 3 kg Laatikko',
      no: 'Amandi 3 kg Boks',
    },
    description: {
      es: 'Perfecto para parejas o uso semanal. 10–14 aguacates premium ecológicos cultivados en Asturias, sin cámaras, sin prisas. Cosechamos solo cuando el árbol decide — y te los enviamos directamente desde nuestra finca a tu cocina.',
      en: 'Perfect for couples or weekly use. 10–14 premium organic avocados grown in Asturias, no cold storage, no rush. We harvest only when the tree decides — and we send them directly from our farm to your kitchen.',
      pt: 'Perfeito para casais ou uso semanal. 10–14 abacates premium orgânicos cultivados nas Astúrias, sem câmaras frigoríficas, sem pressa. Colhemos apenas quando a árvore decide — e enviamos diretamente da nossa quinta para a sua cozinha.',
      fr: 'Parfait pour les couples ou usage hebdomadaire. 10–14 avocats bio premium cultivés dans les Asturies, sans chambre froide, sans précipitation. Nous récoltons uniquement quand l\'arbre décide — et nous les envoyons directement de notre ferme à votre cuisine.',
      de: 'Perfekt für Paare oder wöchentlichen Gebrauch. 10–14 Premium-Bio-Avocados aus Asturien, ohne Kühlräume, ohne Eile. Wir ernten nur, wenn der Baum es entscheidet — und wir senden sie direkt von unserem Hof zu Ihrer Küche.',
      nl: 'Perfect voor koppels of wekelijks gebruik. 10–14 premium biologische avocado\'s gekweekt in Asturië, zonder koelcellen, zonder haast. We oogsten alleen wanneer de boom beslist — en we sturen ze direct van onze boerderij naar uw keuken.',
      da: 'Perfekt til par eller ugentlig brug. 10–14 premium økologiske avokadoer dyrket i Asturien, uden kølerum, uden hast. Vi høster kun, når træet beslutter — og vi sender dem direkte fra vores gård til dit køkken.',
      sv: 'Perfekt för par eller veckovis användning. 10–14 premium ekologiska avokador odlade i Asturien, utan kylrum, utan brådska. Vi skördar bara när trädet bestämmer — och vi skickar dem direkt från vår gård till ditt kök.',
      fi: 'Täydellinen pareille tai viikoittaiseen käyttöön. 10–14 premium-luomu avokadoja, jotka kasvatetaan Asturiassa, ilman kylmävarastoja, ilman kiirettä. Korjaamme vain kun puu päättää — ja lähetämme ne suoraan tilaltamme keittiöösi.',
      no: 'Perfekt for par eller ukentlig bruk. 10–14 premium økologiske avokadoer dyrket i Asturias, uten kjølerom, uten hastverk. Vi høster bare når treet bestemmer — og vi sender dem direkte fra gården vår til kjøkkenet ditt.',
    },
    price: 18, // 3kg × 6€/kg
    currency: 'EUR',
    weight: 3, // 3 kg
    images: ['/assets/products/box3kg.png'],
    icon: '📦',
    unit: 'box',
    features: {
      es: ['10–14 aguacates', 'Envío directo', 'Ecológicos certificados'],
      en: ['10–14 avocados', 'Direct shipping', 'Certified organic'],
      pt: ['10–14 abacates', 'Envio direto', 'Orgânicos certificados'],
      fr: ['10–14 avocats', 'Expédition directe', 'Bio certifié'],
      de: ['10–14 Avocados', 'Direktversand', 'Zertifiziert bio'],
      nl: ['10–14 avocado\'s', 'Directe verzending', 'Gecertificeerd biologisch'],
      da: ['10–14 avokadoer', 'Direkte forsendelse', 'Certificeret økologisk'],
      sv: ['10–14 avokador', 'Direktleverans', 'Certifierad ekologisk'],
      fi: ['10–14 avokadoa', 'Suora toimitus', 'Sertifioitu luomu'],
      no: ['10–14 avokadoer', 'Direkte frakt', 'Sertifisert økologisk'],
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
      pt: 'Caixa Amandi 5 kg',
      fr: 'Caisse Amandi 5 kg',
      de: 'Amandi 5 kg Box',
      nl: 'Amandi 5 kg Doos',
      da: 'Amandi 5 kg Kasse',
      sv: 'Amandi 5 kg Låda',
      fi: 'Amandi 5 kg Laatikko',
      no: 'Amandi 5 kg Boks',
    },
    description: {
      es: 'Ideal para familias, foodies y meal-prep. 16–22 aguacates premium ecológicos cultivados en Asturias. Cada pieza se recolecta a mano, una a una, cuando el árbol indica que está lista.',
      en: 'Ideal for families, foodies and meal-prep. 16–22 premium organic avocados grown in Asturias. Each piece is harvested by hand, one by one, when the tree indicates it\'s ready.',
      pt: 'Ideal para famílias, foodies e meal-prep. 16–22 abacates premium orgânicos cultivados nas Astúrias. Cada peça é colhida à mão, uma a uma, quando a árvore indica que está pronta.',
      fr: 'Idéal pour les familles, foodies et meal-prep. 16–22 avocats bio premium cultivés dans les Asturies. Chaque pièce est récoltée à la main, une par une, quand l\'arbre indique qu\'elle est prête.',
      de: 'Ideal für Familien, Foodies und Meal-Prep. 16–22 Premium-Bio-Avocados aus Asturien. Jedes Stück wird von Hand geerntet, eines nach dem anderen, wenn der Baum anzeigt, dass es bereit ist.',
      nl: 'Ideaal voor gezinnen, foodies en meal-prep. 16–22 premium biologische avocado\'s gekweekt in Asturië. Elk stuk wordt met de hand geoogst, een voor een, wanneer de boom aangeeft dat het klaar is.',
      da: 'Ideel til familier, foodies og meal-prep. 16–22 premium økologiske avokadoer dyrket i Asturien. Hver stykke høstes i hånden, en efter en, når træet indikerer, at det er klar.',
      sv: 'Ideal för familjer, foodies och meal-prep. 16–22 premium ekologiska avokador odlade i Asturien. Varje stycke skördas för hand, ett efter ett, när trädet indikerar att det är redo.',
      fi: 'Ihanteellinen perheille, foodiesille ja meal-prepille. 16–22 premium-luomu avokadoa, jotka kasvatetaan Asturiassa. Jokainen kappale korjataan käsin, yksi kerrallaan, kun puu osoittaa, että se on valmis.',
      no: 'Ideelt for familier, foodies og meal-prep. 16–22 premium økologiske avokadoer dyrket i Asturias. Hver stykke høstes for hånd, en etter en, når treet indikerer at det er klart.',
    },
    price: 30, // 5kg × 6€/kg
    currency: 'EUR',
    weight: 5, // 5 kg
    images: ['/assets/products/box5kg.png'],
    icon: '📦',
    unit: 'box',
    features: {
      es: ['16–22 aguacates', 'Envío directo', 'Ecológicos certificados'],
      en: ['16–22 avocados', 'Direct shipping', 'Certified organic'],
      pt: ['16–22 abacates', 'Envio direto', 'Orgânicos certificados'],
      fr: ['16–22 avocats', 'Expédition directe', 'Bio certifié'],
      de: ['16–22 Avocados', 'Direktversand', 'Zertifiziert bio'],
      nl: ['16–22 avocado\'s', 'Directe verzending', 'Gecertificeerd biologisch'],
      da: ['16–22 avokadoer', 'Direkte forsendelse', 'Certificeret økologisk'],
      sv: ['16–22 avokador', 'Direktleverans', 'Certifierad ekologisk'],
      fi: ['16–22 avokadoa', 'Suora toimitus', 'Sertifioitu luomu'],
      no: ['16–22 avokadoer', 'Direkte frakt', 'Sertifisert økologisk'],
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
      pt: 'Subscrição anual',
      fr: 'Abonnement annuel',
      de: 'Jahresabonnement',
      nl: 'Jaarabonnement',
      da: 'Årligt abonnement',
      sv: 'Årsprenumeration',
      fi: 'Vuosittainen tilaus',
      no: 'Årlig abonnement',
    },
    description: {
      es: '2 cajas al año (Hass + Lamb Hass) con prioridad en envío y precio especial. Reservas tu caja ahora y te la enviamos en el momento exacto en el que nuestros árboles dan fruta lista para cortar.',
      en: '2 boxes per year (Hass + Lamb Hass) with priority shipping and special price. Reserve your box now and we\'ll send it to you at the exact moment when our trees produce fruit ready to cut.',
      pt: '2 caixas por ano (Hass + Lamb Hass) com prioridade no envio e preço especial. Reserve a sua caixa agora e enviámo-la no momento exato em que as nossas árvores dão fruta pronta para cortar.',
      fr: '2 caisses par an (Hass + Lamb Hass) avec expédition prioritaire et prix spécial. Réservez votre caisse maintenant et nous vous l\'enverrons au moment exact où nos arbres produisent des fruits prêts à être coupés.',
      de: '2 Boxen pro Jahr (Hass + Lamb Hass) mit Prioritätsversand und Sonderpreis. Reservieren Sie jetzt Ihre Box und wir senden sie Ihnen genau zu dem Zeitpunkt, wenn unsere Bäume fruchtbereite Früchte produzieren.',
      nl: '2 dozen per jaar (Hass + Lamb Hass) met prioriteitsverzending en speciale prijs. Reserveer nu uw doos en we sturen deze naar u op het exacte moment dat onze bomen fruit klaar om te snijden produceren.',
      da: '2 kasser om året (Hass + Lamb Hass) med prioritetsforsendelse og særlig pris. Reserver din kasse nu, og vi sender den til dig på det nøjagtige tidspunkt, når vores træer producerer frugt klar til at skære.',
      sv: '2 lådor per år (Hass + Lamb Hass) med prioritetsleverans och specialpris. Reservera din låda nu så skickar vi den till dig vid det exakta tillfället när våra träd producerar frukt redo att skära.',
      fi: '2 laatikkoa vuodessa (Hass + Lamb Hass) prioriteettitoimituksella ja erikoisella hinnalla. Varaa laatikko nyt ja lähetämme sen sinulle tarkalleen silloin, kun puumme tuottavat leikattavaksi valmiita hedelmiä.',
      no: '2 bokser per år (Hass + Lamb Hass) med prioritetsfrakt og spesiell pris. Reserver boksen din nå, så sender vi den til deg på det nøyaktige tidspunktet når trærne våre produserer frukt klar til å kutte.',
    },
    price: 43.2, // (18 + 30) × 0.9 = 43.2€ (2 boxes with 10% discount)
    currency: 'EUR',
    weight: 8, // 3kg + 5kg = 8kg total
    images: ['/assets/products/suscription.png'],
    icon: '🌱',
    unit: 'year',
    features: {
      es: ['2 cajas al año', 'Prioridad en envío', 'Precio especial'],
      en: ['2 boxes per year', 'Priority shipping', 'Special price'],
      pt: ['2 caixas por ano', 'Prioridade no envio', 'Preço especial'],
      fr: ['2 caisses par an', 'Expédition prioritaire', 'Prix spécial'],
      de: ['2 Boxen pro Jahr', 'Prioritätsversand', 'Sonderpreis'],
      nl: ['2 dozen per jaar', 'Prioriteitsverzending', 'Speciale prijs'],
      da: ['2 kasser om året', 'Prioritetsforsendelse', 'Særlig pris'],
      sv: ['2 lådor per år', 'Prioritetsleverans', 'Specialpris'],
      fi: ['2 laatikkoa vuodessa', 'Prioriteettitoimitus', 'Erikoishinta'],
      no: ['2 bokser per år', 'Prioritetsfrakt', 'Spesiell pris'],
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
      pt: 'Tábua de cortar de madeira artesanal',
      fr: 'Planche à découper en bois artisanale',
      de: 'Handgefertigtes Holzschneidebrett',
      nl: 'Handgemaakt houten snijplank',
      da: 'Håndlavet træskærebræt',
      sv: 'Handgjord träskärbräda',
      fi: 'Käsityönä tehty puinen leikkuulauta',
      no: 'Håndlaget treskjærebrett',
    },
    description: {
      es: 'Tabla de cortar de madera de roble asturiano, hecha a mano por artesanos locales. Perfecta para preparar tus aguacates. Cada tabla es única, con su propio grano y carácter natural. Acabado con aceite de oliva para proteger la madera.',
      en: 'Cutting board made from Asturian oak wood, handmade by local artisans. Perfect for preparing your avocados. Each board is unique, with its own grain and natural character. Finished with olive oil to protect the wood.',
      pt: 'Tábua de cortar de madeira de carvalho asturiano, feita à mão por artesãos locais. Perfeita para preparar os seus abacates. Cada tábua é única, com o seu próprio grão e carácter natural. Acabada com azeite de oliva para proteger a madeira.',
      fr: 'Planche à découper en bois de chêne asturien, faite à la main par des artisans locaux. Parfaite pour préparer vos avocats. Chaque planche est unique, avec son propre grain et caractère naturel. Finie à l\'huile d\'olive pour protéger le bois.',
      de: 'Schneidebrett aus asturischem Eichenholz, handgefertigt von lokalen Handwerkern. Perfekt zum Zubereiten Ihrer Avocados. Jedes Brett ist einzigartig, mit seiner eigenen Maserung und natürlichem Charakter. Mit Olivenöl behandelt, um das Holz zu schützen.',
      nl: 'Snijplank gemaakt van Asturisch eikenhout, handgemaakt door lokale ambachtslieden. Perfect voor het bereiden van uw avocado\'s. Elk bord is uniek, met zijn eigen nerf en natuurlijk karakter. Afgewerkt met olijfolie om het hout te beschermen.',
      da: 'Skærebræt lavet af asturisk egetræ, håndlavet af lokale håndværkere. Perfekt til at tilberede dine avokadoer. Hvert bræt er unikt, med sin egen korn og naturlige karakter. Afsluttet med olivenolie for at beskytte træet.',
      sv: 'Skärbräda gjord av asturisk ek, handgjord av lokala hantverkare. Perfekt för att förbereda dina avokador. Varje bräda är unik, med sin egen korn och naturliga karaktär. Avslutad med olivolja för att skydda träet.',
      fi: 'Leikkuulauta asturialaisesta tammesta, käsityönä tehty paikallisilta käsityöläisiltä. Täydellinen avokadojesi valmisteluun. Jokainen lauta on ainutlaatuinen, omalla kuviollaan ja luonnollisella luonteellaan. Viimeistelty oliiviöljyllä puun suojaamiseksi.',
      no: 'Skjærebrett laget av asturisk eik, håndlaget av lokale håndverkere. Perfekt for å tilberede avokadoene dine. Hvert brett er unikt, med sin egen korn og naturlige karakter. Avsluttet med olivenolje for å beskytte treet.',
    },
    price: 35,
    currency: 'EUR',
    weight: 0.8, // 800g
    images: ['/assets/products/board.png'],
    icon: '🪵',
    unit: 'unit',
    features: {
      es: ['Madera de roble asturiano', 'Hecho a mano', 'Acabado natural'],
      en: ['Asturian oak wood', 'Handmade', 'Natural finish'],
      pt: ['Madeira de carvalho asturiano', 'Feito à mão', 'Acabamento natural'],
      fr: ['Bois de chêne asturien', 'Fait à la main', 'Finition naturelle'],
      de: ['Asturisches Eichenholz', 'Handgefertigt', 'Natürliche Oberfläche'],
      nl: ['Asturisch eikenhout', 'Handgemaakt', 'Natuurlijke afwerking'],
      da: ['Asturisk egetræ', 'Håndlavet', 'Naturlig finish'],
      sv: ['Asturisk ek', 'Handgjord', 'Naturlig finish'],
      fi: ['Asturialainen tammi', 'Käsityönä tehty', 'Luonnollinen viimeistely'],
      no: ['Asturisk eik', 'Håndlaget', 'Naturlig finish'],
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
      pt: 'O nosso azeite de oliva',
      fr: 'Notre huile d\'olive',
      de: 'Unser Olivenöl',
      nl: 'Onze olijfolie',
      da: 'Vores olivenolie',
      sv: 'Vår olivolja',
      fi: 'Meidän oliiviöljy',
      no: 'Vår olivenolje',
    },
    description: {
      es: 'Aceite de oliva virgen extra de España, prensado en frío. Ideal para acompañar tus aguacates. Este aceite conserva todo su sabor y propiedades naturales. Envase de vidrio oscuro para protegerlo de la luz.',
      en: 'Extra virgin olive oil from Spain, cold-pressed. Ideal to accompany your avocados. This oil retains all its flavor and natural properties. Dark glass container to protect it from light.',
      pt: 'Azeite de oliva virgem extra de Espanha, prensado a frio. Ideal para acompanhar os seus abacates. Este azeite conserva todo o seu sabor e propriedades naturais. Embalagem de vidro escuro para protegê-lo da luz.',
      fr: 'Huile d\'olive extra vierge d\'Espagne, pressée à froid. Idéale pour accompagner vos avocats. Cette huile conserve toute sa saveur et ses propriétés naturelles. Conteneur en verre foncé pour la protéger de la lumière.',
      de: 'Natives Olivenöl extra aus Spanien, kaltgepresst. Ideal, um Ihre Avocados zu begleiten. Dieses Öl behält all seinen Geschmack und seine natürlichen Eigenschaften. Dunkles Glasgefäß zum Schutz vor Licht.',
      nl: 'Extra vierge olijfolie uit Spanje, koudgeperst. Ideaal om uw avocado\'s te begeleiden. Deze olie behoudt al zijn smaak en natuurlijke eigenschappen. Donker glazen container om het tegen licht te beschermen.',
      da: 'Ekstra jomfru olivenolie fra Spanien, koldpresset. Ideel til at ledsage dine avokadoer. Denne olie bevarer al sin smag og naturlige egenskaber. Mørk glasbeholder for at beskytte den mod lys.',
      sv: 'Extra jungfruolja från Spanien, kallpressad. Ideal för att följa med dina avokador. Denna olja behåller all sin smak och naturliga egenskaper. Mörk glasbehållare för att skydda den mot ljus.',
      fi: 'Ekstra neitsytoliiviöljy Espanjasta, kylmäpuristettu. Ihanteellinen avokadojesi seuraksi. Tämä öljy säilyttää kaiken makunsa ja luonnolliset ominaisuutensa. Tumma lasipakkaus suojaamaan sitä valolta.',
      no: 'Ekstra jomfru olivenolje fra Spania, kaldpresset. Ideell til å følge med avokadoene dine. Denne oljen beholder all sin smak og naturlige egenskaper. Mørk glassbeholder for å beskytte den mot lys.',
    },
    price: 10,
    currency: 'EUR',
    weight: 0.5, // 500ml
    images: ['/assets/products/oliveoil.png'],
    icon: '🫒',
    unit: '500ml',
    features: {
      es: ['Virgen extra', 'Prensado en frío', 'Origen España'],
      en: ['Extra virgin', 'Cold-pressed', 'From Spain'],
      pt: ['Virgem extra', 'Prensado a frio', 'Origem Espanha'],
      fr: ['Extra vierge', 'Pressé à froid', 'Origine Espagne'],
      de: ['Extra nativ', 'Kaltgepresst', 'Herkunft Spanien'],
      nl: ['Extra vierge', 'Koudgeperst', 'Oorsprong Spanje'],
      da: ['Ekstra jomfru', 'Koldpresset', 'Oprindelse Spanien'],
      sv: ['Extra jungfru', 'Kallpressad', 'Ursprung Spanien'],
      fi: ['Ekstra neitsyt', 'Kylmäpuristettu', 'Alkuperä Espanja'],
      no: ['Ekstra jomfru', 'Kaldpresset', 'Opprinnelse Spania'],
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
      pt: 'Bolsa de tecido',
      fr: 'Sac en toile',
      de: 'Stofftasche',
      nl: 'Tas van stof',
      da: 'Stoftaske',
      sv: 'Tygtaske',
      fi: 'Kangaskassi',
      no: 'Stoffveske',
    },
    description: {
      es: 'Bolsa de algodón orgánico con el logo de Amandi. Perfecta para llevar tus compras de forma sostenible. Resistente y lavable, ideal para el mercado o el día a día. Diseñada para durar y reducir el uso de plásticos.',
      en: 'Organic cotton bag with Amandi logo. Perfect for carrying your purchases sustainably. Durable and washable, ideal for the market or daily use. Designed to last and reduce plastic use.',
      pt: 'Bolsa de algodão orgânico com o logotipo da Amandi. Perfeita para transportar as suas compras de forma sustentável. Resistente e lavável, ideal para o mercado ou uso diário. Projetada para durar e reduzir o uso de plásticos.',
      fr: 'Sac en coton bio avec le logo Amandi. Parfait pour transporter vos achats de manière durable. Résistant et lavable, idéal pour le marché ou l\'usage quotidien. Conçu pour durer et réduire l\'utilisation de plastiques.',
      de: 'Tasche aus Bio-Baumwolle mit Amandi-Logo. Perfekt zum nachhaltigen Transport Ihrer Einkäufe. Langlebig und waschbar, ideal für den Markt oder den täglichen Gebrauch. Entwickelt, um zu halten und den Plastikverbrauch zu reduzieren.',
      nl: 'Tas van biologisch katoen met Amandi-logo. Perfect voor het duurzaam dragen van uw aankopen. Duurzaam en wasbaar, ideaal voor de markt of dagelijks gebruik. Ontworpen om lang mee te gaan en plasticgebruik te verminderen.',
      da: 'Taske af økologisk bomuld med Amandi-logo. Perfekt til at bære dine indkøb bæredygtigt. Holdbar og vaskbar, ideel til markedet eller daglig brug. Designet til at holde og reducere plastforbrug.',
      sv: 'Väska av ekologisk bomull med Amandi-logotyp. Perfekt för att bära dina inköp hållbart. Hållbar och tvättbar, ideal för marknaden eller daglig användning. Designad för att hålla och minska plastanvändning.',
      fi: 'Luomupuuvillakassi Amandi-logolla. Täydellinen ostoksiesi kestävään kuljetukseen. Kestävä ja pestävä, ihanteellinen markkinoille tai päivittäiseen käyttöön. Suunniteltu kestämään ja vähentämään muovin käyttöä.',
      no: 'Veske av økologisk bomull med Amandi-logo. Perfekt for å bære innkjøpene dine bærekraftig. Holdbar og vaskbar, ideell for markedet eller daglig bruk. Designet for å vare og redusere plastbruk.',
    },
    price: 12,
    currency: 'EUR',
    weight: 0.2, // 200g
    images: ['/assets/products/totebag.png'],
    icon: '👜',
    unit: 'unit',
    features: {
      es: ['Algodón orgánico', 'Lavable', 'Sostenible'],
      en: ['Organic cotton', 'Washable', 'Sustainable'],
      pt: ['Algodão orgânico', 'Lavável', 'Sustentável'],
      fr: ['Coton bio', 'Lavable', 'Durable'],
      de: ['Bio-Baumwolle', 'Waschbar', 'Nachhaltig'],
      nl: ['Biologisch katoen', 'Wasbaar', 'Duurzaam'],
      da: ['Økologisk bomuld', 'Vaskbar', 'Bæredygtig'],
      sv: ['Ekologisk bomull', 'Tvättbar', 'Hållbar'],
      fi: ['Luomupuuvilla', 'Pestävä', 'Kestävä'],
      no: ['Økologisk bomull', 'Vaskbar', 'Bærekraftig'],
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
      pt: 'Limões',
      fr: 'Citrons',
      de: 'Zitronen',
      nl: 'Citroenen',
      da: 'Citroner',
      sv: 'Citroner',
      fi: 'Sitruunat',
      no: 'Sitroner',
    },
    description: {
      es: 'Limones ecológicos de Asturias. Perfectos para acompañar tus aguacates y dar sabor a tus platos. Cultivados sin pesticidas, con todo su sabor natural. Ideales para zumos, postres y aderezos.',
      en: 'Organic lemons from Asturias. Perfect to accompany your avocados and flavor your dishes. Grown without pesticides, with all their natural flavor. Ideal for juices, desserts and dressings.',
      pt: 'Limões orgânicos das Astúrias. Perfeitos para acompanhar os seus abacates e dar sabor aos seus pratos. Cultivados sem pesticidas, com todo o seu sabor natural. Ideais para sumos, sobremesas e molhos.',
      fr: 'Citrons bio des Asturies. Parfaits pour accompagner vos avocats et aromatiser vos plats. Cultivés sans pesticides, avec toute leur saveur naturelle. Idéaux pour les jus, desserts et vinaigrettes.',
      de: 'Bio-Zitronen aus Asturien. Perfekt, um Ihre Avocados zu begleiten und Ihren Gerichten Geschmack zu verleihen. Ohne Pestizide angebaut, mit all ihrem natürlichen Geschmack. Ideal für Säfte, Desserts und Dressings.',
      nl: 'Biologische citroenen uit Asturië. Perfect om uw avocado\'s te begeleiden en uw gerechten op smaak te brengen. Geteeld zonder pesticiden, met al hun natuurlijke smaak. Ideaal voor sappen, desserts en dressings.',
      da: 'Økologiske citroner fra Asturien. Perfekte til at ledsage dine avokadoer og smage dine retter. Dyrket uden pesticider, med al deres naturlige smag. Ideel til safter, desserter og dressinger.',
      sv: 'Ekologiska citroner från Asturien. Perfekta för att följa med dina avokador och smaksätta dina rätter. Odlade utan bekämpningsmedel, med all sin naturliga smak. Ideal för safter, desserter och dressings.',
      fi: 'Luomusitruunat Asturiasta. Täydelliset avokadojesi kanssa ja ruokiesi maustamiseen. Kasvatettu ilman torjunta-aineita, kaikella luonnollisella maullaan. Ihanteellinen mehuihin, jälkiruokiin ja kastikkeisiin.',
      no: 'Økologiske sitroner fra Asturias. Perfekte for å følge med avokadoene dine og smake på rettene dine. Dyrket uten plantevernmidler, med all sin naturlige smak. Ideell for safter, desserter og dressinger.',
    },
    price: 8,
    currency: 'EUR',
    weight: 1, // 1kg
    images: ['/assets/products/lemons.png'],
    icon: '🍋',
    unit: '1kg',
    features: {
      es: ['Ecológicos', 'Sin pesticidas', 'Sabor natural'],
      en: ['Organic', 'No pesticides', 'Natural flavor'],
      pt: ['Orgânicos', 'Sem pesticidas', 'Sabor natural'],
      fr: ['Bio', 'Sans pesticides', 'Saveur naturelle'],
      de: ['Bio', 'Keine Pestizide', 'Natürlicher Geschmack'],
      nl: ['Biologisch', 'Geen pesticiden', 'Natuurlijke smaak'],
      da: ['Økologisk', 'Ingen pesticider', 'Naturlig smag'],
      sv: ['Ekologisk', 'Inga bekämpningsmedel', 'Naturlig smak'],
      fi: ['Luomu', 'Ei torjunta-aineita', 'Luonnollinen maku'],
      no: ['Økologisk', 'Ingen plantevernmidler', 'Naturlig smak'],
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
      pt: 'Verdina asturiana',
      fr: 'Verdina asturienne',
      de: 'Asturische Verdina',
      nl: 'Asturische verdina',
      da: 'Asturisk verdina',
      sv: 'Asturisk verdina',
      fi: 'Asturialainen verdina',
      no: 'Asturisk verdina',
    },
    description: {
      es: 'Alubia verdina asturiana, una legumbre única de nuestra región. Tradicional y deliciosa. Cultivada en Asturias con métodos tradicionales, esta alubia es un ingrediente esencial de la cocina asturiana. Perfecta para guisos y potajes.',
      en: 'Asturian verdina bean, a unique legume from our region. Traditional and delicious. Grown in Asturias with traditional methods, this bean is an essential ingredient of Asturian cuisine. Perfect for stews and potages.',
      pt: 'Feijão verdina asturiano, uma leguminosa única da nossa região. Tradicional e deliciosa. Cultivada nas Astúrias com métodos tradicionais, este feijão é um ingrediente essencial da cozinha asturiana. Perfeita para guisados e potagens.',
      fr: 'Haricot verdina asturien, une légumineuse unique de notre région. Traditionnel et délicieux. Cultivé dans les Asturies avec des méthodes traditionnelles, ce haricot est un ingrédient essentiel de la cuisine asturienne. Parfait pour les ragoûts et potages.',
      de: 'Asturische Verdina-Bohne, eine einzigartige Hülsenfrucht aus unserer Region. Traditionell und köstlich. In Asturien mit traditionellen Methoden angebaut, ist diese Bohne eine wesentliche Zutat der asturischen Küche. Perfekt für Eintöpfe und Potages.',
      nl: 'Asturische verdina boon, een unieke peulvrucht uit onze regio. Traditioneel en heerlijk. Geteeld in Asturië met traditionele methoden, deze boon is een essentieel ingrediënt van de Asturische keuken. Perfect voor stoofschotels en potages.',
      da: 'Asturisk verdina bønne, en unik bælgplante fra vores region. Traditionel og lækker. Dyrket i Asturien med traditionelle metoder, denne bønne er en essentiel ingrediens i den asturiske køkken. Perfekt til stuvninger og potager.',
      sv: 'Asturisk verdina böna, en unik baljväxt från vår region. Traditionell och läcker. Odlad i Asturien med traditionella metoder, denna böna är en väsentlig ingrediens i den asturiska köket. Perfekt för grytor och potager.',
      fi: 'Asturialainen verdina-papu, ainutlaatuinen palkokasvi alueeltamme. Perinteinen ja herkullinen. Kasvatettu Asturiassa perinteisillä menetelmillä, tämä papu on olennainen ainesosa asturialaisessa keittiössä. Täydellinen muhennoksiin ja potageihin.',
      no: 'Asturisk verdina bønne, en unik belgfrukt fra vår region. Tradisjonell og deilig. Dyrket i Asturias med tradisjonelle metoder, denne bønnen er en essensiell ingrediens i det asturiske kjøkkenet. Perfekt for stuinger og potager.',
    },
    price: 15,
    currency: 'EUR',
    weight: 0.65, // 650g
    images: ['/assets/products/verdinas.png'],
    icon: '🫘',
    unit: '650g',
    features: {
      es: ['Tradicional asturiana', 'Cultivo local', 'Alta calidad'],
      en: ['Traditional Asturian', 'Local cultivation', 'High quality'],
      pt: ['Tradicional asturiana', 'Cultivo local', 'Alta qualidade'],
      fr: ['Traditionnel asturien', 'Culture locale', 'Haute qualité'],
      de: ['Traditionell asturisch', 'Lokaler Anbau', 'Hohe Qualität'],
      nl: ['Traditioneel Asturisch', 'Lokale teelt', 'Hoge kwaliteit'],
      da: ['Traditionel asturisk', 'Lokal dyrkning', 'Høj kvalitet'],
      sv: ['Traditionell asturisk', 'Lokal odling', 'Hög kvalitet'],
      fi: ['Perinteinen asturialainen', 'Paikallinen viljely', 'Korkea laatu'],
      no: ['Tradisjonell asturisk', 'Lokal dyrking', 'Høy kvalitet'],
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
      pt: 'Mel',
      fr: 'Miel',
      de: 'Honig',
      nl: 'Honing',
      da: 'Honning',
      sv: 'Honung',
      fi: 'Hunaja',
      no: 'Honning',
    },
    description: {
      es: 'Miel cruda de Asturias, recolectada de nuestras colmenas. Natural y pura, sin procesar ni filtrar. Esta miel conserva todas sus propiedades naturales, enzimas y sabores únicos de las flores asturianas.',
      en: 'Raw honey from Asturias, harvested from our hives. Natural and pure, unprocessed and unfiltered. This honey retains all its natural properties, enzymes and unique flavors from Asturian flowers.',
      pt: 'Mel cru das Astúrias, recolhido das nossas colmeias. Natural e puro, sem processar nem filtrar. Este mel conserva todas as suas propriedades naturais, enzimas e sabores únicos das flores asturianas.',
      fr: 'Miel cru des Asturies, récolté de nos ruches. Naturel et pur, non transformé et non filtré. Ce miel conserve toutes ses propriétés naturelles, enzymes et saveurs uniques des fleurs asturiennes.',
      de: 'Rohhonig aus Asturien, geerntet aus unseren Bienenstöcken. Natürlich und rein, unverarbeitet und ungefiltert. Dieser Honig behält all seine natürlichen Eigenschaften, Enzyme und einzigartigen Aromen der asturischen Blumen.',
      nl: 'Rauwe honing uit Asturië, geoogst uit onze bijenkasten. Natuurlijk en puur, onbewerkt en ongefilterd. Deze honing behoudt al zijn natuurlijke eigenschappen, enzymen en unieke smaken van Asturische bloemen.',
      da: 'Rå honning fra Asturien, høstet fra vores bikuber. Naturlig og ren, uforarbejdet og ufiltreret. Denne honning bevarer alle sine naturlige egenskaber, enzymer og unikke smage fra asturiske blomster.',
      sv: 'Rå honung från Asturien, skördad från våra bikupor. Naturlig och ren, obearbetad och ofiltrerad. Denna honung behåller alla sina naturliga egenskaper, enzymer och unika smaker från asturiska blommor.',
      fi: 'Raaka hunaja Asturiasta, korjattu mehiläispesistämme. Luonnollinen ja puhdas, käsittelemätön ja suodattamaton. Tämä hunaja säilyttää kaikki luonnolliset ominaisuutensa, entsyymit ja ainutlaatuiset maut asturialaisista kukista.',
      no: 'Rå honning fra Asturias, høstet fra våre bikuber. Naturlig og ren, uforarbeidet og ufiltrert. Denne honningen beholder alle sine naturlige egenskaper, enzymer og unike smaker fra asturiske blomster.',
    },
    price: 10,
    currency: 'EUR',
    weight: 0.5, // 500g
    images: ['/assets/products/honey.png'],
    icon: '🍯',
    unit: '500g',
    features: {
      es: ['Miel cruda', 'Sin procesar', '100% natural'],
      en: ['Raw honey', 'Unprocessed', '100% natural'],
      pt: ['Mel cru', 'Sem processar', '100% natural'],
      fr: ['Miel cru', 'Non transformé', '100% naturel'],
      de: ['Rohhonig', 'Unverarbeitet', '100% natürlich'],
      nl: ['Rauwe honing', 'Onbewerkt', '100% natuurlijk'],
      da: ['Rå honning', 'Uforarbejdet', '100% naturlig'],
      sv: ['Rå honung', 'Obearbetad', '100% naturlig'],
      fi: ['Raaka hunaja', 'Käsittelemätön', '100% luonnollinen'],
      no: ['Rå honning', 'Uforarbeidet', '100% naturlig'],
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
      pt: 'Avelãs',
      fr: 'Noisettes',
      de: 'Haselnüsse',
      nl: 'Hazelnoten',
      da: 'Hasselnødder',
      sv: 'Hasselnötter',
      fi: 'Hasselpähkinät',
      no: 'Hasselnøtter',
    },
    description: {
      es: 'Avellanas asturianas, tostadas y listas para disfrutar. Un aperitivo perfecto y saludable. Cultivadas en Asturias, estas avellanas tienen un sabor intenso y una textura crujiente. Perfectas para comer solas o añadir a tus recetas.',
      en: 'Asturian hazelnuts, roasted and ready to enjoy. A perfect and healthy snack. Grown in Asturias, these hazelnuts have an intense flavor and crunchy texture. Perfect to eat alone or add to your recipes.',
      pt: 'Avelãs asturianas, tostadas e prontas para desfrutar. Um aperitivo perfeito e saudável. Cultivadas nas Astúrias, estas avelãs têm um sabor intenso e uma textura crocante. Perfeitas para comer sozinhas ou adicionar às suas receitas.',
      fr: 'Noisettes asturiennes, grillées et prêtes à déguster. Un en-cas parfait et sain. Cultivées dans les Asturies, ces noisettes ont une saveur intense et une texture croquante. Parfaites pour être mangées seules ou ajoutées à vos recettes.',
      de: 'Asturische Haselnüsse, geröstet und bereit zum Genießen. Ein perfekter und gesunder Snack. In Asturien angebaut, haben diese Haselnüsse einen intensiven Geschmack und eine knusprige Textur. Perfekt zum allein essen oder zu Ihren Rezepten hinzufügen.',
      nl: 'Asturische hazelnoten, geroosterd en klaar om te genieten. Een perfecte en gezonde snack. Geteeld in Asturië, deze hazelnoten hebben een intense smaak en knapperige textuur. Perfect om alleen te eten of toe te voegen aan uw recepten.',
      da: 'Asturiske hasselnødder, ristede og klar til at nyde. En perfekt og sund snack. Dyrket i Asturien, disse hasselnødder har en intens smag og knasende tekstur. Perfekt til at spise alene eller tilføje til dine opskrifter.',
      sv: 'Asturiska hasselnötter, rostade och redo att njuta av. En perfekt och hälsosam mellanmål. Odlade i Asturien, dessa hasselnötter har en intensiv smak och krispig textur. Perfekt att äta ensamt eller lägga till i dina recept.',
      fi: 'Asturialaiset hasselpähkinät, paahdetut ja valmiit nautittavaksi. Täydellinen ja terveellinen välipala. Kasvatettu Asturiassa, näillä hasselpähkinöillä on intensiivinen maku ja rapea rakenne. Täydellinen syötäväksi yksin tai lisättäväksi resepteihisi.',
      no: 'Asturiske hasselnøtter, ristet og klare til å nyte. En perfekt og sunn snack. Dyrket i Asturias, disse hasselnøttene har en intens smak og knasende tekstur. Perfekt å spise alene eller legge til i oppskriftene dine.',
    },
    price: 12,
    currency: 'EUR',
    weight: 1, // 1kg
    images: ['/assets/products/hazelnuts.png'],
    icon: '🌰',
    unit: '1kg',
    features: {
      es: ['Tostadas', 'Origen Asturias', 'Alta calidad'],
      en: ['Roasted', 'From Asturias', 'High quality'],
      pt: ['Tostadas', 'Origem Astúrias', 'Alta qualidade'],
      fr: ['Grillées', 'Origine Asturies', 'Haute qualité'],
      de: ['Geröstet', 'Herkunft Asturien', 'Hohe Qualität'],
      nl: ['Geroosterd', 'Herkomst Asturië', 'Hoge kwaliteit'],
      da: ['Ristet', 'Oprindelse Asturien', 'Høj kvalitet'],
      sv: ['Rostade', 'Ursprung Asturien', 'Hög kvalitet'],
      fi: ['Paahdettu', 'Alkuperä Asturia', 'Korkea laatu'],
      no: ['Ristet', 'Opprinnelse Asturias', 'Høy kvalitet'],
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
