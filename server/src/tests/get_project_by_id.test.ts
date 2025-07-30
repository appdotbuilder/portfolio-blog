
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type GetProjectByIdInput, type CreateProjectInput } from '../schema';
import { getProjectById } from '../handlers/get_project_by_id';

// Test input for querying
const testQueryInput: GetProjectByIdInput = {
  id: 1
};

// Test project data
const testProjectInput: CreateProjectInput = {
  name: 'Test Project',
  description: 'A project for testing',
  live_url: 'https://example.com',
  source_url: 'https://github.com/test/project',
  tech_stack: ['TypeScript', 'React', 'Node.js'],
  featured: true
};

describe('getProjectById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return project when it exists', async () => {
    // Create test project first
    const insertResult = await db.insert(projectsTable)
      .values({
        name: testProjectInput.name,
        description: testProjectInput.description,
        live_url: testProjectInput.live_url,
        source_url: testProjectInput.source_url,
        tech_stack: testProjectInput.tech_stack,
        featured: testProjectInput.featured
      })
      .returning()
      .execute();

    const createdProject = insertResult[0];
    
    // Test the handler
    const result = await getProjectById({ id: createdProject.id });

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdProject.id);
    expect(result!.name).toEqual('Test Project');
    expect(result!.description).toEqual(testProjectInput.description);
    expect(result!.live_url).toEqual('https://example.com');
    expect(result!.source_url).toEqual('https://github.com/test/project');
    expect(result!.tech_stack).toEqual(['TypeScript', 'React', 'Node.js']);
    expect(result!.featured).toEqual(true);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when project does not exist', async () => {
    const result = await getProjectById({ id: 999 });

    expect(result).toBeNull();
  });

  it('should handle nullable fields correctly', async () => {
    // Create project with nullable fields set to null
    const insertResult = await db.insert(projectsTable)
      .values({
        name: 'Minimal Project',
        description: 'A minimal project',
        live_url: null,
        source_url: null,
        tech_stack: ['JavaScript'],
        featured: false
      })
      .returning()
      .execute();

    const createdProject = insertResult[0];
    
    const result = await getProjectById({ id: createdProject.id });

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('Minimal Project');
    expect(result!.live_url).toBeNull();
    expect(result!.source_url).toBeNull();
    expect(result!.tech_stack).toEqual(['JavaScript']);
    expect(result!.featured).toEqual(false);
  });
});
