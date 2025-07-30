
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  createProjectInputSchema, 
  updateProjectInputSchema,
  getProjectByIdInputSchema,
  createBlogPostInputSchema,
  updateBlogPostInputSchema,
  getBlogPostByIdInputSchema,
  getBlogPostBySlugInputSchema
} from './schema';

// Import handlers
import { createProject } from './handlers/create_project';
import { getProjects } from './handlers/get_projects';
import { getProjectById } from './handlers/get_project_by_id';
import { updateProject } from './handlers/update_project';
import { deleteProject } from './handlers/delete_project';
import { createBlogPost } from './handlers/create_blog_post';
import { getBlogPosts } from './handlers/get_blog_posts';
import { getBlogPostById } from './handlers/get_blog_post_by_id';
import { getBlogPostBySlug } from './handlers/get_blog_post_by_slug';
import { updateBlogPost } from './handlers/update_blog_post';
import { deleteBlogPost } from './handlers/delete_blog_post';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Project routes
  createProject: publicProcedure
    .input(createProjectInputSchema)
    .mutation(({ input }) => createProject(input)),
  
  getProjects: publicProcedure
    .query(() => getProjects()),
  
  getProjectById: publicProcedure
    .input(getProjectByIdInputSchema)
    .query(({ input }) => getProjectById(input)),
  
  updateProject: publicProcedure
    .input(updateProjectInputSchema)
    .mutation(({ input }) => updateProject(input)),
  
  deleteProject: publicProcedure
    .input(getProjectByIdInputSchema)
    .mutation(({ input }) => deleteProject(input)),

  // Blog post routes
  createBlogPost: publicProcedure
    .input(createBlogPostInputSchema)
    .mutation(({ input }) => createBlogPost(input)),
  
  getBlogPosts: publicProcedure
    .query(() => getBlogPosts()),
  
  getBlogPostById: publicProcedure
    .input(getBlogPostByIdInputSchema)
    .query(({ input }) => getBlogPostById(input)),
  
  getBlogPostBySlug: publicProcedure
    .input(getBlogPostBySlugInputSchema)
    .query(({ input }) => getBlogPostBySlug(input)),
  
  updateBlogPost: publicProcedure
    .input(updateBlogPostInputSchema)
    .mutation(({ input }) => updateBlogPost(input)),
  
  deleteBlogPost: publicProcedure
    .input(getBlogPostByIdInputSchema)
    .mutation(({ input }) => deleteBlogPost(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
