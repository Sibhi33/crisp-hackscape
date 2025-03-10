'use client';

import { Navbar } from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    BookMarked,
    BookOpen,
    Boxes,
    CheckIcon,
    Cloud,
    CloudLightning,
    Code,
    Copy,
    Database,
    FileCode2,
    Flame,
    Flower2,
    Globe,
    Grid,
    Laptop,
    Layers,
    Layout,
    Leaf,
    Package,
    Palette,
    SearchIcon,
    Server,
    Sparkles,
    TerminalSquare,
    Video,
    Workflow,
    Zap,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

// Add animation CSS
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  @keyframes shimmer {
    0% { background-position: -80vw 0; }
    100% { background-position: 80vw 0; }
  }
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
    100% { transform: translateY(0px); }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
  
  .animate-pulse-slow {
    animation: pulse 3s infinite ease-in-out;
  }
  
  .animate-float {
    animation: float 3s infinite ease-in-out;
  }

  .staggered-item:nth-child(1) { animation-delay: 0.1s; }
  .staggered-item:nth-child(2) { animation-delay: 0.2s; }
  .staggered-item:nth-child(3) { animation-delay: 0.3s; }
  .staggered-item:nth-child(4) { animation-delay: 0.4s; }
  .staggered-item:nth-child(5) { animation-delay: 0.5s; }
  .staggered-item:nth-child(6) { animation-delay: 0.6s; }

  .gradient-text {
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    background-image: linear-gradient(90deg, #3b82f6, #8b5cf6);
  }
  
  .shimmering-bg {
    background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.5), rgba(255,255,255,0));
    background-size: 80vw 100%;
    background-repeat: no-repeat;
    animation: shimmer 2s infinite;
  }
  
  .hover-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .glow-on-hover:hover {
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
  }

  .gradient-border {
    position: relative;
  }

  .gradient-border::after {
    content: '';
    position: absolute;
    inset: 0;
    padding: 2px;
    border-radius: 0.5rem;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .gradient-border:hover::after {
    opacity: 1;
  }
`;

// Add these interfaces after the imports and before PROJECT_TYPES
interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
}

interface DocResource {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  tags: string[];
}

// Add project types for tech stack suggestions
const PROJECT_TYPES = {
  'web-app': {
    name: 'Web Application',
    description: 'Full-stack web application with user interface and backend',
    suggestedTech: ['Next.js', 'React', 'Tailwind CSS', 'Supabase', 'Vercel'],
    categories: ['Frontend', 'Backend', 'Database', 'Authentication']
  },
  'mobile-app': {
    name: 'Mobile Application',
    description: 'Native or cross-platform mobile application',
    suggestedTech: ['React Native', 'Expo', 'Firebase', 'Redux'],
    categories: ['Mobile', 'Backend', 'State Management']
  },
  'ai-ml': {
    name: 'AI/ML Application',
    description: 'Application with artificial intelligence or machine learning',
    suggestedTech: ['Python', 'TensorFlow', 'OpenAI API', 'Hugging Face'],
    categories: ['AI/ML', 'API', 'Data Processing']
  },
  'data-analytics': {
    name: 'Data Analytics',
    description: 'Data processing and visualization application',
    suggestedTech: ['Python', 'Pandas', 'D3.js', 'PostgreSQL'],
    categories: ['Data', 'Visualization', 'Backend']
  },
  'iot': {
    name: 'IoT Application',
    description: 'Internet of Things application with hardware integration',
    suggestedTech: ['Arduino', 'Raspberry Pi', 'MQTT', 'Node.js'],
    categories: ['Hardware', 'Networking', 'Backend']
  },
  'blockchain': {
    name: 'Blockchain Application',
    description: 'Decentralized application with blockchain integration',
    suggestedTech: ['Ethereum', 'Solidity', 'Web3.js', 'Hardhat'],
    categories: ['Blockchain', 'Smart Contracts', 'Frontend']
  },
  'ar-vr': {
    name: 'AR/VR Application',
    description: 'Augmented or Virtual Reality application',
    suggestedTech: ['Unity', 'Three.js', 'WebXR', 'A-Frame'],
    categories: ['3D', 'Graphics', 'Frontend']
  },
  'devops': {
    name: 'DevOps Tools',
    description: 'Development operations and automation tools',
    suggestedTech: ['Docker', 'Kubernetes', 'GitHub Actions', 'Terraform'],
    categories: ['CI/CD', 'Containerization', 'Infrastructure']
  }
};

// Add categories for better organization
const CATEGORIES = [
  'Frontend',
  'Backend',
  'Database',
  'Authentication',
  'Mobile',
  'AI/ML',
  'DevOps',
  'Security',
  'Testing',
  'State Management',
  'API',
  'UI/UX',
  'Performance',
  'Analytics'
];

// Move the data declarations before the component
const uiSnippets: Snippet[] = [
  {
    id: 'ui-1',
    title: 'Responsive Card Grid',
    description: 'A responsive grid layout for displaying cards that adapts to different screen sizes.',
    code: `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all">
      <CardHeader className="p-4">
        <CardTitle>{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <p>{item.description}</p>
      </CardContent>
      <CardFooter className="bg-gray-50 p-4">
        <Button>View Details</Button>
      </CardFooter>
    </Card>
  ))}
