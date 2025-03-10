'use client';

import { Navbar } from '@/components/Navbar';
import { ParticleBackground } from '@/components/ParticleBackground';
import TeamCreationModal from '@/components/TeamCreation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, PlusIcon, Search, ShareIcon, TrashIcon, UsersIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface Project {
  id: number;
  user: string;
  PSdescription: string;
  createdat: string;
  PS: string;
  PSotherdetails: string;
  APIresponse: string;
  // add additional project properties if needed
}

interface Team {
  id: number;
  project_id: number;
  team_name: string;
  created_by: string;
  created_at: string;
  // add additional team properties if needed
}

const IdeasPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Modal states 
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [teamModalProject, setTeamModalProject] = useState<Project | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      if (user) {
        const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user', user.id)
        .order('createdat', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
      } else {
        setProjects((data as Project[]) || []);
      }

      }
      setIsLoading(false);
    };

    fetchProjects();
  }, [user]);

  useEffect(() => {
    const fetchTeams = async () => {
      if (projects.length > 0) {
        const projectIds = projects.map((p) => p.id);
        const { data, error } = await supabase
        .from('teams')
        .select('*')
        .in('project_id', projectIds);
      
      if (error) {
        console.error('Error fetching teams:', error);
      } else {
        setTeams((data as Team[]) || []);
      }
      
      }
    };

    fetchTeams();
  }, [projects]);

  const handleCardClick = (id: string) => {
    router.push(`/ideas/${id}`);
  };

  const handleShare = (project: Project, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setSelectedProject(project);
    setShowShareModal(true);
  };

  const handleCopy = async () => {
    if (!selectedProject) return;
    const shareLink = `${window.location.origin}/ideas/${selectedProject.id}`;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDeleteClick = (project: Project, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', selectedProject.id);
      
      if (error) {
        console.error('Error deleting project:', error);
      } else {
        setProjects((prev) => prev.filter((proj) => proj.id !== selectedProject.id));
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error in delete operation:', error);
    }
  };

  const handleOpenTeamModal = (project: Project, e: React.MouseEvent<Element>) => {
    e.stopPropagation();
    setSelectedProject(project);
    setTeamModalProject(project);
  };

  const handleGoToTeam = (team: Team, e: React.MouseEvent<Element>) => {
    e.stopPropagation();
    router.push(`/teams/${team.id}`);
  };

  const handleTeamCreated = (newTeam: Team) => {
    setTeams((prev) => [...prev, newTeam]);
    setTeamModalProject(null);
  };

  // Filter projects based on search query
  const filteredProjects = searchQuery 
    ? projects.filter((project) => 
        project.PS.toLowerCase().includes(searchQuery.toLowerCase()))
    : projects;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 rounded-lg shadow-md bg-white">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign in Required</h2>
          <p className="mb-6 text-gray-600">
            Please log in to view and manage your projects.
          </p>
          <Button onClick={() => router.push('/login')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <header className="mb-8 space-y-4">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-5xl font-black bg-gradient-to-r from-electric-blue via-cyber-purple to-cyber-pink bg-clip-text text-transparent drop-shadow-lg"
          >
            Your Projects
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="glassmorphism rounded-xl p-5 border border-white/20 bg-background/40 backdrop-blur-xl"
          >
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-grow">
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full bg-background/20 border border-white/10 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-electric-blue/50"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-muted-foreground" />
                </div>
              </div>
              <Button
                onClick={() => router.push('/assistant')}
                className="w-full sm:w-auto flex items-center gap-2 cyber-button"
              >
                <PlusIcon size={16} />
                New Project
              </Button>
            </div>
          </motion.div>
        </header>
        
        {/* Projects grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            {searchQuery ? (
              <>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-500"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  No matching projects
                </h2>
                <p className="text-gray-600 mb-4">
                  We couldn&apos;t find any projects matching &quot;{searchQuery}&quot;
                </p>
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <PlusIcon className="h-8 w-8 text-blue-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  No projects yet
                </h2>
                <p className="text-gray-600 mb-4">
                  Get started by creating your first project
                </p>
                <Button onClick={() => router.push('/new-project')}>
                  Create Project
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const teamForProject = teams.find(
                (team) => team.project_id === project.id
              );
              
              return (
                <Card
                  key={project.id}
                  className="glassmorphism h-full p-6 card-hover border border-white/20 bg-[#131620]/90 backdrop-blur-xl relative overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Project label in top left */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="inline-block px-3 py-1 rounded-full bg-background/40 text-cyber-pink text-xs font-medium backdrop-blur-md border border-cyber-pink/20">
                      Project
                    </div>

                    {/* Action buttons in top right */}
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleShare(project, e); }}>
                        <ShareIcon size={14} className="text-cyber-blue" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteClick(project, e); }}>
                        <TrashIcon size={14} className="text-red-500" />
                      </Button>
                    </div>
                  </div>

                  {/* Main content area */}
                  <div onClick={() => handleCardClick(String(project.id))} className="flex flex-col flex-1">
                    <h3 className="text-2xl font-bold mb-2 text-white">{project.PS}</h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {project.PSdescription || 'No description provided.'}
                    </p>
                    
                    {/* Date with calendar icon */}
                    <div className="mt-auto pt-3 mb-4">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar size={14} className="w-3 h-3" />
                        <span>Created {new Date(project.createdat).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Full-width view project button */}
                    <div className="grid grid-cols-1 gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(String(project.id));
                        }} 
                        className="w-full px-4 py-2 border border-electric-blue/70 text-electric-blue hover:bg-electric-blue/10 rounded-lg text-sm transition-colors flex items-center justify-center"
                      >
                        View Project <ChevronRight className="ml-1 w-4 h-4" />
                      </button>
                      
                      {/* Team button below */}
                      {teamForProject ? (
                        <Button 
                          variant="default" 
                          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600"
                          onClick={(e) => {
                            e.stopPropagation(); 
                            handleGoToTeam(teamForProject, e);
                          }}
                        >
                          <UsersIcon size={16} /> Go to Team
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="flex items-center justify-center gap-2 border-dashed"
                          onClick={(e) => {
                            e.stopPropagation(); 
                            handleOpenTeamModal(project, e);
                          }}
                        >
                          <UsersIcon size={16} /> Create Team
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      
      {/* Share Modal */}
      {showShareModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Share Project
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Share this link with others to give them access to your project
            </p>
            <div className="flex items-center space-x-2 mb-4">
              <Input
                type="text"
                readOnly
                value={`${window.location.origin}/ideas/${selectedProject.id}`}
                className="bg-gray-50 text-black"
              />
              <Button
                onClick={handleCopy}
                variant="outline"
                className={`shrink-0 ${copied ? 'bg-green-50 text-green-600 border-green-200' : ''}`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowShareModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              Delete Project
            </h2>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete &quot;{selectedProject.PS}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Team Creation Modal */}
      {teamModalProject && (
        <TeamCreationModal
          project={teamModalProject}
          onClose={() => setTeamModalProject(null)}
          onTeamCreated={handleTeamCreated}
        />
      )}
      
      {/* Toast notification for success messages */}
      {copied && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-md shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          Link copied to clipboard
        </div>
      )}
    </div>
  );
};

export default IdeasPage;
