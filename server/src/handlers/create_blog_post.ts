
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type CreateBlogPostInput, type BlogPost } from '../schema';

export const createBlogPost = async (input: CreateBlogPostInput): Promise<BlogPost> => {
  try {
    // Insert blog post record
    const result = await db.insert(blogPostsTable)
      .values({
        title: input.title,
        content: input.content,
        excerpt: input.excerpt,
        slug: input.slug,
        substack_id: input.substack_id,
        substack_url: input.substack_url,
        published: input.published,
        published_at: input.published_at
      })
      .returning()
      .execute();

    const blogPost = result[0];
    return blogPost;
  } catch (error) {
    console.error('Blog post creation failed:', error);
    throw error;
  }
};
