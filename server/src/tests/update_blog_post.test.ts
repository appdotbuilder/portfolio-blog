
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type UpdateBlogPostInput, type CreateBlogPostInput } from '../schema';
import { updateBlogPost } from '../handlers/update_blog_post';
import { eq } from 'drizzle-orm';

describe('updateBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper to create a test blog post directly in database
  const createTestBlogPost = async () => {
    const testData = {
      title: 'Original Title',
      content: 'Original content',
      excerpt: 'Original excerpt',
      slug: 'original-slug',
      substack_id: 'original-id',
      substack_url: 'https://original.substack.com',
      published: false,
      published_at: null
    };

    const result = await db.insert(blogPostsTable)
      .values(testData)
      .returning()
      .execute();

    return result[0];
  };

  it('should update a blog post with all fields', async () => {
    const originalPost = await createTestBlogPost();
    const publishedDate = new Date('2023-12-01');

    const updateInput: UpdateBlogPostInput = {
      id: originalPost.id,
      title: 'Updated Title',
      content: 'Updated content',
      excerpt: 'Updated excerpt',
      slug: 'updated-slug',
      substack_id: 'updated-id',
      substack_url: 'https://updated.substack.com',
      published: true,
      published_at: publishedDate
    };

    const result = await updateBlogPost(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(originalPost.id);
    expect(result!.title).toEqual('Updated Title');
    expect(result!.content).toEqual('Updated content');
    expect(result!.excerpt).toEqual('Updated excerpt');
    expect(result!.slug).toEqual('updated-slug');
    expect(result!.substack_id).toEqual('updated-id');
    expect(result!.substack_url).toEqual('https://updated.substack.com');
    expect(result!.published).toEqual(true);
    expect(result!.published_at).toEqual(publishedDate);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at > originalPost.updated_at).toBe(true);
  });

  it('should update only specified fields', async () => {
    const originalPost = await createTestBlogPost();

    const updateInput: UpdateBlogPostInput = {
      id: originalPost.id,
      title: 'Only Title Updated',
      published: true
    };

    const result = await updateBlogPost(updateInput);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Only Title Updated');
    expect(result!.published).toEqual(true);
    // Other fields should remain unchanged
    expect(result!.content).toEqual(originalPost.content);
    expect(result!.excerpt).toEqual(originalPost.excerpt);
    expect(result!.slug).toEqual(originalPost.slug);
    expect(result!.substack_id).toEqual(originalPost.substack_id);
    expect(result!.substack_url).toEqual(originalPost.substack_url);
  });

  it('should handle nullable fields', async () => {
    const originalPost = await createTestBlogPost();

    const updateInput: UpdateBlogPostInput = {
      id: originalPost.id,
      excerpt: null,
      substack_id: null,
      substack_url: null,
      published_at: null
    };

    const result = await updateBlogPost(updateInput);

    expect(result).not.toBeNull();
    expect(result!.excerpt).toBeNull();
    expect(result!.substack_id).toBeNull();
    expect(result!.substack_url).toBeNull();
    expect(result!.published_at).toBeNull();
  });

  it('should persist changes in database', async () => {
    const originalPost = await createTestBlogPost();

    const updateInput: UpdateBlogPostInput = {
      id: originalPost.id,
      title: 'Database Persisted Title',
      content: 'Database persisted content'
    };

    await updateBlogPost(updateInput);

    // Query database directly to verify persistence
    const savedPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, originalPost.id))
      .execute();

    expect(savedPost).toHaveLength(1);
    expect(savedPost[0].title).toEqual('Database Persisted Title');
    expect(savedPost[0].content).toEqual('Database persisted content');
    expect(savedPost[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent blog post', async () => {
    const updateInput: UpdateBlogPostInput = {
      id: 99999,
      title: 'Non-existent Post'
    };

    const result = await updateBlogPost(updateInput);

    expect(result).toBeNull();
  });

  it('should throw error for duplicate slug', async () => {
    // Create two blog posts
    const post1 = await createTestBlogPost();
    
    const post2Data = {
      title: 'Second Post',
      content: 'Second content',
      excerpt: 'Second excerpt',
      slug: 'second-slug',
      substack_id: null,
      substack_url: null,
      published: false,
      published_at: null
    };
    
    const post2Result = await db.insert(blogPostsTable)
      .values(post2Data)
      .returning()
      .execute();
    const post2 = post2Result[0];

    // Try to update post2 with post1's slug
    const updateInput: UpdateBlogPostInput = {
      id: post2.id,
      slug: post1.slug
    };

    await expect(updateBlogPost(updateInput)).rejects.toThrow(/slug already exists/i);
  });

  it('should allow updating post with its current slug', async () => {
    const originalPost = await createTestBlogPost();

    const updateInput: UpdateBlogPostInput = {
      id: originalPost.id,
      slug: originalPost.slug, // Same slug
      title: 'Updated with same slug'
    };

    const result = await updateBlogPost(updateInput);

    expect(result).not.toBeNull();
    expect(result!.slug).toEqual(originalPost.slug);
    expect(result!.title).toEqual('Updated with same slug');
  });
});
