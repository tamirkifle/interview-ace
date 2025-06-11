import { StoryService } from '../../services/storyService';
import { CategoryService } from '../../services/categoryService';
import { TraitService } from '../../services/traitService';
import { QuestionService } from '../../services/questionService';
import { RecordingService } from '../../services/recordingService';
import { dateTimeScalar } from '../schema/scalars';

const storyService = new StoryService();
const categoryService = new CategoryService();
const traitService = new TraitService();
const questionService = new QuestionService();
const recordingService = new RecordingService();

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
    }
  },

  Mutation: {
    createStory: async (_: any, { input }: { input: any }) => {
      return storyService.createStory(input);
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
      return storyService.findMatchingStories(parent.id, limit);
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