</div>`,
    language: 'jsx',
    tags: ['UI', 'Responsive', 'Grid', 'Cards']
  },
  {
    id: 'ui-2',
    title: 'Search Input with Icon',
    description: 'A search input field with an icon and responsive design.',
    code: `<div className="relative w-full max-w-md">
  <Input
    type="text"
    placeholder="Search..."
    value={searchValue}
    onChange={(e) => setSearchValue(e.target.value)}
    className="pl-10 w-full"
    aria-label="Search"
  />
  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <SearchIcon size={16} className="text-gray-400" />
  </div>
</div>`,
    language: 'jsx',
    tags: ['UI', 'Input', 'Search', 'Icon']
  },
  {
    id: 'ui-3',
    title: 'Modal Dialog',
    description: 'A reusable modal dialog component with backdrop and animation.',
    code: `{isOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" 
       role="dialog" 
       aria-modal="true">
    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl 
                    animate-in fade-in-50 zoom-in-95 duration-200">
      <h2 className="text-xl font-semibold mb-4">Modal Title</h2>
      <p className="mb-6">Modal content goes here...</p>
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button onClick={handleConfirm}>
          Confirm
        </Button>
      </div>
    </div>
  </div>
)}`,
    language: 'jsx',
    tags: ['UI', 'Modal', 'Dialog', 'Overlay']
  },
  {
    id: 'ui-4',
    title: 'Loading Spinner',
    description: 'A customizable loading spinner with optional text.',
    code: `<div className="flex flex-col items-center justify-center py-8">
  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-3"></div>
  <p className="text-gray-600">Loading...</p>
