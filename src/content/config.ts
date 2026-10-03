import { defineCollection, z } from 'astro:content';

const projectsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    year: z.number(),
    phase: z.string(),
    description: z.string(),
  }),
});

export const collections = {
  projects: projectsCollection,
};
