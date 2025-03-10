'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import TeamCreationModal from '@/components/TeamCreation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { PlusIcon, ShareIcon, TrashIcon, UsersIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

  const handleOpenTeamModal = (project: Project, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setTeamModalProject(project);
  };

  const handleGoToTeam = (team: Team, e: React.MouseEvent<HTMLButtonElement>) => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with search and actions */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-gray-800">My Projects</h1>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:w-64">
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                className="pl-10 w-full"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>
            
            <Button
              onClick={() => router.push('/assistant')}
              className="w-full sm:w-auto flex items-center gap-2"
            >
              <PlusIcon size={16} />
              New Project
            </Button>
          </div>
        </div>
        
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
                  className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-white"
                  onClick={() => handleCardClick(String(project.id))}
                >
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
                    <CardTitle className="text-xl font-semibold line-clamp-2">
                      {project.PS}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="p-5 flex flex-col space-y-4">
                    <div className="text-sm text-gray-500 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1.5"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      {new Date(project.createdat).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    
                    <div className="flex justify-between gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 flex items-center justify-center gap-1"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                          handleShare(project, e)
                        }
                      >
                        <ShareIcon size={14} /> Share
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 flex items-center justify-center gap-1 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                          handleDeleteClick(project, e)
                        }
                      >
                        <TrashIcon size={14} /> Delete
                      </Button>
                    </div>
                    
                    {teamForProject ? (
                      <Button
                        variant="default"
                        className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                          handleGoToTeam(teamForProject, e)
                        }
                      >
                        <UsersIcon size={16} /> Go to Team
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 border-dashed"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                          handleOpenTeamModal(project, e)
                        }
                      >
                        <UsersIcon size={16} /> Create Team
                      </Button>
                    )}
                  </CardContent>
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
                className="bg-gray-50"
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
