
import { serial, text, pgTable, timestamp, boolean, json } from 'drizzle-orm/pg-core';

export const projectsTable = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  live_url: text('live_url'), // Nullable by default
  source_url: text('source_url'), // Nullable by default
  tech_stack: json('tech_stack').$type<string[]>().notNull(),
  featured: boolean('featured').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const blogPostsTable = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'), // Nullable by default
  slug: text('slug').notNull().unique(),
  substack_id: text('substack_id'), // Nullable by default
  substack_url: text('substack_url'), // Nullable by default
  published: boolean('published').notNull().default(false),
  published_at: timestamp('published_at'), // Nullable by default
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schemas
export type Project = typeof projectsTable.$inferSelect;
export type NewProject = typeof projectsTable.$inferInsert;
export type BlogPost = typeof blogPostsTable.$inferSelect;
export type NewBlogPost = typeof blogPostsTable.$inferInsert;

// Export all tables for proper query building
export const tables = { 
  projects: projectsTable,
  blogPosts: blogPostsTable
};
