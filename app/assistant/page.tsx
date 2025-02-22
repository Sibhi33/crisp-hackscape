"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navbar } from '@/components/Navbar';
import FormattedAnalysisCard from '@/components/FormatttedCard';
import { analyzeIdea, ApiResponse } from '@/api/analysisApi'; // Adjust the import path as needed

const GroqStepperPage = () => {
  const [step, setStep] = useState(0);
  const [resume, setResume] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [problemStatement, setProblemStatement] = useState('');
  const [description, setDescription] = useState('');
  const [tracks, setTracks] = useState('');
  const [otherDetails, setOtherDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiResult, setApiResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState('');

  const totalSteps = 5;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file.name.match(/\.(txt|doc|docx)$/)) {
      setError('Please upload a valid document (TXT, DOC, or DOCX)');
      return;
    }
    setError('');
    setResume(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setResumeText(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await analyzeIdea({
        resumeText,
        problemStatement,
        description,
        tracks,
        otherDetails
      });
      setApiResult(result);
    } catch (error) {
      setError('An error occurred while analyzing your submission. Please try again.');
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Upload your resume (Optional)</h3>
              <p className="text-sm text-gray-500 mb-4">Drag and drop your file here or click to browse</p>
              <Button variant="outline" className="relative">
                Browse Files
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".txt,.doc,.docx"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </Button>
              {resume && (
                <div className="mt-4 p-3 bg-secondary rounded-md flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">{resume.name}</span>
                  <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                </div>
              )}
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <label className="text-sm font-medium">Problem Statement</label>
            <Textarea
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="Describe the problem you're trying to solve..."
              className="h-32"
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of your solution..."
              className="h-32"
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <label className="text-sm font-medium">Tracks/Category</label>
            <Input
              value={tracks}
              onChange={(e) => setTracks(e.target.value)}
              placeholder="e.g., Healthcare, Technology, Education..."
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <label className="text-sm font-medium">Other Relevant Details</label>
            <Textarea
              value={otherDetails}
              onChange={(e) => setOtherDetails(e.target.value)}
              placeholder="Any additional information that might be relevant..."
              className="h-32"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderAnalysisResults = () => (
    <div className="space-y-6">
      <div className="grid gap-6">
        {Object.entries(apiResult || {}).map(([key, value]) => (
          <FormattedAnalysisCard
            key={key}
            title={
              key
                .replace(/([A-Z])/g, ' $1')
                .trim()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
            }
            content={value}
          />
        ))}
      </div>
      <Button 
        variant="outline" 
        onClick={() => {
          setStep(0);
          setApiResult(null);
        }}
        className="mt-4"
      >
        Start New Analysis
      </Button>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Idea Analysis Form</CardTitle>
            <CardDescription>
              Submit your idea for comprehensive analysis and feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-8">
              <Progress value={progress} className="h-2" />
              <div className="mt-2 text-sm text-gray-500">
                Step {step + 1} of {totalSteps}
              </div>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-gray-500">Analyzing your submission...</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {apiResult ? renderAnalysisResults() : (
                  <div>
                    {renderStepContent()}
                    <div className="mt-6 flex justify-between">
                      {step > 0 && (
                        <Button variant="outline" onClick={() => setStep(step - 1)}>
                          Previous
                        </Button>
                      )}
                      {step < totalSteps - 1 ? (
                        <Button onClick={() => setStep(step + 1)}>
                          Next
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleSubmit}
                          disabled={!problemStatement || !description || !tracks}
                        >
                          Analyze Idea
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default GroqStepperPage;
