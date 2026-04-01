'use client'

import React, { useLayoutEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

export default function MapChartComponent() {
  const chartDivRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<any>(null) // Track root to prevent multiple instances
  const { resolvedTheme } = useTheme()

  useLayoutEffect(() => {
    const el = chartDivRef.current
    if (!el || !(el instanceof Element)) return

    // Dispose any existing root on this element before creating a new one
    if (rootRef.current) {
      rootRef.current.dispose()
      rootRef.current = null
    }

    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []

    const initChart = async () => {
      // All async guards + another check after awaits
      if (cancelled) return
      if (!chartDivRef.current || !(chartDivRef.current instanceof Element)) return

      const am5 = await import('@amcharts/amcharts5')
      const am5map = await import('@amcharts/amcharts5/map')
      const geodataModule = await import('@amcharts/amcharts5-geodata/worldLow')
      const am5themes_Animated = await import('@amcharts/amcharts5/themes/Animated')
      const am5themes_Dark = await import('@amcharts/amcharts5/themes/Dark')

      if (cancelled) return
      if (!chartDivRef.current || !(chartDivRef.current instanceof Element)) return

      // Dispose again if something created a root in the meantime
      if (rootRef.current) {
        rootRef.current.dispose()
        rootRef.current = null
      }

      const root = am5.Root.new(chartDivRef.current)
      rootRef.current = root

      const themes: any[] = [am5themes_Animated.default.new(root)]
      if (resolvedTheme === 'dark') themes.push(am5themes_Dark.default.new(root))
      root.setThemes(themes)

      const chart = root.container.children.push(
        am5map.MapChart.new(root, {
          projection: am5map.geoMercator(),
          homeZoomLevel: 5,
          homeGeoPoint: { latitude: 40, longitude: 55 },
          panX: 'translateX',
          panY: 'translateY',
          wheelX: 'zoom',
          wheelY: 'zoom',
          pinchZoom: true,
          minZoomLevel: 1,
          maxZoomLevel: 24,
        }),
      )

      const zoomControl = am5map.ZoomControl.new(root, {
        paddingBottom: 20,
        paddingRight: 20,
      })
      zoomControl.homeButton.set('visible', true)
      chart.set('zoomControl', zoomControl)

      chart.chartContainer.set('wheelable', true)

      const polygonSeries = chart.series.push(
        am5map.MapPolygonSeries.new(root, {
          geoJSON: geodataModule.default as any,
          exclude: ['AQ'],
        }),
      )

      const isDark = resolvedTheme === 'dark'
      polygonSeries.mapPolygons.template.setAll({
        tooltipText: '{name}',
        fill: am5.color(isDark ? 0x1e3a5f : 0xdfe8f5),
        stroke: am5.color(isDark ? 0x2d4a6e : 0xffffff),
        strokeWidth: 0.5,
        nonScalingStroke: true,
      })
      polygonSeries.mapPolygons.template.states.create('hover', {
        fill: am5.color(0x3d7dd9),
        fillOpacity: 0.8,
      })

      // Hub (single point) and destinations (separate list)
      const hub = { latitude: 40.11778, longitude: 65.175, title: 'Navoiy (NVI)' }
      const destinations = [
        { latitude: 41.26465, longitude: 69.21627, title: 'Toshkent' },
        { latitude: 30.29365, longitude: 120.16142, title: 'Hangzhou' },
        { latitude: 52.48142, longitude: -1.89983, title: 'Birmingham' },
        { latitude: 41.16343, longitude: 28.76644, title: 'Istanbul' },
        { latitude: 22.396428, longitude: 114.109497, title: 'Hong Kong' },
        { latitude: 55.5915, longitude: 37.2615, title: 'Moskva (Vnukovo)' },
        { latitude: 30.66667, longitude: 104.06667, title: 'Chengdu' },
      ]

      // Hub point series (single, prominent)
      const hubSeries = chart.series.push(am5map.MapPointSeries.new(root, {}))
      hubSeries.bullets.push(function () {
        const circle = am5.Circle.new(root, {
          radius: 11,
          fill: am5.color(0x0d5bd7),
          stroke: am5.color(0xffffff),
          strokeWidth: 3,
          tooltipText: hub.title,
        })
        circle.states.create('hover', { scale: 1.3 })
        return am5.Bullet.new(root, { sprite: circle })
      })
      const hubPoint = hubSeries.pushDataItem({ latitude: hub.latitude, longitude: hub.longitude })

      // Destination point series (interactive — click to zoom)
      const citySeries = chart.series.push(am5map.MapPointSeries.new(root, {}))
      citySeries.bullets.push(function (_r: any, _s: any, dataItem: any) {
        const data = dataItem.dataContext || {}
        const circle = am5.Circle.new(root, {
          radius: 7,
          fill: am5.color(isDark ? 0x5eaaff : 0x1f6feb),
          stroke: am5.color(0xffffff),
          strokeWidth: 2,
          tooltipText: data.title || '',
          cursorOverStyle: 'pointer',
        })
        circle.states.create('hover', { scale: 1.4, fill: am5.color(0x4a9eff) })
        circle.events.on('click', () => {
          chart.zoomToGeoPoint(
            { latitude: dataItem.get('latitude'), longitude: dataItem.get('longitude') },
            6,
            true,
          )
        })
        return am5.Bullet.new(root, { sprite: circle })
      })

      // ── Flight Lines ──
      const departureLineSeries = chart.series.push(am5map.MapLineSeries.new(root, {}))
      departureLineSeries.mapLines.template.setAll({
        strokeWidth: 2,
        strokeOpacity: 0.8,
        stroke: am5.color(isDark ? 0x5eaaff : 0x1a6dff),
        nonScalingStroke: true,
      })

      const returnLineSeries = chart.series.push(am5map.MapLineSeries.new(root, {}))
      returnLineSeries.mapLines.template.setAll({
        strokeWidth: 1.2,
        strokeOpacity: 0.45,
        stroke: am5.color(isDark ? 0x4ade80 : 0x16a34a),
        nonScalingStroke: true,
        strokeDasharray: [6, 4],
      })

      // ── Plane icons (only on departure lines — keeps map clean) ──
      const planeSeries = chart.series.push(am5map.MapPointSeries.new(root, {}))
      planeSeries.bullets.push(function () {
        const plane = am5.Graphics.new(root, {
          svgPath:
            'm2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47',
          scale: 0.055,
          centerY: am5.p50,
          centerX: am5.p50,
          fill: am5.color(isDark ? 0x93c5fd : 0x1e40af),
        })
        const container = am5.Container.new(root, {})
        container.children.push(plane)
        return am5.Bullet.new(root, { sprite: container })
      })

      function addDestination(p: { latitude: number; longitude: number; title: string }) {
        const item = citySeries.pushDataItem({ latitude: p.latitude, longitude: p.longitude })
        ;(item as any).dataContext = { title: p.title }
        return item
      }

      function addLine(from: any, to: any, series: any) {
        return series.pushDataItem({
          pointsToConnect: [from, to],
        })
      }

      function dist(
        a: { latitude: number; longitude: number },
        b: { latitude: number; longitude: number },
      ) {
        return Math.sqrt(
          Math.pow(a.latitude - b.latitude, 2) + Math.pow(a.longitude - b.longitude, 2),
        )
      }

      for (const dest of destinations) {
        const destPoint = addDestination(dest)
        const flightDuration = 140 * dist(hub, dest)

        // Departure: Navoiy → Destination (solid blue)
        const departureLine = addLine(hubPoint, destPoint, departureLineSeries)
        const departurePlane = planeSeries.pushDataItem({
          lineDataItem: departureLine,
          positionOnLine: 0,
          autoRotate: true,
        })
        departurePlane.animate({
          key: 'positionOnLine',
          to: 1,
          duration: flightDuration,
          loops: Infinity,
          easing: am5.ease.linear,
        })

        // Return: Destination → Navoiy (dashed green, no plane)
        addLine(destPoint, hubPoint, returnLineSeries)
      }

      // ── Legend ──
      const legendContainer = chart.children.push(
        am5.Container.new(root, {
          x: am5.percent(0),
          y: am5.percent(100),
          centerX: am5.percent(0),
          centerY: am5.percent(100),
          paddingLeft: 14,
          paddingBottom: 14,
          layout: root.verticalLayout,
        }),
      )

      function addLegendItem(label: string, color: number, dashed: boolean) {
        const row = legendContainer.children.push(
          am5.Container.new(root, { layout: root.horizontalLayout, paddingBottom: 4 }),
        )
        row.children.push(
          am5.Graphics.new(root, {
            stroke: am5.color(color),
            strokeWidth: dashed ? 1.5 : 2.5,
            strokeDasharray: dashed ? [5, 3] : [],
            draw: (display: any) => {
              display.moveTo(0, 0)
              display.lineTo(24, 0)
            },
            centerY: am5.p50,
          }),
        )
        row.children.push(
          am5.Label.new(root, {
            text: label,
            fontSize: 11,
            paddingLeft: 6,
            centerY: am5.p50,
            fill: am5.color(isDark ? 0xd1d5db : 0x374151),
          }),
        )
      }

      addLegendItem('Uchib ketish', isDark ? 0x5eaaff : 0x1a6dff, false)
      addLegendItem('Qaytish', isDark ? 0x4ade80 : 0x16a34a, true)

      chart.appear(1000, 100)

      // Force zoom to route area after map polygons are rendered
      polygonSeries.events.once('datavalidated', () => {
        chart.zoomToGeoPoint({ latitude: 40, longitude: 55 }, 5, true)
      })
    }

    initChart()

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      if (rootRef.current) {
        rootRef.current.dispose()
        rootRef.current = null
      }
    }
    // Only re-run when resolvedTheme changes, NOT on every render
  }, [resolvedTheme])

  return (
    <div
      ref={chartDivRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  )
}
