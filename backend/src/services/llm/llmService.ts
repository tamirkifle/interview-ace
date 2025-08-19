import { LLMContext, LLMProvider, GenerateQuestionsRequest, QuestionGenerationResult, LLMError, ResolvedGeneratedQuestion } from './types';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GeminiProvider } from './providers/gemini';
import { OllamaProvider } from './providers/ollama';
import { ResumeProcessorPrompts } from './prompts/resumeProcessor';
import { CategoryService } from '../categoryService';
import { TraitService } from '../traitService';
import { Category, Trait } from '../storyService';
import { v4 as uuidv4 } from 'uuid';

const categoryService = new CategoryService();
const traitService = new TraitService();

export class LLMService {
  getProvider(context: LLMContext): LLMProvider {
    const { provider, apiKey, model } = context;
    if (!provider) {
      throw new LLMError('No LLM provider specified', 'INVALID_REQUEST', 'unknown');
    }

    if (!apiKey) {
      throw new LLMError('No API key provided', 'INVALID_API_KEY', provider);
    }

    switch (provider) {
      case 'openai':
        return new OpenAIProvider(apiKey, model);
      case 'anthropic':
        return new AnthropicProvider(apiKey, model);
      case 'gemini':
        return new GeminiProvider(apiKey, model);
      case 'ollama':
        return new OllamaProvider(apiKey, model);
      default:
        throw new LLMError(`Unknown provider: ${provider}`, 'INVALID_REQUEST', provider);
    }
  }

  // Helper function to resolve category names to full Category objects
  async resolveCategoryNamesToObjects(names: string[]): Promise<Category[]> {
    const allCategories = await categoryService.getAllCategories();
    return names
      .map(name => {
        // Try exact match first
        let match = allCategories.find(cat => 
          cat.name.toLowerCase() === name.toLowerCase()
        );
        
        // If no exact match, try partial match
        if (!match) {
          match = allCategories.find(cat => 
            cat.name.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(cat.name.toLowerCase())
          );
        }
        
        return match;
      })
      .filter((cat): cat is Category => cat !== null && cat !== undefined);
  }

  // Helper function to resolve trait names to full Trait objects
  async resolveTraitNamesToObjects(names: string[]): Promise<Trait[]> {
    const allTraits = await traitService.getAllTraits();
    return names
      .map(name => {
        // Try exact match first
        let match = allTraits.find(trait => 
          trait.name.toLowerCase() === name.toLowerCase()
        );
        
        // If no exact match, try partial match
        if (!match) {
          match = allTraits.find(trait => 
            trait.name.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(trait.name.toLowerCase())
          );
        }
        
        return match;
      })
      .filter((trait): trait is Trait => trait !== null && trait !== undefined);
  }

  async generateQuestions(
    request: GenerateQuestionsRequest,
    context: LLMContext
  ): Promise<QuestionGenerationResult> {
    const provider = this.getProvider(context);
    let generatedQuestions = await provider.generateQuestions(request);

    let resolvedQuestions: ResolvedGeneratedQuestion[] = await Promise.all(
      generatedQuestions.map(async (q) => {
        const resolvedCategories = await this.resolveCategoryNamesToObjects(q.suggestedCategories);
        const resolvedTraits = await this.resolveTraitNamesToObjects(q.suggestedTraits);
        return {
          ...q,
          suggestedCategories: resolvedCategories,
          suggestedTraits: resolvedTraits,
        };
      })
    );

    // Determine source type based on request
    const sourceType = request.jobDescription
      ? request.categoryIds?.length
        ? 'mixed'
        : 'job'
      : 'generated';

    return {
      questions: resolvedQuestions,
      generationId: uuidv4(),
      sourceType,
      provider: provider.getName(),
    };
  }

  async consolidateDescription(oldDesc: string, newDesc: string, provider: LLMProvider): Promise<string> {
    const consolidationPrompt = ResumeProcessorPrompts.buildConsolidationPrompt(oldDesc, newDesc);
    const rawConsolidation = await provider.generateCompletion(consolidationPrompt);
    return rawConsolidation.replace(/```json\n|```/g, '').trim();
  }

  async processResume(resumeText: string, context: LLMContext): Promise<{
    experiences: Array<{ id: string; description: string }>;
    projects: Array<{ id: string; description: string }>;
  }> {
    const provider = this.getProvider(context);
    const prompt = ResumeProcessorPrompts.buildResumeAnalysisPrompt(resumeText);
    
    const rawCompletion = await provider.generateCompletion(prompt);
    const cleanedResponse = rawCompletion.replace(/```json\n|```/g, '').trim();
    
    return JSON.parse(cleanedResponse);
  }

  async generateResumeQuestions(
    entityType: 'experience' | 'project',
    entityId: string,
    description: string,
    count: number,
    context: LLMContext
  ): Promise<QuestionGenerationResult> {
    const provider = this.getProvider(context);
    const prompt = ResumeProcessorPrompts.buildQuestionGenerationPrompt(
      entityType,
      entityId,
      description,
      count
    );
    
    const rawCompletion = await provider.generateCompletion(prompt);
    const cleanedResponse = rawCompletion.replace(/```json\n|```/g, '').trim();
    const questions = JSON.parse(cleanedResponse);
    
    // Resolve category and trait names to objects
    const resolvedQuestions = await Promise.all(
      questions.map(async (q: any) => {
        const resolvedCategories = await this.resolveCategoryNamesToObjects(q.suggestedCategories || []);
        const resolvedTraits = await this.resolveTraitNamesToObjects(q.suggestedTraits || []);
        
        return {
          text: q.text,
          difficulty: q.difficulty,
          reasoning: q.reasoning,
          suggestedCategories: resolvedCategories,
          suggestedTraits: resolvedTraits,
          // Add metadata for frontend
          metadata: {
            entityType,
            entityId,
            source: entityType // Use entityType directly as source
          }
        };
      })
    );
    
    return {
      questions: resolvedQuestions,
      generationId: uuidv4(),
      sourceType: entityType, // This should be 'experience' or 'project'
      provider: context.provider || 'unknown',
    };
  }

  async validateApiKey(context: LLMContext): Promise<boolean> {
    try {
      const provider = this.getProvider(context);
      return await provider.validateApiKey();
    } catch {
      return false;
    }
  }
}

export const llmService = new LLMService();