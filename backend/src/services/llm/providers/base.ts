import { LLMProvider, GenerateQuestionsRequest, GeneratedQuestion, LLMError } from '../types';
import { QuestionGeneratorPrompts } from '../prompts/questionGenerator';
import { JobDescriptionAnalyzer } from '../prompts/jobDescriptionAnalyzer';

export abstract class BaseLLMProvider implements LLMProvider {
  protected apiKey: string;
  protected providerName: string;
  protected promptGenerator: QuestionGeneratorPrompts;
  protected jobAnalyzer: JobDescriptionAnalyzer;

  constructor(apiKey: string, providerName: string) {
    if (!apiKey) {
      throw new LLMError('API key is required', 'INVALID_API_KEY', providerName);
    }
    this.apiKey = apiKey;
    this.providerName = providerName;
    this.promptGenerator = new QuestionGeneratorPrompts();
    this.jobAnalyzer = new JobDescriptionAnalyzer();
  }

  abstract generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]>;
  
  abstract validateApiKey(): Promise<boolean>;

  getName(): string {
    return this.providerName;
  }

  protected validateRequest(request: GenerateQuestionsRequest): void {
    const count = request.count || 5;
    if (count < 1 || count > 20) {
      throw new LLMError(
        'Question count must be between 1 and 20',
        'INVALID_REQUEST',
        this.providerName
      );
    }

    if (!request.categoryIds?.length && !request.jobDescription) {
      throw new LLMError(
        'Either categoryIds or jobDescription must be provided',
        'INVALID_REQUEST',
        this.providerName
      );
    }
  }

  protected async buildPrompts(request: GenerateQuestionsRequest): Promise<{
    systemPrompt: string;
    userPrompt: string;
  }> {
    const categories = await this.promptGenerator.getCategories(request.categoryIds || []);
    const traits = await this.promptGenerator.getTraits(request.traitIds || []);
    const systemPrompt = this.promptGenerator.buildSystemPrompt();
    const userPrompt = await this.promptGenerator.buildUserPrompt(
      request,
      categories,
      traits
    );
    return { systemPrompt, userPrompt };
  }

  protected parseQuestionResponse(responseText: string): GeneratedQuestion[] {
    try {
      
      // First, check for and strip markdown code block wrapping
      const cleanedResponse = responseText.replace(/```json\n|```/g, '').trim();
      console.log('cleanedResponse')
      console.log(cleanedResponse)

      const parsed = JSON.parse(cleanedResponse);
      console.log('parsed')
      console.log(parsed)

      const questions = Array.isArray(parsed) ? parsed : [parsed];
      
      return questions.map((q: any) => ({
        // id: q.id,
        text: q.text || q.question || '',
        suggestedCategories: Array.isArray(q.suggestedCategories) ? q.suggestedCategories : 
                           Array.isArray(q.categories) ? q.categories : [],
        suggestedTraits: Array.isArray(q.suggestedTraits) ? q.suggestedTraits : 
                        Array.isArray(q.traits) ? q.traits : [],
        difficulty: (q.difficulty || 'medium').toLowerCase() as 'easy' | 'medium' | 'hard',
        reasoning: q.reasoning || ''
      })).filter((q: GeneratedQuestion) => q.text);
    } catch (error) {
      console.log({error})
      throw new LLMError(
        'Failed to parse question response',
        'PROVIDER_ERROR',
        this.providerName
      );
    }
  }
}