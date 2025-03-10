'use client';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';

// Type definitions
interface AIChatProps {
  projectName?: string;
  darkMode?: boolean;
  fullScreen?: boolean;
  message?: string;
  onMessageProcessed?: () => void;
  teamId: string; // Add teamId prop
  contextWindowSize?: number; // Maximum number of messages to include in context
}

interface Message {
  id: number | string;
  text: string;
  sender: string;
  timestamp: Date;
  model?: string;
  sender_id?: string;
  sender_name?: string;
  avatar_url?: string;
}

interface Model {
  id: string;
  name: string;
  model: string;
  description: string;
  icon: string;
}

// Models configuration
const AI_MODELS: Model[] = [
  {
    id: 'research',
    name: 'Research',
    model: 'gemma2-9b-it',
    description: 'Best for academic research and factual information',
    icon: '📚',
  },
  {
    id: 'reasoning',
    name: 'Reasoning',
    model: 'deepseek-r1-distill-qwen-32b',
    description: 'Specialized for coding, math and logical reasoning',
    icon: '🧮',
  },
];

const AIChat: React.FC<AIChatProps> = ({
  projectName,
  darkMode = false,
  fullScreen = false,
  message = '',
  onMessageProcessed,
  teamId,
  contextWindowSize = 10, // Default to 10 messages of context
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model>(AI_MODELS[0]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const modelSelectorRef = useRef<HTMLDivElement>(null);
  const [showChipsInfo, setShowChipsInfo] = useState(false);
  const realtimeSubscriptionRef = useRef<any>(null);
  const [conversationSummary, setConversationSummary] = useState<string>('');

  const [themeStyles, _setThemeStyles] = useState({
    background: darkMode ? 'bg-gray-900' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-black',
    borderColor: darkMode ? 'border-gray-700' : 'border-gray-200',
    headerBg: darkMode ? 'bg-gray-800' : 'bg-gray-50',
    messageBg: darkMode ? 'bg-gray-800' : 'bg-gray-100',
    messageText: darkMode ? 'text-gray-100' : 'text-gray-800',
    inputBg: darkMode ? 'bg-gray-800' : 'bg-white',
    inputBorder: darkMode ? 'border-gray-600' : 'border-gray-300',
    inputText: darkMode ? 'text-white' : 'text-gray-900',
    modelSelectBg: darkMode
      ? 'bg-gray-800 text-gray-200'
      : 'bg-gray-100 text-gray-800',
  });

  // Format the AI response based on model
  const formatAIResponse = useCallback((text: string, modelId: string) => {
    // Format deepseek model responses with <think> tags
    if (modelId === 'reasoning' && text.includes('<think>')) {
      text = text.replace(/<think>[\s\S]*?<\/think>/g, (match) => {
        // Extract the content inside the think tags
        const thinkContent = match.replace(/<think>|<\/think>/g, '');
        return `<div class="thinking-block p-3 my-2 border-l-4 border-indigo-500 bg-opacity-20 ${darkMode ? 'bg-indigo-900' : 'bg-indigo-50'}">
            <strong>Thinking:</strong>
            <div class="pl-2 mt-1">${thinkContent}</div>`;
      });
    }

    // Improved link formatting using our special format LINK[URL|TEXT]
    text = text.replace(/LINK\[(https?:\/\/[^|]+)\|([^\]]+)\]/g, '[$2]($1)');

    return text;
  }, [darkMode]);

  // Create system prompt for AI
  const createSystemPrompt = useCallback((modelId: string, projectName?: string) => {
    const linkInstructions = `
      When you want to include links in your response, use this exact format: 
      LINK[URL|TEXT]
      For example: LINK[https://example.com|Example Website] will be displayed as a clickable link.
      Always include the full URL with protocol (https:// or http://).
    `;

    // Return model-specific system prompts
    if (modelId === 'reasoning') {
      return `You are a technical AI assistant specializing in software development. You help developers with coding questions.
              You can showcase your reasoning skills by using <think></think> tags for your thought process.
              ${linkInstructions}`;
    } else {
      return `You are a helpful AI assistant for the project ${projectName || 'unknown'}. 
              Provide concise, accurate information.
              ${linkInstructions}`;
    }
  }, []);

  // Setup realtime subscription
  const setupRealtimeSubscription = useCallback(async () => {
    if (!teamId) return;

    // Remove existing subscription if it exists
    if (realtimeSubscriptionRef.current) {
      supabase.removeChannel(realtimeSubscriptionRef.current);
    }

    // Create new subscription
    const channel = supabase
      .channel(`ai_messages_${teamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_messages',
          filter: `team_id=eq.${teamId}`,
        },
        async (payload) => {
          // Skip messages from the current user entirely to avoid duplicates
          // These are already added to the local state when sendMessage is called
          if (payload.new.sender_id === user?.id) {
            return;
          }

          // For messages from other users, fetch the full record including profile
          const { data, error } = await supabase
            .from('ai_messages')
            .select(`
              id,
              user_message,
              ai_message,
              created_at,
              sender_id,
              model,
              profiles!sender_id(
                display_name,
                email,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (error) {
            console.error('Error fetching new message details:', error);
            return;
          }

          // Add user message
          if (data.user_message) {
            // Fix the typing issue with profile data
            const profile = data.profiles as unknown as { 
              display_name: string; 
              email: string; 
              avatar_url: string 
            };
            const senderName = profile.display_name || profile.email || 'User';
            setMessages((prev) => [
              ...prev,
              {
                id: `${data.id}-user`,
                text: data.user_message,
                sender: senderName,
                sender_id: data.sender_id,
                sender_name: senderName,
                avatar_url: profile.avatar_url,
                timestamp: new Date(data.created_at),
              },
            ]);
          }

          // Add AI response
          if (data.ai_message) {
            setMessages((prev) => [
              ...prev,
              {
                id: `${data.id}-ai`,
                text: data.ai_message,
                sender: 'AI Assistant',
                timestamp: new Date(data.created_at),
                model: data.model || 'Unknown',
              },
            ]);
          }
        }
      )
      .subscribe();

    realtimeSubscriptionRef.current = channel;
  }, [user?.id, teamId]);

  // Handle external message
  const handleExternalMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: text,
      sender: user?.user_metadata?.display_name || 'You',
      sender_id: user?.id,
      sender_name: user?.user_metadata?.display_name || 'You',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Call to the Groq API via backend proxy
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel.model,
          messages: [
            {
              role: 'system',
              content: createSystemPrompt(selectedModel.id, projectName),
            },
            ...messages.map((msg) => ({
              role: msg.sender === 'AI Assistant' ? 'assistant' : 'user',
              content: msg.text,
            })),
            { role: 'user', content: text },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const aiResponse = formatAIResponse(data.response, selectedModel.id);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: aiResponse,
          sender: 'AI Assistant',
          timestamp: new Date(),
          model: selectedModel.id,
        },
      ]);

      // Notify parent that message has been processed
      if (onMessageProcessed) {
        onMessageProcessed();
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: 'Sorry, I encountered an error. Please try again later.',
          sender: 'AI Assistant',
          timestamp: new Date(),
          model: selectedModel.id,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [
    user?.id,
    user?.user_metadata?.display_name,
    messages, 
    projectName, 
    selectedModel.id, 
    selectedModel.model, 
    createSystemPrompt, 
    formatAIResponse, 
    onMessageProcessed
  ]);

  // Add welcome message if there are no messages
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          text: `I'm here to help with your project "${projectName || 'your project'}". Ask me anything!`,
          sender: 'AI Assistant',
          timestamp: new Date(),
          model: selectedModel.id,
        },
      ]);
    }
  }, [projectName, messages.length, selectedModel.id]);

  // Process incoming message from parent component (from team chat)
  useEffect(() => {
    if (message && message.trim() !== '') {
      handleExternalMessage(message);
    }
  }, [message, handleExternalMessage]);

  // Fetch previous messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!teamId) return;

      // First, log what we're doing to debug
      console.log('Fetching messages for team:', teamId);

      const { data, error } = await supabase
        .from('ai_messages')
        .select(`
          id,
          user_message,
          ai_message,
          created_at,
          sender_id,
          model,
          profiles!sender_id(
            display_name,
            email,
            avatar_url
          )
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: true });

      // Add debugging to see what we're getting back
      if (data && data.length > 0) {
        console.log('First message profiles data:', data[0].profiles);
      }

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      if (data) {
        // Debug what data looks like
        console.log('Sample message data structure:', data.length > 0 ? data[0] : 'No messages');
        
        const formattedMessages: Message[] = [];
        data.forEach((msg) => {
          // Debug individual message profiles
          console.log(`Message ${msg.id} profiles:`, msg.profiles);
          
          // Add user message
          if (msg.user_message) {
            // Check various profile formats and log what we find
            const profilesExist = !!msg.profiles;
            const profilesIsArray = Array.isArray(msg.profiles);
            const profilesHasItems = profilesIsArray && msg.profiles.length > 0;
            const profilesIsObject = typeof msg.profiles === 'object' && !Array.isArray(msg.profiles);
            
            console.log(`Message ${msg.id} profile checks:`, {
              exists: profilesExist,
              isArray: profilesIsArray,
              hasItems: profilesHasItems,
              isObject: profilesIsObject
            });
            
            // Get display name using various methods to see what works
            let displayName = 'Team member';
            
            if (profilesIsArray && profilesHasItems) {
              displayName = msg.profiles[0].display_name || msg.profiles[0].email || 'Team member';
            } else if (profilesIsObject) {
              displayName = (msg.profiles as any).display_name || (msg.profiles as any).email || 'Team member';
            }
            
            formattedMessages.push({
              id: `${msg.id}-user`,
              text: msg.user_message,
              sender: msg.sender_id === user?.id ? 'You' : 'Team member',
              sender_id: msg.sender_id,
              sender_name: msg.sender_id === user?.id 
                ? (user?.user_metadata?.display_name || 'You') 
                : displayName,
              timestamp: new Date(msg.created_at),
              avatar_url: profilesIsArray && profilesHasItems 
                ? msg.profiles[0].avatar_url 
                : profilesIsObject 
                  ? (msg.profiles as any).avatar_url 
                  : undefined,
            });
            
            // Log what we decided to use
            console.log(`Using display name for message ${msg.id}:`, displayName);
          }
          
          // Add AI message
          if (msg.ai_message) {
            formattedMessages.push({
              id: `${msg.id}-ai`,
              text: msg.ai_message,
              sender: 'AI Assistant',
              sender_id: msg.sender_id,
              sender_name: 'AI Assistant',
              timestamp: new Date(msg.created_at),
              model: (msg as any).model || 'research',
            });
          }
        });
        setMessages(formattedMessages);
      }
    };

    fetchMessages();

    // Set up realtime subscription
    setupRealtimeSubscription();

    // Cleanup function to remove subscription
    return () => {
      if (realtimeSubscriptionRef.current) {
        supabase.removeChannel(realtimeSubscriptionRef.current);
      }
    };
  }, [teamId, setupRealtimeSubscription, user?.id, user?.user_metadata?.display_name]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Close model selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modelSelectorRef.current &&
        !modelSelectorRef.current.contains(event.target as Node)
      ) {
        setShowModelSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate a summary of the conversation when needed
  const generateConversationSummary = async () => {
    // Only summarize if we have enough messages
    if (messages.length < contextWindowSize * 2) {
      return;
    }
    
    try {
      // Get messages to summarize (all except the most recent contextWindowSize)
      const messagesToSummarize = messages.slice(0, -contextWindowSize);
      
      // Format messages for summarization
      const formattedMessages = messagesToSummarize.map(msg => 
        `${msg.sender}: ${msg.text}`
      ).join('\n');
      
      // Call to the AI API to generate summary
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel.model,
          content: formattedMessages,
          teamId: teamId, // Pass the teamId to ensure team-specific processing
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to generate conversation summary');
        // Don't return - we'll continue without a summary
        return;
      }
      
      const data = await response.json();
      setConversationSummary(data.summary);
    } catch (error) {
      console.error('Error generating conversation summary:', error);
      // Continue without the summary - this is a graceful fallback
    }
  };

  // Create optimized message context to reduce token usage
  const createOptimizedContext = () => {
    // We'll always include the system message
    const systemMessage = {
      role: 'system',
      content: createSystemPrompt(selectedModel.id, projectName),
    };
    
    // Add team context to ensure the AI knows which team this is for
    const teamContextMessage = {
      role: 'system',
      content: `You are assisting with team ID: ${teamId}. All context and responses should be relevant to this team only.`
    };
    
    // If there's an error with summarization or no summary available yet, just use recent messages
    try {
      // If we have a conversation summary and more messages than our window size
      if (conversationSummary && messages.length > contextWindowSize) {
        const contextMessages = [systemMessage, teamContextMessage];
        
        // Add the conversation summary as a system message
        contextMessages.push({
          role: 'system',
          content: `Previous conversation summary: ${conversationSummary}`,
        });
        
        // Add the most recent N messages based on contextWindowSize
        const recentMessages = messages.slice(-contextWindowSize);
        recentMessages.forEach(msg => {
          contextMessages.push({
            role: msg.sender === 'AI Assistant' ? 'assistant' : 'user',
            content: msg.text,
          });
        });
        
        return contextMessages;
      }
    } catch (error) {
      console.error('Error creating optimized context:', error);
      // On error, fallback to the basic context
    }
    
    // Fallback - if there's no summary or an error, just include the system message and recent messages
    // Control the number of messages to avoid token limits
    const fallbackRecentMessages = messages.slice(-Math.min(contextWindowSize, messages.length));
    
    return [
      systemMessage,
      teamContextMessage,
      ...fallbackRecentMessages.map((msg) => ({
        role: msg.sender === 'AI Assistant' ? 'assistant' : 'user',
        content: msg.text,
      })),
    ];
  };
  
  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: user?.user_metadata?.display_name || 'You',
      sender_id: user?.id,
      sender_name: user?.user_metadata?.display_name || 'You',
      timestamp: new Date(),
      avatar_url: user?.user_metadata?.avatar_url || '',
    };

    // Add user message to the UI
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Check if we need to generate a summary
    // We do this in the background and don't block the main flow
    if (messages.length >= contextWindowSize * 2) {
      // Generate summary in background, don't await
      generateConversationSummary();
    }

    try {
      // Get optimized context for the AI - this will handle errors internally
      let optimizedMessages = [];
      try {
        optimizedMessages = createOptimizedContext();
      } catch (error) {
        console.error('Failed to create optimized context, using fallback:', error);
        // Fallback to minimal context if optimization fails
        optimizedMessages = [
          {
            role: 'system',
            content: createSystemPrompt(selectedModel.id, projectName),
          },
          { 
            role: 'system',
            content: `You are assisting with team ID: ${teamId}.`
          }
        ];
      }
      
      // Add current user message
      optimizedMessages.push({ role: 'user', content: inputValue });
      
      // Call to the Groq API via backend proxy
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel.model,
          messages: optimizedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const aiResponse = formatAIResponse(data.response, selectedModel.id);

      // Save both messages to the database
      const { error: dbError } = await supabase.from('ai_messages').insert({
        team_id: teamId,
        user_message: inputValue,
        ai_message: aiResponse,
        sender_id: user?.id,
        model: selectedModel.id
      });

      if (dbError) {
        console.error('Error saving messages:', dbError);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: aiResponse,
          sender: 'AI Assistant',
          timestamp: new Date(),
          model: selectedModel.id,
        },
      ]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: 'Sorry, I encountered an error. Please try again later.',
          sender: 'AI Assistant',
          timestamp: new Date(),
          model: selectedModel.id,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleModelSelector = () => {
    setShowModelSelector(!showModelSelector);
  };

  const handleModelSelect = (model: Model) => {
    setSelectedModel(model);
    setShowModelSelector(false);
  };

  // Custom components for ReactMarkdown
  const components = {
    code({ _node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <CodeBlock
          language={match[1]}
          value={String(children).replace(/\n$/, '')}
        />
      ) : (
        <code
          className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded px-1 py-0.5 ${darkMode ? 'text-gray-200' : 'text-gray-800'} ${className}`}
          {...props}
        >
          {children}
        </code>
      );
    },
    a: ({ _node, ...props }: any) => (
      <a
        className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} underline hover:${darkMode ? 'text-blue-300' : 'text-blue-800'} cursor-pointer`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          // Handle link clicks properly
          e.preventDefault();
          if (props.href) {
            window.open(props.href, '_blank', 'noopener,noreferrer');
          }
        }}
        {...props}
      />
    ),
    h1: ({ _node, ...props }: any) => (
      <h1
        className={`text-2xl font-bold mt-4 mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
        {...props}
      />
    ),
    h2: ({ _node, ...props }: any) => (
      <h2
        className={`text-xl font-bold mt-3 mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
        {...props}
      />
    ),
    h3: ({ _node, ...props }: any) => (
      <h3
        className={`text-lg font-bold mt-3 mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}
        {...props}
      />
    ),
    p: ({ _node, ...props }: any) => <p className="mb-2" {...props} />,
    ul: ({ _node, ...props }: any) => (
      <ul className="list-disc pl-5 mb-2" {...props} />
    ),
    ol: ({ _node, ...props }: any) => (
      <ol className="list-decimal pl-5 mb-2" {...props} />
    ),
    li: ({ _node, ...props }: any) => <li className="mb-1" {...props} />,
    blockquote: ({ _node, ...props }: any) => (
      <blockquote
        className={`border-l-4 ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'} pl-4 py-1 italic my-2 rounded`}
        {...props}
      />
    ),
    div: ({ _node, ...props }: any) => {
      // Check if this is a thinking block
      if (props.className && props.className.includes('thinking-block')) {
        return <div {...props} />;
      }
      return <div className="mb-2" {...props} />;
    },
  };

  return (
    <div
      className={`${themeStyles.background} rounded-lg shadow-sm overflow-hidden flex flex-col ${fullScreen ? 'h-full' : 'h-[calc(100vh-160px)]'}`}
    >
      {/* Header */}
      <div
        className={`p-4 border-b flex items-center justify-between ${themeStyles.headerBg} ${themeStyles.borderColor}`}
      >
        <div className="flex items-center">
          <span className={`text-lg font-semibold ${themeStyles.text}`}>
            CHIPS
          </span>
          <button
            className={`ml-2 p-1 rounded-full text-gray-400 hover:${darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'}`}
            onClick={() => setShowChipsInfo(!showChipsInfo)}
            aria-label="CHIPS Information"
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
        <div className="relative" ref={modelSelectorRef}>
          <button
            onClick={toggleModelSelector}
            className={`flex items-center space-x-1 px-2 py-1 rounded ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
          >
            <span>{selectedModel.icon}</span>
            <span>{selectedModel.name}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform ${showModelSelector ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showModelSelector && (
            <div
              className={`${darkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-black border-gray-200'} absolute right-0 mt-1 w-64 rounded-md shadow-lg z-10 border overflow-hidden`}
            >
              {AI_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model)}
                  className={`w-full text-left px-4 py-3 hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors flex items-start space-x-2 ${
                    selectedModel.id === model.id
                      ? darkMode
                        ? 'bg-gray-700'
                        : 'bg-gray-50'
                      : ''
                  }`}
                >
                  <span className="text-xl">{model.icon}</span>
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div
                      className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      {model.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CHIPS Info Panel */}
      {showChipsInfo && (
        <div
          className={`p-4 ${themeStyles.modelSelectBg} border-b ${themeStyles.borderColor} transition-all ease-in-out duration-300`}
        >
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-lg font-bold">C</span>
              </div>
              <h3
                className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}
              >
                Collaborative Hackathon Intelligence with Project Support
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div
                className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-sm`}
              >
                <h4
                  className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
                >
                  💡 What CHIPS Can Do
                </h4>
                <ul
                  className={`list-disc pl-5 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}
                >
                  <li>Answer technical questions about your project</li>
                  <li>Help brainstorm ideas and solutions</li>
                  <li>Provide code examples and explanations</li>
                  <li>Assist with debugging and problem-solving</li>
                  <li>Research technologies and frameworks</li>
                </ul>
              </div>

              <div
                className={`p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-sm`}
              >
                <h4
                  className={`font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
                >
                  🔧 How To Use CHIPS
                </h4>
                <ul
                  className={`list-disc pl-5 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}
                >
                  <li>Type your questions directly in the chat</li>
                  <li>Use &quot;/chips your question&quot; in team chat</li>
                  <li>Choose the right model for your needs</li>
                  <li>Be specific with your questions</li>
                  <li>Share CHIPS responses with your team</li>
                </ul>
              </div>
            </div>

            <div
              className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}
            >
              CHIPS is powered by advanced language models. Results may vary and
              should be verified for critical tasks.
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className={`flex-1 overflow-y-auto p-4 space-y-6 ${themeStyles.text}`}
      >
        {messages.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center h-full ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3
              className={`text-lg font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}
            >
              AI Assistant
            </h3>
            <p
              className={`text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'} max-w-md`}
            >
              I&apos;m here to help with your project. Ask me anything!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'AI Assistant' ? '' : 'justify-end'}`}
            >
              <div
                className={`max-w-3/4 rounded-2xl px-4 py-3 ${
                  msg.sender === 'AI Assistant'
                    ? themeStyles.messageBg + ' ' + themeStyles.messageText
                    : 'bg-blue-600 text-white'
                }`}
              >
                {msg.sender === 'AI Assistant' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div 
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                        darkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                      title="AI Assistant"
                    >
                      {msg.model === 'research' ? '📚' : '🧮'}
                    </div>
                    <span
                      className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      Using {msg.model === 'research' ? 'Research' : 'Reasoning'} model
                    </span>
                  </div>
                )}

                {msg.sender === 'AI Assistant' ? (
                  <div className="text-sm markdown-content">
                    <ReactMarkdown components={components}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-sm">{msg.text}</div>
                )}

                <div
                  className={`flex items-center justify-between text-xs mt-2 ${
                    msg.sender === 'AI Assistant'
                      ? darkMode
                        ? 'text-gray-400'
                        : 'text-gray-500'
                      : 'text-blue-200'
                  }`}
                >
                  <div className="flex items-center">
                    {msg.sender !== 'AI Assistant' ? (
                      <div 
                        className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-1 relative group"
                      >
                        {(() => {
                          console.log('Rendering avatar for message:', msg);
                          
                          // For the current user
                          if (msg.sender_id === user?.id) {
                            return (user?.user_metadata?.display_name?.charAt(0) || 'Y').toUpperCase();
                          }
                          // For other users with display name
                          else if (msg.sender_name && msg.sender_name !== 'Team member' && msg.sender_name !== 'Unknown') {
                            return msg.sender_name.charAt(0).toUpperCase();
                          }
                          // For team members without display name
                          else {
                            return 'T';
                          }
                        })()}
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs whitespace-nowrap rounded bg-gray-800 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                          {(() => {
                            // For the current user
                            if (msg.sender_id === user?.id) {
                              return user?.user_metadata?.display_name || 'You';
                            }
                            // For other users with display name
                            else if (msg.sender_name && msg.sender_name !== 'Team member' && msg.sender_name !== 'Unknown') {
                              return msg.sender_name;
                            }
                            // For team members without display name
                            else {
                              return msg.sender;
                            }
                          })()}
                        </span>
                      </div>
                    ) : (
                      <div 
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs mr-1 ${
                          darkMode ? 'bg-gray-600' : 'bg-gray-300'
                        } relative group`}
                        data-tooltip="AI Assistant"
                      >
                        {msg.model === 'research' ? '📚' : '🧮'}
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs whitespace-nowrap rounded bg-gray-800 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                          {msg.sender_name || 'AI Assistant'}
                        </span>
                      </div>
                    )}
                  </div>
                  <span>{formatTime(new Date(msg.timestamp))}</span>
                </div>
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex">
            <div
              className={`max-w-3/4 ${themeStyles.messageBg} rounded-2xl px-4 py-2`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <div 
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    darkMode ? 'bg-gray-600' : 'bg-gray-300'
                  } relative group`}
                >
                  {selectedModel.icon}
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs whitespace-nowrap rounded bg-gray-800 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    AI Assistant
                  </span>
                </div>
                <span
                  className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  Using {selectedModel.name} model
                </span>
              </div>
              <div className="flex space-x-1">
                <div
                  className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-400'} animate-bounce`}
                ></div>
                <div
                  className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-400'} animate-bounce`}
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className={`w-2 h-2 rounded-full ${darkMode ? 'bg-gray-400' : 'bg-gray-400'} animate-bounce`}
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className={`border-t p-3 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
      >
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Ask the ${selectedModel.name} AI...`}
              className={`w-full py-3 px-4 rounded-lg border ${themeStyles.inputBorder} focus:ring-2 ${darkMode ? 'focus:ring-indigo-600 focus:border-indigo-500' : 'focus:ring-indigo-300 focus:border-indigo-500'} focus:outline-none ${themeStyles.inputBg} ${themeStyles.inputText}`}
              disabled={isTyping}
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className={`p-3 rounded-lg ${
              inputValue.trim() && !isTyping
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : `${darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'}`
            } transition-colors`}
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
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIChat;