
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput, type UpdateProjectInput } from '../schema';
import { updateProject } from '../handlers/update_project';
import { eq } from 'drizzle-orm';

// Test data for creating initial project
const initialProjectInput: CreateProjectInput = {
  name: 'Initial Project',
  description: 'Initial description',
  live_url: 'https://initial.example.com',
  source_url: 'https://github.com/user/initial',
  tech_stack: ['React', 'TypeScript'],
  featured: false
};

describe('updateProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a project successfully', async () => {
    // Create initial project
    const createResult = await db.insert(projectsTable)
      .values(initialProjectInput)
      .returning()
      .execute();

    const createdProject = createResult[0];
    const originalUpdatedAt = createdProject.updated_at;

    // Wait a small amount to ensure updated_at changes
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateProjectInput = {
      id: createdProject.id,
      name: 'Updated Project',
      description: 'Updated description',
      featured: true
    };

    const result = await updateProject(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdProject.id);
    expect(result!.name).toEqual('Updated Project');
    expect(result!.description).toEqual('Updated description');
    expect(result!.live_url).toEqual('https://initial.example.com'); // Unchanged
    expect(result!.source_url).toEqual('https://github.com/user/initial'); // Unchanged
    expect(result!.tech_stack).toEqual(['React', 'TypeScript']); // Unchanged
    expect(result!.featured).toEqual(true);
    expect(result!.created_at).toEqual(createdProject.created_at); // Unchanged
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should update project in database', async () => {
    // Create initial project
    const createResult = await db.insert(projectsTable)
      .values(initialProjectInput)
      .returning()
      .execute();

    const createdProject = createResult[0];

    const updateInput: UpdateProjectInput = {
      id: createdProject.id,
      name: 'Database Updated Project',
      tech_stack: ['Vue', 'JavaScript', 'Node.js']
    };

    await updateProject(updateInput);

    // Verify the update persisted in database
    const updatedProjects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, createdProject.id))
      .execute();

    expect(updatedProjects).toHaveLength(1);
    const updatedProject = updatedProjects[0];
    expect(updatedProject.name).toEqual('Database Updated Project');
    expect(updatedProject.description).toEqual('Initial description'); // Unchanged
    expect(updatedProject.tech_stack).toEqual(['Vue', 'JavaScript', 'Node.js']);
    expect(updatedProject.featured).toEqual(false); // Unchanged
  });

  it('should update only provided fields', async () => {
    // Create initial project
    const createResult = await db.insert(projectsTable)
      .values(initialProjectInput)
      .returning()
      .execute();

    const createdProject = createResult[0];

    const updateInput: UpdateProjectInput = {
      id: createdProject.id,
      live_url: null, // Explicitly set to null
      featured: true
    };

    const result = await updateProject(updateInput);

    expect(result!.name).toEqual('Initial Project'); // Unchanged
    expect(result!.description).toEqual('Initial description'); // Unchanged
    expect(result!.live_url).toBeNull(); // Updated to null
    expect(result!.source_url).toEqual('https://github.com/user/initial'); // Unchanged
    expect(result!.tech_stack).toEqual(['React', 'TypeScript']); // Unchanged
    expect(result!.featured).toEqual(true); // Updated
  });

  it('should return null for non-existent project', async () => {
    const updateInput: UpdateProjectInput = {
      id: 999,
      name: 'Non-existent Project'
    };

    const result = await updateProject(updateInput);

    expect(result).toBeNull();
  });

  it('should handle updating with all nullable fields', async () => {
    // Create initial project
    const createResult = await db.insert(projectsTable)
      .values(initialProjectInput)
      .returning()
      .execute();

    const createdProject = createResult[0];

    const updateInput: UpdateProjectInput = {
      id: createdProject.id,
      live_url: null,
      source_url: null
    };

    const result = await updateProject(updateInput);

    expect(result!.live_url).toBeNull();
    expect(result!.source_url).toBeNull();
    expect(result!.name).toEqual('Initial Project'); // Unchanged
    expect(result!.description).toEqual('Initial description'); // Unchanged
  });

  it('should update tech_stack array correctly', async () => {
    // Create initial project
    const createResult = await db.insert(projectsTable)
      .values(initialProjectInput)
      .returning()
      .execute();

    const createdProject = createResult[0];

    const updateInput: UpdateProjectInput = {
      id: createdProject.id,
      tech_stack: ['Python', 'Django', 'PostgreSQL', 'Docker']
    };

    const result = await updateProject(updateInput);

    expect(result!.tech_stack).toEqual(['Python', 'Django', 'PostgreSQL', 'Docker']);
    expect(result!.tech_stack).toHaveLength(4);
  });
});
