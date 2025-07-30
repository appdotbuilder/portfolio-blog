
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type GetBlogPostByIdInput, type CreateBlogPostInput } from '../schema';
import { getBlogPostById } from '../handlers/get_blog_post_by_id';

// Test input for blog post creation
const testBlogPostInput: CreateBlogPostInput = {
  title: 'Test Blog Post',
  content: 'This is a test blog post content',
  excerpt: 'Test excerpt',
  slug: 'test-blog-post',
  substack_id: 'test-substack-id',
  substack_url: 'https://example.substack.com/test',
  published: true,
  published_at: new Date('2024-01-01T10:00:00Z')
};

describe('getBlogPostById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a blog post when it exists', async () => {
    // Create a blog post first
    const insertResult = await db.insert(blogPostsTable)
      .values({
        title: testBlogPostInput.title,
        content: testBlogPostInput.content,
        excerpt: testBlogPostInput.excerpt,
        slug: testBlogPostInput.slug,
        substack_id: testBlogPostInput.substack_id,
        substack_url: testBlogPostInput.substack_url,
        published: testBlogPostInput.published,
        published_at: testBlogPostInput.published_at
      })
      .returning()
      .execute();

    const createdBlogPost = insertResult[0];
    const input: GetBlogPostByIdInput = { id: createdBlogPost.id };

    const result = await getBlogPostById(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdBlogPost.id);
    expect(result!.title).toEqual('Test Blog Post');
    expect(result!.content).toEqual('This is a test blog post content');
    expect(result!.excerpt).toEqual('Test excerpt');
    expect(result!.slug).toEqual('test-blog-post');
    expect(result!.substack_id).toEqual('test-substack-id');
    expect(result!.substack_url).toEqual('https://example.substack.com/test');
    expect(result!.published).toEqual(true);
    expect(result!.published_at).toBeInstanceOf(Date);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when blog post does not exist', async () => {
    const input: GetBlogPostByIdInput = { id: 99999 };

    const result = await getBlogPostById(input);

    expect(result).toBeNull();
  });

  it('should handle blog post with nullable fields', async () => {
    // Create a blog post with minimal required fields
    const minimalInput = {
      title: 'Minimal Blog Post',
      content: 'Minimal content',
      excerpt: null,
      slug: 'minimal-blog-post',
      substack_id: null,
      substack_url: null,
      published: false,
      published_at: null
    };

    const insertResult = await db.insert(blogPostsTable)
      .values(minimalInput)
      .returning()
      .execute();

    const createdBlogPost = insertResult[0];
    const input: GetBlogPostByIdInput = { id: createdBlogPost.id };

    const result = await getBlogPostById(input);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Minimal Blog Post');
    expect(result!.content).toEqual('Minimal content');
    expect(result!.excerpt).toBeNull();
    expect(result!.substack_id).toBeNull();
    expect(result!.substack_url).toBeNull();
    expect(result!.published).toEqual(false);
    expect(result!.published_at).toBeNull();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });
});
