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
      title: 'Avocados Amandi - Desde la tierra buena, para la vida buena',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.amandi.bio'
  const isSpanish = resolvedParams.lang === 'es'
  const pageUrl = `${baseUrl}/${resolvedParams.lang}`
  const ogImage = `${baseUrl}/brand.png`

  return {
    title: 'Avocados Amandi - Desde la tierra buena, para la vida buena',
    description: 'Aguacates ecológicos cultivados en Asturias, sin cámaras, sin prisas. Cosechamos solo cuando el árbol decide.',
    openGraph: {
      title: 'Avocados Amandi - Desde la tierra buena, para la vida buena',
      description: isSpanish
        ? 'Aguacates ecológicos cultivados en Asturias, sin cámaras, sin prisas. Cosechamos solo cuando el árbol decide.'
        : 'Organic avocados grown in Asturias, no cold storage, no rush. We harvest only when the tree decides.',
      url: pageUrl,
      siteName: 'Avocados Amandi',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Avocados Amandi',
        },
      ],
      locale: isSpanish ? 'es_ES' : 'en_GB',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Avocados Amandi - Desde la tierra buena, para la vida buena',
      description: isSpanish
        ? 'Aguacates ecológicos cultivados en Asturias, sin cámaras, sin prisas.'
        : 'Organic avocados grown in Asturias, no cold storage, no rush.',
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

