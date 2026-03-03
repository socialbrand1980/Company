"use client"

import React, { useState, useRef } from "react"
import { Share2, Link as LinkIcon, MessageCircle, Instagram, Copy, Download, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ShareModalProps {
  title: string
  excerpt: string
  url?: string
}

export function ShareModal({ title, excerpt, url }: ShareModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareStep, setShareStep] = useState<'options' | 'instagram'>('options')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setIsOpen(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Share to WhatsApp Chat
  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `Check out this article:\n\n"${title}"\n\n${excerpt}\n\nRead more: ${shareUrl}`
    )
    const waUrl = `https://wa.me/?text=${message}`
    window.open(waUrl, '_blank')
  }

  // Generate image for Instagram Story
  const generateInstagramImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 1080
    canvas.height = 1920

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1920)
    gradient.addColorStop(0, '#0f0f0f')
    gradient.addColorStop(1, '#1a1a2e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1080, 1920)

    // Add neon accent
    ctx.fillStyle = 'rgba(45, 117, 255, 0.1)'
    ctx.beginPath()
    ctx.arc(800, 400, 400, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'rgba(255, 0, 128, 0.1)'
    ctx.beginPath()
    ctx.arc(280, 1400, 300, 0, Math.PI * 2)
    ctx.fill()

    // Title
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 72px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Word wrap for title
    const words = title.split(' ')
    let line = ''
    let lines = []
    let y = 960

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width
      if (testWidth > 900 && n > 0) {
        lines.push(line)
        line = words[n] + ' '
      } else {
        line = testLine
      }
    }
    lines.push(line)

    // Center lines vertically
    const lineHeight = 90
    const totalHeight = lines.length * lineHeight
    let startY = y - (totalHeight / 2) + (lineHeight / 2)

    lines.forEach((l, i) => {
      ctx.fillText(l.trim(), 540, startY + (i * lineHeight))
    })

    // Website URL at bottom
    ctx.fillStyle = '#666666'
    ctx.font = '48px Arial'
    ctx.fillText('socialbrand1980.github.io', 540, 1750)

    // Logo/Brand
    ctx.fillStyle = '#2D75FF'
    ctx.font = 'bold 56px Arial'
    ctx.fillText('SocialBrand 1980', 540, 200)

    return canvas.toDataURL('image/png')
  }

  // Download for Instagram
  const handleInstagramShare = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const imageUrl = generateInstagramImage()
    if (!imageUrl) return

    // Create download link
    const link = document.createElement('a')
    link.download = `article-${title.slice(0, 30).replace(/[^a-z0-9]/gi, '-')}.png`
    link.href = imageUrl
    link.click()

    setShareStep('options')
    setIsOpen(false)
  }

  // WhatsApp Status instructions
  const handleWhatsAppStatus = () => {
    handleCopyLink()
    alert('Link copied! Now:\n\n1. Open WhatsApp\n2. Go to Status tab\n3. Tap "My Status"\n4. Paste the link\n5. Add your message')
  }

  return (
    <>
      {/* Share Button */}
      <Button
        onClick={() => {
          setIsOpen(true)
          setShareStep('options')
        }}
        variant="outline"
        size="sm"
        className="neon-border bg-transparent gap-2"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      {/* Share Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">Share Article</h3>
              <button
                onClick={() => {
                  setIsOpen(false)
                  setShareStep('options')
                }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {shareStep === 'options' ? (
              <div className="space-y-3">
                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="w-full p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all text-left group flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {copied ? (
                      <Check className="h-6 w-6 text-green-500" />
                    ) : (
                      <LinkIcon className="h-6 w-6 text-blue-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {copied ? 'Copied!' : 'Copy Link'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {copied ? 'Link copied to clipboard' : 'Copy URL to clipboard'}
                    </p>
                  </div>
                </button>

                {/* WhatsApp Chat */}
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full p-4 rounded-xl border border-border/50 hover:border-green-500/50 hover:bg-green-500/10 transition-all text-left group flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">WhatsApp Chat</h4>
                    <p className="text-xs text-muted-foreground">
                      Share to contacts via WhatsApp
                    </p>
                  </div>
                </button>

                {/* Instagram Story */}
                <button
                  onClick={() => setShareStep('instagram')}
                  className="w-full p-4 rounded-xl border border-border/50 hover:border-pink-500/50 hover:bg-pink-500/10 transition-all text-left group flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Instagram className="h-6 w-6 text-pink-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Instagram Story</h4>
                    <p className="text-xs text-muted-foreground">
                      Download image for IG Story
                    </p>
                  </div>
                </button>

                {/* WhatsApp Status */}
                <button
                  onClick={handleWhatsAppStatus}
                  className="w-full p-4 rounded-xl border border-border/50 hover:border-green-500/50 hover:bg-green-500/10 transition-all text-left group flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">WhatsApp Status</h4>
                    <p className="text-xs text-muted-foreground">
                      Copy link for WA Status
                    </p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="font-semibold text-foreground mb-2">Instagram Story</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download this image and upload to your Instagram Story
                  </p>
                </div>

                {/* Hidden canvas for image generation */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Preview */}
                <div className="aspect-[9/16] rounded-lg overflow-hidden border border-border/50 bg-black relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <h2 className="text-3xl font-bold text-white text-center">
                      {title}
                    </h2>
                  </div>
                  <div className="absolute bottom-8 left-0 right-0 text-center">
                    <p className="text-pink-500 font-semibold">SocialBrand 1980</p>
                    <p className="text-gray-500 text-sm">socialbrand1980.github.io</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShareStep('options')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleInstagramShare}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  After downloading, open Instagram → Your Story → Add this image
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </>
  )
}
