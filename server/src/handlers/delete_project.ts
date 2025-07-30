
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type GetProjectByIdInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteProject = async (input: GetProjectByIdInput): Promise<{ success: boolean }> => {
  try {
    // Delete project by ID
    const result = await db.delete(projectsTable)
      .where(eq(projectsTable.id, input.id))
      .execute();

    // Check if any rows were affected (project existed and was deleted)
    return { success: (result.rowCount ?? 0) > 0 };
  } catch (error) {
    console.error('Project deletion failed:', error);
    throw error;
  }
};
