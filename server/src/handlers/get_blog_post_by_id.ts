
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type GetBlogPostByIdInput, type BlogPost } from '../schema';
import { eq } from 'drizzle-orm';

export const getBlogPostById = async (input: GetBlogPostByIdInput): Promise<BlogPost | null> => {
  try {
    const result = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, input.id))
      .execute();

    if (result.length === 0) {
      return null;
    }

    const blogPost = result[0];
    return {
      ...blogPost,
      // Ensure dates are properly coerced
      created_at: blogPost.created_at,
      updated_at: blogPost.updated_at,
      published_at: blogPost.published_at
    };
  } catch (error) {
    console.error('Blog post retrieval failed:', error);
    throw error;
  }
};
