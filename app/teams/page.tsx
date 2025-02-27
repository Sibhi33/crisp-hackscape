'use client';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface Team {
  id: string;
  team_name: string;
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
        setTeams(teamData || []);
      }
      setLoading(false);
    };

    fetchTeams();
  }, [user]);

  if (loading) {
    return <div>Loading teams...</div>;
  }

  if (teams.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        You are not part of any teams.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Your Teams</h1>
      <div className="grid gap-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="p-4 border rounded shadow hover:shadow-lg"
          >
            {/* Display project name if available, fallback to team name */}
            <h2 className="text-2xl font-semibold">
              {team.project?.PS || team.team_name}
            </h2>
            <p className="text-gray-600">
              {team.project?.PSdescription
                ? team.project.PSdescription.length > 100
                  ? team.project.PSdescription.substring(0, 100) + '...'
                  : team.project.PSdescription
                : 'No description provided.'}
            </p>
            <button
              onClick={() => router.push(`/teams/${team.id}`)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Team
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamsPage;
