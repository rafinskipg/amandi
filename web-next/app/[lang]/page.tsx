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
import { es, en, type Translations } from '@/lib/translations'
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

  return {
    title: 'Avocados Amandi - Desde la tierra buena, para la vida buena',
    description: 'Aguacates ecológicos cultivados en Asturias, sin cámaras, sin prisas. Cosechamos solo cuando el árbol decide.',
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
  
  // Detect language and use appropriate translations
  const lang = resolvedParams.lang === 'es' ? 'es' : 'en'
  const translations: Translations = lang === 'es' ? es : en

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

