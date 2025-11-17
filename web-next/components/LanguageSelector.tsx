'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import styles from './LanguageSelector.module.css'
import { getCountryByPath, countries, type CountryCode } from '@/lib/countries'
import CartIcon from './CartIcon'

const languages = [
  { code: 'en', name: 'English', displayCode: 'EN', countryCode: 'gb' as CountryCode },
  { code: 'es', name: 'Español', displayCode: 'ES', countryCode: 'es' as CountryCode },
  { code: 'pt', name: 'Português', displayCode: 'PT', countryCode: 'pt' as CountryCode },
  { code: 'fr', name: 'Français', displayCode: 'FR', countryCode: 'fr' as CountryCode },
  { code: 'de', name: 'Deutsch', displayCode: 'DE', countryCode: 'de' as CountryCode },
  { code: 'nl', name: 'Nederlands', displayCode: 'NL', countryCode: 'nl' as CountryCode },
  { code: 'da', name: 'Dansk', displayCode: 'DA', countryCode: 'dk' as CountryCode },
  { code: 'sv', name: 'Svenska', displayCode: 'SV', countryCode: 'se' as CountryCode },
  { code: 'fi', name: 'Suomi', displayCode: 'FI', countryCode: 'fi' as CountryCode },
  { code: 'no', name: 'Norsk', displayCode: 'NO', countryCode: 'no' as CountryCode },
]

const languageCodes = languages.map(lang => lang.code).join('|')

// Map language codes to their corresponding country codes
// Since countries have specific languages, we map each language to its primary country
const getCountryForLanguage = (langCode: string): CountryCode | null => {
  const lang = languages.find(l => l.code === langCode)
  return lang ? lang.countryCode : null
}

// Detect page type from path (order, ecological, or home)
const getPageType = (path: string): string | null => {
  if (path.includes('order') || path.includes('comprar') || path.includes('abacates-online')) return 'order'
  if (path.includes('ecological') || path.includes('ecologicos')) return 'ecological'
  if (path === '/' || path === '') return 'home'
  return null
}

// Check if current path is a country-specific SEO page
const isCountrySeoPage = (path: string): boolean => {
  for (const country of Object.values(countries)) {
    if (Object.values(country.seoPaths).some(seoPath => path.includes(seoPath))) {
      return true
    }
  }
  return false
}

export default function LanguageSelector() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Detect current language from pathname
  const currentLangMatch = pathname.match(new RegExp(`^/(${languageCodes})`))
  const currentLangCode = currentLangMatch ? currentLangMatch[1] : 'en'
  const currentLang = languages.find(lang => lang.code === currentLangCode) || languages[0]

  // Detect current country and page type
  const currentCountry = getCountryByPath(pathname)
  const pageType = getPageType(pathname)
  const isSeoPage = isCountrySeoPage(pathname)
  
  // Generate paths for all languages
  const languagePaths = languages.map(lang => {
    const targetCountryCode = getCountryForLanguage(lang.code)
    
    // If we're on a country-specific SEO page, map to the corresponding country page
    if (isSeoPage && targetCountryCode) {
      const targetCountry = countries[targetCountryCode]
      
      // Map to the target country's page based on detected page type
      if (pageType && targetCountry.seoPaths[pageType]) {
        return {
          ...lang,
          path: targetCountry.seoPaths[pageType]
        }
      }
      
      // Fallback: use order page
      return {
        ...lang,
        path: targetCountry.seoPaths.order
      }
    }
    
    // For other pages (shop, checkout, etc.), just change the language prefix
    // Remove current language prefix and add new one
    const pathWithoutLang = pathname.replace(new RegExp(`^/(${languageCodes})`), '') || '/'
    return {
      ...lang,
      path: `/${lang.code}${pathWithoutLang}`
    }
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Check if we're on the home page
  const isHomePage = pathname === '/' || pathname === ''

  // Home button text based on language
  const homeTexts: Record<string, string> = {
    en: 'Home',
    es: 'Inicio',
    pt: 'Início',
    fr: 'Accueil',
    de: 'Startseite',
    nl: 'Home',
    da: 'Hjem',
    sv: 'Hem',
    fi: 'Koti',
    no: 'Hjem',
  }
  const homeText = homeTexts[currentLangCode] || 'Home'

  return (
    <div className={styles.headerContainer}>
      {!isHomePage && (
        <Link href="/" className={styles.homeButton}>
          <span className={styles.homeIcon}>🏠</span>
          <span className={styles.homeText}>{homeText}</span>
        </Link>
      )}
      <CartIcon />
      <div className={styles.languageSelector} ref={dropdownRef}>
        <button
          className={styles.trigger}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <span className={styles.currentLang}>{currentLang.displayCode}</span>
          <span className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}>▼</span>
        </button>
        
        {isOpen && (
          <div className={styles.dropdown}>
            {languagePaths.map((lang) => (
              <Link
                key={lang.code}
                href={lang.path}
                className={`${styles.langOption} ${currentLangCode === lang.code ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <span className={styles.langCode}>{lang.displayCode}</span>
                <span className={styles.langName}>{lang.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
