import { StoryService } from '../../services/storyService';
import { CategoryService } from '../../services/categoryService';
import { TraitService } from '../../services/traitService';
import { QuestionService } from '../../services/questionService';
import { RecordingService } from '../../services/recordingService';
import { dateTimeScalar } from '../schema/scalars';
import { llmService, LLMError } from '../../services/llm';
import { JobService } from '../../services/jobService';
import { GraphQLError } from 'graphql';
import { Category, Trait } from '../../services/storyService';
import { GeneratedQuestion, ResolvedGeneratedQuestion } from '../../services/llm/types';

const storyService = new StoryService();
const categoryService = new CategoryService();
const traitService = new TraitService();
const questionService = new QuestionService();
const recordingService = new RecordingService();
const jobService = new JobService();

// Helper function to convert category names to Category objects
async function resolveSuggestedCategories(categoryNames: string[]): Promise<Category[]> {
  const allCategories = await categoryService.getAllCategories();
  return categoryNames
    .map(name => allCategories.find(cat => 
      cat.name.toLowerCase() === name.toLowerCase()
    ))
    .filter((cat): cat is Category => cat !== null);
}

// Helper function to convert trait names to Trait objects
async function resolveSuggestedTraits(traitNames: string[]): Promise<Trait[]> {
  const allTraits = await traitService.getAllTraits();
  return traitNames
    .map(name => allTraits.find(trait => 
      trait.name.toLowerCase() === name.toLowerCase()
    ))
    .filter((trait): trait is Trait => trait !== null);
}

