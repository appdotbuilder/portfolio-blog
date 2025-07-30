
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type GetProjectByIdInput, type Project } from '../schema';
import { eq } from 'drizzle-orm';

export const getProjectById = async (input: GetProjectByIdInput): Promise<Project | null> => {
  try {
    const results = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, input.id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    const project = results[0];
    return {
      ...project,
      // All fields are already in correct types from the database
      // No numeric conversions needed since all fields are text, boolean, or timestamp
    };
  } catch (error) {
    console.error('Get project by ID failed:', error);
    throw error;
  }
};
