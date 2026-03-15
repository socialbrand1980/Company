# Content Ops for SocialBrand1980

This folder gives Codex a focused workflow for generating Indonesian article drafts that match the SocialBrand1980 brand brief and publishing them into the existing Sanity `article` schema.

## What is adapted for this project

- publishes to `_type: "article"` instead of a generic `post`
- writes to the existing `content` field used by the frontend
- includes required fields already used by the site such as `category`, `author`, `publishedAt`, and `readTime`
- supports the additional editorial fields added to the schema for this workflow: `seoDescription`, `language`, `status`, and `practicalTakeaways`
- supports optional news-analysis metadata through `contentType` and `sourceReferences`
- creates real Sanity drafts using an `_id` with the `drafts.` prefix
- generates a consistent visual brief for article cover images

## Setup

1. Copy `.env.example` to `.env`
2. Fill in the Sanity values
3. Install dependencies:

```bash
cd content-ops
npm install
```

4. Generate a local draft JSON:

```bash
npm run generate
```

Generate 2 drafts with a 1000-word minimum each:

```bash
ARTICLE_COUNT=2 MIN_WORDS=1000 npm run generate
```

Generate a mixed run with 1 news-based article and 1 evergreen article:

```bash
ARTICLE_MODE=mixed NEWS_ARTICLE_COUNT=1 ARTICLE_COUNT=2 MIN_WORDS=1000 npm run generate
```

Before publishing for the first time, run:

```bash
npm run check
```

5. Publish the latest JSON file to Sanity as a draft:

```bash
npm run publish
```

If you want to inspect the payload first without writing to Sanity:

```bash
npm run publish:dry
```

6. Run the full flow:

```bash
npm run run
```

Run the full flow for 2 long-form drafts:

```bash
ARTICLE_COUNT=2 MIN_WORDS=1000 npm run run
```

Run the full flow with internet-sourced brand news mixed into the output:

```bash
ARTICLE_MODE=mixed NEWS_ARTICLE_COUNT=1 NEWS_MAX_AGE_DAYS=7 ARTICLE_COUNT=2 MIN_WORDS=1000 npm run run
```

## Recommended Codex automation flow

1. Read the brand and editorial files in this folder
2. Generate one article JSON into `outputs/`
3. Run `npm run publish`
4. Review the draft in Sanity Studio before publishing live

For mixed news + evergreen runs:

1. Read the brand, editorial, and news sourcing files in this folder
2. Fetch only recent and strategically relevant news
3. Convert the news into founder-level analysis instead of recap content
4. Fall back to evergreen topics if no strong news signal is available

The prompt template for that automation lives in `prompts/daily-article-prompt.md`.
For a fuller Codex App automation run, use `prompts/daily-automation-prompt.md`.