export const resolvers = {
  DateTime: dateTimeScalar,
  
  Query: {
    health: () => 'ok',
    nodeCount: async () => {
      const stories = await storyService.getAllStories();
      return stories.length;
    },
    stories: async () => {
      return storyService.getAllStories();
    },
    story: async (_: any, { id }: { id: string }) => {
      return storyService.getStoryById(id);
    },
    categories: async () => {
      return categoryService.getAllCategories();
    },
    category: async (_: any, { id }: { id: string }) => {
      return categoryService.getCategoryById(id);
    },
    traits: async () => {
      return traitService.getAllTraits();
    },
    trait: async (_: any, { id }: { id: string }) => {
      return traitService.getTraitById(id);
    },
    questions: async () => {
      return questionService.getAllQuestions();
    },
    question: async (_: any, { id }: { id: string }) => {
      return questionService.getQuestionById(id);
    },
    recording: async (_: any, { id }: { id: string }) => {
      return recordingService.getRecordingById(id);
    },
    recordingsByQuestion: async (_: any, { questionId }: { questionId: string }) => {
      return recordingService.getRecordingsByQuestion(questionId);
    },
    questionsForCompany: async (_: any, { company }: { company: string }) => {
      return jobService.getQuestionsForCompany(company);
    },
    
    // Question Generation
    generateQuestions: async (_: any, { input }: { input: any }, context: any) => {
      try {
        if (!context.llmContext) {
          throw new GraphQLError('LLM context not provided', {
            extensions: { code: 'LLM_NOT_CONFIGURED' }
          });
        }
        
        const result = await llmService.generateQuestions(input, context.llmContext);

        const questionsWithResolvedRefs: ResolvedGeneratedQuestion[] = await Promise.all(
          result.questions.map(async (q: ResolvedGeneratedQuestion) => {
            const resolvedCategories = q.suggestedCategories;
            const resolvedTraits = q.suggestedTraits;
            
            return {
              ...q,
              suggestedCategories: resolvedCategories,
              suggestedTraits: resolvedTraits,
            };
          })
        );
        
        return {
          ...result,
          questions: questionsWithResolvedRefs
        };
      } catch (error) {
        if (error instanceof LLMError) {
          throw new GraphQLError(error.message, {
            extensions: { 
              code: error.code,
              provider: error.provider 
            }
          });
        }
        throw error;
      }
    },

    validateLLMKey: async (_: any, __: any, context: any) => {
      try {
        if (!context.llmContext) {
          return false;
        }
        return await llmService.validateApiKey(context.llmContext);
      } catch {
        return false;
      }
    },
    
    recordingTranscriptionStatus: async (_: any, { id }: { id: string }) => {
      return recordingService.getRecordingTranscriptionStatus(id);
    },

    recordings: async (_: any, { where, orderBy }: { where?: any; orderBy?: string }) => {
      const filters: any = {};
      if (where) {
        if (where.createdAt_gte) filters.startDate = new Date(where.createdAt_gte);
        if (where.createdAt_lte) filters.endDate = new Date(where.createdAt_lte);
        if (where.questionId) filters.questionId = where.questionId;
        if (where.storyId) filters.storyId = where.storyId;
      }
      
      return recordingService.getAllRecordings(filters);
    }
  },

  Mutation: {
    createStory: async (_: any, { input }: { input: any }) => {
      return storyService.createStory(input);
    },
    createRecording: async (_: any, { input }: { input: any }, context: any) => {
      return recordingService.createRecording(input, context.transcriptionContext);
    },
    deleteRecording: async (_: any, { id }: { id: string }) => {
      return recordingService.deleteRecording(id);
    },
    createCustomQuestion: async (_: any, { input }: { input: any }) => {
      const { text, categoryIds, traitIds, difficulty, reasoning } = input;
      // Validation
      if (text.trim().length < 20) {
        throw new GraphQLError('Question must be at least 20 characters long', {
          extensions: { code: 'VALIDATION_ERROR' }
        });
      }
      
      if ((!categoryIds || categoryIds.length === 0) && (!traitIds || traitIds.length === 0)) {
        throw new GraphQLError('At least one category or trait must be selected', {
          extensions: { code: 'VALIDATION_ERROR' }
        });
      }
      
      const validDifficulties = ['easy', 'medium', 'hard'];
      if (!validDifficulties.includes(difficulty)) {
        throw new GraphQLError('Invalid difficulty level', {
          extensions: { code: 'VALIDATION_ERROR' }
        });
      }
      
      // Check for duplicates
      const existingQuestion = await questionService.findByText(text.trim());
      if (existingQuestion) {
        throw new GraphQLError('This question already exists', {
          extensions: { code: 'DUPLICATE_ERROR' }
        });
      }
      
      // Create the question
      return questionService.createQuestion({
        text: text.trim(),
        categoryIds: categoryIds || [],
        traitIds: traitIds || [],
        difficulty,
        reasoning,
        commonality: 5, // Default commonality for custom questions
        source: 'custom' // Track that this was user-created
      });
    },
    updateQuestion: async (_: any, { id, text }: { id: string; text: string }) => {
      if (!text || text.trim().length < 20) {
        throw new GraphQLError('Question must be at least 20 characters long', {
          extensions: { code: 'VALIDATION_ERROR' }
        });
      }
      
      return questionService.updateQuestion(id, text.trim());
    },
    
    deleteQuestions: async (_: any, { ids }: { ids: string[] }) => {
      if (!ids || ids.length === 0) {
        throw new GraphQLError('No question IDs provided', {
          extensions: { code: 'VALIDATION_ERROR' }
        });
      }
      
      return questionService.deleteQuestions(ids);
    },

    updateQuestionFull: async (_: any, { id, input }: { id: string; input: any }) => {
      const { text, difficulty, categoryIds, traitIds } = input;
      // Validation
      if (!text || text.trim().length < 20) {
        throw new GraphQLError('Question must be at least 20 characters long', {
          extensions: { code: 'VALIDATION_ERROR' }
        });
      }
      
      if ((!categoryIds || categoryIds.length === 0) && (!traitIds || traitIds.length === 0)) {
        throw new GraphQLError('At least one category or trait must be selected', {
          extensions: { code: 'VALIDATION_ERROR' }
        });
      }
      
      const validDifficulties = ['easy', 'medium', 'hard'];
      if (!validDifficulties.includes(difficulty)) {
        throw new GraphQLError('Invalid difficulty level', {
          extensions: { code: 'VALIDATION_ERROR' }
        });
      }
      
      return questionService.updateQuestionFull(id, {
        text: text.trim(),
        difficulty,
        categoryIds,
        traitIds
      });
    },

    retryTranscription: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.transcriptionContext) {
        throw new GraphQLError('Transcription not configured', {
          extensions: { code: 'TRANSCRIPTION_NOT_CONFIGURED' }
        });
      }
      
      return recordingService.retryTranscription(id, context.transcriptionContext);
    }
  },

  Story: {
    categories: async (parent: { id: string }) => {
      return storyService.getStoryCategories(parent.id);
    },
    traits: async (parent: { id: string }) => {
      return storyService.getStoryTraits(parent.id);
    },
    recordings: async (parent: { id: string }) => {
      return storyService.getStoryRecordings(parent.id);
    },
    questions: async (parent: { id: string }) => {
      return storyService.getStoryQuestions(parent.id);
    }
  },

  Category: {
    stories: async (parent: { id: string }) => {
      return categoryService.getCategoryStories(parent.id);
    },
    questions: async (parent: { id: string }) => {
      return categoryService.getCategoryQuestions(parent.id);
    }
  },

  Trait: {
    stories: async (parent: { id: string }) => {
      return traitService.getTraitStories(parent.id);
    },
    questions: async (parent: { id: string }) => {
      return traitService.getTraitQuestions(parent.id);
    }
  },
  
  Job: {
    questions: async (parent: { id: string }) => {
      return jobService.getJobQuestions(parent.id);
    }
  },

  Question: {
    categories: async (parent: { id: string }) => {
      return questionService.getQuestionCategories(parent.id);
    },
    traits: async (parent: { id: string }) => {
      return questionService.getQuestionTraits(parent.id);
    },
    recordings: async (parent: { id: string }) => {
      return questionService.getQuestionRecordings(parent.id);
    },
    matchingStories: async (parent: { id: string }, { limit }: { limit?: number }) => {
      const intLimit = limit ? Math.floor(Number(limit)) : 3;
      return storyService.findMatchingStories(parent.id, intLimit);
    },
    job: async (parent: { id: string }) => {
      return questionService.getQuestionJob(parent.id);
    }
  },

  Recording: {
    story: async (parent: { id: string }) => {
      return recordingService.getRecordingStory(parent.id);
    },
    question: async (parent: { id: string }) => {
      return recordingService.getRecordingQuestion(parent.id);
    }
  }
};