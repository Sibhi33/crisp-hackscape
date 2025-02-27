import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface FormattedAnalysisCardProps {
  title: string;
  content: string;
}

const FormattedAnalysisCard: React.FC<FormattedAnalysisCardProps> = ({
  title,
  content,
}) => {
  // Function to render text with links
  const renderTextWithLinks = (text: string): React.ReactNode[] => {
    const parts = text.split(/(<https?:\/\/[^>]+>)/);
    return parts.map((part, index) => {
      const linkMatch = part.match(/<(https?:\/\/[^>]+)>/);
      if (linkMatch) {
        const url = linkMatch[1];
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 ml-2"
          >
            Visit Link
            <ExternalLink className="h-4 w-4" />
          </a>
        );
      }
      return part;
    });
  };

  // Function to process content into hierarchical structure
  const processContent = (text: string): React.ReactNode[] => {
    const lines = text.split('\n');
    let currentSection = '';
    const formattedContent: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('- **') && trimmedLine.includes(':**')) {
        // Main section header
        currentSection = trimmedLine.replace('- **', '').split(':**')[0];
        formattedContent.push(
          <div key={index} className="mt-4 first:mt-0">
            <h3 className="font-bold text-lg mb-2">{currentSection}:</h3>
          </div>
        );
        // Add the content after the colon if any
        const afterColon = trimmedLine.split(':**')[1].trim();
        if (afterColon) {
          formattedContent.push(
            <p key={`${index}-content`} className="ml-4 mb-2">
              {renderTextWithLinks(afterColon)}
            </p>
          );
        }
      } else if (trimmedLine.startsWith('- ')) {
        // Regular bullet point
        formattedContent.push(
          <div key={index} className="ml-4 mb-2 flex">
            <span className="mr-2">•</span>
            <span className="flex-1">
              {renderTextWithLinks(trimmedLine.substring(2))}
            </span>
          </div>
        );
      } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        // Section title
        formattedContent.push(
          <h2 key={index} className="text-xl font-bold mb-4 mt-6 first:mt-0">
            {trimmedLine.replace(/\*\*/g, '')}
          </h2>
        );
      } else if (trimmedLine.startsWith('###')) {
        // Subsection marker
        formattedContent.push(
          <div key={index} className="border-t my-6"></div>
        );
      } else if (trimmedLine) {
        // Regular text
        formattedContent.push(
          <p key={index} className="mb-2">
            {renderTextWithLinks(trimmedLine)}
          </p>
        );
      }
    });

    return formattedContent;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="capitalize">
          {title.replace(/([A-Z])/g, ' $1').trim()}
        </CardTitle>
      </CardHeader>
      <CardContent className="prose max-w-none">
        {processContent(content)}
      </CardContent>
    </Card>
  );
};

export default FormattedAnalysisCard;
