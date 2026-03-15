# Sanity Schema Notes

This repository already uses the `article` document type.

For the content ops workflow, the `article` schema should contain at least:

- `title` (string)
- `slug` (slug)
- `excerpt` (text)
- `seoDescription` (text)
- `content` (array of block content)
- `category` (string)
- `language` (string)
- `author` (string)
- `status` (string)
- `publishedAt` (datetime)
- `readTime` (string)
- `practicalTakeaways` (array of strings)
- `featured` (boolean)

The publish script in this folder writes drafts to `_type: "article"` and stores them using a `drafts.` document id.
