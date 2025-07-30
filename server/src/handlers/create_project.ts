
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput, type Project } from '../schema';

export const createProject = async (input: CreateProjectInput): Promise<Project> => {
  try {
    // Insert project record
    const result = await db.insert(projectsTable)
      .values({
        name: input.name,
        description: input.description,
        live_url: input.live_url,
        source_url: input.source_url,
        tech_stack: input.tech_stack,
        featured: input.featured
      })
      .returning()
      .execute();

    // Return the created project
    const project = result[0];
    return {
      ...project,
      // JSON field is already properly typed as string[]
      tech_stack: project.tech_stack
    };
  } catch (error) {
    console.error('Project creation failed:', error);
    throw error;
  }
};
