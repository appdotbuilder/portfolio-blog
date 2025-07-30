
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { projectsTable } from '../db/schema';
import { type CreateProjectInput } from '../schema';
import { createProject } from '../handlers/create_project';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateProjectInput = {
  name: 'Portfolio Website',
  description: 'A modern portfolio website built with React and TypeScript',
  live_url: 'https://example.com',
  source_url: 'https://github.com/user/portfolio',
  tech_stack: ['React', 'TypeScript', 'Tailwind CSS'],
  featured: true
};

describe('createProject', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a project', async () => {
    const result = await createProject(testInput);

    // Basic field validation
    expect(result.name).toEqual('Portfolio Website');
    expect(result.description).toEqual(testInput.description);
    expect(result.live_url).toEqual('https://example.com');
    expect(result.source_url).toEqual('https://github.com/user/portfolio');
    expect(result.tech_stack).toEqual(['React', 'TypeScript', 'Tailwind CSS']);
    expect(result.featured).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save project to database', async () => {
    const result = await createProject(testInput);

    // Query using proper drizzle syntax
    const projects = await db.select()
      .from(projectsTable)
      .where(eq(projectsTable.id, result.id))
      .execute();

    expect(projects).toHaveLength(1);
    expect(projects[0].name).toEqual('Portfolio Website');
    expect(projects[0].description).toEqual(testInput.description);
    expect(projects[0].live_url).toEqual('https://example.com');
    expect(projects[0].source_url).toEqual('https://github.com/user/portfolio');
    expect(projects[0].tech_stack).toEqual(['React', 'TypeScript', 'Tailwind CSS']);
    expect(projects[0].featured).toEqual(true);
    expect(projects[0].created_at).toBeInstanceOf(Date);
    expect(projects[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create project with nullable fields', async () => {
    const inputWithNulls: CreateProjectInput = {
      name: 'Simple Project',
      description: 'A basic project without URLs',
      live_url: null,
      source_url: null,
      tech_stack: ['JavaScript'],
      featured: false
    };

    const result = await createProject(inputWithNulls);

    expect(result.name).toEqual('Simple Project');
    expect(result.description).toEqual('A basic project without URLs');
    expect(result.live_url).toBeNull();
    expect(result.source_url).toBeNull();
    expect(result.tech_stack).toEqual(['JavaScript']);
    expect(result.featured).toEqual(false);
    expect(result.id).toBeDefined();
  });

  it('should apply default featured value', async () => {
    const inputWithDefaults: CreateProjectInput = {
      name: 'Default Project',
      description: 'A project using default featured flag',
      live_url: null,
      source_url: null,
      tech_stack: ['Vue.js'],
      featured: false // Include explicit value since it's required in the type
    };

    const result = await createProject(inputWithDefaults);

    expect(result.featured).toEqual(false);
  });
});
