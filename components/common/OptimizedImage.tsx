'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ImageProps } from 'next/image'

interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string
  enableBlur?: boolean
  className?: string
  onError?: () => void
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fallbackSrc = '/icon-192.png',
  enableBlur = true,
  className = '',
  onError,
  priority = false,
  quality = 75,
  ...props
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [imageError, setImageError] = useState(false)

  const handleError = () => {
    if (!imageError) {
      setImageError(true)
      setImageSrc(fallbackSrc)
      onError?.()
    }
  }

  const blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      quality={quality}
      placeholder={enableBlur ? "blur" : "empty"}
      blurDataURL={enableBlur ? blurDataURL : undefined}
      onError={handleError}
      className={className}
      {...props}
    />
  )
} 