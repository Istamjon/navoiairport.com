'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter } from 'next/navigation'
import { Search as SearchIcon } from 'lucide-react'
import { motion } from 'framer-motion'

const DICTIONARY = {
  uz: { placeholder: 'Nimani qidiryapsiz? Yorliq, xabar yoki parvozni kiriting...' },
  ru: { placeholder: 'Что вы ищете? Введите тег, новость или рейс...' },
  en: { placeholder: 'What are you looking for? Enter a tag, news or flight...' },
  zh: { placeholder: '您在寻找什么？输入标签，新闻或航班...' },
}

export const Search: React.FC = () => {
  const [value, setValue] = useState('')
  const [lang, setLang] = useState<keyof typeof DICTIONARY>('uz')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  const debouncedValue = useDebounce(value, 300)

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
    router.push(`/search${debouncedValue ? `?q=${debouncedValue}` : ''}`)
  }, [debouncedValue, router])

  const t = DICTIONARY[lang]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-3xl mx-auto"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
        className="relative group w-full"
      >
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        
        <div className="relative flex items-center border-b border-foreground/20 focus-within:border-primary transition-all duration-300 overflow-hidden">
          <div className="flex items-center justify-center text-muted-foreground group-focus-within:text-primary transition-colors pr-2">
            <SearchIcon className="w-8 h-8" />
          </div>
          
          <Input
            id="search"
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
            }}
            placeholder={mounted ? t.placeholder : DICTIONARY.uz.placeholder}
            className="w-full h-16 pl-0 pr-6 text-xl md:text-2xl bg-transparent border-none shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50 rounded-none tracking-tight"
            autoComplete="off"
            spellCheck="false"
          />
        </div>
        
        <button type="submit" className="sr-only">
          Izlash
        </button>
      </form>
    </motion.div>
  )
}
