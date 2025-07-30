
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type CreateBlogPostInput } from '../schema';
import { getBlogPosts } from '../handlers/get_blog_posts';

describe('getBlogPosts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no published posts exist', async () => {
    const result = await getBlogPosts();
    expect(result).toHaveLength(0);
  });

  it('should return only published blog posts', async () => {
    // Create published post
    await db.insert(blogPostsTable).values({
      title: 'Published Post',
      content: 'This is published content',
      excerpt: 'Published excerpt',
      slug: 'published-post',
      substack_id: null,
      substack_url: null,
      published: true,
      published_at: new Date()
    }).execute();

    // Create unpublished post
    await db.insert(blogPostsTable).values({
      title: 'Draft Post',
      content: 'This is draft content',
      excerpt: 'Draft excerpt',
      slug: 'draft-post',
      substack_id: null,
      substack_url: null,
      published: false,
      published_at: null
    }).execute();

    const result = await getBlogPosts();

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Published Post');
    expect(result[0].published).toBe(true);
  });

  it('should return posts ordered by published_at descending', async () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Create posts with different published_at dates
    await db.insert(blogPostsTable).values({
      title: 'Oldest Post',
      content: 'Content 1',
      excerpt: null,
      slug: 'oldest-post',
      substack_id: null,
      substack_url: null,
      published: true,
      published_at: yesterday
    }).execute();

    await db.insert(blogPostsTable).values({
      title: 'Newest Post',
      content: 'Content 2',
      excerpt: null,
      slug: 'newest-post',
      substack_id: null,
      substack_url: null,
      published: true,
      published_at: tomorrow
    }).execute();

    await db.insert(blogPostsTable).values({
      title: 'Middle Post',
      content: 'Content 3',
      excerpt: null,
      slug: 'middle-post',
      substack_id: null,
      substack_url: null,
      published: true,
      published_at: now
    }).execute();

    const result = await getBlogPosts();

    expect(result).toHaveLength(3);
    expect(result[0].title).toEqual('Newest Post');
    expect(result[1].title).toEqual('Middle Post');
    expect(result[2].title).toEqual('Oldest Post');
  });

  it('should include all blog post fields', async () => {
    await db.insert(blogPostsTable).values({
      title: 'Complete Post',
      content: 'Full content here',
      excerpt: 'This is an excerpt',
      slug: 'complete-post',
      substack_id: 'substack123',
      substack_url: 'https://example.substack.com/p/complete-post',
      published: true,
      published_at: new Date()
    }).execute();

    const result = await getBlogPosts();

    expect(result).toHaveLength(1);
    const post = result[0];
    
    expect(post.id).toBeDefined();
    expect(post.title).toEqual('Complete Post');
    expect(post.content).toEqual('Full content here');
    expect(post.excerpt).toEqual('This is an excerpt');
    expect(post.slug).toEqual('complete-post');
    expect(post.substack_id).toEqual('substack123');
    expect(post.substack_url).toEqual('https://example.substack.com/p/complete-post');
    expect(post.published).toBe(true);
    expect(post.published_at).toBeInstanceOf(Date);
    expect(post.created_at).toBeInstanceOf(Date);
    expect(post.updated_at).toBeInstanceOf(Date);
  });
});
