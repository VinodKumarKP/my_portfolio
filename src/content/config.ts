import { defineCollection, z } from 'astro:content';

const projectsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    year: z.number(),
    phase: z.string(),
    description: z.string(),
    tags: z.array(z.string()).optional(),
    sidebar: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })).optional(),
  }),
});

export const collections = {
  projects: projectsCollection,
};
