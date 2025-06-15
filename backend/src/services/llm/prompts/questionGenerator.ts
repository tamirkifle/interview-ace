import { CategoryService } from '../../categoryService';
import { TraitService } from '../../traitService';
import { Category, Trait } from '../../storyService';
import { JobDescriptionAnalyzer } from './jobDescriptionAnalyzer';

export class QuestionGeneratorPrompts {
  private categoryService: CategoryService;
  private traitService: TraitService;

  constructor() {
    this.categoryService = new CategoryService();
    this.traitService = new TraitService();
  }

  async getCategories(categoryIds: string[]): Promise<Category[]> {
    if (!categoryIds || categoryIds.length === 0) return [];
    
    const categories = await Promise.all(
      categoryIds.map(id => this.categoryService.getCategoryById(id))
    );
    
    return categories.filter((cat): cat is Category => cat !== null);
  }

  async getTraits(traitIds: string[]): Promise<Trait[]> {
    if (!traitIds || traitIds.length === 0) return [];
    
    const traits = await Promise.all(
      traitIds.map(id => this.traitService.getTraitById(id))
    );
    
    return traits.filter((trait): trait is Trait => trait !== null);
  }

  buildSystemPrompt(): string {
    return `You are an expert behavioral interview coach specializing in the STAR method (Situation, Task, Action, Result). You help candidates prepare for interviews at top technology companies.

Your expertise includes:
- Creating questions that reveal specific competencies and behaviors
- Ensuring questions are open-ended and based on past experiences
- Varying difficulty levels appropriately
- Focusing on real situations, not hypotheticals

Question Guidelines:
1. Start with phrases like "Tell me about a time when...", "Describe a situation where...", "Give me an example of...", "Walk me through..."
2. Focus on past experiences and actual behaviors
3. Be specific enough to guide the candidate but open enough for various responses
4. Avoid yes/no questions or hypothetical scenarios
5. Each question should assess 2-3 specific categories/traits maximum

Difficulty Levels:
- Easy: Common situations most professionals have encountered
- Medium: Challenging situations requiring problem-solving or leadership
- Hard: Complex scenarios involving ambiguity, failure, or significant impact`;
  }

  getCategoryPromptDetails(): Record<string, string> {
    return {
      'Leadership': 'Focus on guiding teams, making decisions, influencing without authority, taking ownership of outcomes, and driving initiatives forward',
      'Teamwork': 'Explore collaboration across functions, conflict resolution, supporting teammates, building consensus, and working in diverse teams',
      'Problem Solving': 'Examine analytical thinking, debugging complex issues, finding creative solutions, working with constraints, and systematic approaches',
      'Communication': 'Assess ability to explain complex topics simply, deliver difficult messages, present to various audiences, and adapt communication style',
      'Innovation': 'Look for challenging status quo, implementing new ideas, improving processes, creative problem-solving, and driving change',
      'Adversity': 'Explore handling failure, receiving criticism, managing setbacks, learning from mistakes, and maintaining resilience',
      'Impact': 'Focus on delivering measurable results, creating business value, exceeding expectations, and driving meaningful outcomes',
      'Growth': 'Examine continuous learning, seeking feedback, mentoring others, expanding comfort zone, and skill development'
    };
  }

  getTraitPromptDetails(): Record<string, string> {
    return {
      'Initiative': 'Taking action without being asked, identifying opportunities, going above and beyond',
      'Collaboration': 'Working effectively with others, building relationships, fostering team success',
      'Adaptability': 'Adjusting to change, handling ambiguity, being flexible in approach',
      'Resilience': 'Bouncing back from setbacks, maintaining positivity, persevering through challenges',
      'Empathy': 'Understanding others\' perspectives, showing emotional intelligence, building trust',
      'Analytical Thinking': 'Breaking down complex problems, using data effectively, logical reasoning',
      'Customer Focus': 'Prioritizing user needs, understanding customer pain points, delivering value',
      'Ownership': 'Taking responsibility, seeing things through, accountability for outcomes',
      'Influence': 'Persuading others, building buy-in, inspiring action without authority',
      'Strategic Thinking': 'Seeing big picture, long-term planning, connecting dots across areas',
      'Execution': 'Getting things done, delivering on time, turning plans into results',
      'Creativity': 'Finding novel solutions, thinking outside the box, innovative approaches',
      'Data-Driven': 'Using metrics to guide decisions, measuring impact, evidence-based thinking',
      'Humility': 'Being open to feedback, admitting mistakes, continuous learning mindset',
      'Integrity': 'Doing the right thing, ethical decision-making, building trust through honesty',
      'Results-Oriented': 'Focusing on outcomes, driving to completion, measuring success'
    };
  }

