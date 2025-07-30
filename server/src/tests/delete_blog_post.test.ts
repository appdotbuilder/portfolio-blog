
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type GetBlogPostByIdInput, type CreateBlogPostInput } from '../schema';
import { deleteBlogPost } from '../handlers/delete_blog_post';
import { eq } from 'drizzle-orm';

// Test input for creating a blog post
const testBlogPostInput: CreateBlogPostInput = {
  title: 'Test Blog Post',
  content: 'This is a test blog post content',
  excerpt: 'Test excerpt',
  slug: 'test-blog-post',
  substack_id: 'test-substack-id',
  substack_url: 'https://example.substack.com/p/test-post',
  published: true,
  published_at: new Date()
};

describe('deleteBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing blog post', async () => {
    // Create a test blog post first
    const insertResult = await db.insert(blogPostsTable)
      .values(testBlogPostInput)
      .returning()
      .execute();

    const createdPost = insertResult[0];

    // Delete the blog post
    const deleteInput: GetBlogPostByIdInput = { id: createdPost.id };
    const result = await deleteBlogPost(deleteInput);

    // Should return success: true
    expect(result.success).toBe(true);

    // Verify the blog post no longer exists in database
    const posts = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, createdPost.id))
      .execute();

    expect(posts).toHaveLength(0);
  });

  it('should return false when deleting non-existent blog post', async () => {
    // Try to delete a blog post that doesn't exist
    const deleteInput: GetBlogPostByIdInput = { id: 999 };
    const result = await deleteBlogPost(deleteInput);

    // Should return success: false
    expect(result.success).toBe(false);
  });

  it('should not affect other blog posts when deleting one', async () => {
    // Create two test blog posts
    const firstPostInput = { ...testBlogPostInput, slug: 'first-post' };
    const secondPostInput = { ...testBlogPostInput, slug: 'second-post', title: 'Second Post' };

    const firstInsert = await db.insert(blogPostsTable)
      .values(firstPostInput)
      .returning()
      .execute();

    const secondInsert = await db.insert(blogPostsTable)
      .values(secondPostInput)
      .returning()
      .execute();

    const firstPost = firstInsert[0];
    const secondPost = secondInsert[0];

    // Delete only the first blog post
    const deleteInput: GetBlogPostByIdInput = { id: firstPost.id };
    const result = await deleteBlogPost(deleteInput);

    expect(result.success).toBe(true);

    // Verify first post is deleted
    const firstPostQuery = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, firstPost.id))
      .execute();

    expect(firstPostQuery).toHaveLength(0);

    // Verify second post still exists
    const secondPostQuery = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, secondPost.id))
      .execute();

    expect(secondPostQuery).toHaveLength(1);
    expect(secondPostQuery[0].title).toEqual('Second Post');
  });
});
