
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface ProjectDetails {
  hackathonName: string;
  problemStatement: string;
  track: string;
}

interface AIAnalysis {
  approach: string;
  technologies: string[];
  nextSteps: string[];
}

const Factory = () => {
  const [details, setDetails] = useState<ProjectDetails>({
    hackathonName: "",
    problemStatement: "",
    track: "",
  });
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const analyzeProject = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to use the AI analysis feature",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/analyze-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(details),
      });

      if (!response.ok) throw new Error("Failed to analyze project");
      
      const data = await response.json();
      setAnalysis(data);
      toast({
        title: "Analysis complete",
        description: "Check out our suggestions below!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold text-center mb-8">Project Factory</h1>
          
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hackathon Name</label>
                <Input
                  placeholder="Enter hackathon name"
                  value={details.hackathonName}
                  onChange={(e) => setDetails(prev => ({
                    ...prev,
                    hackathonName: e.target.value
                  }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Problem Statement</label>
                <Textarea
                  placeholder="Describe the problem you're trying to solve"
                  value={details.problemStatement}
                  onChange={(e) => setDetails(prev => ({
                    ...prev,
                    problemStatement: e.target.value
                  }))}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Track</label>
                <Input
                  placeholder="e.g., Healthcare, FinTech, Education"
                  value={details.track}
                  onChange={(e) => setDetails(prev => ({
                    ...prev,
                    track: e.target.value
                  }))}
                />
              </div>

              <Button 
                onClick={analyzeProject} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Project"
                )}
              </Button>
            </CardContent>
          </Card>

          {analysis && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>AI Analysis & Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Recommended Approach</h3>
                  <p className="text-muted-foreground">{analysis.approach}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Suggested Technologies</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {analysis.technologies.map((tech, index) => (
                      <li key={index} className="text-muted-foreground">{tech}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Next Steps</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {analysis.nextSteps.map((step, index) => (
                      <li key={index} className="text-muted-foreground">{step}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Factory;
