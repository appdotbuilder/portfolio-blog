
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type Project } from '../schema';
import { desc } from 'drizzle-orm';

export const getProjects = async (): Promise<Project[]> => {
  try {
    // Query all projects, ordered by featured first, then by creation date (newest first)
    const results = await db.select()
      .from(projectsTable)
      .orderBy(desc(projectsTable.featured), desc(projectsTable.created_at))
      .execute();

    // Return results with proper type mapping
    return results.map(project => ({
      ...project,
      // Ensure tech_stack is properly typed as string array
      tech_stack: project.tech_stack || []
    }));
  } catch (error) {
    console.error('Get projects failed:', error);
    throw error;
  }
};
