
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type BlogPost } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    // Query for published blog posts, ordered by published_at descending (most recent first)
    // Fall back to created_at if published_at is null
    const results = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.published, true))
      .orderBy(desc(blogPostsTable.published_at), desc(blogPostsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    throw error;
  }
};