  async buildUserPrompt(
    request: {
      categoryIds?: string[];
      traitIds?: string[];
      jobDescription?: string;
      count?: number;
      difficulty?: string;
    },
    categories: Category[],
    traits: Trait[]
  ): Promise<string> {
    const count = request.count || 5;
    const categoryDetails = this.getCategoryPromptDetails();
    const traitDetails = this.getTraitPromptDetails();
  
    let prompt = `Generate exactly ${count} behavioral interview questions`;
  
    // If job description is provided but no categories, analyze it first
    if (request.jobDescription && (!categories || categories.length === 0)) {
      const jobAnalyzer = new JobDescriptionAnalyzer();
      const analysis = jobAnalyzer.analyzeJobDescription(request.jobDescription);
      
      prompt += `\n\nBased on this job description analysis:
  - Seniority Level: ${analysis.seniorityLevel}
  - Suggested focus areas: ${analysis.suggestedCategories.join(', ')}
  - Key skills to assess: ${analysis.keySkills.slice(0, 5).join(', ')}`;
    }
  
    if (request.difficulty) {
      prompt += `\n\nGenerate questions at ${request.difficulty} difficulty level`;
    } else {
      prompt += `\n\nGenerate questions with a mix of difficulty levels`;
    }
  
    if (categories.length > 0) {
      prompt += `\n\nFocus on these behavioral categories:\n`;
      categories.forEach(cat => {
        const detail = categoryDetails[cat.name] || cat.description;
        prompt += `- ${cat.name}: ${detail}\n`;
      });
    }
  
    if (traits.length > 0) {
      prompt += `\n\nAssess these specific traits:\n`;
      traits.forEach(trait => {
        const detail = traitDetails[trait.name] || trait.description;
        prompt += `- ${trait.name}: ${detail}\n`;
      });
    }
  
    if (request.jobDescription) {
      prompt += `\n\nJob Description:\n${request.jobDescription}\n`;
      prompt += `\nTailor questions to be relevant to this specific role while maintaining behavioral interview best practices.`;
    }
  
    // This part ensures JSON format for ALL cases
    prompt += `\n\nFor each question, provide a JSON object with the following structure:
  {
    "text": "The complete question text",
    "suggestedCategories": ["Category names that this question assesses"],
    "suggestedTraits": ["Trait names that this question evaluates"],
    "difficulty": "easy|medium|hard",
    "reasoning": "Brief explanation of why this is an effective behavioral question"
  }
  
  IMPORTANT FORMATTING REQUIREMENTS:
  - Return ONLY a valid JSON array containing exactly ${count} question objects
  - Start your response with [ and end with ]
  - Do NOT include any markdown formatting, code blocks, or explanatory text
  - Do NOT wrap the JSON in \`\`\`json blocks
  - Each question object must have all five fields: text, suggestedCategories, suggestedTraits, difficulty, reasoning
  - Ensure the JSON is valid and can be parsed directly
  
  Example of the expected format:
  [
    {
      "text": "Tell me about a time when you led a team through a challenging project",
      "suggestedCategories": ["Leadership", "Teamwork"],
      "suggestedTraits": ["Initiative", "Collaboration"],
      "difficulty": "medium",
      "reasoning": "This question effectively assesses leadership skills and team collaboration"
    }
  ]`;
  
    return prompt;
  }

  buildJobDescriptionPrompt(jobDescription: string): string {
    return `Analyze this job description and generate behavioral interview questions that would help assess a candidate's fit for this role:

Job Description:
${jobDescription}

Based on this role, generate questions that:
1. Target the key skills and responsibilities mentioned
2. Assess cultural fit based on the company values implied
3. Explore relevant past experiences that would predict success
4. Cover both technical and soft skills as appropriate

Remember to maintain behavioral interview best practices - focus on past experiences, not hypotheticals.`;
  }

  getExampleQuestions(): Record<string, string[]> {
    return {
      'Leadership': [
        'Tell me about a time you led a team through a challenging project',
        'Describe a situation where you had to influence without direct authority',
        'Give an example of when you had to make a difficult decision with limited information'
      ],
      'Teamwork': [
        'Tell me about a time you disagreed with a coworker. How did you handle it?',
        'Describe a situation where you had to work with a difficult team member',
        'Give an example of when you helped a struggling teammate'
      ],
      'Problem Solving': [
        'Tell me about the most complex technical problem you have solved',
        'Describe a time when you had to debug a critical issue under pressure',
        'How did you approach a problem where the solution was not obvious?'
      ],
      'Communication': [
        'Tell me about a time you had to explain a technical concept to non-technical stakeholders',
        'Describe a situation where you had to deliver difficult feedback',
        'Give an example of a presentation that did not go as planned'
      ],
      'Innovation': [
        'Tell me about a time you improved an existing process',
        'Describe a creative solution you came up with to solve a problem',
        'When have you challenged the status quo?'
      ],
      'Adversity': [
        'Tell me about your biggest failure and what you learned from it',
        'Describe a time when you received harsh criticism',
        'Give an example of when a project you worked on was cancelled'
      ],
      'Impact': [
        'What is your proudest professional achievement?',
        'Tell me about a time you exceeded expectations',
        'Describe a project where you delivered significant business value'
      ],
      'Growth': [
        'Tell me about a time you had to learn a new skill quickly',
        'Describe how you have mentored someone',
        'When have you stepped outside your comfort zone?'
      ]
    };
  }

  buildCategorySpecificPrompt(categoryName: string, count: number = 5): string {
    const examples = this.getExampleQuestions();
    const categoryExamples = examples[categoryName] || [];
    const categoryDetail = this.getCategoryPromptDetails()[categoryName];

    return `Generate ${count} behavioral interview questions specifically for the "${categoryName}" category.

Category Focus: ${categoryDetail}

Example questions in this category:
${categoryExamples.map(q => `- ${q}`).join('\n')}

Create new questions that:
1. Are different from the examples but maintain similar depth
2. Explore various aspects of ${categoryName.toLowerCase()}
3. Range in difficulty from easy to hard
4. Would reveal genuine competency in this area

Avoid repeating the example questions or being too similar to them.`;
  }
}