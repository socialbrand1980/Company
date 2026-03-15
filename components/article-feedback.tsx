"use client"

import * as React from "react"
import { Loader2, ThumbsDown, ThumbsUp } from "lucide-react"

import { Button } from "@/components/ui/button"

const DISLIKE_REASONS = [
  { value: "too_generic", label: "Terlalu generic" },
  { value: "not_insightful", label: "Kurang insightful" },
  { value: "weak_sources", label: "Source kurang kuat" },
  { value: "less_relevant", label: "Kurang relevan" },
  { value: "awkward_tone", label: "Tone masih canggung" },
] as const

type FeedbackVote = "like" | "dislike"
type FeedbackSummary = {
  likeCount: number
  dislikeCount: number
  reasonBreakdown: Record<string, number>
  userFeedback: {
    vote: FeedbackVote
    reason: string | null
  } | null
}

function getFeedbackSessionId() {
  const storageKey = "article-feedback-session-id"
  const existing = window.localStorage.getItem(storageKey)
  if (existing) {
    return existing
  }

  const nextId = typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`

  window.localStorage.setItem(storageKey, nextId)
  return nextId
}

export function ArticleFeedback({ articleSlug }: { articleSlug: string }) {
  const [sessionId, setSessionId] = React.useState<string | null>(null)
  const [summary, setSummary] = React.useState<FeedbackSummary | null>(null)
  const [pendingVote, setPendingVote] = React.useState<FeedbackVote | null>(null)
  const [selectedReason, setSelectedReason] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    const nextSessionId = getFeedbackSessionId()
    setSessionId(nextSessionId)

    async function fetchSummary() {
      const response = await fetch(`/api/articles/${articleSlug}/feedback?sessionId=${encodeURIComponent(nextSessionId)}`, {
        cache: "no-store",
      })

      if (!response.ok) {
        return
      }

      const data = (await response.json()) as FeedbackSummary
      setSummary(data)
      setPendingVote(data.userFeedback?.vote || null)
      setSelectedReason(data.userFeedback?.reason || null)
    }

    void fetchSummary()
  }, [articleSlug])

  async function submitFeedback(vote: FeedbackVote, reason?: string | null) {
    if (!sessionId) {
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/articles/${articleSlug}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vote,
          reason: reason || null,
          sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error("Feedback request failed")
      }

      const data = (await response.json()) as FeedbackSummary
      setSummary(data)
      setPendingVote(vote)
      setSelectedReason(reason || null)
      setMessage(vote === "like" ? "Feedback positif tersimpan." : "Feedback dislike tersimpan untuk evaluasi artikel berikutnya.")
    } catch (error) {
      console.error("Failed to submit article feedback", error)
      setMessage("Feedback gagal dikirim.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mt-12 rounded-2xl border border-border/60 bg-white/5 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Apakah artikel ini membantu?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Like/dislike akan dipakai untuk menyesuaikan kualitas artikel berikutnya.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant={pendingVote === "like" ? "default" : "outline"}
            size="sm"
            className={pendingVote === "like" ? "text-white" : "bg-transparent"}
            disabled={isSubmitting}
            onClick={() => void submitFeedback("like")}
          >
            {isSubmitting && pendingVote !== "dislike" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
            Like
            <span className="ml-2 text-xs opacity-80">{summary?.likeCount || 0}</span>
          </Button>
          <Button
            type="button"
            variant={pendingVote === "dislike" ? "destructive" : "outline"}
            size="sm"
            disabled={isSubmitting}
            onClick={() => {
              if (pendingVote === "dislike") {
                return
              }
              setPendingVote("dislike")
            }}
          >
            <ThumbsDown className="mr-2 h-4 w-4" />
            Dislike
            <span className="ml-2 text-xs opacity-80">{summary?.dislikeCount || 0}</span>
          </Button>
        </div>
      </div>

      {pendingVote === "dislike" && (
        <div className="mt-4">
          <p className="mb-3 text-sm text-muted-foreground">Apa yang paling perlu dibenahi?</p>
          <div className="flex flex-wrap gap-2">
            {DISLIKE_REASONS.map((reason) => (
              <button
                key={reason.value}
                type="button"
                className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                  selectedReason === reason.value
                    ? "border-red-400 bg-red-500/15 text-red-100"
                    : "border-border/70 bg-transparent text-muted-foreground hover:border-red-400/60 hover:text-foreground"
                }`}
                disabled={isSubmitting}
                onClick={() => void submitFeedback("dislike", reason.value)}
              >
                {reason.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}
    </section>
  )
}
