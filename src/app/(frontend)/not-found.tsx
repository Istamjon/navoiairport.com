'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plane, Home, AlertCircle } from 'lucide-react'

const DICTIONARY = {
  uz: {
    title: 'Kechirasiz, sahifa topilmadi',
    desc: "Siz izlayotgan sahifa o'z manzilini o'zgartirgan yoki butunlay olib tashlangan bo'lishi mumkin. Quyidagi tugma orqali bosh sahifaga qaytishingiz mumkin.",
    btn: 'Bosh sahifaga qaytish',
  },
  ru: {
    title: 'Извините, страница не найдена',
    desc: 'Возможно, страница, которую вы ищете, изменила свой адрес или была полностью удалена. Вы можете вернуться на главную страницу с помощью кнопки ниже.',
    btn: 'Вернуться на главную',
  },
  en: {
    title: 'Sorry, page not found',
    desc: 'The page you are looking for may have changed its address or been completely removed. You can return to the home page using the button below.',
    btn: 'Return to Home',
  },
  zh: {
    title: '抱歉，找不到页面',
    desc: '您寻找的页面可能已更改地址或被完全删除。您可以使用下面的按钮返回主页。',
    btn: '返回首页',
  },
}

export default function NotFound() {
  const [lang, setLang] = useState<keyof typeof DICTIONARY>('uz')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const match = document.cookie.match(/(^| )payload-locale=([^;]+)/)
    if (match && match[2] && Object.keys(DICTIONARY).includes(match[2])) {
      setLang(match[2] as keyof typeof DICTIONARY)
    } else {
      // Fallback to html lang attribute if available
      const htmlLang = document.documentElement.lang
      if (htmlLang && Object.keys(DICTIONARY).includes(htmlLang)) {
        setLang(htmlLang as keyof typeof DICTIONARY)
      }
    }
  }, [])

  const t = DICTIONARY[lang]

  return (
    <div className="relative min-h-[85vh] w-full flex items-center justify-center overflow-hidden bg-[#f5f5f5] dark:bg-background">
      {/* Animated Clouds / Atmospheric Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center items-center">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${150 + i * 50}px`,
              height: `${150 + i * 50}px`,
              background: `radial-gradient(circle at center, hsl(var(--foreground) / ${0.03 - i * 0.005}), transparent 70%)`,
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 20}%`,
              filter: 'blur(3xl)',
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
        {/* Animated Flying Plane */}
        <motion.div
          className="absolute z-0 text-foreground/5 dark:text-foreground/10"
          initial={{ x: '-10vw', y: '10vh', rotate: 15 }}
          animate={{ x: '110vw', y: '-20vh' }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        >
          <Plane className="w-64 h-64 md:w-96 md:h-96" />
        </motion.div>
      </div>

      <div className="container relative z-10 flex flex-col items-center justify-center text-center px-4">
        <motion.div className="relative">
          <h1 className="text-[120px] md:text-[180px] lg:text-[220px] font-black tracking-tighter text-[#0B1E4A] dark:text-foreground leading-none drop-shadow-2xl">
            404
          </h1>
          <motion.div
            className="absolute -top-8 -right-8 md:-top-12 md:-right-12 text-primary"
            animate={{ rotate: 0 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <AlertCircle className="w-16 h-16 md:w-24 md:h-24 opacity-20" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-4 md:mt-8 max-w-lg"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
            {mounted ? t.title : DICTIONARY.uz.title}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-10 leading-relaxed">
            {mounted ? t.desc : DICTIONARY.uz.desc}
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full button-shine focus-visible:ring-4 focus-visible:ring-primary/50 outline-none hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            aria-label={mounted ? t.btn : DICTIONARY.uz.btn}
          >
            <Home className="w-5 h-5" />
            <span>{mounted ? t.btn : DICTIONARY.uz.btn}</span>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
