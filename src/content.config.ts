import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Blog de Eclipxia. Cada articulo es un .md en src/content/blog/ y su URL es
// /blog/<nombre-del-archivo>/. Instrucciones para quien publica: AGENTS.md.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    // H1 visible del articulo
    title: z.string(),
    // <title> para Google (~50 caracteres; el sitio agrega " | Eclipxia")
    seoTitle: z.string().optional(),
    // Resumen para el listado y, si no hay seoDescription, meta description
    description: z.string(),
    seoDescription: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    author: z.string().default('Eclipxia'),
    category: z.enum([
      'Agentes de IA',
      'Cerebros corporativos y RAG',
      'Automatización',
      'Estrategia de IA',
      'Casos',
    ]),
    tags: z.array(z.string()).default([]),
    // Ruta en public/ (ej. /blog/mi-articulo.jpg), 1200x630
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
