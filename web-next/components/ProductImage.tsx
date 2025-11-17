'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './ProductImage.module.css'

interface ProductImageProps {
  src: string
  alt: string
  fallbackIcon?: string
  className?: string
  fill?: boolean
  sizes?: string
}

export default function ProductImage({ 
  src, 
  alt, 
  fallbackIcon = '🥑',
  className = '',
  fill = false,
  sizes
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Check if image is already loaded (cached) when component mounts
  useEffect(() => {
    const img = imgRef.current
    if (img && img.complete && img.naturalHeight !== 0) {
      setImageLoaded(true)
    }
  }, [src])

  if (imageError) {
    return (
      <div className={`${styles.fallback} ${className}`}>
        <span className={styles.fallbackIcon}>{fallbackIcon}</span>
      </div>
    )
  }

  return (
    <div className={`${styles.imageContainer} ${fill ? styles.fill : ''} ${className}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`${styles.image} ${imageLoaded ? styles.loaded : styles.loading}`}
        onError={() => setImageError(true)}
        onLoad={() => setImageLoaded(true)}
      />
      {!imageLoaded && !imageError && (
        <div className={styles.loadingOverlay}>
          <span className={styles.loadingSpinner}>⏳</span>
        </div>
      )}
    </div>
  )
}

