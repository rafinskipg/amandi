import { notFound } from 'next/navigation'
import SeoPageIntro from '@/components/SeoPageIntro'
import MaternityIntro from '@/components/MaternityIntro'
import NuestrosAguacates from '@/components/NuestrosAguacates'
import Preorden from '@/components/Preorden'
import EligeTuCaja from '@/components/EligeTuCaja'
import PorQueAmandi from '@/components/PorQueAmandi'
import FAQ from '@/components/FAQ'
import Footer from '@/components/Footer'
import LanguageSelector from '@/components/LanguageSelector'
import { getCountryByPath, getAllSeoPaths } from '@/lib/countries'
import { getSpecialSeoPageByPath, getAllSpecialSeoPaths } from '@/lib/seoPages'
import { getTranslations, es, type Translations } from '@/lib/translations'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const countryPaths = getAllSeoPaths()
  const specialPaths = getAllSpecialSeoPaths()
  
  const allPaths = [
    ...countryPaths.map(({ path }) => {
      const segments = path.split('/').filter(Boolean)
      return { seo: segments }
    }),
    ...specialPaths.map(({ path }) => {
      const segments = path.split('/').filter(Boolean)
      return { seo: segments }
    })
  ]
  
  return allPaths
}

export async function generateMetadata({ params }: { params: { seo?: string[] } | Promise<{ seo?: string[] }> }): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params
  const seoArray = resolvedParams?.seo || []
  
  if (seoArray.length === 0) {
    return {
      title: 'Avocados Amandi',
    }
  }
  
  const path = '/' + seoArray.join('/')
  
  // Check for special SEO pages first
  const specialPage = getSpecialSeoPageByPath(path)
  if (specialPage) {
    const langMatch = path.match(/^\/([a-z]{2})/)
    const lang = langMatch ? langMatch[1] : 'en'
    const translations: Translations = getTranslations(lang)
    const isSpanish = translations === es
    
    if (specialPage.type === 'maternity') {
      return {
        title: isSpanish 
          ? 'Aguacates Ecológicos para Embarazadas y Bebés | Avocados Amandi'
          : 'Organic Avocados for Pregnant Women and Babies | Avocados Amandi',
        description: isSpanish
          ? 'Aguacates ecológicos certificados perfectos para embarazadas y bebés. Rico en ácido fólico, omega-3 y nutrientes esenciales. Sin pesticidas, cultivados en Asturias.'
          : 'Certified organic avocados perfect for pregnant women and babies. Rich in folic acid, omega-3 and essential nutrients. No pesticides, grown in Asturias.',
      }
    }
  }
  
  const country = getCountryByPath(path)
  
  if (!country) {
    return {
      title: 'Avocados Amandi',
    }
  }

  const translations: Translations = getTranslations(country.language)
  const countryName = country.name

  return {
    title: `Order Organic Avocados Online in ${countryName} | Avocados Amandi`,
    description: `Buy premium organic avocados from Asturias, Spain. Direct shipping to ${countryName}. No cold storage, tree-ripened fruit.`,
  }
}

export default async function SeoPage({ params }: { params: { seo?: string[] } | Promise<{ seo?: string[] }> }) {
  const resolvedParams = params instanceof Promise ? await params : params
  const seoArray = resolvedParams?.seo || []
  
  if (seoArray.length === 0) {
    notFound()
  }
  
  const path = '/' + seoArray.join('/')
  
  // Check for special SEO pages first
  const specialPage = getSpecialSeoPageByPath(path)
  if (specialPage) {
    const langMatch = path.match(/^\/([a-z]{2})/)
    const lang = langMatch ? langMatch[1] : 'en'
    const translations: Translations = getTranslations(lang)
    
    if (specialPage.type === 'maternity') {
      return (
        <div className="app">
          <LanguageSelector />
          <MaternityIntro translations={translations} />
          <NuestrosAguacates translations={translations} />
          <Preorden translations={translations} />
          <EligeTuCaja translations={translations} />
          <PorQueAmandi translations={translations} />
          <FAQ translations={translations} />
          <Footer translations={translations} />
        </div>
      )
    }
  }
  
  const country = getCountryByPath(path)
  
  if (!country) {
    notFound()
  }

  const translations: Translations = getTranslations(country.language)

  return (
    <div className="app">
      <LanguageSelector />
      <SeoPageIntro translations={translations} country={country} />
      <NuestrosAguacates translations={translations} country={country} />
      <Preorden translations={translations} country={country} />
      <EligeTuCaja translations={translations} country={country} />
      <PorQueAmandi translations={translations} country={country} />
      <FAQ translations={translations} country={country} />
      <Footer translations={translations} country={country} />
    </div>
  )
}
