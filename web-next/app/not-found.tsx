'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import LanguageSelector from '@/components/LanguageSelector'
import styles from './not-found.module.css'

const notFoundTranslations = {
  es: {
    title: '404',
    subtitle: 'Esta página no está aquí',
    description1: 'Parece que esta página se ha ido de paseo... como nuestros aguacates cuando están listos para cosechar.',
    description2: 'Pero no te preocupes, puedes volver a casa y seguir explorando nuestros aguacates ecológicos.',
    backHome: 'Volver al inicio',
    buyAvocados: 'Comprar aguacates',
  },
  en: {
    title: '404',
    subtitle: 'This page is not here',
    description1: 'It seems this page has gone for a walk... like our avocados when they\'re ready to harvest.',
    description2: 'But don\'t worry, you can go back home and keep exploring our organic avocados.',
    backHome: 'Back to home',
    buyAvocados: 'Buy avocados',
  },
  pt: {
    title: '404',
    subtitle: 'Esta página não está aqui',
    description1: 'Parece que esta página foi dar um passeio... como os nossos abacates quando estão prontos para colher.',
    description2: 'Mas não se preocupe, pode voltar para casa e continuar a explorar os nossos abacates ecológicos.',
    backHome: 'Voltar ao início',
    buyAvocados: 'Comprar abacates',
  },
  fr: {
    title: '404',
    subtitle: 'Cette page n\'est pas ici',
    description1: 'Il semble que cette page soit partie se promener... comme nos avocats quand ils sont prêts à être récoltés.',
    description2: 'Mais ne vous inquiétez pas, vous pouvez retourner à la maison et continuer à explorer nos avocats biologiques.',
    backHome: 'Retour à l\'accueil',
    buyAvocados: 'Acheter des avocats',
  },
  de: {
    title: '404',
    subtitle: 'Diese Seite ist nicht hier',
    description1: 'Es scheint, dass diese Seite spazieren gegangen ist... wie unsere Avocados, wenn sie reif zum Ernten sind.',
    description2: 'Aber keine Sorge, Sie können nach Hause zurückkehren und unsere Bio-Avocados weiter erkunden.',
    backHome: 'Zurück zur Startseite',
    buyAvocados: 'Avocados kaufen',
  },
  nl: {
    title: '404',
    subtitle: 'Deze pagina is hier niet',
    description1: 'Het lijkt erop dat deze pagina is gaan wandelen... zoals onze avocado\'s wanneer ze klaar zijn om te oogsten.',
    description2: 'Maar maak je geen zorgen, je kunt terug naar huis gaan en onze biologische avocado\'s blijven verkennen.',
    backHome: 'Terug naar home',
    buyAvocados: 'Avocado\'s kopen',
  },
  da: {
    title: '404',
    subtitle: 'Denne side er ikke her',
    description1: 'Det ser ud til, at denne side er gået en tur... som vores avokadoer, når de er klar til høst.',
    description2: 'Men bare rolig, du kan gå tilbage hjem og fortsætte med at udforske vores økologiske avokadoer.',
    backHome: 'Tilbage til hjem',
    buyAvocados: 'Køb avokadoer',
  },
  sv: {
    title: '404',
    subtitle: 'Denna sida finns inte här',
    description1: 'Det verkar som att denna sida har gått på promenad... som våra avokador när de är redo att skördas.',
    description2: 'Men oroa dig inte, du kan gå tillbaka hem och fortsätta utforska våra ekologiska avokador.',
    backHome: 'Tillbaka till hem',
    buyAvocados: 'Köp avokador',
  },
  fi: {
    title: '404',
    subtitle: 'Tämä sivu ei ole täällä',
    description1: 'Näyttää siltä, että tämä sivu on lähtenyt kävelylle... kuten avokadomme, kun ne ovat valmiita korjattavaksi.',
    description2: 'Mutta älä huoli, voit palata kotiin ja jatkaa ekologisten avokadojemme tutkimista.',
    backHome: 'Takaisin kotiin',
    buyAvocados: 'Osta avokadoja',
  },
  no: {
    title: '404',
    subtitle: 'Denne siden er ikke her',
    description1: 'Det ser ut til at denne siden har gått på tur... som våre avokadoer når de er klare til høsting.',
    description2: 'Men ikke bekymre deg, du kan gå tilbake hjem og fortsette å utforske våre økologiske avokadoer.',
    backHome: 'Tilbake til hjem',
    buyAvocados: 'Kjøp avokadoer',
  },
}

export default function NotFound() {
  const pathname = usePathname()
  
  // Detect language from pathname
  const langMatch = pathname.match(/^\/(en|es|pt|fr|de|nl|da|sv|fi|no)/)
  const langCode = langMatch ? langMatch[1] : 'en'
  const t = notFoundTranslations[langCode as keyof typeof notFoundTranslations] || notFoundTranslations.en
  
  // Get appropriate home and buy links based on language
  const getHomeLink = () => {
    // Always go to the root home page
    return '/'
  }
  
  const getBuyLink = () => {
    if (langCode === 'es') return '/es/comprar-aguacates-online-espana'
    if (langCode === 'pt') return '/pt/comprar-abacates-online-portugal'
    if (langCode === 'en') return '/en/order-avocados-online-uk'
    // For other languages, use their country's order page
    const langCountryMap: Record<string, string> = {
      fr: '/en/order-avocados-online-france',
      de: '/en/order-avocados-online-germany',
      nl: '/en/order-avocados-online-netherlands',
      dk: '/en/order-avocados-online-denmark',
      da: '/en/order-avocados-online-denmark',
      se: '/en/order-avocados-online-sweden',
      sv: '/en/order-avocados-online-sweden',
      fi: '/en/order-avocados-online-finland',
      no: '/en/order-avocados-online-norway',
    }
    return langCountryMap[langCode] || '/en/order-avocados-online-uk'
  }

  return (
    <div className={styles.container}>
      <LanguageSelector />
      <div className={styles.content}>
        <div className={styles.emoji}>🥑</div>
        <h1 className={styles.title}>{t.title}</h1>
        <h2 className={styles.subtitle}>{t.subtitle}</h2>
        <p className={styles.description}>
          {t.description1}
        </p>
        <p className={styles.description}>
          {t.description2}
        </p>
        <div className={styles.actions}>
          <Link href={getHomeLink()} className={styles.buttonPrimary}>
            {t.backHome}
          </Link>
          <Link href={getBuyLink()} className={styles.buttonSecondary}>
            {t.buyAvocados}
          </Link>
        </div>
      </div>
    </div>
  )
}

