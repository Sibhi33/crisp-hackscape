'use client';

import { Groq } from 'groq-sdk';

export type ApiResponse = {
  ideaDescription: string;
  existingCompetitors: string;
  impact: string;
  uniqueValuePropositions: string;
  otherInformation: string;
  referenceLinks: string;
};

export async function analyzeIdea({
  resumeText,
  problemStatement,
  description,
  tracks,
  otherDetails,
}: {
  resumeText: string;
  problemStatement: string;
  description: string;
  tracks: string;
  otherDetails: string;
}): Promise<ApiResponse> {
  // Build the prompt using the provided details.
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
      dangerouslyAllowBrowser: true,
    });

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'mixtral-8x7b-32768',
      temperature: 0.3,
      max_completion_tokens: 8192,
      top_p: 0.8,
      stream: false,
      stop: ['\n\n\n'],
      frequency_penalty: 0.3,
      presence_penalty: 0.3,
    });

    const content = completion.choices[0]?.message?.content || '';

    // Define the sections to extract from the response.
    const sections: {
      key: keyof ApiResponse;
      start: string;
      end: string | null;
    }[] = [
      {
        key: 'ideaDescription',
        start: '1) Idea Description:',
        end: '2) Existing Competitors:',
      },
      {
        key: 'existingCompetitors',
        start: '2) Existing Competitors:',
        end: '3) Impact:',
      },
      {
        key: 'impact',
        start: '3) Impact:',
        end: '4) Unique Value Propositions:',
      },
      {
        key: 'uniqueValuePropositions',
        start: '4) Unique Value Propositions:',
        end: '5) Other Information:',
      },
      {
        key: 'otherInformation',
        start: '5) Other Information:',
        end: '6) Reference Links & Resources:',
      },
      {
        key: 'referenceLinks',
        start: '6) Reference Links & Resources:',
        end: null,
      },
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

      // Extract and trim the section content.
      const sectionContent = content
        .slice(startIndex + section.start.length, endIndex)
        .trim()
        .replace(/\*\*\d+\)\s*$/, '');

      result[section.key] = sectionContent;
    });

    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
