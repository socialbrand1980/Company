"use client"

import React, { useState } from "react"
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FormData {
  // Brand Information
  brandName: string
  website: string
  industry: string
  targetMarket: string
  yearFounded: string
  teamSize: string
  
  // Business Goals
  primaryGoal: string
  
  // Current Marketing
  runAds: string
  channels: string[]
  
  // Budget & Timeline
  budget: string
  targetAudience: string
  competitors: string
  timeline: string
  
  // Services
  servicesNeeded: string[]
  
  // Contact Information
  fullName: string
  email: string
  phone: string
  role: string
}

const initialData: FormData = {
  brandName: "",
  website: "",
  industry: "",
  targetMarket: "",
  yearFounded: "",
  teamSize: "",
  primaryGoal: "",
  runAds: "",
  channels: [],
  budget: "",
  targetAudience: "",
  competitors: "",
  timeline: "",
  servicesNeeded: [],
  fullName: "",
  email: "",
  phone: "",
  role: ""
}

const industryOptions = [
  "Beauty & Skincare",
  "Fashion",
  "Food & Beverage",
  "Technology",
  "E-commerce",
  "Education",
  "Health & Beauty",
  "Entertainment",
  "Real Estate",
  "Other"
]

const teamSizeOptions = [
  "1-5",
  "6-20",
  "21-50",
  "51-200",
  "200+"
]

const channelOptions = [
  "Meta Ads",
  "Google Ads",
  "TikTok Ads",
  "SEO",
  "Email Marketing",
  "Organic Social Media",
  "None"
]

const budgetOptions = [
  "Rp5.000.000 – Rp15.000.000",
  "Rp15.000.000 – Rp50.000.000",
  "Rp50.000.000 – Rp150.000.000",
  "Rp150.000.000+"
]

const timelineOptions = [
  "Immediately",
  "Within 1 month",
  "1 – 3 months",
  "Just exploring"
]

