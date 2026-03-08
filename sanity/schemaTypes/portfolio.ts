import { defineField, defineType } from 'sanity'

export const portfolio = defineType({
  name: 'portfolio',
  title: 'Portfolio',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Project Title',
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
      name: 'clientName',
      title: 'Client Name',
      type: 'string',
      description: 'Name of the client/company',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'clientLogo',
      title: 'Client Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'projectImage',
      title: 'Project Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Project Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              title: 'Alternative Text',
              type: 'string',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'description',
      title: 'Project Description',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: 'services',
      title: 'Services Provided',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Brand Strategy & Positioning', value: 'Brand Strategy & Positioning' },
          { title: 'Social Media Management', value: 'Social Media Management' },
          { title: 'Content Production', value: 'Content Production' },
          { title: 'KOL & Influencer Activation', value: 'KOL & Influencer Activation' },
          { title: 'Performance Marketing', value: 'Performance Marketing' },
          { title: 'Omnichannel Marketing Strategy', value: 'Omnichannel Marketing Strategy' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'industry',
      title: 'Industry',
      type: 'string',
      options: {
        list: [
          { title: 'Technology', value: 'Technology' },
          { title: 'Fashion', value: 'Fashion' },
          { title: 'Food & Beverage', value: 'Food & Beverage' },
          { title: 'Health & Beauty', value: 'Health & Beauty' },
          { title: 'E-commerce', value: 'E-commerce' },
          { title: 'Education', value: 'Education' },
          { title: 'Real Estate', value: 'Real Estate' },
          { title: 'Entertainment', value: 'Entertainment' },
          { title: 'Other', value: 'Other' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'projectUrl',
      title: 'Project URL',
      type: 'url',
      description: 'Link to the project website (optional)',
    }),
    defineField({
      name: 'completedDate',
      title: 'Project Completed Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      description: 'Show this project in the featured section',
    }),
    defineField({
      name: 'results',
      title: 'Project Results',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'metric',
              title: 'Metric',
              type: 'string',
              description: 'e.g., "Instagram Followers", "Website Traffic"',
            },
            {
              name: 'value',
              title: 'Value',
              type: 'string',
              description: 'e.g., "+150%", "10K to 50K"',
            },
          ],
          preview: {
            select: {
              metric: 'metric',
              value: 'value',
            },
            prepare: ({ metric, value }) => ({
              title: `${metric}: ${value}`,
            }),
          },
        },
      ],
      description: 'Key results/metrics achieved (optional)',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      client: 'clientName',
      media: 'clientLogo',
      featured: 'featured',
    },
    prepare(selection) {
      const { title, client, featured } = selection
      return {
        title: title,
        subtitle: `${client}${featured ? ' • Featured' : ''}`,
      }
    },
  },
})
