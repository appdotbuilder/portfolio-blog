
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type UpdateBlogPostInput, type BlogPost } from '../schema';
import { eq, and, ne } from 'drizzle-orm';

export const updateBlogPost = async (input: UpdateBlogPostInput): Promise<BlogPost | null> => {
  try {
    // First check if the blog post exists
    const existingPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, input.id))
      .execute();

    if (existingPost.length === 0) {
      return null;
    }

    // If slug is being updated, check for uniqueness
    if (input.slug) {
      const duplicateSlug = await db.select()
        .from(blogPostsTable)
        .where(and(
          eq(blogPostsTable.slug, input.slug),
          ne(blogPostsTable.id, input.id)
        ))
        .execute();

      if (duplicateSlug.length > 0) {
        throw new Error('A blog post with this slug already exists');
      }
    }

    // Build the update object with only provided fields
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.excerpt !== undefined) updateData.excerpt = input.excerpt;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.substack_id !== undefined) updateData.substack_id = input.substack_id;
    if (input.substack_url !== undefined) updateData.substack_url = input.substack_url;
    if (input.published !== undefined) updateData.published = input.published;
    if (input.published_at !== undefined) updateData.published_at = input.published_at;

    // Update the blog post
    const result = await db.update(blogPostsTable)
      .set(updateData)
      .where(eq(blogPostsTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Blog post update failed:', error);
    throw error;
  }
};
