import type { Metadata } from 'next'
import { TwilightRoom } from '@/components/twilight/TwilightRoom'

export const metadata: Metadata = {
  title: '黄昏の対話室 | CLAFT',
  description: 'キャラクターAIとの感情を持った没入型対話空間',
}

export default function TwilightPage() {
  return <TwilightRoom />
}