</div>`,
    language: 'jsx',
    tags: ['UI', 'Loading', 'Spinner', 'Animation']
  },
  {
    id: 'ui-5',
    title: 'Alert/Toast Notification',
    description: 'A toast notification component for success, error, or info messages.',
    code: `{showToast && (
  <div className={\`fixed bottom-4 right-4 px-4 py-3 rounded-md shadow-lg 
                   flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 
                   duration-300 \${
                     type === 'success' ? 'bg-green-500 text-white' : 
                     type === 'error' ? 'bg-red-500 text-white' : 
                     'bg-blue-500 text-white'
                   }\`} 
       role="alert">
    {type === 'success' && <CheckIcon size={20} />}
    {type === 'error' && <AlertCircle size={20} />}
    {type === 'info' && <Info size={20} />}
    {message}
  </div>
)}`,
    language: 'jsx',
    tags: ['UI', 'Toast', 'Alert', 'Notification']
  },
  {
    id: 'ui-6',
    title: 'Tabbed Interface',
    description: 'A tabbed interface for organizing content into separate views.',
    code: `<Tabs defaultValue="tab1" className="w-full">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
    <TabsTrigger value="tab3">Tab 3</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    <Card>
      <CardHeader>
        <CardTitle>Tab 1 Content</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Content for tab 1 goes here...</p>
      </CardContent>
    </Card>
  </TabsContent>
  <TabsContent value="tab2">
    <Card>
      <CardHeader>
        <CardTitle>Tab 2 Content</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Content for tab 2 goes here...</p>
      </CardContent>
    </Card>
  </TabsContent>
  <TabsContent value="tab3">
    <Card>
      <CardHeader>
        <CardTitle>Tab 3 Content</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Content for tab 3 goes here...</p>
      </CardContent>
    </Card>
  </TabsContent>
</Tabs>`,
    language: 'jsx',
    tags: ['UI', 'Tabs', 'Navigation']
  }
];

const backendSnippets: Snippet[] = [
  {
    id: 'backend-1',
    title: 'Supabase Authentication',
    description: 'Set up authentication with Supabase in a Next.js application.',
    code: `// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Example usage in a component:
const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};`,
    language: 'typescript',
    tags: ['Backend', 'Authentication', 'Supabase', 'Next.js']
  },
  {
    id: 'backend-2',
    title: 'API Route with Edge Function',
    description: 'Create a serverless API route with Next.js Edge Runtime.',
    code: `// app/api/example/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    // Parse the URL and query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    
    // Fetch data or process the request
    const data = { message: 'Hello from the API', query };
    
    // Return the response
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}`,
    language: 'typescript',
    tags: ['Backend', 'API', 'Edge', 'Next.js']
  },
  {
    id: 'backend-3',
    title: 'Database Query with Supabase',
    description: 'Perform CRUD operations with Supabase database.',
    code: `// Example CRUD operations with Supabase

// Create record
const createItem = async (data) => {
  const { data: newItem, error } = await supabase
    .from('your_table')
    .insert([data])
    .select();
  
  if (error) throw error;
  return newItem;
};

// Read records
const getItems = async () => {
  const { data, error } = await supabase
    .from('your_table')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Update record
const updateItem = async (id, updates) => {
  const { data, error } = await supabase
    .from('your_table')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data;
};

// Delete record
const deleteItem = async (id) => {
  const { error } = await supabase
    .from('your_table')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};`,
    language: 'typescript',
    tags: ['Backend', 'Database', 'CRUD', 'Supabase']
  },
  {
    id: 'backend-4',
    title: 'File Upload with Supabase Storage',
    description: 'Upload files to Supabase Storage.',
    code: `// Upload a file to Supabase Storage
const uploadFile = async (file, bucketName = 'public') => {
  try {
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = \`\${Math.random().toString(36).substring(2)}-\${Date.now()}.\${fileExt}\`;
    const filePath = \`\${fileName}\`;
    
    // Upload the file
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return { path: data.path, url: publicUrl };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};`,
    language: 'typescript',
    tags: ['Backend', 'Storage', 'File Upload', 'Supabase']
  },
  {
    id: 'backend-5',
    title: 'Realtime Subscriptions with Supabase',
    description: 'Set up realtime data subscriptions with Supabase.',
    code: `// Setting up a realtime subscription
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtimeData(tableName) {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setData(data);
      } catch (error) {
        setError(error);
        console.error(\`Error fetching \${tableName}:\`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up realtime subscription
    const subscription = supabase
      .channel(\`\${tableName}-changes\`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: tableName 
      }, (payload) => {
        console.log('Change received!', payload);
        
        // Handle the different change types
        if (payload.eventType === 'INSERT') {
          setData(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setData(prev => prev.map(item => 
            item.id === payload.new.id ? payload.new : item
          ));
        } else if (payload.eventType === 'DELETE') {
          setData(prev => prev.filter(item => item.id !== payload.old.id));
        }
      })
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [tableName]);

  return { data, error, loading };
}`,
    language: 'typescript',
    tags: ['Backend', 'Realtime', 'Subscription', 'Supabase']
  },
  {
    id: 'backend-6',
    title: 'Rate Limiting Middleware',
    description: 'Implement rate limiting in a Next.js API route.',
    code: `// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory store for rate limiting
// Note: In production, use Redis or another external store
const rateLimit = new Map();
const RATE_LIMIT_DURATION = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30; // 30 requests per minute

export function middleware(request: NextRequest) {
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  const ip = request.ip || 'anonymous';
  const rateLimitKey = \`\${ip}:\${request.nextUrl.pathname}\`;
  
  // Get the current rate limit data or create it if it doesn't exist
  const rateLimitData = rateLimit.get(rateLimitKey) || {
    count: 0,
    timestamp: Date.now(),
  };
  
  // Reset the count if the time window has passed
  if (Date.now() - rateLimitData.timestamp > RATE_LIMIT_DURATION) {
    rateLimitData.count = 0;
    rateLimitData.timestamp = Date.now();
  }
  
  // Increment the request count
  rateLimitData.count++;
  rateLimit.set(rateLimitKey, rateLimitData);
  
  // Return rate limit headers
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString());
  response.headers.set('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - rateLimitData.count).toString());
  
  // If the rate limit is exceeded, return an error
  if (rateLimitData.count > MAX_REQUESTS) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: response.headers }
    );
  }
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};`,
    language: 'typescript',
    tags: ['Backend', 'Middleware', 'Rate Limiting', 'Next.js']
  }
];

const apiDocs: DocResource[] = [
  {
    id: 'api-1',
    title: 'Supabase Documentation',
    description: 'Official documentation for Supabase - an open source Firebase alternative.',
    url: 'https://supabase.com/docs',
    icon: <Database size={16} />,
    tags: ['Backend', 'Database', 'Authentication', 'Storage']
  },
  {
    id: 'api-2',
    title: 'Next.js Documentation',
    description: 'Official documentation for Next.js framework.',
    url: 'https://nextjs.org/docs',
    icon: <Server size={16} />,
    tags: ['Frontend', 'Backend', 'React', 'SSR']
  },
  {
    id: 'api-3',
    title: 'Shadcn UI Components',
    description: 'Documentation for the Shadcn UI component library.',
    url: 'https://ui.shadcn.com/',
    icon: <Laptop size={16} />,
    tags: ['UI', 'Components', 'Design System', 'Tailwind']
  },
  {
    id: 'api-4',
    title: 'OpenAI API',
    description: 'Integrate AI capabilities with OpenAI\'s API.',
    url: 'https://platform.openai.com/docs/api-reference',
    icon: <Zap size={16} />,
    tags: ['AI', 'API', 'Machine Learning']
  },
  {
    id: 'api-5',
    title: 'Vercel Documentation',
    description: 'Deploy and scale your Next.js applications with Vercel.',
    url: 'https://vercel.com/docs',
    icon: <Globe size={16} />,
    tags: ['Deployment', 'Hosting', 'CI/CD']
  },
  {
    id: 'api-6',
    title: 'Tailwind CSS',
    description: 'Documentation for Tailwind CSS utility-first framework.',
    url: 'https://tailwindcss.com/docs',
    icon: <FileCode2 size={16} />,
    tags: ['CSS', 'Styling', 'Design']
  },
  {
    id: 'api-7',
    title: 'Auth.js (NextAuth)',
    description: 'Authentication for Next.js applications.',
    url: 'https://authjs.dev/reference/nextjs',
    icon: <Laptop size={16} />,
    tags: ['Authentication', 'OAuth', 'Security']
  },
  {
    id: 'api-8',
    title: 'TanStack Query',
    description: 'Powerful asynchronous state management for fetching, caching, and updating data.',
    url: 'https://tanstack.com/query/latest/docs/react/overview',
    icon: <FileCode2 size={16} />,
    tags: ['State Management', 'Data Fetching', 'React']
  }
];

// Component for animated feature badge
const FeatureBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs px-2.5 py-1 rounded-full font-medium animate-pulse-slow">
    <Sparkles className="w-3 h-3 mr-1" />
    {children}
  </span>
);

