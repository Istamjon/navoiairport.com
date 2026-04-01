'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

const DICTIONARY = {
  uz: {
    placeholder: 'Nimani qidiryapsiz? Yorliq, xabar yoki parvozni kiriting...',
    close: 'Yopish',
  },
  ru: {
    placeholder: 'Что вы ищете? Введите тег, новость или рейс...',
    close: 'Закрыть',
  },
  en: {
    placeholder: 'What are you looking for? Enter a tag, news or flight...',
    close: 'Close',
  },
  zh: {
    placeholder: '您在寻找什么？输入标签，新闻或航班...',
    close: '关闭',
  },
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [lang, setLang] = useState<keyof typeof DICTIONARY>('uz')
  const [mounted, setMounted] = useState(false)
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const match = document.cookie.match(/(^| )payload-locale=([^;]+)/)
    if (match && match[2] && Object.keys(DICTIONARY).includes(match[2])) {
      setLang(match[2] as keyof typeof DICTIONARY)
    } else {
      const htmlLang = document.documentElement.lang
      if (htmlLang && Object.keys(DICTIONARY).includes(htmlLang)) {
        setLang(htmlLang as keyof typeof DICTIONARY)
      }
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      document.body.style.overflow = 'auto'
      setValue('')
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value.trim())}`)
      onClose()
    }
  }

  const t = DICTIONARY[lang]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 sm:px-6 bg-background/80 backdrop-blur-md"
        >
          {/* Overlay Click to Close */}
          <div className="absolute inset-0 z-0" onClick={onClose} />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-3xl relative z-10"
          >
            <form onSubmit={handleSubmit} className="relative group flex items-center bg-transparent">
              <div className="absolute left-6 text-foreground/50 transition-colors group-focus-within:text-foreground">
                <Search className="w-8 h-8" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={mounted ? t.placeholder : DICTIONARY.uz.placeholder}
                className="w-full h-24 pl-20 pr-16 text-2xl md:text-3xl bg-transparent border-none shadow-none focus-visible:ring-0 focus:outline-none placeholder:text-foreground/30 text-foreground tracking-tight"
                autoComplete="off"
                spellCheck="false"
              />
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 p-2 text-foreground/50 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors"
                aria-label={mounted ? t.close : DICTIONARY.uz.close}
              >
                <X className="w-8 h-8" />
              </button>
            </form>
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-[1px] bg-foreground/10"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
