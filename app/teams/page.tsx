'use client';

import { Navbar } from '@/components/Navbar';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, PlusCircle, Search, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface Team {
  id: string;
  team_name: string;
  created_at?: string;
  members_count?: number;
  project?: {
    PS: string;
    PSdescription: string;
  };
}

const TeamsPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchTeams = async () => {
      if (!user) return;

      // First, fetch team memberships for the user
      const { data: membershipData, error: membershipError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);

      if (membershipError) {
        console.error('Error fetching team memberships:', membershipError);
        setLoading(false);
        return;
      }

      // Extract an array of team IDs from membership data
      const memberTeamIds = membershipData.map(
        (m: { team_id: string }) => m.team_id
      );

      // Build the filter for teams:
      // - Teams created by the user OR teams where the user is a member
      let filter = '';
      if (memberTeamIds.length > 0) {
        filter = `created_by.eq.${user.id},id.in.(${memberTeamIds.join(',')})`;
      } else {
        filter = `created_by.eq.${user.id}`;
      }

      // Now, fetch teams using the built filter and join the related project data
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*, project:projects(PS,PSdescription)')
        .or(filter);

      if (teamError) {
        console.error('Error fetching teams:', teamError);
      } else {
        // For each team, count its members
        const teamsWithMemberCount = await Promise.all(
          (teamData || []).map(async (team) => {
            const { count, error: _error } = await supabase
              .from('team_members')
              .select('*', { count: 'exact', head: true })
              .eq('team_id', team.id);
              
            return {
              ...team,
              members_count: count || 0
            };
          })
        );
        
        setTeams(teamsWithMemberCount || []);
      }
      setLoading(false);
    };

    fetchTeams();
  }, [user]);

  // Filter teams based on search query
  const filteredTeams = searchQuery
    ? teams.filter(team => 
        team.team_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (team.project?.PS && team.project.PS.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : teams;

  return (
    <div className="min-h-screen w-full overflow-hidden relative flex flex-col">
      <ParticleBackground />

      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          {/* Header */}
          <header className="text-center space-y-6">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="text-4xl md:text-5xl font-black bg-gradient-to-r from-electric-blue via-cyber-purple to-cyber-pink bg-clip-text text-transparent drop-shadow-lg"
            >
              Your Teams
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Collaborate with teammates and build amazing projects together
            </motion.p>
          </header>

          {/* Search and Filter Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="glassmorphism rounded-xl p-5 border border-white/20 bg-background/40 backdrop-blur-xl"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search teams..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background/20 border border-white/10 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-electric-blue/50"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg border ${filter === 'all' ? 'bg-electric-blue text-white border-electric-blue' : 'border-white/20 bg-background/20 hover:bg-background/40'}`}
                >
                  All Teams
                </button>
            <button
                  onClick={() => setFilter('my')}
                  className={`px-4 py-2 rounded-lg border ${filter === 'my' ? 'bg-electric-blue text-white border-electric-blue' : 'border-white/20 bg-background/20 hover:bg-background/40'}`}
                >
                  My Teams
                </button>
                <Link href="/ideas" className="cyber-button inline-flex items-center px-4 py-2">
                  <PlusCircle className="mr-2 w-4 h-4" />
                  Create Team
                </Link>
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-blue"></div>
            </div>
          ) : filteredTeams.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glassmorphism p-8 rounded-xl border border-white/20 bg-background/40 backdrop-blur-xl text-center"
            >
              <div className="mb-4 mx-auto w-16 h-16 bg-electric-blue/10 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-electric-blue" />
              </div>
              <h2 className="text-xl font-bold mb-2">No Teams Found</h2>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? "No teams match your search criteria."
                  : "You haven't joined or created any teams yet."}
              </p>
              <Link href="/ideas" className="cyber-button inline-flex items-center">
                Create Your First Team
                <ChevronRight className="ml-2 w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            /* Teams Grid */
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <Card 
                    className="glassmorphism h-full p-6 card-hover border border-white/20 bg-background/40 backdrop-blur-xl relative overflow-hidden flex flex-col cursor-pointer"
                    onClick={() => router.push(`/teams/${team.id}`)}
                  >
                    <div className="inline-block px-3 py-1 rounded-full bg-background/40 text-cyber-pink text-xs font-medium mb-3 backdrop-blur-md border border-cyber-pink/20">
                      {team.project?.PS ? 'Project Team' : 'General Team'}
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{team.project?.PS || team.team_name}</h3>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {team.project?.PSdescription || 'No description provided.'}
                    </p>
                    
                    <div className="mt-auto space-y-3">
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {team.created_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Created {new Date(team.created_at).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{team.members_count || 1} member{(team.members_count || 1) !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      
                      <button className="w-full px-4 py-2 border border-electric-blue/70 text-electric-blue hover:bg-electric-blue/10 rounded-lg text-sm transition-colors flex items-center justify-center">
                        View Team <ChevronRight className="ml-1 w-4 h-4" />
            </button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </section>
          )}
        </motion.div>
      </main>

      {/* Footer with enhanced glass effect */}
      <footer className="border-t border-white/20 bg-background/40 backdrop-blur-xl mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-electric-blue">Crisp</h4>
              <p className="text-sm text-muted-foreground">
                Building the future of collaboration and innovation.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/ideas" className="hover:text-electric-blue transition-colors">
                    Projects
                  </Link>
                </li>
                <li>
                  <Link href="/teams" className="hover:text-electric-blue transition-colors">
                    Teams
                  </Link>
                </li>
                <li>
                  <Link href="/hackathons" className="hover:text-electric-blue transition-colors">
                    Hackathons
                  </Link>
                </li>
                <li>
                  <Link href="/assistant" className="hover:text-electric-blue transition-colors">
                    Assistant
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-electric-blue transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-electric-blue transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-electric-blue transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-electric-blue transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-electric-blue transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-electric-blue transition-colors">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-electric-blue transition-colors">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-electric-blue transition-colors">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Crisp. All rights reserved.</p>
          </div>
      </div>
      </footer>
    </div>
  );
};

export default TeamsPage;
