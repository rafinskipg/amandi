'use client'

import { useState, useEffect } from 'react'
import styles from './CookieConsent.module.css'

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null)

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
        <div className={styles.text}>
          <h3 className={styles.title}>🍪 Cookie Consent</h3>
          <p className={styles.description}>
            We use cookies to improve your experience, analyze site traffic, and for marketing purposes. 
            By clicking "Accept All", you consent to our use of cookies. You can also choose to reject non-essential cookies.
          </p>
        </div>
        <div className={styles.buttons}>
          <button onClick={handleReject} className={styles.rejectButton}>
            Reject
          </button>
          <button onClick={handleAccept} className={styles.acceptButton}>
            Accept All
          </button>
        </div>
      </div>
    </div>
  )
}

