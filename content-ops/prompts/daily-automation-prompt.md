Run the SocialBrand1980 daily article workflow end-to-end for one new draft.

Work inside:
- `/Users/jhordideamarall/Projects/SocialBrand1980/content-ops`

Goal:
- create 3 new Indonesian articles aligned with the SocialBrand1980 personal brand
- use a fixed mix of 2 timely news-analysis articles and 1 practical tips/how-to article
- generate a matching visual direction for the cover image
- save the JSON output locally
- publish all approved articles directly to Sanity as published documents

Before doing anything:
1. Read:
   - `content-ops/AGENTS.md`
   - all files in `content-ops/docs/`
   - all files in `content-ops/examples/`
   - `content-ops/prompts/daily-article-prompt.md`
2. Respect the brand positioning: strategic, premium, practical, founder-level.
3. Avoid repeating the same angle as recent files in `content-ops/outputs/`.
4. If there is a strong and relevant news signal about brands, campaigns, platform shifts, AI, SaaS, fintech, creator economy, or marketing strategy, include it as analysis rather than recap. Scope the news to business-relevant sectors such as fashion, beauty, skincare, cosmetics, lifestyle, retail, FMCG, ecommerce, UMKM, AI, SaaS, fintech, digital platforms, and creator economy. Explicitly exclude gambling, betting, casino, sportsbook, poker, lottery, and adjacent industries. Use a curated source-first approach, not Google News RSS or another broad aggregator. Prioritize Indonesia-local context and sources first, especially Jakpat, Populix, Kantar, NielsenIQ, McKinsey, Deloitte, BPS, Kemenperin, BPOM, Katadata, Compas, and official marketplace or platform reports from TikTok Shop, Shopee, and Tokopedia. The evergreen slot must be a practical tips/how-to article, not a reflective opinion piece.

Execution steps:
1. Run `cd /Users/jhordideamarall/Projects/SocialBrand1980/content-ops && npm run check`
2. Run `cd /Users/jhordideamarall/Projects/SocialBrand1980/content-ops && npm run check`
3. Use the orchestrated workflow so generate, review, retry, and publish happen in one guarded run: `cd /Users/jhordideamarall/Projects/SocialBrand1980/content-ops && ARTICLE_MODE=mixed ARTICLE_RESEARCH_MODE=deep NEWS_ARTICLE_STYLE=premium NEWS_ARTICLE_COUNT=2 NEWS_MAX_AGE_DAYS=7 EVERGREEN_TOPIC_STYLE=tips ARTICLE_COUNT=3 SANITY_PUBLISH_MODE=published ARTICLE_REVIEW_MIN_SCORE=80 ARTICLE_REVIEW_MAX_ATTEMPTS=3 npm run run`
4. If the run still fails after retries, inspect the latest generated files, identify why the batch still feels weak, and only then regenerate deliberately instead of lowering the standard.
5. Confirm all generated JSON files include:
   - `title`
   - `slug`
   - `excerpt`
   - `seoDescription`
   - `content`
   - `category`
   - `language`
   - `author`
   - `status`
   - `publishedAt`
   - `readTime`
   - `practicalTakeaways`
   - `contentType`
   - `sourceReferences`
   - `coverImageStyle`
   - `coverImageBrief`
   - `coverImageAlt`
   - `coverImagePath`
6. Ensure each article body is complete, commercially useful, and not padded just to hit a word-count target.
7. The final run should leave 3 new published documents in Sanity with `mainImage` automatically attached.
8. For any news-based article, verify the body cites the source and date naturally and that the angle remains founder-level.
9. If an article still feels flat after the automatic retries, do not lower the standard. Rewrite or regenerate until the batch is publishable.

Writing rules:
- write in Indonesian
- use a strategic agency-founder perspective
- avoid fluff, generic listicles, and weak insight
- include a decision-making lens, framework, or audit logic
- keep CTA subtle
- do not turn news into gossip or trend-chasing; extract lessons that help real business decisions
- make the article sound naturally written by an expert reviewing a real situation, not assembled from a rigid template
- keep each article persuasive and distinct in rhythm, phrasing, and argument flow
- get to the point quickly; the first two paragraphs should already tell the reader what matters
- do not publish an article that feels merely competent; it has to feel interesting enough that a general reader would keep going after the opening
- make each paragraph earn its place with either a fact, implication, contrast, or clear action
- when the news is strong enough, prefer a premium long-form analysis that feels closer to a researched feature than a short commentary
- when the topic fits, prefer a premium market-report structure over a reflective essay structure
- keep first-person minimal; default to clean editorial analysis
- do not pad articles only to satisfy a high word count target if the piece is already complete

Visual rules:
- cover image direction must feel premium, modern, business-focused, and aligned with SocialBrand1980
- avoid generic corporate stock look
- use the visual style guide as the source of truth

Output back to the user:
- all 3 article titles
- content type for each (`evergreen` or `newsAnalysis`)
- chosen category for each
- output JSON path for each
- whether published sync to Sanity succeeded for each
- the quality-review verdict for each
- the suggested cover image brief in 1 short paragraph for each
