import React, { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, useToast, ToastContainer, Input } from '@/components/design-system'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTED_TOPICS = [
  { emoji: '❓', label: 'General Questions', prompt: 'I have questions about my pregnancy...' },
  { emoji: '😟', label: 'Symptom Concerns', prompt: 'I am concerned about my symptoms...' },
  { emoji: '💪', label: 'Wellness Tips', prompt: 'What can I do to stay healthy?' },
  { emoji: '📖', label: 'Trimester Guide', prompt: 'Tell me about my current trimester' },
]

const ASSISTANT_RESPONSES: Record<string, string> = {
  default: 'I understand your concern. This is important information to discuss with your healthcare provider. In the meantime, here\'s what you should know...',
  symptom: 'Thank you for sharing this. Symptoms can vary during pregnancy. Have you had a chance to contact your provider about this?',
  urgent: 'I want to make sure you get the right help. If this is urgent, please reach out to your healthcare provider or emergency services.',
  wellness: 'Great question! Here are some evidence-based wellness recommendations for your trimester...',
}

export default function AIChat() {
  const { toasts, dismissToast } = useToast()

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '👋 Hello! I\'m your Calm Care Companion. I\'m here to help answer questions about your pregnancy in a supportive, non-judgmental way. How can I help you today?',
      timestamp: new Date(),
    },
  ])

  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Simulate assistant response with delay
    setTimeout(() => {
      // Determine response type based on keywords
      let responseType = 'default'
      const lowerText = messageText.toLowerCase()

      if (lowerText.includes('symptom') || lowerText.includes('pain') || lowerText.includes('bleeding') || lowerText.includes('fever')) {
        responseType = 'symptom'
      } else if (lowerText.includes('emergency') || lowerText.includes('urgent') || lowerText.includes('immediately')) {
        responseType = 'urgent'
      } else if (lowerText.includes('exercise') || lowerText.includes('food') || lowerText.includes('sleep') || lowerText.includes('health')) {
        responseType = 'wellness'
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: ASSISTANT_RESPONSES[responseType],
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 800)
  }

  const handleTopicClick = (prompt: string) => {
    setInputValue(prompt)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.3 } },
  }

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  }

  return (
    <>
      <Head>
        <title>Calm Care Companion - NURTURA</title>
      </Head>

      <div className="min-h-screen nurtura-bg flex flex-col pb-24 md:pb-8">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/70 backdrop-blur border-b border-white/70">
          <div className="max-w-2xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-slate-900">💬 Your Care Companion</h1>
              <p className="text-xs md:text-sm text-slate-600 mt-1">Ask me anything about your pregnancy</p>
            </div>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                ← Back
              </Button>
            </Link>
          </div>
        </div>

        {/* Chat Area */}
        <motion.div
          className="flex-1 max-w-2xl mx-auto w-full px-4 md:px-8 py-6 overflow-y-auto"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Messages */}
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  variants={messageVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-900 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-white/70' : 'text-slate-500'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="bg-slate-100 text-slate-900 px-4 py-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-200" />
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce delay-400" />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </motion.div>

        {/* Suggested Topics - Show if no messages yet */}
        {messages.length === 1 && (
          <motion.div
            className="max-w-2xl mx-auto w-full px-4 md:px-8 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <p className="text-xs md:text-sm text-slate-600 font-semibold mb-3">Suggested Topics:</p>
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {SUGGESTED_TOPICS.map(topic => (
                <motion.button
                  key={topic.label}
                  onClick={() => handleTopicClick(topic.prompt)}
                  className="p-3 bg-white rounded-lg border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-xl mb-1">{topic.emoji}</div>
                  <p className="text-xs md:text-sm font-semibold text-slate-900">{topic.label}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto md:left-auto md:right-auto bg-white md:bg-transparent border-t md:border-t-0 border-slate-200 md:border-slate-200 p-4 md:p-0">
          <div className="max-w-2xl mx-auto w-full px-4 md:px-8 md:py-4">
            <div className="flex gap-2">
              <div className="flex-1 flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(inputValue)
                    }
                  }}
                  placeholder="Type your question..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim() || isLoading}
                  variant="primary"
                  size="lg"
                >
                  Send
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-3 text-xs">
              <Link href="/symptom-checker">
                <Button variant="ghost" size="sm" className="text-xs">
                  🩺 Check Symptoms
                </Button>
              </Link>
              <Link href="/emergency">
                <Button variant="ghost" size="sm" className="text-xs">
                  🚨 Emergency
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Safety Disclaimer */}
        <motion.div
          className="max-w-2xl mx-auto w-full px-4 md:px-8 mt-24 md:mt-8 mb-4 p-4 bg-slate-100 rounded-lg border border-slate-200 text-center hidden md:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs text-slate-600">
            ⓘ I provide supportive information, not medical advice. Always consult your healthcare provider with medical concerns.
          </p>
        </motion.div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  )
}

