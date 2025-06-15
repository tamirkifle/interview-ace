import { StoryService } from '../../services/storyService';
import { CategoryService } from '../../services/categoryService';
import { TraitService } from '../../services/traitService';
import { QuestionService } from '../../services/questionService';
import { RecordingService } from '../../services/recordingService';
import { dateTimeScalar } from '../schema/scalars';
import { llmService, LLMError } from '../../services/llm';
import { GraphQLError } from 'graphql';

const storyService = new StoryService();
const categoryService = new CategoryService();
const traitService = new TraitService();
const questionService = new QuestionService();
const recordingService = new RecordingService();

// Helper function to convert category names to Category objects
async function resolveSuggestedCategories(categoryNames: string[]): Promise<any[]> {
  const allCategories = await categoryService.getAllCategories();
  return categoryNames
    .map(name => allCategories.find(cat => 
      cat.name.toLowerCase() === name.toLowerCase()
    ))
    .filter(Boolean);
}

// Helper function to convert trait names to Trait objects
async function resolveSuggestedTraits(traitNames: string[]): Promise<any[]> {
  const allTraits = await traitService.getAllTraits();
  return traitNames
    .map(name => allTraits.find(trait => 
      trait.name.toLowerCase() === name.toLowerCase()
    ))
    .filter(Boolean);
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
    
    // Question Generation
    generateQuestions: async (_: any, { input }: { input: any }, context: any) => {
      try {
        if (!context.llmContext) {
          throw new GraphQLError('LLM context not provided', {
            extensions: { code: 'LLM_NOT_CONFIGURED' }
          });
        }

        const result = await llmService.generateQuestions(input, context.llmContext);
        
        // Resolve category and trait names to actual objects
        const questionsWithResolvedRefs = await Promise.all(
          result.questions.map(async (q) => ({
            ...q,
            suggestedCategories: await resolveSuggestedCategories(q.suggestedCategories),
            suggestedTraits: await resolveSuggestedTraits(q.suggestedTraits)
          }))
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
      const { text, categoryIds, traitIds, difficulty } = input;
      
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
        commonality: 5, // Default commonality for custom questions
        source: 'custom' // Track that this was user-created
      });
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