
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type GetBlogPostByIdInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteBlogPost = async (input: GetBlogPostByIdInput): Promise<{ success: boolean }> => {
  try {
    // Delete the blog post by ID
    const result = await db.delete(blogPostsTable)
      .where(eq(blogPostsTable.id, input.id))
      .execute();

    // Check if any rows were affected (deleted)
    return { success: (result.rowCount ?? 0) > 0 };
  } catch (error) {
    console.error('Blog post deletion failed:', error);
    throw error;
  }
};
