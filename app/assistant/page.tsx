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
          <div className="flex-grow flex flex-col">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-base font-medium">Problem Statement</h3>
              <div className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full">Required</div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">Clearly define the problem your solution addresses.</p>
            <Textarea
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="E.g., Many small businesses struggle with inventory management..."
              className="text-sm flex-grow"
            />
            <div className="text-[10px] text-right text-gray-500 mt-1">{problemStatement.length > 0 ? `${problemStatement.length} characters` : "No input yet"}</div>
          </div>
        );
      case 1:
        return (
          <div className="flex-grow flex flex-col">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-base font-medium">Solution Description</h3>
              <div className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full">Required</div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">Describe your solution in detail.</p>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., Our cloud-based inventory management system uses AI..."
              className="text-sm flex-grow"
            />
            <div className="text-[10px] text-right text-gray-500 mt-1">{description.length > 0 ? `${description.length} characters` : "No input yet"}</div>
          </div>
        );
      case 2:
        return (
          <div className="flex-grow flex flex-col">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-base font-medium">Tracks/Category</h3>
              <div className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full">Required</div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">Select the industry or category that best fits your idea.</p>
            <Input
              value={tracks}
              onChange={(e) => setTracks(e.target.value)}
              placeholder="E.g., Retail Tech, Healthcare, Fintech..."
              className="text-sm mb-2"
            />
            <div className="grid grid-cols-3 gap-1 mt-auto">
              {["Healthcare", "Education", "Fintech", "E-commerce", "Sustainability", "AI/ML"].map(category => (
                <Button 
                  key={category}
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className={`text-[10px] h-7 ${tracks === category ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-500' : ''}`}
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
          <div className="flex-grow flex flex-col">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-base font-medium">Additional Details</h3>
              <div className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full">Optional</div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">Share any other relevant information.</p>
            <Textarea
              value={otherDetails}
              onChange={(e) => setOtherDetails(e.target.value)}
              placeholder="E.g., Target market is small to medium retailers..."
              className="text-sm flex-grow"
            />
            <div className="text-[10px] text-right text-gray-500 mt-1">{otherDetails.length > 0 ? `${otherDetails.length} characters` : "No input yet"}</div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderAnalysisResults = () => (
    <motion.div 
      className="flex-grow flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Limited height for analysis results with no scrolling */}
      <div className="flex-grow">
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
          {Object.entries(apiResult || {}).slice(0, 4).map(([key, value], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="border border-indigo-200 bg-white/10 rounded-lg p-3">
                <h3 className="text-sm font-semibold mb-1">
                  {key
                    .replace(/([A-Z])/g, ' $1')
                    .trim()
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </h3>
                <p className="text-xs text-slate-700">
                  {typeof value === 'string' && value.length > 150 
                    ? `${value.substring(0, 150)}...` 
                    : value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center mt-3">
        <Button
          variant="outline"
          onClick={() => {
            setStep(0);
            setApiResult(null);
          }}
          className="mr-3 text-xs h-8"
          size="sm"
        >
          New Analysis
        </Button>
        <Button
          onClick={() => {
            // Implement save or export functionality
            alert("Analysis saved successfully!");
          }}
          className="text-xs h-8"
          size="sm"
        >
          Save Analysis
        </Button>
      </div>
    </motion.div>
  );

  return (
    <> 
      <Navbar />
      <div className="relative h-[calc(100vh-4rem)]">
        <WavyBackground />
        <div className="absolute inset-0 flex items-center justify-center z-10 px-4">
          <motion.div 
            className="w-full max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glassmorphism mx-auto h-[75vh] flex flex-col">
              <CardHeader className="py-3">
                <CardTitle className="text-xl md:text-2xl font-bold text-center">
                  {apiResult ? "Idea Analysis Results" : "Idea Analysis Form"}
                </CardTitle>
                <CardDescription className="text-center text-sm">
                  {apiResult ? "Review the detailed feedback on your idea" : "Submit your idea for comprehensive analysis and feedback"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col overflow-hidden py-3">
                {!apiResult && (
                  <div className="mb-4">
                    <Progress value={progress} className="h-2 rounded-full" />
                    <div className="flex justify-between mt-2">
                      {steps.map((s, i) => (
                        <div 
                          key={i} 
                          className={`text-center flex-1 ${i === step ? 'text-primary' : 'text-gray-500'}`}
                        >
                          <div className="text-xs font-medium">{s.label}</div>
                          <div className="text-[10px] hidden md:block">{s.subtitle}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {loading ? (
                  <div className="text-center py-8 flex-grow flex flex-col justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-base">Analyzing your idea...</p>
                    <p className="text-xs text-gray-500 mt-1">This may take a moment</p>
                  </div>
                ) : (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex-grow flex flex-col"
                  >
                    {apiResult ? (
                      renderAnalysisResults()
                    ) : (
                      <div className="flex-grow flex flex-col">
                        {renderStepContent()}
                        <div className="mt-auto pt-2 flex justify-between">
                          {step > 0 ? (
                            <Button 
                              variant="outline" 
                              onClick={() => setStep(step - 1)}
                              className="flex items-center text-sm h-8"
                              size="sm"
                            >
                              <ArrowLeft className="h-3 w-3 mr-1" />
                              Back
                            </Button>
                          ) : (
                            <div></div>
                          )}
                          
                          {step < totalSteps - 1 ? (
                            <Button 
                              onClick={() => setStep(step + 1)}
                              disabled={(step === 0 && !problemStatement) || (step === 1 && !description)} 
                              className="flex items-center text-sm h-8"
                              size="sm"
                            >
                              Continue
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          ) : (
                            <Button
                              onClick={handleSubmit}
                              disabled={!problemStatement || !description || !tracks}
                              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-sm h-8"
                              size="sm"
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
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-3 w-3" />
                    <AlertDescription className="text-xs">{error}</AlertDescription>
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
        font-size: 0.875rem;
      }
      
      :global(.glassmorphism input:focus),
      :global(.glassmorphism textarea:focus) {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.5);
      }
      
      /* Fixed textarea height */
      :global(.glassmorphism textarea) {
        height: 8rem;
        max-height: 8rem;
        min-height: 8rem;
        resize: none;
      }
    `}</style>
    </>
  );
};

export default GroqStepperPage;