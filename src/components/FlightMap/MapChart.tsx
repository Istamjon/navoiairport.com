'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { useLocale } from '@/providers/Locale/useLocale'
import type { LocaleCode } from '@/providers/Locale/config'

const LOADING: Record<LocaleCode, string> = {
  uz: 'Xarita yuklanmoqda...',
  ru: 'Загрузка карты...',
  en: 'Loading map...',
  zh: '地图加载中...',
}

const MapLoading: React.FC = () => {
  const { locale } = useLocale()
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/20 text-muted-foreground">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="font-medium animate-pulse">{LOADING[locale] ?? LOADING.uz}</p>
    </div>
  )
}

// Render empty space until client loads it (to avoid SSR errors with amCharts)
const MapChartComponent = dynamic(() => import('./MapChartComponent'), {
  ssr: false,
  loading: () => <MapLoading />,
})

export default function MapChart() {
  return <MapChartComponent />
}
