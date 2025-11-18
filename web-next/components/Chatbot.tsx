'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getTranslations, es } from '@/lib/translations'
import styles from './Chatbot.module.css'

interface ChatbotProps {
  orderNumber?: string
  variant?: 'bubble' | 'box' // bubble for floating, box for inline
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function Chatbot({ orderNumber, variant = 'bubble' }: ChatbotProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(variant === 'box')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Detect language
  const langMatch = pathname.match(/^\/([a-z]{2})/)
  const lang = langMatch ? langMatch[1] : 'en'
  const t = getTranslations(lang)
  const isSpanish = t === es

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Add welcome message when chat opens for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = isSpanish
        ? '¡Hola! 👋 Soy tu asistente de Amandi. ¿En qué puedo ayudarte hoy? Puedo responder preguntas sobre nuestros productos, envíos, tu pedido y nuestra finca.'
        : 'Hello! 👋 I\'m your Amandi assistant. How can I help you today? I can answer questions about our products, shipping, your order, and our farm.'
      
      setMessages([{
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date(),
      }])
    }
  }, [isOpen, messages.length, isSpanish])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    
    // Add user message
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, newUserMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          orderNumber,
          lang,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: isSpanish
          ? 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.'
          : 'Sorry, there was an error processing your message. Please try again.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  if (variant === 'bubble') {
    return (
      <>
        {!isOpen && (
          <button
            className={styles.chatbotBubble}
            onClick={() => setIsOpen(true)}
            aria-label={isSpanish ? 'Abrir chat' : 'Open chat'}
          >
            <span className={styles.avocadoIcon}>🥑</span>
          </button>
        )}
        {isOpen && (
          <div className={styles.chatbotContainer}>
            <div className={styles.chatbotHeader}>
              <div className={styles.chatbotHeaderContent}>
                <span className={styles.avocadoIcon}>🥑</span>
                <span className={styles.chatbotTitle}>
                  {isSpanish ? 'Asistente Amandi' : 'Amandi Assistant'}
                </span>
              </div>
              <button
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label={isSpanish ? 'Cerrar chat' : 'Close chat'}
              >
                ✕
              </button>
            </div>
            <div className={styles.chatbotMessages}>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`${styles.message} ${styles[message.role]}`}
                >
                  <div className={styles.messageContent}>
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className={`${styles.message} ${styles.assistant}`}>
                  <div className={styles.messageContent}>
                    <span className={styles.typingIndicator}>...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className={styles.chatbotInput}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isSpanish ? 'Escribe tu mensaje...' : 'Type your message...'}
                disabled={isLoading}
                className={styles.input}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={styles.sendButton}
              >
                →
              </button>
            </form>
          </div>
        )}
      </>
    )
  }

  // Box variant (for checkout success page)
  return (
    <div className={styles.chatbotBox}>
      <div className={styles.chatbotHeader}>
        <div className={styles.chatbotHeaderContent}>
          <span className={styles.avocadoIcon}>🥑</span>
          <span className={styles.chatbotTitle}>
            {isSpanish ? 'Asistente Amandi' : 'Amandi Assistant'}
          </span>
        </div>
      </div>
      <div className={styles.chatbotMessages}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${styles.message} ${styles[message.role]}`}
          >
            <div className={styles.messageContent}>
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={styles.messageContent}>
              <span className={styles.typingIndicator}>...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className={styles.chatbotInput}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isSpanish ? 'Escribe tu mensaje...' : 'Type your message...'}
          disabled={isLoading}
          className={styles.input}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={styles.sendButton}
        >
          →
        </button>
      </form>
    </div>
  )
}

