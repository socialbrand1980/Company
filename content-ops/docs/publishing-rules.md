# Publishing Rules

## Publishing Mode
Always create documents in Sanity as drafts first.
Do not auto-publish directly.
Exception: an approved automation may publish directly only after the generated batch passes an explicit quality review gate.

## Existing Project Schema
This project already uses the `article` document type and the frontend reads from the `content` field.
Generated drafts must match that structure.

## Required Fields
Each generated article draft should include:

- _type
- title
- slug
- excerpt
- seoDescription
- content
- category
- language
- author
- status
- publishedAt
- readTime

## Status Convention
Use:

- `draft` for the Sanity draft document
- `readyForReview` for generated JSON that is complete and ready for a human pass
- `published` only after manual approval
- `published` may also be used by the daily automation after automated quality review passes and direct publish mode is explicitly enabled

## Review Notes
The generated article should be easy to review in Sanity Studio.
Keep formatting clean and simple.
Do not publish if the article feels generic, repetitive, thin, or weak in the first two paragraphs.
