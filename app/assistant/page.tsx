"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Groq } from 'groq-sdk';
import { Navbar } from '@/components/Navbar';
import FormattedAnalysisCard from '@/components/FormatttedCard';
type ApiResponse = {
  ideaDescription: string;
  existingCompetitors: string;
  impact: string;
  uniqueValuePropositions: string;
  otherInformation: string;
  referenceLinks: string;
};

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
    // Removed PDF from allowed formats
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
    
    // Updated prompt to ensure all sections are returned with "N/A" if missing,
    // and to minimize hallucination by not generating unsupported information.
    const prompt = `You are an expert business analyst and startup consultant specializing in idea validation, market analysis, and innovation assessment. Analyze the following submission and provide a comprehensive evaluation. Your analysis must be thorough, specific, and presented in clear bullet points for better readability.

Please structure your response exactly as follows, ensuring all sections are filled with relevant bullet points. If information is truly unavailable, list "Insufficient data provided" as a bullet point rather than "N/A":

1) Idea Description:
• Overview of the core concept
• Target market/audience
• Key features and functionalities
• Primary goals and objectives
• Technology or methods involved
• Implementation approach

2) Existing Competitors:
• Direct competitors in the market
• Indirect competitors and alternatives
• Market leaders and their strengths
• Competitor weaknesses and gaps
• Similar solutions in adjacent markets
• Notable failed attempts in this space

3) Impact:
• Potential market size and reach
• Social and economic benefits
• Environmental considerations
• Scalability potential
• Job creation possibilities
• Industry transformation potential
• Cost-benefit analysis
• Risk assessment

4) Unique Value Propositions:
• Key differentiators
• Competitive advantages
• Innovation aspects
• Cost efficiencies
• Time-saving benefits
• Quality improvements
• User experience enhancements
• Technical advantages

5) Other Information:
• Resource requirements
• Implementation timeline
• Potential challenges
• Growth opportunities
• Strategic partnerships needed
• Regulatory considerations
• Success metrics
• Risk mitigation strategies

6) Reference Links & Resources:
• Similar successful implementations
• Relevant research papers
• Industry reports
• Market studies
• Technical documentation
• Regulatory guidelines
• Expert opinions
• Case studies
For each reference, provide a brief description followed by the relevant link in angle brackets (<>), the reference links must be highly accurate. Example format:
• Similar successful implementations:
- Google Cloud Speech-to-Text: Industry-leading speech recognition service. <https://cloud.google.com/speech-to-text>
- Microsoft Azure Cognitive Services: Comprehensive AI services for developers. <https://azure.microsoft.com/services/cognitive-services>
• Relevant research papers:
- "Neural Machine Translation": Comprehensive overview of modern translation techniques. <https://arxiv.org/abs/1709.07809>
• Industry reports:
- Global Language Services Market Report: Detailed market analysis and forecasts. <https://www.grandviewresearch.com/industry-analysis/language-services-market>
• Market studies:
- Common Sense Advisory Report: In-depth analysis of language service providers. <https://csa-research.com/More/Featured-Content/Global-Market-Study>
• Technical documentation:
- TensorFlow Documentation: Machine learning framework documentation. <https://www.tensorflow.org/api_docs>
- PyTorch tutorials: Comprehensive guides for deep learning. <https://pytorch.org/tutorials>
• Regulatory guidelines:
- GDPR Official Documentation: Data protection requirements. <https://gdpr.eu>
- CCPA Guidelines: California privacy law requirements. <https://oag.ca.gov/privacy/ccpa>
• Expert opinions:
- Industry expert blogs and resources. <https://slator.com>
- Academic research in translation technology. <https://mt-archive.info>
• Case studies:
- Google Translate Case Studies: Real-world implementation examples. <https://cloud.google.com/customers#/products=translate>

Analyze this information meticulously:
${resumeText ? `Resume Content: ${resumeText}\n` : ''}
Problem Statement: ${problemStatement}
Description: ${description}
Category/Tracks: ${tracks}
Additional Details: ${otherDetails}

Guidelines for analysis:
- Each bullet point should be specific and actionable
- Support claims with concrete examples when possible
- Identify both opportunities and challenges
- Consider short-term and long-term implications
- Focus on feasibility and practicality
- Maintain objective and balanced assessment
- Provide specific metrics where relevant
- Include implementation considerations

Format your response using the following Markdown structure:

**Section Title**
- **Core Concept:** [Description]
- **Subsection Title:**
- Bullet point 1
- Bullet point 2
### [Next Section]

Ensure each major section starts with a double asterisk (**) and each subsection uses a single dash (-) followed by bold text for titles. Use regular bullet points for lists within subsections.

Keep your response factual and evidence-based. Do not make assumptions or include speculative information. Each bullet point should provide clear, distinct value to the analysis.`;

    try {
      const groq = new Groq({
        apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: "mixtral-8x7b-32768", // More capable model for complex analysis
        temperature: 0.3, // Lower temperature for more consistent, focused responses
        max_completion_tokens: 8192, // Increased token limit for more detailed responses
        top_p: 0.8, // Slightly lower top_p for more focused sampling
        stream: false,
        stop: ["\n\n\n"], // Prevent excessive newlines
        frequency_penalty: 0.3, // Reduce repetition
        presence_penalty: 0.3 // Encourage coverage of all topics
      });

      const content = completion.choices[0]?.message?.content || "";
      // console.log("content", content);
      // Parse response sections
      const sections: { key: keyof ApiResponse; start: string; end: string | null }[] = [
        { key: 'ideaDescription', start: '1) Idea Description:', end: '2) Existing Competitors:' },
        { key: 'existingCompetitors', start: '2) Existing Competitors:', end: '3) Impact:' },
        { key: 'impact', start: '3) Impact:', end: '4) Unique Value Propositions:' },
        { key: 'uniqueValuePropositions', start: '4) Unique Value Propositions:', end: '5) Other Information:' },
        { key: 'otherInformation', start: '5) Other Information:', end: '6) Reference Links & Resources:' },
        { key: 'referenceLinks', start: '6) Reference Links & Resources:', end: null }
      ];
      


      const result: ApiResponse = {} as ApiResponse;
      
      sections.forEach((section) => {
        const startIndex = content.indexOf(section.start);
        if (startIndex === -1) {
          result[section.key] = 'Section not found';
          return;
        }

        const endIndex = section.end 
          ? content.indexOf(section.end)
          : content.length;
        
        if (endIndex === -1) {
          result[section.key] = 'Section end not found';
          return;
        }

        // Extract content and remove any trailing "**" markers
        const sectionContent = content
          .slice(startIndex + section.start.length, endIndex)
          .trim()
          .replace(/\*\*\d+\)\s*$/, ''); // Remove trailing "**N)" pattern

        result[section.key] = sectionContent;
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
          title={key.replace(/([A-Z])/g, ' $1').trim() // Add spaces before capital letters
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')}
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
    <Navbar/>
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
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default GroqStepperPage;
