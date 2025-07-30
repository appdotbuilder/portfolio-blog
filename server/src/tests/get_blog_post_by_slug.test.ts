
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type GetBlogPostBySlugInput, type CreateBlogPostInput } from '../schema';
import { getBlogPostBySlug } from '../handlers/get_blog_post_by_slug';

// Test input for creating a blog post
const testBlogPost: CreateBlogPostInput = {
  title: 'Test Blog Post',
  content: 'This is test content for the blog post',
  excerpt: 'Test excerpt',
  slug: 'test-blog-post',
  substack_id: 'substack123',
  substack_url: 'https://example.substack.com/p/test-post',
  published: true,
  published_at: new Date('2024-01-15T10:00:00Z')
};

describe('getBlogPostBySlug', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return blog post when found by slug', async () => {
    // Create test blog post
    await db.insert(blogPostsTable)
      .values(testBlogPost)
      .execute();

    const input: GetBlogPostBySlugInput = {
      slug: 'test-blog-post'
    };

    const result = await getBlogPostBySlug(input);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Test Blog Post');
    expect(result!.content).toEqual('This is test content for the blog post');
    expect(result!.excerpt).toEqual('Test excerpt');
    expect(result!.slug).toEqual('test-blog-post');
    expect(result!.substack_id).toEqual('substack123');
    expect(result!.substack_url).toEqual('https://example.substack.com/p/test-post');
    expect(result!.published).toEqual(true);
    expect(result!.published_at).toBeInstanceOf(Date);
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when blog post not found', async () => {
    const input: GetBlogPostBySlugInput = {
      slug: 'non-existent-slug'
    };

    const result = await getBlogPostBySlug(input);

    expect(result).toBeNull();
  });

  it('should handle nullable fields correctly', async () => {
    // Create blog post with null values
    const blogPostWithNulls: CreateBlogPostInput = {
      title: 'Minimal Blog Post',
      content: 'Basic content',
      excerpt: null,
      slug: 'minimal-post',
      substack_id: null,
      substack_url: null,
      published: false,
      published_at: null
    };

    await db.insert(blogPostsTable)
      .values(blogPostWithNulls)
      .execute();

    const input: GetBlogPostBySlugInput = {
      slug: 'minimal-post'
    };

    const result = await getBlogPostBySlug(input);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Minimal Blog Post');
    expect(result!.content).toEqual('Basic content');
    expect(result!.excerpt).toBeNull();
    expect(result!.slug).toEqual('minimal-post');
    expect(result!.substack_id).toBeNull();
    expect(result!.substack_url).toBeNull();
    expect(result!.published).toEqual(false);
    expect(result!.published_at).toBeNull();
  });

  it('should return correct blog post when multiple posts exist', async () => {
    // Create multiple blog posts
    await db.insert(blogPostsTable)
      .values([
        { ...testBlogPost, slug: 'first-post', title: 'First Post' },
        { ...testBlogPost, slug: 'second-post', title: 'Second Post' },
        { ...testBlogPost, slug: 'third-post', title: 'Third Post' }
      ])
      .execute();

    const input: GetBlogPostBySlugInput = {
      slug: 'second-post'
    };

    const result = await getBlogPostBySlug(input);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Second Post');
    expect(result!.slug).toEqual('second-post');
  });
});
