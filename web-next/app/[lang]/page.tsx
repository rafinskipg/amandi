import { notFound } from 'next/navigation'
import Hero from '@/components/Hero'
import NuestrosAguacates from '@/components/NuestrosAguacates'
import Preorden from '@/components/Preorden'
import Variedades from '@/components/Variedades'
import VideoFinca from '@/components/VideoFinca'
import EligeTuCaja from '@/components/EligeTuCaja'
import PorQueAmandi from '@/components/PorQueAmandi'
import FAQ from '@/components/FAQ'
import Footer from '@/components/Footer'
import LanguageSelector from '@/components/LanguageSelector'
import { getTranslations, type Translations } from '@/lib/translations'
import type { Metadata } from 'next'

const languages = ['es', 'en', 'pt', 'fr', 'de', 'nl', 'da', 'sv', 'fi', 'no']

export async function generateStaticParams() {
  return languages.map((lang) => ({
    lang,
  }))
}

export async function generateMetadata({ 
  params 
}: { 
  params: { lang: string } | Promise<{ lang: string }> 
}): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params
  
  if (!languages.includes(resolvedParams.lang)) {
    return {
      title: 'Buy Organic Avocados Online | Direct Shipping from Spain | Avocados Amandi',
      description: 'Buy premium organic avocados grown in Asturias, Spain. Direct shipping across Europe. No cold storage, tree-ripened Hass and Lamb Hass avocados.',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.amandi.bio'
  const lang = resolvedParams.lang
  const pageUrl = `${baseUrl}/${lang}`
  const ogImage = `${baseUrl}/brand.png`

  // SEO-optimized titles and descriptions focused on sales and conversion for all languages
  const seoContent: Record<string, { title: string; description: string; keywords: string; locale: string }> = {
    es: {
      title: 'Comprar Aguacates Ecológicos Online España | Envío Directo desde Asturias | Avocados Amandi',
      description: 'Compra aguacates ecológicos premium cultivados en Asturias, España. Envío directo a toda Europa. Sin cámaras frigoríficas, cosechados cuando el árbol decide. Aguacates Hass y Lamb Hass certificados ecológicos. Precio desde 18€.',
      keywords: 'comprar aguacates online, aguacates ecológicos España, comprar aguacates ecológicos, aguacates premium Asturias, envío aguacates Europa, aguacates Hass online, aguacates ecológicos certificados, comprar aguacates directo finca',
      locale: 'es_ES',
    },
    en: {
      title: 'Buy Organic Avocados Online | Direct Shipping from Spain | Premium Tree-Ripened | Avocados Amandi',
      description: 'Buy premium organic avocados grown in Asturias, Spain. Direct shipping across Europe. No cold storage, tree-ripened Hass and Lamb Hass avocados. Certified organic. From €18. Order online today.',
      keywords: 'buy organic avocados online, organic avocados Spain, premium avocados, tree-ripened avocados, Hass avocados online, certified organic avocados, buy avocados Europe, direct farm shipping',
      locale: 'en_GB',
    },
    pt: {
      title: 'Comprar Abacates Orgânicos Online | Envio Direto da Espanha | Avocados Amandi',
      description: 'Compre abacates orgânicos premium cultivados em Astúrias, Espanha. Envio direto para toda a Europa. Sem câmaras frigoríficas, colhidos quando a árvore decide. Abacates Hass e Lamb Hass certificados orgânicos. Preço a partir de €18.',
      keywords: 'comprar abacates online, abacates orgânicos Espanha, comprar abacates orgânicos, abacates premium Astúrias, envio abacates Europa, abacates Hass online, abacates orgânicos certificados',
      locale: 'pt_PT',
    },
    fr: {
      title: 'Acheter des Avocats Bio en Ligne | Livraison Directe depuis l\'Espagne | Avocados Amandi',
      description: 'Achetez des avocats bio premium cultivés en Asturies, Espagne. Livraison directe dans toute l\'Europe. Sans chambres froides, récoltés quand l\'arbre décide. Avocats Hass et Lamb Hass certifiés bio. À partir de €18. Commandez en ligne aujourd\'hui.',
      keywords: 'acheter avocats bio en ligne, avocats bio Espagne, avocats premium, avocats Hass en ligne, avocats bio certifiés, acheter avocats Europe, livraison directe ferme',
      locale: 'fr_FR',
    },
    de: {
      title: 'Bio-Avocados Online Kaufen | Direktversand aus Spanien | Avocados Amandi',
      description: 'Kaufen Sie Premium-Bio-Avocados aus Asturien, Spanien. Direktversand in ganz Europa. Ohne Kühlräume, baumgereift geerntet. Zertifizierte Bio-Avocados Hass und Lamb Hass. Ab €18. Jetzt online bestellen.',
      keywords: 'bio avocados online kaufen, bio avocados Spanien, premium avocados, baumgereifte avocados, hass avocados online, zertifizierte bio avocados, avocados Europa kaufen',
      locale: 'de_DE',
    },
    nl: {
      title: 'Biologische Avocado\'s Online Kopen | Directe Verzending uit Spanje | Avocados Amandi',
      description: 'Koop premium biologische avocado\'s gekweekt in Asturië, Spanje. Directe verzending in heel Europa. Geen koelcellen, boomrijp geoogst. Gecertificeerde biologische Hass en Lamb Hass avocado\'s. Vanaf €18. Bestel nu online.',
      keywords: 'biologische avocado\'s online kopen, biologische avocado\'s Spanje, premium avocado\'s, boomrijpe avocado\'s, hass avocado\'s online, gecertificeerde biologische avocado\'s',
      locale: 'nl_NL',
    },
    da: {
      title: 'Køb Økologiske Avokadoer Online | Direkte Forsendelse fra Spanien | Avocados Amandi',
      description: 'Køb premium økologiske avokadoer dyrket i Asturien, Spanien. Direkte forsendelse i hele Europa. Uden kølerum, træmodnet høstet. Certificerede økologiske Hass og Lamb Hass avokadoer. Fra €18. Bestil online i dag.',
      keywords: 'køb økologiske avokadoer online, økologiske avokadoer Spanien, premium avokadoer, træmodnede avokadoer, hass avokadoer online, certificerede økologiske avokadoer',
      locale: 'da_DK',
    },
    sv: {
      title: 'Köp Ekologiska Avokador Online | Direktleverans från Spanien | Avocados Amandi',
      description: 'Köp premium ekologiska avokador odlade i Asturien, Spanien. Direktleverans i hela Europa. Utan kylrum, trädmogna skördade. Certifierade ekologiska Hass och Lamb Hass avokador. Från €18. Beställ online idag.',
      keywords: 'köp ekologiska avokador online, ekologiska avokador Spanien, premium avokador, trädmogna avokador, hass avokador online, certifierade ekologiska avokador',
      locale: 'sv_SE',
    },
    fi: {
      title: 'Osta Luomu Avokadoja Verkosta | Suora Toimitus Espanjasta | Avocados Amandi',
      description: 'Osta premium-luomu avokadoja, jotka kasvatetaan Asturiassa, Espanjassa. Suora toimitus koko Eurooppaan. Ilman kylmävarastoja, puussa kypsennetty. Sertifioidut luomu Hass ja Lamb Hass avokadot. Alkaen €18. Tilaa verkosta tänään.',
      keywords: 'osta luomu avokadoja verkosta, luomu avokadoja Espanja, premium avokadot, puussa kypsennetyt avokadot, hass avokadot verkosta, sertifioidut luomu avokadot',
      locale: 'fi_FI',
    },
    no: {
      title: 'Kjøp Økologiske Avokadoer Online | Direkte Frakt fra Spania | Avocados Amandi',
      description: 'Kjøp premium økologiske avokadoer dyrket i Asturias, Spania. Direkte frakt i hele Europa. Uten kjølerom, tremodnet høstet. Sertifiserte økologiske Hass og Lamb Hass avokadoer. Fra €18. Bestill online i dag.',
      keywords: 'kjøp økologiske avokadoer online, økologiske avokadoer Spania, premium avokadoer, tremodnede avokadoer, hass avokadoer online, sertifiserte økologiske avokadoer',
      locale: 'no_NO',
    },
  }

  // Default to English if language not found
  const content = seoContent[lang] || seoContent.en

  return {
    title: content.title,
    description: content.description,
    keywords: content.keywords,
    openGraph: {
      title: content.title,
      description: content.description,
      url: pageUrl,
      siteName: 'Avocados Amandi',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: lang === 'es' ? 'Comprar Aguacates Ecológicos Online' : 'Buy Organic Avocados Online',
        },
      ],
      locale: content.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.description,
      images: [ogImage],
    },
  }
}

export default async function Home({ 
  params 
}: { 
  params: { lang: string } | Promise<{ lang: string }> 
}) {
  const resolvedParams = params instanceof Promise ? await params : params
  
  // Validate language
  if (!languages.includes(resolvedParams.lang)) {
    notFound()
  }
  
  // Detect language and use appropriate translations (defaults to English if not Spanish)
  const translations: Translations = getTranslations(resolvedParams.lang)

  return (
    <div className="app">
      <LanguageSelector />
      <Hero translations={translations} />
      <NuestrosAguacates translations={translations} />
      <Preorden translations={translations} />
      <Variedades translations={translations} />
      <VideoFinca translations={translations} />
      <EligeTuCaja translations={translations} />
      <PorQueAmandi translations={translations} />
      <FAQ translations={translations} />
      <Footer translations={translations} />
    </div>
  )
}

