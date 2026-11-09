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

// Casos de éxito. Cada caso es un .md en src/content/casos/ y su URL es
// /casos/<nombre-del-archivo>/. El cuerpo SIEMPRE lleva tres secciones ##,
// en este orden: "La problemática y el objetivo", "El planteamiento de
// Eclipxia" y "La solución". La IA como diferenciador va en aiBuild/aiUse.
const casos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/casos' }),
  schema: z.object({
    // H1 visible del caso
    title: z.string(),
    seoTitle: z.string().optional(),
    client: z.string(),
    sector: z.string(),
    // Resumen para el listado y meta description
    summary: z.string(),
    // Orden en el listado (menor primero)
    order: z.number(),
    services: z.array(z.string()).default([]),
    // Cifras destacadas. Nunca montos de dinero del cliente.
    metrics: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    // IA como diferenciador: cómo aceleró la construcción y cómo la usa el cliente
    aiBuild: z.string(),
    aiUse: z.string(),
    // Aviso visible cuando el caso omite detalles por confidencialidad
    note: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, casos };
