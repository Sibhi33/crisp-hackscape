"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";

const IdeasPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const router = useRouter();

  // Modal state for share and delete actions
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("user", user.id)
          .order("createdat", { ascending: false });
        if (error) {
          console.error("Error fetching projects:", error);
        } else {
          setProjects(data || []);
        }
      }
    };

    fetchProjects();
  }, [user]);

  const handleCardClick = (id: number) => {
    router.push(`/ideas/${id}`);
  };

  // Open share modal
  const handleShare = (project: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProject(project);
    setShowShareModal(true);
  };

  // Copy share link to clipboard
  const handleCopy = async () => {
    const shareLink = `${window.location.origin}/ideas/${selectedProject.id}`;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  // Open delete confirmation modal
  const handleDeleteClick = (project: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  // Delete project from Supabase and update state
  const handleDelete = async () => {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", selectedProject.id);
    if (error) {
      console.error("Error deleting project:", error);
    } else {
      setProjects((prev) =>
        prev.filter((proj) => proj.id !== selectedProject.id)
      );
      setShowDeleteModal(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl font-semibold text-gray-700">
          Please log in to view your projects.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">My Projects</h1>
          <Button
            onClick={() => router.push("/new-project")}
            
          >
            + New Project
          </Button>
        </div>
        {projects.length === 0 ? (
          <p className="text-lg text-gray-600">
            No projects found. Start by creating a new project.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer transform hover:scale-105 transition duration-300 shadow-lg hover:shadow-2xl"
                onClick={() => handleCardClick(project.id)}
              >
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-t">
                  <CardTitle className="text-xl font-semibold">
                    {project.PS}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 bg-white">
                  <p className="text-sm text-gray-600">
                    {new Date(project.createdat).toLocaleString()}
                  </p>
                  <div className="mt-4 flex justify-between">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => handleShare(project, e)}
                    >
                      Share
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => handleDeleteClick(project, e)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h2 className="text-xl font-semibold mb-4 text-black">Share Project</h2>
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/ideas/${selectedProject.id}`}
              className="w-full p-2 border rounded mb-4 text-black"
            />
            <Button onClick={handleCopy} className="w-full mb-2">
              {copied ? "Copied!" : "Copy Link"}
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
      {showDeleteModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-80 ">
            <h2 className="text-xl text-black font-semibold mb-4">
              Confirm Delete
            </h2>
            <p className="mb-4 text-black">
              Are you sure you want to delete the project &quot;
              {selectedProject.PS}&quot;?
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
  );
};

export default IdeasPage;
