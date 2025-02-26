'use client';
import { useAuth } from '@/contexts/AuthContext';
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';

// Type definitions
interface AIChatProps {
  projectName?: string;
}

interface Message {
  id: number | string;
  text: string;
  sender: string;
  timestamp: Date;
  model?: string;
  sender_id?: string;
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

const AIChat: React.FC<AIChatProps> = ({ projectName }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model>(AI_MODELS[0]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const modelSelectorRef = useRef<HTMLDivElement>(null);

  // Welcome message from AI
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

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'You',
      sender_id: user?.id,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
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
            { role: 'user', content: inputValue },
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

  const formatAIResponse = (text: string, modelId: string) => {
    // Format deepseek model responses with <think> tags
    if (modelId === 'reasoning' && text.includes('<think>')) {
      text = text.replace(
        /<think>[\s\S]*?<\/think>/g,
        `<div class="thinking-block">
          <strong>Thinking:</strong>
        </div>`
      );
    }

    // Format links using our special format LINK[URL|TEXT]
    text = text.replace(/LINK\[(https?:\/\/[^|]+)\|([^\]]+)\]/g, '[$2]($1)');

    return text;
  };

  const createSystemPrompt = (modelId: string, projectName?: string) => {
    const linkInstructions = `
      When you want to include links in your response, use this exact format: 
      LINK[URL|TEXT]
      For example: LINK[https://example.com|Example Website] will be displayed as a clickable link.
      Always include the full URL with protocol (https:// or http://).
    `;

    if (modelId === 'research') {
      return `You are an AI research assistant helping with the project "${projectName}". 
              Provide accurate, well-researched information based on reliable sources.
              Format your responses with markdown for readability.
              Clearly indicate when you are speculating or uncertain.
              ${linkInstructions}`;
    } else {
      return `You are an AI reasoning assistant specialized in coding and mathematical problem-solving for the project "${projectName}".
              Show your work step-by-step using <think></think> tags when solving complex problems.
              Format code examples with appropriate markdown syntax.
              Be precise and logical in your explanations.
              ${linkInstructions}`;
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
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <CodeBlock
          language={match[1]}
          value={String(children).replace(/\n$/, '')}
        />
      ) : (
        <code
          className={`bg-gray-100 rounded px-1 py-0.5 text-gray-800 ${className}`}
          {...props}
        >
          {children}
        </code>
      );
    },
    a: ({ node, ...props }: any) => (
      <a
        className="text-blue-600 underline hover:text-blue-800"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),
    h1: ({ node, ...props }: any) => (
      <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 className="text-xl font-bold mt-3 mb-2" {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-lg font-bold mt-3 mb-1" {...props} />
    ),
    p: ({ node, ...props }: any) => <p className="mb-2" {...props} />,
    ul: ({ node, ...props }: any) => (
      <ul className="list-disc pl-5 mb-2" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol className="list-decimal pl-5 mb-2" {...props} />
    ),
    li: ({ node, ...props }: any) => <li className="mb-1" {...props} />,
    blockquote: ({ node, ...props }: any) => (
      <blockquote
        className="border-l-4 border-gray-300 pl-4 italic my-2"
        {...props}
      />
    ),
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-[calc(100vh-160px)]">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-gray-50">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
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
          <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
        </div>
        <div className="relative" ref={modelSelectorRef}>
          <button
            onClick={toggleModelSelector}
            className="flex items-center space-x-1 px-2 py-1 rounded text-gray-700 hover:bg-gray-100 transition-colors"
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
            <div className="text-black absolute right-0 mt-1 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200 overflow-hidden">
              {AI_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors flex items-start space-x-2 ${
                    selectedModel.id === model.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <span className="text-xl">{model.icon}</span>
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-gray-600">
                      {model.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 text-gray-800"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600">
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
            <h3 className="text-lg font-medium mb-1 text-gray-900">
              AI Assistant
            </h3>
            <p className="text-sm text-center text-gray-600 max-w-md">
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
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {msg.sender === 'AI Assistant' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs">
                      {msg.model === 'research' ? '📚' : '🧮'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Using{' '}
                      {msg.model === 'research' ? 'Research' : 'Reasoning'}{' '}
                      model
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
                  className={`text-xs mt-2 ${
                    msg.sender === 'AI Assistant'
                      ? 'text-gray-500'
                      : 'text-blue-200'
                  }`}
                >
                  {formatTime(new Date(msg.timestamp))}
                </div>
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex">
            <div className="max-w-3/4 bg-gray-100 rounded-2xl px-4 py-2">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs">{selectedModel.icon}</span>
                <span className="text-xs text-gray-500">
                  Using {selectedModel.name} model
                </span>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t p-3">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Ask the ${selectedModel.name} AI...`}
              className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 focus:outline-none text-gray-900"
              disabled={isTyping}
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className={`p-3 rounded-lg ${
              inputValue.trim() && !isTyping
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-400'
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
