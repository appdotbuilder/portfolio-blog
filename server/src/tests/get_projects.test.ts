
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput } from '../schema';
import { getProjects } from '../handlers/get_projects';

const testProject1: CreateProjectInput = {
  name: 'Featured Project',
  description: 'A featured test project',
  live_url: 'https://example.com',
  source_url: 'https://github.com/test/project1',
  tech_stack: ['React', 'TypeScript'],
  featured: true
};

const testProject2: CreateProjectInput = {
  name: 'Regular Project',
  description: 'A regular test project',
  live_url: null,
  source_url: 'https://github.com/test/project2',
  tech_stack: ['Node.js', 'Express'],
  featured: false
};

const testProject3: CreateProjectInput = {
  name: 'Another Project',
  description: 'Another test project',
  live_url: 'https://another.com',
  source_url: null,
  tech_stack: ['Vue.js'],
  featured: false
};

describe('getProjects', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no projects exist', async () => {
    const result = await getProjects();
    expect(result).toEqual([]);
  });

  it('should return all projects', async () => {
    // Create test projects
    await db.insert(projectsTable)
      .values([
        {
          name: testProject1.name,
          description: testProject1.description,
          live_url: testProject1.live_url,
          source_url: testProject1.source_url,
          tech_stack: testProject1.tech_stack,
          featured: testProject1.featured
        },
        {
          name: testProject2.name,
          description: testProject2.description,
          live_url: testProject2.live_url,
          source_url: testProject2.source_url,
          tech_stack: testProject2.tech_stack,
          featured: testProject2.featured
        }
      ])
      .execute();

    const result = await getProjects();

    expect(result).toHaveLength(2);
    
    // Verify project data
    const featuredProject = result.find(p => p.featured);
    const regularProject = result.find(p => !p.featured);

    expect(featuredProject).toBeDefined();
    expect(featuredProject!.name).toEqual('Featured Project');
    expect(featuredProject!.tech_stack).toEqual(['React', 'TypeScript']);
    expect(featuredProject!.live_url).toEqual('https://example.com');

    expect(regularProject).toBeDefined();
    expect(regularProject!.name).toEqual('Regular Project');
    expect(regularProject!.tech_stack).toEqual(['Node.js', 'Express']);
    expect(regularProject!.live_url).toBeNull();
  });

  it('should order projects with featured first, then by creation date', async () => {
    // Insert projects in specific order to test sorting
    await db.insert(projectsTable)
      .values({
        name: testProject2.name,
        description: testProject2.description,
        live_url: testProject2.live_url,
        source_url: testProject2.source_url,
        tech_stack: testProject2.tech_stack,
        featured: testProject2.featured
      })
      .execute();

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(projectsTable)
      .values({
        name: testProject1.name,
        description: testProject1.description,
        live_url: testProject1.live_url,
        source_url: testProject1.source_url,
        tech_stack: testProject1.tech_stack,
        featured: testProject1.featured
      })
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(projectsTable)
      .values({
        name: testProject3.name,
        description: testProject3.description,
        live_url: testProject3.live_url,
        source_url: testProject3.source_url,
        tech_stack: testProject3.tech_stack,
        featured: testProject3.featured
      })
      .execute();

    const result = await getProjects();

    expect(result).toHaveLength(3);
    
    // Featured project should be first
    expect(result[0].featured).toBe(true);
    expect(result[0].name).toEqual('Featured Project');
    
    // Non-featured projects should be ordered by creation date (newest first)
    expect(result[1].featured).toBe(false);
    expect(result[2].featured).toBe(false);
    expect(result[1].name).toEqual('Another Project'); // Created last
    expect(result[2].name).toEqual('Regular Project'); // Created first
  });

  it('should handle projects with null values correctly', async () => {
    await db.insert(projectsTable)
      .values({
        name: 'Minimal Project',
        description: 'Project with null values',
        live_url: null,
        source_url: null,
        tech_stack: ['JavaScript'],
        featured: false
      })
      .execute();

    const result = await getProjects();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Minimal Project');
    expect(result[0].live_url).toBeNull();
    expect(result[0].source_url).toBeNull();
    expect(result[0].tech_stack).toEqual(['JavaScript']);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });
});
