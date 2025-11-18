'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TrackOrder from '@/components/TrackOrder'

export default function TrackOrderPage() {
  const params = useParams()
  const router = useRouter()
  const orderNumber = params?.orderNumber as string

  // TrackOrder component will handle the orderNumber from URL
  return <TrackOrder initialOrderNumber={orderNumber} />
}

