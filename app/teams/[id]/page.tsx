'use client';

import AIChat from '@/components/AiChat';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';

// TypeScript interfaces
interface User {
  id: string;
  email: string;
  avatar_url?: string;
  display_name?: string;
}

interface Message {
  id: number;
  text: string;
  sender: string;
  sender_id?: string;
  timestamp: Date;
  avatar_url?: string;
}

interface Project {
  id: string;
  PS: string;
  PSdescription: string;
}

interface Team {
  id: string;
  team_name: string;
  project_id: string;
  project?: Project;
}

const TeamPage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string }; // Team ID from the URL
  const { user } = useAuth() as { user: User | null };
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Team chat state
  const [teamMessages, setTeamMessages] = useState<Message[]>([]);
  const [teamChatInput, setTeamChatInput] = useState<string>('');
  const teamChatRef = useRef<HTMLDivElement>(null);
  const [subscription, setSubscription] = useState<any>(null);

  // Message for AI chat
  const [aiMessage, setAiMessage] = useState<string>('');

  // Scroll control states
  const [_isNearBottom, setIsNearBottom] = useState(true);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [_initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Team members
  const [teamMembers, setTeamMembers] = useState<User[]>([]);

  // Modal for inviting a single new member
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Resizable panel state
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percent
  const [isDragging, setIsDragging] = useState(false);

  // CHIPS info tooltip state
  const [_showChipsInfo, _setShowChipsInfo] = useState(false);

  // Fetch team details (including project)
  useEffect(() => {
    const fetchTeamDetails = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('teams')
        .select('*, project:projects(PS, PSdescription)')
        .eq('id', id)
        .single();
      if (error) {
        console.error('Error fetching team:', error);
      } else {
        setTeam(data);
      }
      setLoading(false);
    };

    fetchTeamDetails();
  }, [id]);

  // Fetch team members
  const fetchTeamMembers = async () => {
    if (!id) return;
    // Get team_members rows for this team
    const { data: tmData, error: tmError } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', id);

    if (tmError) {
      console.error('Error fetching team members:', tmError);
      return;
    }
    if (tmData && tmData.length > 0) {
      const userIds = tmData.map((tm: any) => tm.user_id);
      // Fetch profiles for these user IDs
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, email, avatar_url')
        .in('id', userIds);
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      setTeamMembers(profilesData);
    } else {
      // No members found
      setTeamMembers([]);
    }
  };

  // Run fetchTeamMembers on mount & after new members are added
  useEffect(() => {
    fetchTeamMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Callback after a new member is successfully added
  const handleMemberAdded = () => {
    setShowAddMemberModal(false);
    fetchTeamMembers(); // Refresh
  };

  // Check if user is at bottom of chat
  const checkIfUserAtBottom = () => {
    const chatContainer = teamChatRef.current;
    if (!chatContainer) return true;

    // Use a smaller threshold (20px) to more accurately determine if user is at bottom
    return (
      chatContainer.scrollHeight -
        chatContainer.scrollTop -
        chatContainer.clientHeight <
      20
    );
  };

  // Modified scrollToBottom function with callback option
  const scrollToBottom = (smooth = false, force = false) => {
    const container = teamChatRef.current;
    if (!container) return;
    
    // Always scroll if forced (initial load) or if user is near the bottom
    if (force || container.scrollHeight - container.scrollTop - container.clientHeight <= 20) {
      container.scrollTo({ 
        top: container.scrollHeight, 
        behavior: smooth ? 'smooth' : 'auto' 
      });
    }
  };

  // Fetch team messages from the database
  useEffect(() => {
    const fetchTeamMessages = async () => {
      if (!id) return;

      // Initial fetch of existing messages
      const { data, error } = await supabase
        .from('team_messages')
        .select('*, sender:profiles(display_name, email, avatar_url)')
        .eq('team_id', id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching team messages:', error);
      } else if (data) {
        // Convert timestamp string to Date and map message structure
        const messages = data.map((msg: any) => ({
          id: msg.id,
          text: msg.message,
          sender: msg.sender?.display_name || msg.sender?.email || 'Unknown',
          sender_id: msg.sender_id,
          timestamp: new Date(msg.created_at),
          avatar_url: msg.sender?.avatar_url || '',
        }));
        setTeamMessages(messages);
        // Set initial load complete - scrolling handled by dedicated useEffect
        setInitialLoadComplete(true);

        // Set up real-time subscription
        const newSubscription = supabase
          .channel('team_messages_changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'team_messages',
              filter: `team_id=eq.${id}`,
            },
            async (payload) => {
              // When a new message is added, fetch the sender details
              const { data: senderData, error: senderError } = await supabase
                .from('profiles')
                .select('display_name, email, avatar_url')
                .eq('id', payload.new.sender_id)
                .single();

              if (senderError) {
                console.error('Error fetching sender details:', senderError);
              }

              const newMessage = {
                id: payload.new.id,
                text: payload.new.message,
                sender:
                  senderData?.display_name || senderData?.email || 'Unknown',
                sender_id: payload.new.sender_id,
                timestamp: new Date(payload.new.created_at),
                avatar_url: senderData?.avatar_url || '',
              };

              // Check if user is at bottom before adding new message
              const wasAtBottom = checkIfUserAtBottom();

              setTeamMessages((prev) => [...prev, newMessage]);

              // Only scroll if user was already at bottom when message arrived
              if (wasAtBottom) {
                // Remove setTimeout to make scrolling more predictable
                scrollToBottom(false);
              } else {
                // Show scroll-down button if not at bottom
                setShowScrollDown(true);
              }
            }
          )
          .subscribe();

        setSubscription(newSubscription);

        // Cleanup function
        return () => {
          if (subscription) {
            supabase.removeChannel(subscription);
          }
        };
      }
    };

    fetchTeamMessages();
  }, [id, subscription]); // Remove subscription dependency to prevent re-fetching

  // Add scroll event listener to determine scroll position
  useEffect(() => {
    const chatContainer = teamChatRef.current;
    if (!chatContainer) return;

    const handleScroll = () => {
      const isAtBottom = checkIfUserAtBottom();
      setIsNearBottom(isAtBottom);
      setShowScrollDown(!isAtBottom && teamMessages.length > 0);
    };

    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, [teamMessages.length]);

  // Handle scroll to bottom button click
  const handleScrollToBottom = () => {
    scrollToBottom(true, true); // Use smooth scrolling and force scroll to bottom
    setShowScrollDown(false);
    setIsNearBottom(true);
  };

  // Effect for resizable panels
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const containerWidth = window.innerWidth;
      const newLeftWidth = (e.clientX / containerWidth) * 100;

      // Limit resizing to reasonable bounds (15% - 85%)
      if (newLeftWidth > 15 && newLeftWidth < 85) {
        setLeftPanelWidth(newLeftWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleTeamChatSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!teamChatInput.trim()) return;

    // Check if input starts with "/chips"
    if (teamChatInput.startsWith('/chips')) {
      // Extract the message after "/chips"
      const chipsMessage = teamChatInput.substring(6).trim();

      if (chipsMessage) {
        // Set the AI message to send to the AIChat component
        setAiMessage(chipsMessage);

        // Reset input without sending to team chat
        setTeamChatInput('');
      }
    } else {
      // Regular message - send to team chat
      const { error } = await supabase.from('team_messages').insert([
        {
          team_id: id,
          message: teamChatInput,
          sender_id: user?.id,
        },
      ]);

      if (error) {
        console.error('Error sending message:', error);
      } else {
        setTeamChatInput('');
        // We don't need to force scroll here, the realtime subscription will handle it
      }
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Add a dedicated useEffect to handle scrolling to the bottom when messages load
  useEffect(() => {
    if (teamMessages.length > 0 && _initialLoadComplete) {
      // Use a small timeout to ensure messages are rendered before scrolling
      const timer = setTimeout(() => {
        scrollToBottom(false, true); // Force scroll to bottom
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [teamMessages, _initialLoadComplete]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (!team)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-2xl font-semibold text-gray-700">
          Team not found
        </div>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => router.push('/teams')}
        >
          Return to Teams
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                {team.project?.PS || team.team_name}
              </h1>
              <div className="bg-green-100 text-green-800 text-xs font-medium ml-3 px-2.5 py-0.5 rounded-full">
                Active
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Team Members Avatars */}
              <div className="flex -space-x-2">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="relative z-0 inline-block h-8 w-8 rounded-full ring-2 ring-white group"
                  >
                    {member.avatar_url ? (
                      <Image
                        src={member.avatar_url}
                        alt={member.display_name || member.email}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-300 text-gray-800">
                        {member.display_name
                          ? member.display_name.charAt(0).toUpperCase()
                          : member.email.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Tooltip on hover */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-xs text-white rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity whitespace-nowrap">
                      {member.email}
                      {/* Arrow pointing up */}
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-800"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* + Invite Button */}
              <button
                className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                onClick={() => setShowAddMemberModal(true)}
                aria-label="Invite new member"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>

              {/* Go to Project Button */}
              <button
                className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                onClick={() =>
                  window.open(`/ideas/${team.project_id}`, '_blank', 'noopener')
                }
                aria-label="Project info"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Resizable Split Panes */}
      <div className="flex flex-1 overflow-hidden">
        {/* Team Chat Panel */}
        <div
          className="bg-white overflow-hidden flex flex-col border-r"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center justify-around w-full">
              <div className="flex items-center w-full justify-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-purple-600 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900">
                  Team Chat
                </h2>
              </div>
              {/* Scroll to Bottom Button in Header */}
              {showScrollDown && (
                <button
                  onClick={handleScrollToBottom}
                  className="ml-3 p-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                  aria-label="Scroll to latest messages"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 13l-7 7-7-7m14-8l-7 7-7-7"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div
            ref={teamChatRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 text-gray-800 relative"
          >
            {teamMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mb-2 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              teamMessages.map((msg, index) => {
                const previousMsg = index > 0 ? teamMessages[index - 1] : null;
                const showHeader =
                  !previousMsg || previousMsg.sender !== msg.sender;

                return (
                  <div
                    key={`${msg.id}-${index}`}
                    className={`flex ${showHeader ? 'mt-4' : 'mt-1'}`}
                  >
                    {showHeader && (
                      <div className="flex-shrink-0 mr-3">
                        {msg.avatar_url ? (
                          <Image
                            src={msg.avatar_url}
                            alt={msg.sender}
                            width={36}
                            height={36}
                            className="rounded"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-9 w-9 rounded-full bg-gray-300 text-gray-800">
                            {msg.sender
                              ? msg.sender.charAt(0).toUpperCase()
                              : ''}
                          </div>
                        )}
                      </div>
                    )}
                    <div className={`flex-1 ${!showHeader ? 'pl-12' : ''}`}>
                      {showHeader && (
                        <div className="flex items-baseline">
                          <span className="font-medium text-gray-900">
                            {msg.sender}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            {formatTime(new Date(msg.timestamp))}
                          </span>
                        </div>
                      )}
                      <div className="mt-1 text-sm text-gray-800">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <form
            onSubmit={handleTeamChatSend}
            className="border-t p-3 bg-gray-50"
          >
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={teamChatInput}
                  onChange={(e) => setTeamChatInput(e.target.value)}
                  placeholder="Message team members... (type /chips to send to AI)"
                  className="w-full py-2 px-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none text-gray-900"
                />
              </div>
              <button
                type="submit"
                disabled={!teamChatInput.trim()}
                className={`p-2 rounded-full ${
                  teamChatInput.trim()
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Resizer Handle */}
        <div
          className="w-2 bg-gray-200 hover:bg-blue-400 cursor-col-resize active:bg-blue-600 transition-colors"
          onMouseDown={() => setIsDragging(true)}
        />

        {/* CHIPS (AI Chat) Panel */}
        <div
          className="bg-gray-900 text-white flex flex-col flex-1"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          {/* AI Chat with updated props */}

          <AIChat
            projectName={team.project?.PS || team.team_name}
            darkMode={true}
            fullScreen={true}
            message={aiMessage}
            onMessageProcessed={() => setAiMessage('')}
            teamId={id} // Add this line
          />
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <AddMemberModal
          teamId={id}
          currentUserEmail={user?.email || ''}
          onClose={() => setShowAddMemberModal(false)}
          onMemberAdded={handleMemberAdded}
        />
      )}
    </div>
  );
};

export default TeamPage;

/**
 * ---------------------------------------------------------------------------
 *  ADD MEMBER MODAL
 * ---------------------------------------------------------------------------
 */
interface AddMemberModalProps {
  teamId: string;
  currentUserEmail: string;
  onClose: () => void;
  onMemberAdded: () => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  teamId,
  currentUserEmail,
  onClose,
  onMemberAdded,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use useMemo to prevent recreating the regex on every render
  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  // Debounced check for existing email in "profiles"
  useEffect(() => {
    if (!email || !emailRegex.test(email)) {
      setEmailExists(false);
      return;
    }
    setCheckingEmail(true);

    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (error || !data) {
        setEmailExists(false);
      } else {
        setEmailExists(true);
      }
      setCheckingEmail(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [email, emailRegex]);

  const handleInvite = async () => {
    setError('');

    // Check for self-invite
    if (email === currentUserEmail) {
      setError('You cannot invite yourself.');
      return;
    }

    if (!emailRegex.test(email)) {
      setError('Invalid email address.');
      return;
    }

    if (!emailExists) {
      setError('User does not exist. Please ask them to sign up.');
      return;
    }

    setLoading(true);
    try {
      // 1) Find the user's ID by email
      const { data: profilesData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email);

      if (profileError || !profilesData || profilesData.length === 0) {
        throw new Error('Failed to find user profile.');
      }

      // Use the first profile found
      const profileData = profilesData[0];

      if (profileError || !profileData) {
        throw new Error('Failed to find user profile.');
      }

      // After fetching the profile data for the given email:
      const { data: existingMember, error: existingError } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', profileData.id)
        .maybeSingle();

      if (existingError) {
        throw new Error(existingError.message);
      }

      if (existingMember) {
        setError('User is already a team member.');
        setLoading(false);
        return;
      }

      // 2) Insert into team_members
      const { error: insertError } = await supabase
        .from('team_members')
        .insert([
          {
            team_id: Number(teamId), // ensure correct type if teamId is numeric
            user_id: profileData.id,
          },
        ]);

      if (insertError) {
        // Possibly a unique constraint violation or other DB error
        throw new Error(insertError.message);
      }

      // Success
      onMemberAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to add team member.');
      console.error('AddMemberModal error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-black fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        {/* Error Toast */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Invite a New Member
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="flex items-center mt-1">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="Enter email address"
              className="flex-grow border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {checkingEmail && (
              <span className="ml-2 text-sm text-gray-500">Checking...</span>
            )}
          </div>
          {!checkingEmail &&
            email &&
            !emailExists &&
            emailRegex.test(email) && (
              <p className="text-red-500 text-sm mt-1">
                User does not exist. Please ask them to sign up.
              </p>
            )}
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleInvite}
            disabled={loading || !email}
            className={`px-4 py-2 rounded text-white ${
              email
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? 'Inviting...' : 'Invite'}
          </button>
        </div>
      </div>
    </div>
  );
};
