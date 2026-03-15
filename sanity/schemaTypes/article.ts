import { defineField, defineType } from 'sanity'

export const article = defineType({
  name: 'article',
  title: 'Articles',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
      description: 'Used for search snippets and social previews',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Brand Strategy', value: 'Brand Strategy' },
          { title: 'Social Media', value: 'Social Media' },
          { title: 'Content Marketing', value: 'Content Marketing' },
          { title: 'Influencer Marketing', value: 'Influencer Marketing' },
          { title: 'Paid Advertising', value: 'Paid Advertising' },
          { title: 'Branding', value: 'Branding' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      initialValue: 'id-ID',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      initialValue: 'Jhordi Deamarall',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'draft',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Ready For Review', value: 'readyForReview' },
          { title: 'Published', value: 'published' },
        ],
      },
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'readTime',
      title: 'Read Time',
      type: 'string',
      description: 'e.g., "5 min read"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'practicalTakeaways',
      title: 'Practical Takeaways',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Short tactical takeaways for editors and readers',
    }),
    defineField({
      name: 'contentType',
      title: 'Content Type',
      type: 'string',
      initialValue: 'evergreen',
      options: {
        list: [
          { title: 'Evergreen', value: 'evergreen' },
          { title: 'News Analysis', value: 'newsAnalysis' },
        ],
      },
    }),
    defineField({
      name: 'sourceReferences',
      title: 'Source References',
      type: 'array',
      description: 'Optional source references for news analysis articles',
      of: [
        {
          name: 'sourceReference',
          title: 'Source Reference',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Source Title',
              type: 'string',
            }),
            defineField({
              name: 'publisher',
              title: 'Publisher',
              type: 'string',
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
            }),
            defineField({
              name: 'publishedAt',
              title: 'Published At',
              type: 'datetime',
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'coverImageBrief',
      title: 'Cover Image Brief',
      type: 'text',
      rows: 4,
      description: 'Internal visual direction for the article cover image',
    }),
    defineField({
      name: 'coverImageAlt',
      title: 'Cover Image Alt Suggestion',
      type: 'string',
      description: 'Suggested alt text for the article cover image',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      description: 'Show this article in the featured section',
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          description: 'Important for SEO and accessibility',
        }),
      ],
    }),
    defineField({
      name: 'relatedArticles',
      title: 'Related Articles',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'article' }] }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      media: 'mainImage',
      publishedAt: 'publishedAt',
      status: 'status',
    },
    prepare(selection) {
      const { author, status } = selection
      return {
        ...selection,
        subtitle: [author ? `by ${author}` : null, status ? `status: ${status}` : null]
          .filter(Boolean)
          .join(' • '),
      }
    },
  },
})
