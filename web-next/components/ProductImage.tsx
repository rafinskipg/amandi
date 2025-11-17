'use client'

import { useState } from 'react'
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

  if (imageError) {
    return (
      <div className={`${styles.fallback} ${className}`}>
        <span className={styles.fallbackIcon}>{fallbackIcon}</span>
      </div>
    )
  }

  const imageStyle = fill 
    ? { width: '100%', height: '100%', objectFit: 'cover' as const }
    : undefined

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`${styles.image} ${className} ${imageLoaded ? styles.loaded : ''}`}
        onError={() => setImageError(true)}
        onLoad={() => setImageLoaded(true)}
        style={imageStyle}
      />
      {!imageLoaded && !imageError && (
        <div className={`${styles.loading} ${className}`}>
          <span className={styles.loadingSpinner}>⏳</span>
        </div>
      )}
    </>
  )
}

