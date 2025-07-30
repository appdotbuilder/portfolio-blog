
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type CreateBlogPostInput } from '../schema';
import { createBlogPost } from '../handlers/create_blog_post';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateBlogPostInput = {
  title: 'Test Blog Post',
  content: 'This is a test blog post content',
  excerpt: 'Test excerpt',
  slug: 'test-blog-post',
  substack_id: 'test-substack-123',
  substack_url: 'https://example.substack.com/p/test-post',
  published: false,
  published_at: null
};

describe('createBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a blog post', async () => {
    const result = await createBlogPost(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Blog Post');
    expect(result.content).toEqual(testInput.content);
    expect(result.excerpt).toEqual('Test excerpt');
    expect(result.slug).toEqual('test-blog-post');
    expect(result.substack_id).toEqual('test-substack-123');
    expect(result.substack_url).toEqual('https://example.substack.com/p/test-post');
    expect(result.published).toEqual(false);
    expect(result.published_at).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save blog post to database', async () => {
    const result = await createBlogPost(testInput);

    // Query using proper drizzle syntax
    const blogPosts = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, result.id))
      .execute();

    expect(blogPosts).toHaveLength(1);
    expect(blogPosts[0].title).toEqual('Test Blog Post');
    expect(blogPosts[0].content).toEqual(testInput.content);
    expect(blogPosts[0].slug).toEqual('test-blog-post');
    expect(blogPosts[0].published).toEqual(false);
    expect(blogPosts[0].created_at).toBeInstanceOf(Date);
  });

  it('should create blog post with published_at date', async () => {
    const publishedInput: CreateBlogPostInput = {
      ...testInput,
      published: true,
      published_at: new Date('2024-01-01T12:00:00.000Z')
    };

    const result = await createBlogPost(publishedInput);

    expect(result.published).toEqual(true);
    expect(result.published_at).toBeInstanceOf(Date);
    expect(result.published_at?.toISOString()).toEqual('2024-01-01T12:00:00.000Z');
  });

  it('should create blog post with minimal required fields', async () => {
    const minimalInput: CreateBlogPostInput = {
      title: 'Minimal Post',
      content: 'Minimal content',
      excerpt: null,
      slug: 'minimal-post',
      substack_id: null,
      substack_url: null,
      published: false,
      published_at: null
    };

    const result = await createBlogPost(minimalInput);

    expect(result.title).toEqual('Minimal Post');
    expect(result.content).toEqual('Minimal content');
    expect(result.slug).toEqual('minimal-post');
    expect(result.excerpt).toBeNull();
    expect(result.substack_id).toBeNull();
    expect(result.substack_url).toBeNull();
    expect(result.published).toEqual(false);
    expect(result.published_at).toBeNull();
  });

  it('should enforce unique slug constraint', async () => {
    // Create first blog post
    await createBlogPost(testInput);

    // Try to create another blog post with the same slug
    const duplicateInput: CreateBlogPostInput = {
      ...testInput,
      title: 'Different Title',
      content: 'Different content'
    };

    await expect(createBlogPost(duplicateInput)).rejects.toThrow(/duplicate key value violates unique constraint/i);
  });
});
