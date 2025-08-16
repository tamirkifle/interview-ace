import { LLMContext, LLMProvider, GenerateQuestionsRequest, QuestionGenerationResult, LLMError, GeneratedQuestion, ResolvedGeneratedQuestion } from './types';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GeminiProvider } from './providers/gemini';
import { OllamaProvider } from './providers/ollama';
import { QuestionService } from '../questionService';
import { JobService } from '../jobService';
import { CategoryService } from '../categoryService';
import { TraitService } from '../traitService';
import { v4 as uuidv4 } from 'uuid';
import { Question, Job } from '../storyService';
import { Category, Trait } from '../storyService';

const questionService = new QuestionService();
const jobService = new JobService();
const categoryService = new CategoryService();
const traitService = new TraitService();


export class LLMService {
  private getProvider(context: LLMContext): LLMProvider {
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
  private async resolveCategoryNamesToObjects(names: string[]): Promise<Category[]> {
    const allCategories = await categoryService.getAllCategories();
    return names
      .map(name => allCategories.find(cat => cat.name.toLowerCase() === name.toLowerCase()))
      .filter((cat): cat is Category => cat !== undefined);
  }

  // Helper function to resolve trait names to full Trait objects
  private async resolveTraitNamesToObjects(names: string[]): Promise<Trait[]> {
    const allTraits = await traitService.getAllTraits();
    return names
      .map(name => allTraits.find(trait => trait.name.toLowerCase() === name.toLowerCase()))
      .filter((trait): trait is Trait => trait !== undefined);
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
    
    try {
      // Handle persistence for job-specific questions
      if (request.jobDescription && request.company && request.title) {
        const jobNode: Job = await jobService.createOrFindJob({
          company: request.company,
          title: request.title,
          description: request.jobDescription,
        });

        const savedQuestions: ResolvedGeneratedQuestion[] = await Promise.all(
          resolvedQuestions.map(async (q) => {
            const newQuestion: Question = await questionService.createQuestion({
              text: q.text,
              categoryIds: q.suggestedCategories.map(c => c.id),
              traitIds: q.suggestedTraits.map(t => t.id),
              difficulty: q.difficulty,
              commonality: 5,
              source: 'generated',
              reasoning: q.reasoning,
            });

            await questionService.linkQuestionToJob(newQuestion.id, jobNode.id);

            return {
              ...q,
              id: newQuestion.id,
            };
          })
        );
        resolvedQuestions = savedQuestions;
      }

      const sourceType = request.jobDescription
        ? request.categoryIds?.length
          ? 'mixed'
          : 'job_description'
        : 'categories';

      return {
        questions: resolvedQuestions,
        generationId: uuidv4(),
        sourceType,
        provider: provider.getName(),
      };
    } catch (error) {
      if (error instanceof LLMError) {
        throw error;
      }
      throw new LLMError(
        'Unexpected error during question generation',
        'PROVIDER_ERROR',
        provider.getName()
      );
    }
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