// Dynamic section header
const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="mb-6">
    <h2 className="text-2xl font-bold gradient-text">{title}</h2>
    <p className="text-slate-600 mt-2">{subtitle}</p>
  </div>
);

const ResourcesPage = () => {
  const [_activeTab, setActiveTab] = useState('ui');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [selectedProjectType, setSelectedProjectType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copiedSnippet) {
      const timer = setTimeout(() => {
        setCopiedSnippet(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedSnippet]);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(""), 2000);
    
    // Show tooltip briefly
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  };

  // Get suggested resources based on project type
  const suggestedResources = useMemo(() => {
    if (!selectedProjectType) return null;

    const projectType = PROJECT_TYPES[selectedProjectType as keyof typeof PROJECT_TYPES];
    if (!projectType) return null;

    const relevantUiSnippets = uiSnippets.filter(snippet =>
      projectType.categories.some(cat => snippet.tags.includes(cat))
    );

    const relevantBackendSnippets = backendSnippets.filter(snippet =>
      projectType.categories.some(cat => snippet.tags.includes(cat))
    );

    const relevantDocs = apiDocs.filter(doc =>
      projectType.categories.some(cat => doc.tags.includes(cat))
    );

    return {
      suggestedTech: projectType.suggestedTech,
      uiSnippets: relevantUiSnippets,
      backendSnippets: relevantBackendSnippets,
      docs: relevantDocs
    };
  }, [selectedProjectType]);

  // Handle search interactions
  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Filter resources based on search and category
  const filterResources = <T extends { title: string; description: string; tags: string[] }>(
    items: T[],
    query: string,
    category: string
  ): T[] => {
    let filtered = items;

    if (query) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    if (category && category !== 'all') {
      filtered = filtered.filter(item =>
        item.tags.includes(category)
      );
    }

    return filtered;
  };

  const filteredUiSnippets = filterResources(uiSnippets, searchQuery, selectedCategory);
  const filteredBackendSnippets = filterResources(backendSnippets, searchQuery, selectedCategory);
  const filteredApiDocs = filterResources(apiDocs, searchQuery, selectedCategory);

  return (
    <>
      <style jsx global>{animationStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="animate-fade-in">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                  Resources
                  <span className="inline-block animate-float">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                  </span>
                </h1>
                <p className="mt-2 text-slate-700 max-w-3xl">
                  Find code snippets, UI components, and documentation for your hackathon project.
                  <span className="hidden sm:inline"> Build faster with these curated resources.</span>
                </p>
              </div>
            </div>

            {/* Project Type and Search Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                value={selectedProjectType}
                onValueChange={setSelectedProjectType}
              >
                <SelectTrigger className="bg-white text-slate-900 border-slate-200 hover:border-blue-300 focus:ring-2 focus:ring-blue-600 transition-all">
                  <SelectValue placeholder="Select project type" className="text-slate-900" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 shadow-md">
                  {Object.entries(PROJECT_TYPES).map(([key, value]) => (
                    <SelectItem 
                      key={key} 
                      value={key}
                      className="text-slate-900 hover:bg-blue-50 focus:bg-blue-50 focus:text-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{value.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="bg-white text-slate-900 border-slate-200 hover:border-blue-300 focus:ring-2 focus:ring-blue-600 transition-all">
                  <SelectValue placeholder="Filter by category" className="text-slate-900" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 shadow-md">
                  <SelectItem 
                    value="all"
                    className="text-slate-900 hover:bg-blue-50 focus:bg-blue-50 focus:text-slate-900 transition-colors"
                  >
                    <span className="font-medium">All Categories</span>
                  </SelectItem>
                  {CATEGORIES.map(category => (
                    <SelectItem 
                      key={category} 
                      value={category}
                      className="text-slate-900 hover:bg-blue-50 focus:bg-blue-50 focus:text-slate-900 transition-colors"
                    >
                      <span className="font-medium">{category}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative">
                <Input
                  type="text"
                  placeholder={isSearching ? "Searching..." : "Search resources..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 w-full bg-white text-slate-900 border-slate-200 hover:border-blue-300 
                    focus:ring-2 focus:ring-blue-600 placeholder:text-slate-500 transition-all
                    ${isSearching ? 'shimmering-bg' : ''}`}
                  aria-label="Search resources"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon size={16} className={`${isSearching ? 'text-blue-600 animate-pulse' : 'text-slate-500'}`} />
                </div>
              </div>
            </div>

            {/* Tech Stack Suggestions */}
            {selectedProjectType && suggestedResources && (
              <Card className="bg-white border border-slate-200 shadow-sm hover-lift transition-all overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600 animate-pulse-slow" />
                      Suggested Tech Stack for {PROJECT_TYPES[selectedProjectType as keyof typeof PROJECT_TYPES].name}
                    </CardTitle>
                    <FeatureBadge>AI Recommended</FeatureBadge>
                  </div>
                  <CardDescription className="text-slate-700">
                    {PROJECT_TYPES[selectedProjectType as keyof typeof PROJECT_TYPES].description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {suggestedResources.suggestedTech.map((tech, index) => (
                      <Badge 
                        key={index} 
                        className="bg-blue-100 text-blue-800 hover:bg-blue-200 font-medium transition-colors animate-fade-in staggered-item"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <Tabs defaultValue="ui" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-white border border-slate-200 rounded-full overflow-hidden p-1">
              <TabsTrigger 
                value="ui" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white text-slate-700 hover:bg-slate-100 data-[state=active]:hover:from-blue-700 data-[state=active]:hover:to-indigo-700 transition-all rounded-full"
              >
                <Laptop size={16} />
                <span className="hidden sm:inline font-medium">UI Components</span>
                <span className="sm:hidden font-medium">UI</span>
              </TabsTrigger>
              <TabsTrigger 
                value="backend" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white text-slate-700 hover:bg-slate-100 data-[state=active]:hover:from-blue-700 data-[state=active]:hover:to-indigo-700 transition-all rounded-full"
              >
                <Server size={16} />
                <span className="hidden sm:inline font-medium">Backend Code</span>
                <span className="sm:hidden font-medium">Backend</span>
              </TabsTrigger>
              <TabsTrigger 
                value="docs" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white text-slate-700 hover:bg-slate-100 data-[state=active]:hover:from-blue-700 data-[state=active]:hover:to-indigo-700 transition-all rounded-full"
              >
                <BookOpen size={16} />
                <span className="hidden sm:inline font-medium">Documentation</span>
                <span className="sm:hidden font-medium">Docs</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ui" className="space-y-6 animate-fade-in">
              {/* Helpful UI Resources Section */}
              <Card className="bg-white border border-slate-200 shadow-sm hover-lift transition-all overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                  <SectionHeader 
                    title="Helpful UI Resources" 
                    subtitle="Curated list of websites for UI components, design inspiration, and assets" 
                  />
                </CardHeader>
                <CardContent className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <a href="https://ui.shadcn.com" target="_blank" rel="noopener noreferrer" 
                     className="block p-4 rounded-lg border border-slate-200 hover-lift glow-on-hover gradient-border transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Layout className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">Shadcn UI</h3>
                    </div>
                    <p className="text-sm text-slate-700">Beautiful and accessible components built with Radix UI and Tailwind</p>
                  </a>
                  <a href="https://tailwindui.com" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Boxes className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">Tailwind UI</h3>
                    </div>
                    <p className="text-sm text-slate-700">Official Tailwind CSS components and templates</p>
                  </a>
                  <a href="https://headlessui.com" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">Headless UI</h3>
                    </div>
                    <p className="text-sm text-slate-700">Unstyled, accessible UI components for React</p>
                  </a>
                  <a href="https://mui.com" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Palette className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">Material UI</h3>
                    </div>
                    <p className="text-sm text-slate-700">Popular React UI framework implementing Material Design</p>
                  </a>
                  <a href="https://react-bootstrap.github.io" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Grid className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">React Bootstrap</h3>
                    </div>
                    <p className="text-sm text-slate-700">Bootstrap components built with React</p>
                  </a>
                  <a href="https://www.framer.com/motion" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">Framer Motion</h3>
                    </div>
                    <p className="text-sm text-slate-700">Production-ready animation library for React</p>
                  </a>
                  <a href="https://daisyui.com" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Flower2 className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">daisyUI</h3>
                    </div>
                    <p className="text-sm text-slate-700">Tailwind CSS component library with beautifully designed elements</p>
                  </a>
                  <a href="https://chakra-ui.com" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">Chakra UI</h3>
                    </div>
                    <p className="text-sm text-slate-700">Simple, modular and accessible component library for React</p>
                  </a>
                  <a href="https://ui.aceternity.com" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Layout className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">Aceternity UI</h3>
                    </div>
                    <p className="text-sm text-slate-700">Modern UI components with beautiful animations and effects for React</p>
                  </a>
                  <a href="https://github.com/vasanthk/react-bits" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">React Bits</h3>
                    </div>
                    <p className="text-sm text-slate-700">A compilation of React patterns, techniques, and best practices</p>
                  </a>
                </CardContent>
              </Card>

              {filteredUiSnippets.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center border border-slate-200 animate-fade-in">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse-slow">
                    <SearchIcon className="h-8 w-8 text-blue-700" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">No matching UI components</h2>
                  <p className="text-slate-700 mb-4">
                    Try a different search term or browse all components
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery('')}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 font-medium transition-all"
                  >
                    Clear Search
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredUiSnippets.map((snippet, index) => (
                    <Card 
                      key={snippet.id} 
                      className="resource-card overflow-hidden bg-white border border-slate-200 hover-lift transition-all animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardHeader className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                        <CardTitle className="text-lg font-semibold text-slate-900">{snippet.title}</CardTitle>
                        <CardDescription className="text-slate-700">{snippet.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="mt-4 relative">
                          <pre className="bg-slate-900 text-slate-50 p-4 rounded-md overflow-x-auto text-sm">
                            <code>{snippet.code}</code>
                          </pre>
                          <TooltipProvider>
                            <Tooltip open={copiedSnippet === snippet.id && showTooltip}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className={`absolute top-2 right-2 font-medium transition-all ${
                                    copiedSnippet === snippet.id 
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                      : 'bg-slate-800 text-white hover:bg-slate-700'
                                  }`}
                                  onClick={() => handleCopyCode(snippet.id, snippet.code)}
                                >
                                  {copiedSnippet === snippet.id ? (
                                    <><CheckIcon size={14} className="mr-1" /> Copied</>
                                  ) : (
                                    <><Copy size={14} className="mr-1" /> Copy</>
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copied to clipboard!</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </CardContent>
                      <CardFooter className="px-4 py-3 bg-slate-50 flex flex-wrap gap-2 border-t border-slate-200">
                        {snippet.tags.map((tag) => (
                          <Badge key={tag} className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors font-medium">
                            {tag}
                          </Badge>
                        ))}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="backend" className="space-y-6 animate-fade-in">
              {/* Helpful Backend Resources Section */}
              <Card className="bg-white border border-slate-200 shadow-sm hover-lift transition-all overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                  <SectionHeader 
                    title="Helpful Backend Resources" 
                    subtitle="Essential resources for backend development and APIs" 
                  />
                </CardHeader>
                <CardContent className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <a href="https://supabase.com" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover-lift glow-on-hover gradient-border transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">Supabase</h3>
                    </div>
                    <p className="text-sm text-slate-700">Open source Firebase alternative with powerful features</p>
                  </a>
                  <a href="https://railway.app" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover-lift glow-on-hover gradient-border transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Cloud className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">Railway</h3>
                    </div>
                    <p className="text-sm text-slate-700">Deploy infrastructure, from development to production</p>
                  </a>
                  <a href="https://www.prisma.io" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover-lift glow-on-hover gradient-border transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">Prisma</h3>
                    </div>
                    <p className="text-sm text-slate-700">Next-generation Node.js and TypeScript ORM</p>
                  </a>
                  <a href="https://firebase.google.com" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover-lift glow-on-hover gradient-border transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">Firebase</h3>
                    </div>
                    <p className="text-sm text-slate-700">Google&apos;s platform for app development with ready-made backend services</p>
                  </a>
                  <a href="https://planetscale.com" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover-lift glow-on-hover gradient-border transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">PlanetScale</h3>
                    </div>
                    <p className="text-sm text-slate-700">MySQL-compatible serverless database platform</p>
                  </a>
                  <a href="https://aws.amazon.com/amplify" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover-lift glow-on-hover gradient-border transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <CloudLightning className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">AWS Amplify</h3>
                    </div>
                    <p className="text-sm text-slate-700">Set of tools for building full-stack applications on AWS</p>
                  </a>
                  <a href="https://render.com" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover-lift glow-on-hover gradient-border transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">Render</h3>
                    </div>
                    <p className="text-sm text-slate-700">Unified platform to build and run all your apps and websites</p>
                  </a>
                  <a href="https://www.mongodb.com/atlas" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover-lift glow-on-hover gradient-border transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">MongoDB Atlas</h3>
                    </div>
                    <p className="text-sm text-slate-700">Cloud-hosted MongoDB service with free tier for small projects</p>
                  </a>
                  <a href="https://maven.apache.org" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover-lift glow-on-hover gradient-border transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">Apache Maven</h3>
                    </div>
                    <p className="text-sm text-slate-700">Software project management and comprehension tool for Java projects</p>
                  </a>
                  <a href="https://spring.io/projects/spring-boot" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover-lift glow-on-hover gradient-border transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Leaf className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">Spring Boot</h3>
                    </div>
                    <p className="text-sm text-slate-700">Framework to create stand-alone, production-grade Spring applications</p>
                  </a>
                  <a href="https://spring.io/tools" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover-lift glow-on-hover gradient-border transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <TerminalSquare className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">Spring Tool Suite (STS)</h3>
                    </div>
                    <p className="text-sm text-slate-700">Eclipse-based development environment for Spring applications</p>
                  </a>
                </CardContent>
              </Card>

              {filteredBackendSnippets.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center border border-slate-200 animate-fade-in">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse-slow">
                    <SearchIcon className="h-8 w-8 text-blue-700" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">No matching backend snippets</h2>
                  <p className="text-slate-700 mb-4">
                    Try a different search term or browse all backend code
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery('')}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 font-medium transition-all"
                  >
                    Clear Search
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredBackendSnippets.map((snippet, index) => (
                    <Card 
                      key={snippet.id} 
                      className="resource-card overflow-hidden bg-white border border-slate-200 hover-lift transition-all animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardHeader className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                        <CardTitle className="text-lg font-semibold text-slate-900">{snippet.title}</CardTitle>
                        <CardDescription className="text-slate-700">{snippet.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="mt-4 relative">
                          <pre className="bg-slate-900 text-slate-50 p-4 rounded-md overflow-x-auto text-sm">
                            <code>{snippet.code}</code>
                          </pre>
                          <TooltipProvider>
                            <Tooltip open={copiedSnippet === snippet.id && showTooltip}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className={`absolute top-2 right-2 font-medium transition-all ${
                                    copiedSnippet === snippet.id 
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                      : 'bg-slate-800 text-white hover:bg-slate-700'
                                  }`}
                                  onClick={() => handleCopyCode(snippet.id, snippet.code)}
                                >
                                  {copiedSnippet === snippet.id ? (
                                    <><CheckIcon size={14} className="mr-1" /> Copied</>
                                  ) : (
                                    <><Copy size={14} className="mr-1" /> Copy</>
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copied to clipboard!</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </CardContent>
                      <CardFooter className="px-4 py-3 bg-slate-50 flex flex-wrap gap-2 border-t border-slate-200">
                        {snippet.tags.map((tag) => (
                          <Badge key={tag} className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors font-medium">
                            {tag}
                          </Badge>
                        ))}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="docs" className="space-y-6 animate-fade-in">
              {/* Helpful Documentation Resources Section */}
              <Card className="bg-white border border-slate-200 shadow-sm hover-lift transition-all overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                  <SectionHeader 
                    title="Learning Resources & Documentation" 
                    subtitle="Comprehensive guides, tutorials, and documentation for developers" 
                  />
                </CardHeader>
                <CardContent className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <a href="https://www.theodinproject.com" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover-lift glow-on-hover gradient-border transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">The Odin Project</h3>
                    </div>
                    <p className="text-sm text-slate-700">Free full-stack curriculum with hands-on projects</p>
                  </a>
                  <a href="https://roadmap.sh" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover-lift glow-on-hover gradient-border transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Workflow className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">roadmap.sh</h3>
                    </div>
                    <p className="text-sm text-slate-700">Developer roadmaps and learning paths</p>
                  </a>
                  <a href="https://web.dev" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover-lift glow-on-hover gradient-border transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">web.dev</h3>
                    </div>
                    <p className="text-sm text-slate-700">Guidance for modern web development by Google</p>
                  </a>
                  <a href="https://developer.mozilla.org" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover-lift glow-on-hover gradient-border transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">MDN Web Docs</h3>
                    </div>
                    <p className="text-sm text-slate-700">Comprehensive documentation for web technologies</p>
                  </a>
                  <a href="https://github.com/awesome-selfhosted/awesome-selfhosted" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover-lift glow-on-hover gradient-border transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <BookMarked className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">Awesome Self-Hosted</h3>
                    </div>
                    <p className="text-sm text-slate-700">List of Free Software solutions for self-hosting your services</p>
                  </a>
                  <a href="https://devdocs.io" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover-lift glow-on-hover gradient-border transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">DevDocs</h3>
                    </div>
                    <p className="text-sm text-slate-700">Fast, offline access to multiple API documentations in a single web app</p>
                  </a>
                  <a href="https://scrimba.com" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover-lift glow-on-hover gradient-border transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">Scrimba</h3>
                    </div>
                    <p className="text-sm text-slate-700">Interactive coding screencasts for learning front-end development</p>
                  </a>
                  <a href="https://github.com/public-apis/public-apis" target="_blank" rel="noopener noreferrer"
                     className="block p-4 rounded-lg border border-slate-200 hover-lift glow-on-hover gradient-border transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">Public APIs</h3>
                    </div>
                    <p className="text-sm text-slate-700">Collective list of free APIs for use in software and web development</p>
                  </a>
                </CardContent>
              </Card>

              {filteredApiDocs.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center border border-slate-200 animate-fade-in">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse-slow">
                    <SearchIcon className="h-8 w-8 text-blue-700" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">No matching documentation</h2>
                  <p className="text-slate-700 mb-4">
                    Try a different search term or browse all documentation
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery('')}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 font-medium transition-all"
                  >
                    Clear Search
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredApiDocs.map((doc) => (
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      key={doc.id}
                      className="block h-full"
                    >
                      <Card className="overflow-hidden bg-white border border-slate-200 hover-lift transition-all h-full hover:border-blue-300">
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            {doc.icon}
                            {doc.title}
                          </CardTitle>
                          <CardDescription className="text-slate-700">{doc.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="px-4 py-3 bg-slate-50 flex flex-wrap gap-2 border-t border-slate-200">
                          {doc.tags.map((tag) => (
                            <Badge key={tag} className="bg-blue-100 text-blue-800 hover:bg-blue-200 font-medium">
                              {tag}
                            </Badge>
                          ))}
                        </CardFooter>
                      </Card>
                    </a>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default ResourcesPage;
