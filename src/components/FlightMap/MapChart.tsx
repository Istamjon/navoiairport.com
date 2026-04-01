'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { getLocaleFromCookie } from './getLocale'

const LOADING: Record<string, string> = {
  uz: 'Xarita yuklanmoqda...',
  ru: 'Загрузка карты...',
  en: 'Loading map...',
  zh: '地图加载中...',
}

function getLoadingText(): string {
  const locale = getLocaleFromCookie()
  return LOADING[locale] ?? LOADING['uz']
}

// Render empty space until client loads it (to avoid SSR errors with amCharts)
const MapChartComponent = dynamic(() => import('./MapChartComponent'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/20 text-muted-foreground">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="font-medium animate-pulse">{getLoadingText()}</p>
    </div>
  ),
})

export default function MapChart() {
  return <MapChartComponent />
}
