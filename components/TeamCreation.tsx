"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";

// Move emailRegex outside the component or use useMemo
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface TeamCreationModalProps {
  project: any;
  onClose: () => void;
  onTeamCreated: (team: any) => void;
}

const TeamCreationModal: React.FC<TeamCreationModalProps> = ({
  project,
  onClose,
  onTeamCreated,
}) => {
  const { user } = useAuth();
  const [teamName, setTeamName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [invitedMembers, setInvitedMembers] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // States for email existence check
  const [emailExists, setEmailExists] = useState<boolean>(false);
  const [checkingEmail, setCheckingEmail] = useState<boolean>(false);

  // Debounced effect to check if the email exists in the system
  useEffect(() => {
    if (!memberEmail || !emailRegex.test(memberEmail)) {
      setEmailExists(false);
      return;
    }
    setCheckingEmail(true);
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", memberEmail)
        .maybeSingle();

      if (error || !data) {
        setEmailExists(false);
      } else {
        setEmailExists(true);
      }
      setCheckingEmail(false);
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [memberEmail]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMemberEmail(e.target.value);
    setError("");
  };

  const handleInvite = () => {
    // Prevent inviting oneself
    if (user?.email === memberEmail) {
      setError("You cannot add yourself.");
      return;
    }

    if (memberEmail && emailRegex.test(memberEmail) && emailExists) {
      if (invitedMembers.includes(memberEmail)) {
        setError("This email has already been invited.");
        return;
      }
      setInvitedMembers((prev) => [...prev, memberEmail]);
      setMemberEmail("");
      setError("");
    } else {
      setError("User does not exist. Please ask them to sign up.");
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName || invitedMembers.length === 0) {
      setError("Team name and at least one member are required.");
      return;
    }

    setLoading(true);

    try {
      // 1) Insert the new team
      const { data: insertedTeams, error: teamError } = await supabase
        .from("teams")
        .insert([
          {
            project_id: project.id,
            team_name: teamName,
            created_by: user?.id,
          },
        ])
        .select();

      if (teamError || !insertedTeams || insertedTeams.length === 0) {
        throw new Error(teamError?.message || "Failed to create team.");
      }

      const newTeam = insertedTeams[0];

      // 2) Fetch the profiles of invited members to get their user IDs
      const { data: fetchedProfiles, error: fetchError } = await supabase
        .from("profiles")
        .select("id, email")
        .in("email", invitedMembers);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (!fetchedProfiles || fetchedProfiles.length === 0) {
        // If none of the invited emails exist in 'profiles', handle that scenario
        throw new Error("No invited emails match existing users. Please ask them to sign up.");
      }

      // 3) Insert all valid invited members into team_members
      const teamMembersToInsert = fetchedProfiles.map((profile) => ({
        team_id: newTeam.id,
        user_id: profile.id,
      }));

      const { error: memberError } = await supabase
        .from("team_members")
        .insert(teamMembersToInsert);

      if (memberError) {
        throw new Error(memberError.message);
      }

      // Everything succeeded
      onTeamCreated(newTeam);
      onClose();
    } catch (err: any) {
      console.error("Team creation error:", err);
      setError(err.message || "Failed to create team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-black fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        {/* Toast/Alert message */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Create Team for {project.PS}
        </h2>

        {/* Team Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Team Name
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter team name"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Invite Members */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Invite Members
          </label>
          <div className="flex items-center mt-1">
            <input
              type="email"
              value={memberEmail}
              onChange={handleEmailChange}
              placeholder="Enter email address"
              className="flex-grow border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {checkingEmail && (
              <span className="ml-2 text-sm text-gray-500">Checking...</span>
            )}
            {!checkingEmail && emailExists && memberEmail && (
              <Button onClick={handleInvite} className="ml-2 whitespace-nowrap">
                Invite
              </Button>
            )}
          </div>
          {!checkingEmail &&
            memberEmail &&
            !emailExists &&
            emailRegex.test(memberEmail) && (
              <p className="text-red-500 text-sm mt-1">
                User does not exist. Please ask them to sign up.
              </p>
            )}
          {invitedMembers.length > 0 && (
            <ul className="mt-2 space-y-1">
              {invitedMembers.map((email, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {email}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="destructive" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateTeam}
            disabled={loading || !teamName || invitedMembers.length === 0}
          >
            {loading ? "Creating..." : "Create Team"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeamCreationModal;
