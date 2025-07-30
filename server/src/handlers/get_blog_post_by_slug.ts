
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GetBlogPostBySlugInput, type BlogPost } from '../schema';

export const getBlogPostBySlug = async (input: GetBlogPostBySlugInput): Promise<BlogPost | null> => {
  try {
    // Query blog post by slug
    const results = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.slug, input.slug))
      .execute();

    // Return null if no blog post found
    if (results.length === 0) {
      return null;
    }

    // Return the first (and should be only) result
    const blogPost = results[0];
    return blogPost;
  } catch (error) {
    console.error('Blog post fetch by slug failed:', error);
    throw error;
  }
};
