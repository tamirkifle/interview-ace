import { StoryService } from '../../services/storyService';
import { dateTimeScalar } from '../schema/scalars';

const storyService = new StoryService();

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
      // TODO: Implement category service
      return [];
    },
    traits: async () => {
      // TODO: Implement trait service
      return [];
    },
    questions: async () => {
      // TODO: Implement question service
      return [];
    }
  },
  Story: {
    categories: async (parent: { id: string }) => {
      return storyService.getStoryCategories(parent.id);
    },
    traits: async (parent: { id: string }) => {
      return storyService.getStoryTraits(parent.id);
    }
  },
  Question: {
    categories: async (parent: { id: string }) => {
      // TODO: Implement question categories
      return [];
    },
    traits: async (parent: { id: string }) => {
      // TODO: Implement question traits
      return [];
    }
  }
}; 