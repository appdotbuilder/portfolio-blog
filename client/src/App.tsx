
import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Github, Calendar, Star, FileText } from 'lucide-react';
// Type-only imports for better TypeScript compliance
import type { Project, BlogPost } from '../../server/src/schema';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingBlog, setIsLoadingBlog] = useState(true);
  const [usesOfflineData, setUsesOfflineData] = useState(false);

  // Sample data for demonstration
  const sampleProjects: Project[] = [
    {
      id: 1,
      name: "E-Commerce Platform",
      description: "A full-stack e-commerce solution built with React, Node.js, and PostgreSQL. Features include user authentication, product catalog, shopping cart, and payment processing.",
      live_url: "https://demo-ecommerce.example.com",
      source_url: "https://github.com/example/ecommerce-platform",
      tech_stack: ["React", "TypeScript", "Node.js", "PostgreSQL", "Stripe"],
      featured: true,
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-20')
    },
    {
      id: 2,
      name: "Task Management App",
      description: "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.",
      live_url: "https://taskapp.example.com",
      source_url: "https://github.com/example/task-manager",
      tech_stack: ["Vue.js", "Socket.io", "Express", "MongoDB"],
      featured: false,
      created_at: new Date('2023-11-10'),
      updated_at: new Date('2023-11-25')
    },
    {
      id: 3,
      name: "Weather Dashboard",
      description: "A responsive weather dashboard that displays current conditions and forecasts using multiple weather APIs with beautiful data visualizations.",
      live_url: "https://weather-dash.example.com",
      source_url: null,
      tech_stack: ["React", "Chart.js", "Weather API", "Tailwind CSS"],
      featured: true,
      created_at: new Date('2023-09-05'),
      updated_at: new Date('2023-09-12')
    },
    {
      id: 4,
      name: "Blog CMS",
      description: "A content management system for bloggers with markdown support, SEO optimization, and social media integration.",
      live_url: null,
      source_url: "https://github.com/example/blog-cms",
      tech_stack: ["Next.js", "Prisma", "SQLite", "Markdown"],
      featured: false,
      created_at: new Date('2023-07-20'),
      updated_at: new Date('2023-08-01')
    }
  ];

  const sampleBlogPosts: BlogPost[] = [
    {
      id: 1,
      title: "Building Scalable React Applications",
      content: "In this comprehensive guide, I'll walk you through the best practices for building scalable React applications. We'll cover component architecture, state management patterns, performance optimization techniques, and how to structure your codebase for long-term maintainability. Whether you're working on a small project or a large enterprise application, these principles will help you create robust and efficient React apps.",
      excerpt: "A comprehensive guide to building scalable React applications with best practices for architecture, state management, and performance optimization.",
      slug: "building-scalable-react-applications",
      substack_id: null,
      substack_url: null,
      published: true,
      published_at: new Date('2024-01-10'),
      created_at: new Date('2024-01-08'),
      updated_at: new Date('2024-01-10')
    },
    {
      id: 2,
      title: "The Future of Web Development",
      content: "Web development is constantly evolving, and staying up-to-date with the latest trends and technologies is crucial for developers. In this post, I explore emerging technologies like WebAssembly, Progressive Web Apps, edge computing, and how AI is changing the development landscape. We'll also discuss what skills developers should focus on to stay relevant in the coming years.",
      excerpt: "Exploring emerging trends in web development including WebAssembly, PWAs, edge computing, and the impact of AI on development.",
      slug: "future-of-web-development",
      substack_id: "sub_123456",
      substack_url: "https://mysubstack.substack.com/p/future-of-web-development",
      published: true,
      published_at: new Date('2023-12-15'),
      created_at: new Date('2023-12-12'),
      updated_at: new Date('2023-12-15')
    },
    {
      id: 3,
      title: "TypeScript Tips and Tricks",
      content: "TypeScript has become an essential tool for modern JavaScript development. In this post, I share some advanced TypeScript techniques that can help you write more robust and maintainable code. We'll cover utility types, conditional types, template literal types, and how to effectively use TypeScript with popular frameworks like React and Node.js.",
      excerpt: "Advanced TypeScript techniques including utility types, conditional types, and framework-specific best practices.",
      slug: "typescript-tips-and-tricks",
      substack_id: "sub_789012",
      substack_url: "https://mysubstack.substack.com/p/typescript-tips-and-tricks",
      published: true,
      published_at: new Date('2023-11-20'),
      created_at: new Date('2023-11-18'),
      updated_at: new Date('2023-11-20')
    },
    {
      id: 4,
      title: "Optimizing Database Performance",
      content: "Database performance is critical for any web application. This post covers various strategies for optimizing database queries, indexing strategies, connection pooling, and caching techniques. We'll look at examples using PostgreSQL and discuss when to use different optimization approaches based on your application's specific needs.",
      excerpt: null,
      slug: "optimizing-database-performance",
      substack_id: null,
      substack_url: null,
      published: false,
      published_at: null,
      created_at: new Date('2023-10-05'),
      updated_at: new Date('2023-10-08')
    }
  ];

  // Load projects with fallback to sample data
  const loadProjects = useCallback(async () => {
    try {
      const result = await trpc.getProjects.query();
      setProjects(result);
      setUsesOfflineData(false);
    } catch (error) {
      console.warn('Backend not available, using sample data for projects:', error);
      setProjects(sampleProjects);
      setUsesOfflineData(true);
    } finally {
      setIsLoadingProjects(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Sample data is defined inline, so no dependencies needed

  // Load blog posts with fallback to sample data
  const loadBlogPosts = useCallback(async () => {
    try {
      const result = await trpc.getBlogPosts.query();
      setBlogPosts(result);
    } catch (error) {
      console.warn('Backend not available, using sample data for blog posts:', error);
      setBlogPosts(sampleBlogPosts);
    } finally {
      setIsLoadingBlog(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Sample data is defined inline, so no dependencies needed

  useEffect(() => {
    loadProjects();
    loadBlogPosts();
  }, [loadProjects, loadBlogPosts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Development Notice */}
      {usesOfflineData && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="container mx-auto px-6 py-2">
            <p className="text-sm text-blue-800 text-center">
              🔧 <strong>Demo Mode:</strong> Backend is not connected. Showing sample data for demonstration purposes.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🚀 Developer Portfolio
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Welcome to my digital space where I showcase my projects and share insights through my blog
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="projects" className="text-lg">
              💼 Projects
            </TabsTrigger>
            <TabsTrigger value="blog" className="text-lg">
              📝 Blog
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">My Projects</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                A collection of applications and tools I've built using various technologies. 
                Each project represents a learning journey and solution to real-world problems.
              </p>
            </div>

            {isLoadingProjects ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏗️</div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  Projects Coming Soon!
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  I'm currently working on exciting projects that will be showcased here. 
                  Check back soon to see what I've been building!
                </p>
              </div>
            ) : (
              <>
                {/* Featured Projects */}
                {projects.some((project: Project) => project.featured) && (
                  <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                      <Star className="w-6 h-6 text-yellow-500 fill-current" />
                      <h3 className="text-2xl font-bold text-gray-900">Featured Projects</h3>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      {projects
                        .filter((project: Project) => project.featured)
                        .map((project: Project) => (
                          <ProjectCard key={project.id} project={project} featured />
                        ))}
                    </div>
                  </div>
                )}

                {/* All Projects */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    {projects.some((project: Project) => project.featured) ? 'Other Projects' : 'All Projects'}
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects
                      .filter((project: Project) => !project.featured)
                      .map((project: Project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">My Blog</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Thoughts, tutorials, and insights from my development journey. 
                Some posts are imported from my Substack newsletter.
              </p>
            </div>

            {isLoadingBlog ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-8 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : blogPosts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">✍️</div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  Blog Posts Coming Soon!
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  I'm preparing some great content to share with you. 
                  This will include both original posts and content from my Substack newsletter.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {blogPosts
                  .filter((post: BlogPost) => post.published)
                  .map((post: BlogPost) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                
                {/* Draft Posts Section */}
                {blogPosts.some((post: BlogPost) => !post.published) && (
                  <div className="mt-12">
                    <Separator className="mb-8" />
                    <h3 className="text-xl font-bold text-gray-700 mb-6">📝 Draft Posts</h3>
                    <div className="space-y-4">
                      {blogPosts
                        .filter((post: BlogPost) => !post.published)
                        .map((post: BlogPost) => (
                          <BlogPostCard key={post.id} post={post} />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              © 2024 Developer Portfolio. Built with React, TypeScript, and tRPC.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Project Card Component
interface ProjectCardProps {
  project: Project;
  featured?: boolean;
}

function ProjectCard({ project, featured = false }: ProjectCardProps) {
  return (
    <Card className={`group hover:shadow-lg transition-shadow duration-200 ${featured ? 'ring-2 ring-yellow-200 bg-yellow-50' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {project.name}
              {featured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
            </CardTitle>
            <CardDescription className="mt-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                {project.created_at.toLocaleDateString()}
              </div>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-700 mb-4 line-clamp-3">{project.description}</p>
        
        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tech_stack.map((tech: string) => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        {project.live_url && (
          <Button 
            variant="default" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => window.open(project.live_url!, '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            Live Demo
          </Button>
        )}
        {project.source_url && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => window.open(project.source_url!, '_blank')}
          >
            <Github className="w-4 h-4" />
            Source
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// Blog Post Card Component
interface BlogPostCardProps {
  post: BlogPost;
}

function BlogPostCard({ post }: BlogPostCardProps) {
  const handleReadMore = () => {
    // In a real app, this would navigate to a detailed post view
    console.log(`Navigate to post: ${post.slug}`);
  };

  return (
    <Card className={`group hover:shadow-lg transition-shadow duration-200 ${!post.published ? 'opacity-75 border-dashed' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl group-hover:text-blue-600 transition-colors cursor-pointer" onClick={handleReadMore}>
              {post.title}
            </CardTitle>
            <CardDescription className="mt-2 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {post.published_at 
                  ? post.published_at.toLocaleDateString() 
                  : post.created_at.toLocaleDateString()
                }
              </div>
              {post.substack_url && (
                <Badge variant="outline" className="text-xs">
                  From Substack
                </Badge>
              )}
              <Badge variant={post.published ? "default" : "secondary"}>
                {post.published ? "Published" : "Draft"}
              </Badge>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {post.excerpt && (
          <p className="text-gray-700 mb-4 leading-relaxed">
            {post.excerpt}
          </p>
        )}
        <Separator className="my-4" />
        <div className="prose prose-sm max-w-none text-gray-600">
          <p className="line-clamp-3">
            {post.content.substring(0, 300)}...
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button variant="default" size="sm" className="flex items-center gap-2" onClick={handleReadMore}>
          <FileText className="w-4 h-4" />
          Read More
        </Button>
        {post.substack_url && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => window.open(post.substack_url!, '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            View on Substack
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default App;
