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
import FormattedAnalysisCard from '@/components/FormatttedCard';

const IdeaDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { id } = params; // project id as a string

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

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
      <div className="p-6 flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        {error || 'Project not found.'}
      </div>
    );
  }

  // Parse the API response JSON
  let apiResponseParsed = {};
  try {
    apiResponseParsed = JSON.parse(project.APIresponse);
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

  // Define a repeating pattern of grid spans for a bento-like layout
  const bentoPatterns = [
    // Large tiles
    'col-span-3 row-span-2',
    'col-span-3 row-span-2',
    // Smaller tiles
    'col-span-2 row-span-1',
    'col-span-2 row-span-1',
    'col-span-2 row-span-1',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="hover:bg-gray-700 transition-colors"
          >
            ← Back
          </Button>
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={() => setShowShareModal(true)}>
              Share
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Main Card with project info */}
        <Card className="shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 rounded-t-lg">
            <CardTitle className="text-3xl font-bold">{project.PS}</CardTitle>
            <CardDescription className="mt-2 text-white">
              {new Date(project.createdat).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            {project.PSdescription && (
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Description
                </h2>
                <p className="text-gray-600">{project.PSdescription}</p>
              </div>
            )}
            {project.PSotherdetails && (
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Other Details
                </h2>
                <p className="text-gray-600">{project.PSotherdetails}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bento-Style Grid for CHIPS Response */}
        <div className="bg-white p-6 rounded-lg shadow-xl mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            CHIPS Response
          </h2>
          <div className="grid grid-cols-6 auto-rows-auto gap-4">
            {Object.entries(apiResponseParsed).map(([key, value], index) => {
              // Assign a bento layout pattern
              const layoutClass = bentoPatterns[index % bentoPatterns.length];
              return (
                <div
                  key={key}
                  className={`relative overflow-hidden rounded-xl shadow-lg bg-gradient-to-tr from-gray-50 to-white p-4 ${layoutClass}`}
                >
                  <FormattedAnalysisCard
                    title={key
                      .replace(/([A-Z])/g, ' $1')
                      .trim()
                      .split(' ')
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(' ')}
                    content={value as string}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-80">
              <h2 className="text-xl text-black font-semibold mb-4">
                Share Project
              </h2>
              <input
                type="text"
                readOnly
                value={shareLink}
                className="w-full p-2 border rounded mb-4 text-black"
              />
              <Button onClick={handleCopy} className="w-full mb-2">
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
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
            <div className="bg-white rounded-lg p-6 w-80">
              <h2 className="text-xl text-black font-semibold mb-4">
                Confirm Delete
              </h2>
              <p className="mb-4 text-black">
                Are you sure you want to delete this project?
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
                  className="w-full"
                >
                  Delete
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