export function BrandIntakeForm() {
  const [formData, setFormData] = useState<FormData>(initialData)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCheckboxChange = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const current = prev[field] as string[]
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value]
      return { ...prev, [field]: updated }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted with data:', formData)
    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('API Response status:', response.status)
      const result = await response.json()
      console.log('API Response:', result)

      if (response.ok) {
        setSubmitted(true)
        setFormData(initialData)
      } else {
        setError(result.error || 'Failed to submit form. Please try again.')
      }
    } catch (err) {
      console.error('Submission error:', err)
      setError('Failed to submit form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="glass-card rounded-2xl p-8 sm:p-12 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
          Thank You! 🎉
        </h3>
        <p className="text-base sm:text-lg text-muted-foreground mb-6 leading-relaxed">
          Terima kasih telah mengirimkan informasi project Anda.
        </p>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed">
          Tim kami akan mempelajari informasi brand Anda dan menghubungi Anda dalam waktu <strong className="text-primary">24 jam</strong>.
        </p>
        
        <div className="glass-card rounded-xl p-6 max-w-md mx-auto">
          <h4 className="font-semibold text-foreground mb-4">Langkah Selanjutnya:</h4>
          <div className="flex items-center gap-4 text-left">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold">1</span>
            </div>
            <div>
              <p className="font-medium text-foreground">Brand Discovery Call</p>
              <p className="text-sm text-muted-foreground">We'll schedule a call to discuss your brand needs</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 sm:p-12">
      {/* Brand Information */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">1</span>
          Brand Information
        </h3>
        
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Brand Name *</label>
            <input
              type="text"
              value={formData.brandName}
              onChange={(e) => handleInputChange('brandName', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
              placeholder="Your brand name"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Website / URL</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
              placeholder="https://yourbrand.com"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Industry *</label>
            <select
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
              required
            >
              <option value="">Select industry</option>
              {industryOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Target Market *</label>
            <input
              type="text"
              value={formData.targetMarket}
              onChange={(e) => handleInputChange('targetMarket', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
              placeholder="e.g., Indonesia, Southeast Asia"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Year Founded</label>
            <input
              type="text"
              value={formData.yearFounded}
              onChange={(e) => handleInputChange('yearFounded', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
              placeholder="e.g., 2020"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Team Size</label>
            <select
              value={formData.teamSize}
              onChange={(e) => handleInputChange('teamSize', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
            >
              <option value="">Select team size</option>
              {teamSizeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Business Goals */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">2</span>
          Business Goals
        </h3>
        
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Apa tujuan utama marketing Anda? *</label>
          <textarea
            value={formData.primaryGoal}
            onChange={(e) => handleInputChange('primaryGoal', e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors resize-none"
            rows={3}
            placeholder="Contoh: Meningkatkan brand awareness, generate 100 leads per bulan, launch produk baru, dll."
            required
          />
          <p className="text-xs text-muted-foreground mt-2">Jelaskan secara detail tujuan marketing Anda</p>
        </div>
      </div>

      {/* Current Marketing */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">3</span>
          Current Marketing Activity
        </h3>
        
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground mb-3 block">Apakah brand Anda saat ini menjalankan digital advertising? *</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-3 p-4 rounded-lg border border-border/50 hover:border-primary/30 cursor-pointer transition-colors">
              <input
                type="radio"
                name="runAds"
                value="Yes"
                checked={formData.runAds === 'Yes'}
                onChange={(e) => handleInputChange('runAds', e.target.value)}
                className="w-4 h-4 text-primary"
                required
              />
              <span className="text-sm text-foreground">Yes</span>
            </label>
            <label className="flex items-center gap-3 p-4 rounded-lg border border-border/50 hover:border-primary/30 cursor-pointer transition-colors">
              <input
                type="radio"
                name="runAds"
                value="No"
                checked={formData.runAds === 'No'}
                onChange={(e) => handleInputChange('runAds', e.target.value)}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm text-foreground">No</span>
            </label>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-foreground mb-3 block">Current Marketing Channels</label>
          <div className="grid sm:grid-cols-2 gap-3">
            {channelOptions.map(option => (
              <label
                key={option}
                className="flex items-center gap-3 p-4 rounded-lg border border-border/50 hover:border-primary/30 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.channels.includes(option)}
                  onChange={(e) => handleCheckboxChange('channels', option)}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm text-foreground">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Budget & Timeline */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">4</span>
          Budget & Timeline
        </h3>
        
        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Estimated Monthly Marketing Budget *</label>
            <select
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
              required
            >
              <option value="">Select budget range</option>
              {budgetOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Project Timeline *</label>
            <select
              value={formData.timeline}
              onChange={(e) => handleInputChange('timeline', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
              required
            >
              <option value="">Select timeline</option>
              {timelineOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Target Audience</label>
            <textarea
              value={formData.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors resize-none"
              rows={3}
              placeholder="Describe your target audience..."
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Competitors</label>
            <textarea
              value={formData.competitors}
              onChange={(e) => handleInputChange('competitors', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors resize-none"
              rows={3}
              placeholder="Who are your main competitors?"
            />
          </div>
        </div>
      </div>

      {/* Services Needed */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">5</span>
          Services Needed
        </h3>
        
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Layanan yang Anda Butuhkan *</label>
          <textarea
            value={formData.servicesNeeded}
            onChange={(e) => handleInputChange('servicesNeeded', e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors resize-none"
            rows={4}
            placeholder="Contoh:
• Social Media Management untuk Instagram & TikTok
• Content Production (4 reels + 8 feed posts per bulan)
• Paid Ads di Meta & Google
• Influencer Marketing campaign"
            required
          />
          <p className="text-xs text-muted-foreground mt-2">Sebutkan semua layanan yang Anda butuhkan (gunakan bullet points untuk lebih jelas)</p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-10">
        <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">6</span>
          Contact Information
        </h3>
        
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Full Name *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
              placeholder="Your full name"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Company Role *</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
              placeholder="e.g., Founder, Marketing Manager"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Phone / WhatsApp *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-border focus:border-primary focus:outline-none text-foreground transition-colors"
              placeholder="08123456789"
              required
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        size="lg"
        className="w-full neon-btn text-white font-semibold"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            Work With Us
            <ArrowRight className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>
    </form>
  )
}
