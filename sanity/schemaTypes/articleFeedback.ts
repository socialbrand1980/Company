import { defineField, defineType } from 'sanity'

export const articleFeedback = defineType({
  name: 'articleFeedback',
  title: 'Article Feedback',
  type: 'document',
  fields: [
    defineField({
      name: 'articleId',
      title: 'Article ID',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'articleSlug',
      title: 'Article Slug',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'articleTitle',
      title: 'Article Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
    }),
    defineField({
      name: 'contentType',
      title: 'Content Type',
      type: 'string',
    }),
    defineField({
      name: 'vote',
      title: 'Vote',
      type: 'string',
      options: {
        list: [
          { title: 'Like', value: 'like' },
          { title: 'Dislike', value: 'dislike' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'reason',
      title: 'Reason',
      type: 'string',
      options: {
        list: [
          { title: 'Too Generic', value: 'too_generic' },
          { title: 'Not Insightful', value: 'not_insightful' },
          { title: 'Weak Sources', value: 'weak_sources' },
          { title: 'Less Relevant', value: 'less_relevant' },
          { title: 'Awkward Tone', value: 'awkward_tone' },
        ],
      },
    }),
    defineField({
      name: 'sessionHash',
      title: 'Session Hash',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'articleTitle',
      subtitle: 'vote',
      reason: 'reason',
    },
    prepare(selection) {
      const { title, subtitle, reason } = selection
      return {
        title,
        subtitle: [subtitle, reason].filter(Boolean).join(' • '),
      }
    },
  },
})
