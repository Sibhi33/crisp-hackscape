"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navbar } from '@/components/Navbar';
import FormattedAnalysisCard from '@/components/FormatttedCard';
import { analyzeIdea, ApiResponse } from '@/api/analysisApi';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { WavyBackground } from '@/components/ui/wavy-background';

const GroqStepperPage = () => {
  const [step, setStep] = useState(0);
  const [problemStatement, setProblemStatement] = useState('');
  const [description, setDescription] = useState('');
  const [tracks, setTracks] = useState('');
  const [otherDetails, setOtherDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiResult, setApiResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState('');

  const { user } = useAuth();

  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      // Pass an empty string for resumeText to satisfy the API's parameter type
      const result = await analyzeIdea({
        resumeText: '',
        problemStatement,
        description,
        tracks,
        otherDetails,
      });
      setApiResult(result);

      // Insert into Supabase if user is logged in
      if (user) {
        const { error: insertError } = await supabase
          .from('projects')
          .insert({
            user: user.id,
            PS: problemStatement,
            PSdescription: description,
            PSotherdetails: otherDetails,
            APIresponse: JSON.stringify(result),
            createdat: new Date().toISOString(),
          });

        if (insertError) {
          console.error('Supabase insert error:', insertError);
        }
      } else {
        console.error('User not logged in, cannot save project');
      }
    } catch (err) {
      setError('An error occurred while analyzing your submission. Please try again.');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
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
      case 1:
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
      case 2:
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
      case 3:
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
      <div className="relative min-h-screen">
        <WavyBackground />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="max-w-4xl mx-auto p-6">
            <Card className="glassmorphism">
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
                    <p className="text-white-500">Analyzing your submission...</p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {apiResult ? (
                      renderAnalysisResults()
                    ) : (
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
        </div>
      </div>
      <style jsx>{`
        .glassmorphism {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </>
  );
};

export default GroqStepperPage;