
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput, type GetProjectByIdInput } from '../schema';
import { deleteProject } from '../handlers/delete_project';
import { eq } from 'drizzle-orm';

// Test input for creating a project
const testProject: CreateProjectInput = {
  name: 'Test Project',
  description: 'A project for testing deletion',
  live_url: 'https://example.com',
  source_url: 'https://github.com/example/test',
  tech_stack: ['React', 'TypeScript'],
  featured: false
};

describe('deleteProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing project', async () => {
    // Create a project first
    const createResult = await db.insert(projectsTable)
      .values({
        name: testProject.name,
        description: testProject.description,
        live_url: testProject.live_url,
        source_url: testProject.source_url,
        tech_stack: testProject.tech_stack,
        featured: testProject.featured
      })
      .returning()
      .execute();

    const projectId = createResult[0].id;

    // Delete the project
    const input: GetProjectByIdInput = { id: projectId };
    const result = await deleteProject(input);

    expect(result.success).toBe(true);

    // Verify project was deleted from database
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId))
      .execute();

    expect(projects).toHaveLength(0);
  });

  it('should return false when deleting non-existent project', async () => {
    const input: GetProjectByIdInput = { id: 999 };
    const result = await deleteProject(input);

    expect(result.success).toBe(false);
  });

  it('should not affect other projects when deleting one', async () => {
    // Create two projects
    const firstProject = await db.insert(projectsTable)
      .values({
        name: 'First Project',
        description: 'First test project',
        live_url: testProject.live_url,
        source_url: testProject.source_url,
        tech_stack: testProject.tech_stack,
        featured: testProject.featured
      })
      .returning()
      .execute();

    const secondProject = await db.insert(projectsTable)
      .values({
        name: 'Second Project',
        description: 'Second test project',
        live_url: testProject.live_url,
        source_url: testProject.source_url,
        tech_stack: testProject.tech_stack,
        featured: testProject.featured
      })
      .returning()
      .execute();

    // Delete the first project
    const input: GetProjectByIdInput = { id: firstProject[0].id };
    const result = await deleteProject(input);

    expect(result.success).toBe(true);

    // Verify first project is deleted
    const deletedProjects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, firstProject[0].id))
      .execute();

    expect(deletedProjects).toHaveLength(0);

    // Verify second project still exists
    const remainingProjects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, secondProject[0].id))
      .execute();

    expect(remainingProjects).toHaveLength(1);
    expect(remainingProjects[0].name).toEqual('Second Project');
  });
});
