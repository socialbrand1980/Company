"use client"

import React, { useState } from "react"
import { Bell, Mail, MessageCircle, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SubscriptionFormProps {
  articleTitle?: string
  articleSlug?: string
}

export function SubscriptionForm({ articleTitle, articleSlug }: SubscriptionFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<'select' | 'whatsapp' | 'email' | 'success'>('select')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subscribeToUpdates: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleWhatsAppSubscribe = () => {
    if (!formData.phone) {
      setError('Please enter your WhatsApp number')
      return
    }

    // Format phone number
    const phone = formData.phone.replace(/\D/g, '')
    
    // Create WhatsApp message
    const message = encodeURIComponent(
      `Hi SocialBrand1980! I want to subscribe to article updates.\n\n` +
      `Name: ${formData.name}\n` +
      `Phone: ${formData.phone}\n` +
      `Article: ${articleTitle || 'All Articles'}\n\n` +
      `Please notify me when new articles are published! 📰`
    )

    // Open WhatsApp
    const waUrl = `https://wa.me/62811198093?text=${message}`
    window.open(waUrl, '_blank')
    
    setStep('success')
  }

  const handleEmailSubscribe = async () => {
    if (!formData.name || !formData.email) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Option 1: Use Formspree (free, no backend needed)
      // Register at https://formspree.io/ and replace the URL
      const formspreeUrl = 'https://formspree.io/f/YOUR_FORMSPREE_ID'
      
      const response = await fetch(formspreeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          article: articleTitle || 'All Articles',
          slug: articleSlug,
          type: 'article_subscription',
        }),
      })

      if (response.ok) {
        setStep('success')
      } else {
        setError('Failed to subscribe. Please try again.')
      }
    } catch (err) {
      console.error('Subscription error:', err)
      setError('Failed to subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep('select')
    setFormData({
      name: '',
      email: '',
      phone: '',
      subscribeToUpdates: true,
    })
    setError('')
    setIsOpen(false)
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Successfully Subscribed! 🎉</h3>
          <p className="text-muted-foreground mb-6">
            You'll receive notifications when we publish new articles.
          </p>
          <Button onClick={resetForm} className="neon-btn text-white">
            Done
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Subscribe Button */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="neon-border bg-transparent gap-2"
      >
        <Bell className="h-4 w-4" />
        Subscribe
      </Button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Get Notified</h3>
                  <p className="text-xs text-muted-foreground">
                    Be the first to read new articles
                  </p>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Step Selection */}
            {step === 'select' && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Choose how you want to receive notifications:
                </p>

                <button
                  onClick={() => setStep('whatsapp')}
                  className="w-full p-4 rounded-xl border border-border/50 hover:border-green-500/50 hover:bg-green-500/10 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MessageCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">WhatsApp</h4>
                      <p className="text-xs text-muted-foreground">
                        Get instant notifications via WhatsApp
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setStep('email')}
                  className="w-full p-4 rounded-xl border border-border/50 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mail className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Email</h4>
                      <p className="text-xs text-muted-foreground">
                        Receive newsletter and updates via email
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* WhatsApp Form */}
            {step === 'whatsapp' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground"
                    placeholder="08123456789"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Include country code (e.g., 62 for Indonesia)
                  </p>
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep('select')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleWhatsAppSubscribe}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Subscribe via WA
                  </Button>
                </div>
              </div>
            )}

            {/* Email Form */}
            {step === 'email' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    WhatsApp Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground"
                    placeholder="08123456789"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep('select')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleEmailSubscribe}
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? 'Subscribing...' : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Subscribe
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
