Create 1 new Indonesian article draft for SocialBrand1980.

Before writing, you must read:
- content-ops/AGENTS.md
- content-ops/docs/personal-brand.md
- content-ops/docs/audience.md
- content-ops/docs/content-pillars.md
- content-ops/docs/offers-and-services.md
- content-ops/docs/editorial-rules.md
- content-ops/docs/news-sourcing.md
- content-ops/docs/topic-bank.md
- content-ops/docs/seo-rules.md
- content-ops/docs/publishing-rules.md
- content-ops/docs/visual-style.md
- content-ops/examples/article-example-01.md
- content-ops/examples/article-example-02.md
- content-ops/examples/article-example-03.md

Then follow these instructions:
1. Choose one topic that is highly relevant to the audience and aligned with the brand.
2. Avoid repeating the same angle as the latest outputs in `content-ops/outputs/`.
3. Write in Indonesian.
4. Make the article strategic, practical, concise, and genuinely worth reading.
5. Use the docs and examples as the decision basis for point of view, structure, CTA style, and audience relevance. Do not write generic filler.
6. Prefer high-priority topics first unless the recent history makes the angle too repetitive.
7. Use an agency-founder perspective with clear decision-making lenses, frameworks, or audit questions.
8. Make the writing feel natural, persuasive, and expert-led. Avoid paragraphs that sound mechanically templated or repeated across articles.
9. Use a sharp business-news analysis rhythm: get to the point early, surface the key implication fast, and avoid long throat-clearing introductions.
10. If `ARTICLE_MODE` is `mixed` or `news`, fetch recent internet news that is relevant to brands, campaigns, marketing, rebrands, platforms, AI, SaaS, fintech, creator economy, or major business-model shifts. Explicitly exclude gambling, betting, casino, sportsbook, poker, lottery, and related sectors. Use a curated source-first approach rather than a broad news aggregator. Use the news as a strategic trigger, not a recap. Mention the source and date in the article body and include `sourceReferences` in the JSON.
11. Prioritize Indonesia-local context and sources first. For consumer insight and Gen Z/Gen Alpha behavior, prefer Jakpat, Populix, Kantar, NielsenIQ, McKinsey, and Deloitte. For Indonesia market context, prefer BPS, Kemenperin, BPOM, Katadata, and Compas. For marketplace or channel shift, prefer Compas and official reports or updates from TikTok Shop, Shopee, and Tokopedia when available.
12. Every paragraph must add one of these: a fact, an implication, a contrast, or a concrete action. If it does none of them, cut it.
13. Do not default to inspirational or generic founder advice. Keep the article specific to the topic and commercially useful.
14. For important news stories, prefer a premium long-form structure: what happened, why it matters, what market signal it reveals, what the counterpoint is, and what founders should test or question next.
15. When the topic supports it, prefer a premium market-intelligence format like this: market context, growth signal, buyer behavior, product or channel shift, and strategic implication. Make it feel like a researched business article, not a motivational essay.
16. Use first-person very sparingly. Default to a clean editorial voice that sounds informed, premium, and data-literate.
17. Do not pad the article to hit an arbitrary minimum word count. If the piece already feels complete, stop.
18. If no strong news signal is available, fall back to an evergreen topic instead of forcing a weak news article.
19. Use one of the current site categories: `Brand Strategy`, `Social Media`, or `Content Marketing` unless there is a strong reason to choose another existing schema category.
20. Keep `status` as `readyForReview` in the generated JSON. The Sanity draft status is handled by the publish step.
21. If `EVERGREEN_TOPIC_STYLE=tips`, choose a practical how-to or audit topic that feels immediately useful to readers.
22. Before publish, the article should be able to survive a simple reader test: would the first two paragraphs make a general business reader want to continue?
23. Include these fields in the saved JSON:
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
   - practicalTakeaways
   - contentType
   - sourceReferences
   - coverImageStyle
   - coverImageBrief
   - coverImageAlt
24. The JSON must match the existing Sanity `article` schema used by this project.
25. Save the result to `content-ops/outputs/` as a JSON file.
26. If the workflow is in direct-publish mode, do not publish weak articles. Rewrite or regenerate them first, then publish only after they pass review.
