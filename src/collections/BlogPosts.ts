import type { CollectionConfig } from 'payload'

const LT_MAP: Record<string, string> = {
  'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 'į': 'i',
  'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z',
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[ąčęėįšųūž]/g, (c) => LT_MAP[c] ?? c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  labels: {
    singular: 'Tinklaraščio įrašas',
    plural: 'Tinklaraščio įrašai',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt'],
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.title && !data?.slug) {
          data.slug = slugify(data.title)
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Pavadinimas',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'URL fragmentas',
      admin: {
        description: 'Sugeneruojama automatiškai iš pavadinimo, jei kuriant paliekama tuščia',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'published',
      label: 'Statusas',
      options: [
        { label: 'Publikuota', value: 'published' },
        { label: 'Juodraštis', value: 'draft' },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Publikavimo data',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Anonsas',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Pagrindinė nuotrauka',
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Turinys',
    },
    {
      name: 'metaTitle',
      type: 'text',
      label: 'SEO pavadinimas',
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      label: 'SEO aprašymas',
    },
  ],
}
