
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type UpdateProjectInput, type Project } from '../schema';
import { eq } from 'drizzle-orm';

export const updateProject = async (input: UpdateProjectInput): Promise<Project | null> => {
  try {
    // Check if project exists first
    const existingProject = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, input.id))
      .execute();

    if (existingProject.length === 0) {
      return null;
    }

    // Prepare update data - only include fields that are provided
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }
    if (input.live_url !== undefined) {
      updateData.live_url = input.live_url;
    }
    if (input.source_url !== undefined) {
      updateData.source_url = input.source_url;
    }
    if (input.tech_stack !== undefined) {
      updateData.tech_stack = input.tech_stack;
    }
    if (input.featured !== undefined) {
      updateData.featured = input.featured;
    }

    // Update the project
    const result = await db.update(projectsTable)
      .set(updateData)
      .where(eq(projectsTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Project update failed:', error);
    throw error;
  }
};
