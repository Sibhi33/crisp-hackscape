"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navbar } from '@/components/Navbar';
import FormattedAnalysisCard from '@/components/FormatttedCard';
import { analyzeIdea, ApiResponse } from '@/app/api/analysisApi';
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

  const steps = [
    { label: "Problem", subtitle: "Define the problem" },
    { label: "Solution", subtitle: "Describe your approach" },
    { label: "Category", subtitle: "Classify your idea" },
    { label: "Details", subtitle: "Additional context" }
  ];

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
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-medium">Problem Statement</h3>
              <div className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full">Required</div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Clearly define the problem your solution addresses. What pain points are you solving?</p>
            <Textarea
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="E.g., Many small businesses struggle with inventory management, leading to lost sales and inefficient operations..."
              className="h-36 transition-shadow focus:shadow-md"
            />
            <div className="text-xs text-right text-gray-500">{problemStatement.length > 0 ? `${problemStatement.length} characters` : "No input yet"}</div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-medium">Solution Description</h3>
              <div className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full">Required</div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Describe your solution in detail. How does it work? What makes it unique?</p>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., Our cloud-based inventory management system uses AI to predict stock needs and integrates with point-of-sale systems..."
              className="h-36 transition-shadow focus:shadow-md"
            />
            <div className="text-xs text-right text-gray-500">{description.length > 0 ? `${description.length} characters` : "No input yet"}</div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-medium">Tracks/Category</h3>
              <div className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full">Required</div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Select the industry or category that best fits your idea. This helps with targeted analysis.</p>
            <Input
              value={tracks}
              onChange={(e) => setTracks(e.target.value)}
              placeholder="E.g., Retail Tech, Healthcare, Fintech, Education, Sustainability..."
              className="transition-shadow focus:shadow-md"
            />
            <div className="grid grid-cols-3 gap-2 mt-4">
              {["Healthcare", "Education", "Fintech", "E-commerce", "Sustainability", "AI/ML"].map(category => (
                <Button 
                  key={category}
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className={`text-xs ${tracks === category ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-500' : ''}`}
                  onClick={() => setTracks(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-medium">Additional Details</h3>
              <div className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full">Optional</div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Share any other relevant information about your idea, target market, or implementation plans.</p>
            <Textarea
              value={otherDetails}
              onChange={(e) => setOtherDetails(e.target.value)}
              placeholder="E.g., Target market is small to medium retailers. We've conducted interviews with 20 potential customers who confirmed the need..."
              className="h-36 transition-shadow focus:shadow-md"
            />
            <div className="text-xs text-right text-gray-500">{otherDetails.length > 0 ? `${otherDetails.length} characters` : "No input yet"}</div>
            <Alert className="bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You're almost done! Review your inputs before submitting for analysis.
              </AlertDescription>
            </Alert>
          </div>
        );
      default:
        return null;
    }
  };

  const renderAnalysisResults = () => (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      
      
      {/* Scrollable container for analysis results */}
      <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid gap-6">
          {Object.entries(apiResult || {}).map(([key, value], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <FormattedAnalysisCard
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
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center mt-8">
        <Button
          variant="outline"
          onClick={() => {
            setStep(0);
            setApiResult(null);
          }}
          className="mr-4"
        >
          Start New Analysis
        </Button>
        <Button
          onClick={() => {
            // Implement save or export functionality
            alert("Analysis saved successfully!");
          }}
        >
          Save Analysis
        </Button>
      </div>
    </motion.div>
  );

  return (
    <> 
      <Navbar />
      <div className="relative overflow-y-hidden">
        <WavyBackground />
        <div className="absolute inset-0 flex items-center justify-center z-10 px-4 overflow-hidden">
          <motion.div 
            className="w-full max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl font-bold text-center">
                  {apiResult ? "Idea Analysis Results" : "Idea Analysis Form"}
                </CardTitle>
                <CardDescription className="text-center text-lg">
                  {apiResult ? "Review the detailed feedback on your idea" : "Submit your idea for comprehensive analysis and feedback"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!apiResult && (
                  <div className="mb-8">
                    <Progress value={progress} className="h-3 rounded-full" />
                    <div className="flex justify-between mt-3">
                      {steps.map((s, i) => (
                        <div 
                          key={i} 
                          className={`text-center flex-1 ${i === step ? 'text-primary' : 'text-gray-500'}`}
                        >
                          <div className="text-sm font-medium">{s.label}</div>
                          <div className="text-xs hidden md:block">{s.subtitle}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {loading ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6" />
                    <p className="text-lg">Analyzing your idea...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
                  </div>
                ) : (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {apiResult ? (
                      renderAnalysisResults()
                    ) : (
                      <div className="p-1">
                        {renderStepContent()}
                        <div className="mt-8 flex justify-between">
                          {step > 0 ? (
                            <Button 
                              variant="outline" 
                              onClick={() => setStep(step - 1)}
                              className="flex items-center"
                            >
                              <ArrowLeft className="h-4 w-4 mr-2" />
                              Back
                            </Button>
                          ) : (
                            <div></div>
                          )}
                          
                          {step < totalSteps - 1 ? (
                            <Button 
                              onClick={() => setStep(step + 1)}
                              disabled={(step === 0 && !problemStatement) || (step === 1 && !description)} 
                              className="flex items-center"
                            >
                              Continue
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          ) : (
                            <Button
                              onClick={handleSubmit}
                              disabled={!problemStatement || !description || !tracks}
                              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                            >
                              Analyze My Idea
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {error && (
                  <Alert variant="destructive" className="mt-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <style jsx>{`
      .glassmorphism {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }
      
      /* Improve input and textarea readability against the backdrop */
      :global(.glassmorphism input),
      :global(.glassmorphism textarea) {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
      }
      
      :global(.glassmorphism input:focus),
      :global(.glassmorphism textarea:focus) {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.5);
      }
      
      /* Custom scrollbar styling */
      :global(.custom-scrollbar::-webkit-scrollbar) {
        width: 6px;
      }
      
      :global(.custom-scrollbar::-webkit-scrollbar-track) {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
      }
      
      :global(.custom-scrollbar::-webkit-scrollbar-thumb) {
        background: rgba(129, 140, 248, 0.5);
        border-radius: 10px;
      }
      
      :global(.custom-scrollbar::-webkit-scrollbar-thumb:hover) {
        background: rgba(129, 140, 248, 0.7);
      }
    `}</style>
    </>
  );
};

export default GroqStepperPage;