'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChevronLeft, Share2, Trash2, Copy, X, ExternalLink } from 'lucide-react';
import FormattedAnalysisCard from '@/components/FormatttedCard';

// Define TypeScript interface for the project data
interface Project {
  id: string;
  PS: string;
  PSdescription?: string;
  PSotherdetails?: string;
  APIresponse?: string;
  created_at: string; // Changed from createdat to follow standard naming convention
  [key: string]: any; // Allow for additional properties
}

const IdeaDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        setError('Error fetching project.');
        console.error('Error fetching project:', error);
      } else {
        setProject(data);
      }
      setLoading(false);
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-blue-400 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-blue-400 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-blue-400 rounded"></div>
              <div className="h-4 bg-blue-400 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || 'Project not found.'}</p>
            <Button className="mt-4" onClick={() => router.push('/ideas')}>
              Return to Ideas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Parse the API response JSON
  let apiResponseParsed = {};
  try {
    apiResponseParsed = project.APIresponse ? JSON.parse(project.APIresponse) : {};
  } catch (err) {
    console.error('Error parsing API response:', err);
  }

  // Create a public share link
  const shareLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/ideas/${id}`
      : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDelete = async () => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      console.error('Error deleting project:', error);
    } else {
      router.push('/ideas');
    }
  };

  // Group API response by categories
  const groupedResponse = {
    'Core Details': ['ideaDescription', 'coreOverview', 'targetMarketAudience', 'keyFeatures'],
    'Market Analysis': ['existingCompetitors', 'marketNeeds', 'uniqueValue'],
    'Impact & Benefits': ['impact', 'environmentalConsiderations', 'socialBenefits', 'costBenefit'],
    'Implementation': ['technicalApproach', 'resourceRequirements', 'regulatoryConsiderations'],
    'References': ['referenceLinks', 'relatedResearch']
  };

  // Function to check which group a key belongs to
  const getGroupForKey = (key) => {
    for (const [group, keys] of Object.entries(groupedResponse)) {
      if (keys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
        return group;
      }
    }
    return 'Other Information';
  };

  // Organize response into groups
  const organizedResponse = {};
  Object.entries(apiResponseParsed).forEach(([key, value]) => {
    const group = getGroupForKey(key);
    if (!organizedResponse[group]) {
      organizedResponse[group] = {};
    }
    organizedResponse[group][key] = value;
  });

  const formatTitle = (title) => {
    return title
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:bg-gray-600 transition-colors"
          >
            <ChevronLeft size={16} /> Back
          </Button>
          <div className="flex space-x-2">
            <Button 
              variant="secondary" 
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2"
            >
              <Share2 size={16} /> Share
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2"
            >
              <Trash2 size={16} /> Delete
            </Button>
          </div>
        </div>

        {/* Main Card with project info */}
        <Card className="shadow-xl mb-8 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
            <CardTitle className="text-2xl md:text-3xl font-bold">{project.PS}</CardTitle>
            <CardDescription className="mt-2 text-blue-100">
              Created: {new Date(project.created_at).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            {project.PSdescription && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Description
                </h2>
                <p className="text-gray-600">{project.PSdescription}</p>
              </div>
            )}
            {project.PSotherdetails && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Other Details
                </h2>
                <p className="text-gray-600">{project.PSotherdetails}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Full-width Tabbed Interface for CHIPS Response */}
        <Card className="shadow-xl mb-8">
          <CardHeader className="bg-white pb-0 pt-6 px-6">
            <CardTitle className="text-2xl font-semibold text-gray-800">
              CHIPS Analysis
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            <Tabs defaultValue={Object.keys(organizedResponse)[0] || "Core Details"} className="w-full">
              <div className="px-6 pt-4">
                {/* Modified TabsList to hide scrollbar but keep functionality */}
                <TabsList className="w-full flex justify-start space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                  {Object.keys(organizedResponse).map((group) => (
                    <TabsTrigger 
                      key={group} 
                      value={group}
                      className="whitespace-nowrap px-4 py-2"
                    >
                      {group}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              {Object.entries(organizedResponse).map(([group, items]) => (
                <TabsContent key={group} value={group} className="mt-2 p-6 bg-gray-900 min-h-[400px]">
                  <div className="grid grid-cols-1 gap-6">
                    {Object.entries(items).map(([key, value]) => (
                      <Card 
                        key={key} 
                        className="w-full shadow-md hover:shadow-lg border-none"
                      >
                        <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 p-4">
                          <CardTitle className="text-lg font-medium text-white">
                            {formatTitle(key)}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 bg-white">
                          <div className="prose max-w-none">
                            <FormattedAnalysisCard
                              title=""
                              content={value}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl text-gray-800 font-semibold">
                  Share Project
                </h2>
                <Button variant="ghost" className="p-1 h-8 w-8" onClick={() => setShowShareModal(false)}>
                  <X size={16} />
                </Button>
              </div>
              <div className="flex mb-4">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className="w-full p-2 border rounded-l text-gray-800 bg-gray-50"
                />
                <Button 
                  onClick={handleCopy} 
                  className="rounded-l-none flex items-center gap-2"
                >
                  {copied ? 'Copied!' : <Copy size={16} />}
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowShareModal(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl text-gray-800 font-semibold">
                  Confirm Delete
                </h2>
                <Button variant="ghost" className="p-1 h-8 w-8" onClick={() => setShowDeleteModal(false)}>
                  <X size={16} />
                </Button>
              </div>
              <p className="mb-6 text-gray-600">
                Are you sure you want to delete this project? This action cannot be undone.
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaDetailsPage;