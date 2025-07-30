
import { z } from 'zod';

// Project schema
export const projectSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  live_url: z.string().url().nullable(),
  source_url: z.string().url().nullable(),
  tech_stack: z.array(z.string()),
  featured: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Project = z.infer<typeof projectSchema>;

// Input schema for creating projects
export const createProjectInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  live_url: z.string().url().nullable(),
  source_url: z.string().url().nullable(),
  tech_stack: z.array(z.string()),
  featured: z.boolean().default(false)
});

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

// Input schema for updating projects
export const updateProjectInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  live_url: z.string().url().nullable().optional(),
  source_url: z.string().url().nullable().optional(),
  tech_stack: z.array(z.string()).optional(),
  featured: z.boolean().optional()
});

export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;

// Blog post schema
export const blogPostSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  excerpt: z.string().nullable(),
  slug: z.string(),
  substack_id: z.string().nullable(),
  substack_url: z.string().url().nullable(),
  published: z.boolean(),
  published_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type BlogPost = z.infer<typeof blogPostSchema>;

// Input schema for creating blog posts
export const createBlogPostInputSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().nullable(),
  slug: z.string().min(1),
  substack_id: z.string().nullable(),
  substack_url: z.string().url().nullable(),
  published: z.boolean().default(false),
  published_at: z.coerce.date().nullable()
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostInputSchema>;

// Input schema for updating blog posts
export const updateBlogPostInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().nullable().optional(),
  slug: z.string().min(1).optional(),
  substack_id: z.string().nullable().optional(),
  substack_url: z.string().url().nullable().optional(),
  published: z.boolean().optional(),
  published_at: z.coerce.date().nullable().optional()
});

export type UpdateBlogPostInput = z.infer<typeof updateBlogPostInputSchema>;

// Query schemas
export const getProjectByIdInputSchema = z.object({
  id: z.number()
});

export type GetProjectByIdInput = z.infer<typeof getProjectByIdInputSchema>;

export const getBlogPostByIdInputSchema = z.object({
  id: z.number()
});

export type GetBlogPostByIdInput = z.infer<typeof getBlogPostByIdInputSchema>;

export const getBlogPostBySlugInputSchema = z.object({
  slug: z.string()
});

export type GetBlogPostBySlugInput = z.infer<typeof getBlogPostBySlugInputSchema>;
