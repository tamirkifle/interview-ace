export class ResumeProcessorPrompts {
    static buildConsolidationPrompt(oldDescription: string, newDescription: string): string {
      return `You are an expert resume analyzer. Consolidate these two experience descriptions into one comprehensive description.
  
  GUIDELINES:
  - Combine unique information from both descriptions
  - Remove redundancy while preserving key details  
  - Maintain 4-6 bullet points maximum
  - Use action verbs and quantify achievements where possible
  - Focus on technical skills, impact, and responsibilities
  
  OLD DESCRIPTION:
  ${oldDescription}
  
  NEW DESCRIPTION:  
  ${newDescription}
  
  Return only the consolidated description as bullet points, no additional text.`;
    }
  
    static buildResumeAnalysisPrompt(resumeText: string): string {
      return `You are an expert resume analyzer. Extract experiences and projects from this resume text.
  
  EXTRACTION RULES:
  1. EXPERIENCES: For each job/internship, create:
     - ID: CompanyName_JobTitle (replace spaces with underscores, remove special chars)
     - Description: 4-6 bullet points of key responsibilities and achievements
  
  2. PROJECTS: For each significant project, create:
     - ID: ProjectName (descriptive, replace spaces with underscores)  
     - Description: 3-5 bullet points of what was built, technologies used, and impact
  
  RESUME TEXT:
  ${resumeText}
  
  Return valid JSON in this exact format:
  {
    "experiences": [
      {
        "id": "Google_Software_Engineer_Intern",
        "description": "• Built scalable microservices using Go and Docker\n• Reduced API latency by 40% through caching optimization\n• Collaborated with 5-person team on user authentication system\n• Implemented automated testing achieving 95% code coverage"
      }
    ],
    "projects": [
      {
        "id": "Social_Media_Dashboard",
        "description": "• Developed React-based analytics dashboard for social media metrics\n• Integrated 5+ APIs including Twitter, Instagram, Facebook\n• Processed 100K+ data points daily with Redis caching\n• Deployed on AWS with 99.9% uptime"
      }
    ]
  }`;
    }
  
    static buildQuestionGenerationPrompt(
      entityType: 'experience' | 'project', 
      entityId: string, 
      description: string,
      count: number = 5
    ): string {
      const contextType = entityType === 'experience' ? 'work experience' : 'project';
      
      return `Generate ${count} behavioral interview questions for this ${contextType}.
  
  ${entityType.toUpperCase()} CONTEXT:
  ID: ${entityId}
  Description: ${description}
  
  QUESTION REQUIREMENTS:
  - Focus on STAR method (Situation, Task, Action, Result)
  - Target technical and soft skills demonstrated in this ${contextType}
  - Vary difficulty levels (easy, medium, hard)
  - Make questions specific enough to this experience but broad enough for good answers
  
  AVAILABLE CATEGORIES (choose relevant ones):
  - Leadership: Leading teams, taking ownership, driving results
  - Teamwork: Collaboration, conflict resolution, cross-functional work
  - Problem Solving: Technical challenges, creative solutions, debugging
  - Communication: Explaining complex topics, persuasion, presentations
  - Innovation: New ideas, improving processes, thinking differently
  - Adversity: Failures, setbacks, learning from mistakes
  - Impact: Measurable results, business outcomes, value creation
  - Growth: Learning new skills, feedback, mentoring
  
  AVAILABLE TRAITS (choose relevant ones):
  - Initiative, Collaboration, Adaptability, Resilience, Empathy
  - Analytical Thinking, Customer Focus, Ownership, Influence
  - Strategic Thinking, Execution, Creativity, Data-Driven
  - Humility, Integrity, Results-Oriented
  
  For each question, provide:
  - text: The complete behavioral question
  - difficulty: "easy", "medium", or "hard"
  - reasoning: Why this question is relevant to this ${contextType}
  - suggestedCategories: Array of category names that this question would assess
  - suggestedTraits: Array of trait names that this question would evaluate
  
  Return valid JSON array:
  [
    {
      "text": "Tell me about a time you had to solve a complex technical problem in this role",
      "difficulty": "medium",
      "reasoning": "Tests problem-solving skills and technical depth from the described responsibilities",
      "suggestedCategories": ["Problem Solving", "Impact"],
      "suggestedTraits": ["Analytical Thinking", "Execution"]
    }
  ]`;
    }
  }