'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import styles from './CookieConsent.module.css'

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

type SupportedLanguage = 'es' | 'en' | 'pt' | 'fr' | 'de' | 'nl' | 'da' | 'sv' | 'fi' | 'no'

const translations: Record<SupportedLanguage, { title: string; description: string; accept: string; reject: string }> = {
  es: {
    title: '🥑 Consentimiento de Cookies',
    description: 'Usamos cookies para mejorar tu experiencia, analizar el tráfico del sitio y para fines de marketing. Al hacer clic en "Aceptar todas", consientes nuestro uso de cookies. También puedes rechazar las cookies no esenciales.',
    accept: 'Aceptar todas',
    reject: 'Rechazar',
  },
  en: {
    title: '🥑 Cookie Consent',
    description: 'We use cookies to improve your experience, analyze site traffic, and for marketing purposes. By clicking "Accept All", you consent to our use of cookies. You can also choose to reject non-essential cookies.',
    accept: 'Accept All',
    reject: 'Reject',
  },
  pt: {
    title: '🥑 Consentimento de Cookies',
    description: 'Usamos cookies para melhorar a sua experiência, analisar o tráfego do site e para fins de marketing. Ao clicar em "Aceitar todas", consente no nosso uso de cookies. Também pode optar por rejeitar cookies não essenciais.',
    accept: 'Aceitar todas',
    reject: 'Rejeitar',
  },
  fr: {
    title: '🥑 Consentement aux Cookies',
    description: 'Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic du site et à des fins marketing. En cliquant sur "Tout accepter", vous consentez à notre utilisation des cookies. Vous pouvez également choisir de refuser les cookies non essentiels.',
    accept: 'Tout accepter',
    reject: 'Refuser',
  },
  de: {
    title: '🥑 Cookie-Zustimmung',
    description: 'Wir verwenden Cookies, um Ihre Erfahrung zu verbessern, den Website-Traffic zu analysieren und für Marketingzwecke. Durch Klicken auf "Alle akzeptieren" stimmen Sie unserer Verwendung von Cookies zu. Sie können auch wählen, nicht wesentliche Cookies abzulehnen.',
    accept: 'Alle akzeptieren',
    reject: 'Ablehnen',
  },
  nl: {
    title: '🥑 Cookie Toestemming',
    description: 'We gebruiken cookies om uw ervaring te verbeteren, siteverkeer te analyseren en voor marketingdoeleinden. Door op "Alles accepteren" te klikken, stemt u in met ons gebruik van cookies. U kunt er ook voor kiezen om niet-essentiële cookies te weigeren.',
    accept: 'Alles accepteren',
    reject: 'Weigeren',
  },
  da: {
    title: '🥑 Cookie Samtykke',
    description: 'Vi bruger cookies til at forbedre din oplevelse, analysere webstedstrafik og til marketingformål. Ved at klikke på "Acceptér alle" giver du samtykke til vores brug af cookies. Du kan også vælge at afvise ikke-essentielle cookies.',
    accept: 'Acceptér alle',
    reject: 'Afvis',
  },
  sv: {
    title: '🥑 Cookie Medgivande',
    description: 'Vi använder cookies för att förbättra din upplevelse, analysera webbplatsens trafik och för marknadsföringssyften. Genom att klicka på "Acceptera alla" samtycker du till vår användning av cookies. Du kan också välja att avvisa icke-essentiella cookies.',
    accept: 'Acceptera alla',
    reject: 'Avvisa',
  },
  fi: {
    title: '🥑 Eväste Suostumus',
    description: 'Käytämme evästeitä parantaaksemme kokemustasi, analysoimalla sivuston liikennettä ja markkinointitarkoituksiin. Klikkaamalla "Hyväksy kaikki" annat suostumuksesi evästeiden käyttöömme. Voit myös valita hylätä ei-olennaiset evästeet.',
    accept: 'Hyväksy kaikki',
    reject: 'Hylkää',
  },
  no: {
    title: '🥑 Cookie Samtykke',
    description: 'Vi bruker informasjonskapsler for å forbedre opplevelsen din, analysere nettstedstrafikk og for markedsføringsformål. Ved å klikke på "Godta alle" samtykker du til vår bruk av informasjonskapsler. Du kan også velge å avvise ikke-essensielle informasjonskapsler.',
    accept: 'Godta alle',
    reject: 'Avvis',
  },
}

export default function CookieConsent() {
  const pathname = usePathname()
  const [showBanner, setShowBanner] = useState(false)
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null)

  // Detect language from pathname
  const langMatch = pathname.match(/^\/(es|en|pt|fr|de|nl|da|sv|fi|no)/)
  const lang: SupportedLanguage = (langMatch ? langMatch[1] : 'en') as SupportedLanguage
  const t = translations[lang]

  useEffect(() => {
    // Check if consent was already given
    if (typeof window !== 'undefined') {
      const savedConsent = localStorage.getItem('amandi-cookie-consent')
      if (savedConsent === 'accepted') {
        setConsentGiven(true)
        setShowBanner(false)
        // Initialize Google Tag with consent
        initializeGoogleTag(true)
      } else if (savedConsent === 'rejected') {
        setConsentGiven(false)
        setShowBanner(false)
        // Initialize Google Tag without consent
        initializeGoogleTag(false)
      } else {
        // Show banner if no consent decision has been made
        setShowBanner(true)
        // Initialize Google Tag in denied mode until consent
        initializeGoogleTag(false)
      }
    }
  }, [])

  const initializeGoogleTag = (hasConsent: boolean) => {
    if (typeof window !== 'undefined') {
      // Initialize dataLayer if it doesn't exist
      window.dataLayer = window.dataLayer || []
      
      // Define gtag function
      window.gtag = function(...args: any[]) {
        window.dataLayer.push(args)
      }

      // Set consent mode
      window.gtag('consent', 'default', {
        'ad_storage': hasConsent ? 'granted' : 'denied',
        'ad_user_data': hasConsent ? 'granted' : 'denied',
        'ad_personalization': hasConsent ? 'granted' : 'denied',
        'analytics_storage': hasConsent ? 'granted' : 'denied',
        'functionality_storage': 'granted',
        'personalization_storage': hasConsent ? 'granted' : 'denied',
        'security_storage': 'granted',
      })

      // Only load Google Tag if consent is given
      if (hasConsent) {
        // Load Google Tag script
        const script = document.createElement('script')
        script.async = true
        script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-17745765655'
        document.head.appendChild(script)

        script.onload = () => {
          window.gtag('js', new Date())
          window.gtag('config', 'AW-17745765655', {
            'ad_storage': 'granted',
            'ad_user_data': 'granted',
            'ad_personalization': 'granted',
            'analytics_storage': 'granted',
          })
        }
      }
    }
  }

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('amandi-cookie-consent', 'accepted')
      setConsentGiven(true)
      setShowBanner(false)
      initializeGoogleTag(true)
    }
  }

  const handleReject = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('amandi-cookie-consent', 'rejected')
      setConsentGiven(false)
      setShowBanner(false)
      initializeGoogleTag(false)
    }
  }

  if (!showBanner) {
    return null
  }

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <div className={styles.avocadoIcon}>🥑</div>
        <div className={styles.text}>
          <h3 className={styles.title}>{t.title}</h3>
          <p className={styles.description}>{t.description}</p>
        </div>
        <div className={styles.buttons}>
          <button onClick={handleReject} className={styles.rejectButton}>
            {t.reject}
          </button>
          <button onClick={handleAccept} className={styles.acceptButton}>
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  )
}

