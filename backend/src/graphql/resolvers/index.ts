import { StoryService } from '../../services/storyService';
import { CategoryService } from '../../services/categoryService';
import { TraitService } from '../../services/traitService';
import { QuestionService } from '../../services/questionService';
import { RecordingService } from '../../services/recordingService';
import { ExperienceService } from '../../services/experienceService';
import { ProjectService } from '../../services/projectService';
import { dateTimeScalar } from '../schema/scalars';
import { llmService, LLMError } from '../../services/llm';
import { JobService } from '../../services/jobService';
import { ResumeProcessorPrompts } from '../../services/llm/prompts/resumeProcessor';
import { GraphQLError } from 'graphql';
import { Category, Trait } from '../../services/storyService';
import { GeneratedQuestion, ResolvedGeneratedQuestion } from '../../services/llm/types';
import { neo4jConnection } from '../../db/neo4j';

const storyService = new StoryService();
const categoryService = new CategoryService();
const traitService = new TraitService();
const questionService = new QuestionService();
const recordingService = new RecordingService();
const experienceService = new ExperienceService();
const projectService = new ProjectService();
const jobService = new JobService();

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
    questions: async (_: any, { 
      limit = 25, 
      offset = 0, 
      filters, 
      sort 
    }: { 
      limit?: number; 
      offset?: number; 
      filters?: any; 
      sort?: any; 
    }) => {
      // Ensure integers for Neo4j
      const intLimit = Math.floor(Number(limit));
      const intOffset = Math.floor(Number(offset));
      
      return questionService.getQuestionsPaginated({
        limit: intLimit,
        offset: intOffset,
        filters,
        sort
      });
    },

    allQuestions: async () => {
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
    experiences: async () => {
      return experienceService.getAllExperiences();
    },
    experience: async (_: any, { id }: { id: string }) => {
      return experienceService.getExperienceById(id);
    },
    projects: async () => {
      return projectService.getAllProjects();
    },
    project: async (_: any, { id }: { id: string }) => {
      return projectService.getProjectById(id);
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
    },

    processResume: async (_: any, { input }: { input: { resumeText: string } }, context: any) => {
      if (!context.llmContext?.provider || !context.llmContext?.apiKey) {
        throw new GraphQLError('LLM not configured', {
          extensions: { code: 'LLM_NOT_CONFIGURED' }
        });
      }

      try {
        const prompt = ResumeProcessorPrompts.buildResumeAnalysisPrompt(input.resumeText);
        const provider = llmService.getProvider(context.llmContext);
        
        // Get AI analysis
        const rawCompletion = await provider.generateCompletion(prompt);
        
        // Clean response to remove markdown formatting
        const cleanedResponse = rawCompletion.replace(/```json\n|```/g, '').trim();
        const analysis = JSON.parse(cleanedResponse);
        
        const processedExperiences = [];
        const processedProjects = [];
        
        // Process experiences
        for (const exp of analysis.experiences || []) {
          const consolidationFn = async (oldDesc: string, newDesc: string) => {
            const consolidationPrompt = ResumeProcessorPrompts.buildConsolidationPrompt(oldDesc, newDesc);
            const rawConsolidation = await provider.generateCompletion(consolidationPrompt);
            return rawConsolidation.replace(/```json\n|```/g, '').trim();
          };
          
          const experience = await experienceService.createOrUpdateExperience(
            exp.id, 
            exp.description,
            consolidationFn
          );
          processedExperiences.push(experience);
        }
        
        // Process projects  
        for (const proj of analysis.projects || []) {
          const consolidationFn = async (oldDesc: string, newDesc: string) => {
            const consolidationPrompt = ResumeProcessorPrompts.buildConsolidationPrompt(oldDesc, newDesc);
            const rawConsolidation = await provider.generateCompletion(consolidationPrompt);
            return rawConsolidation.replace(/```json\n|```/g, '').trim();
          };
          
          const project = await projectService.createOrUpdateProject(
            proj.id,
            proj.description, 
            consolidationFn
          );
          processedProjects.push(project);
        }
        
        return {
          experiencesProcessed: processedExperiences.length,
          projectsProcessed: processedProjects.length,
          experiences: processedExperiences,
          projects: processedProjects
        };
      } catch (error: any) {
        console.error('Resume processing error:', error);
        throw new GraphQLError('Failed to process resume', {
          extensions: { 
            code: 'PROCESSING_ERROR', 
            message: error instanceof Error ? error.message : String(error)
          }
        });
      }
    },

    generateResumeQuestions: async (_: any, { input }: { input: any }, context: any) => {
      if (!context.llmContext?.provider || !context.llmContext?.apiKey) {
        throw new GraphQLError('LLM not configured', {
          extensions: { code: 'LLM_NOT_CONFIGURED' }
        });
      }

      try {
        const { entityType, entityId, count = 5, difficulty } = input;
        
        // Get entity description
        let entity;
        if (entityType === 'experience') {
          entity = await experienceService.getExperienceById(entityId);
        } else {
          entity = await projectService.getProjectById(entityId);
        }
        
        if (!entity) {
          throw new GraphQLError(`${entityType} not found`, {
            extensions: { code: 'NOT_FOUND' }
          });
        }
        
        const prompt = ResumeProcessorPrompts.buildQuestionGenerationPrompt(
          entityType,
          entityId,
          entity.description,
          count
        );
        
        const provider = llmService.getProvider(context.llmContext);
        const rawCompletion = await provider.generateCompletion(prompt);
        
        // Clean response to remove markdown formatting
        const cleanedResponse = rawCompletion.replace(/```json\n|```/g, '').trim();
        const questions = JSON.parse(cleanedResponse);
        
        // Resolve category and trait names to objects
        const resolvedQuestions = await Promise.all(
          questions.map(async (q: any) => {
            console.log('Raw question from LLM:', q);
            console.log('suggestedCategories:', q.suggestedCategories);
            console.log('suggestedTraits:', q.suggestedTraits);
            
            const resolvedCategories = await llmService.resolveCategoryNamesToObjects(q.suggestedCategories || []);
            const resolvedTraits = await llmService.resolveTraitNamesToObjects(q.suggestedTraits || []);
            
            console.log('resolvedCategories:', resolvedCategories);
            console.log('resolvedTraits:', resolvedTraits);
            
            const question = await questionService.createQuestion({
              text: q.text,
              difficulty: difficulty || q.difficulty,
              commonality: 5,
              source: 'resume',
              reasoning: q.reasoning,
              categoryIds: resolvedCategories.map(c => c.id),
              traitIds: resolvedTraits.map(t => t.id)
            });
            
            // Link to entity using TESTS_FOR relationship
            const session = await neo4jConnection.getSession();
            try {
              await session.run(`
                MATCH (q:Question {id: $questionId})
                MATCH (e:${entityType === 'experience' ? 'Experience' : 'Project'} {id: $entityId})
                MERGE (q)-[:TESTS_FOR]->(e)
              `, { questionId: question.id, entityId });
            } finally {
              await session.close();
            }
            
            // Return the structure that matches GraphQL schema (with resolved objects)
            return {
              id: question.id,
              text: question.text,
              difficulty: question.difficulty,
              reasoning: q.reasoning,
              suggestedCategories: resolvedCategories, // Category objects
              suggestedTraits: resolvedTraits // Trait objects
            };
          })
        );
        
        return {
          questions: resolvedQuestions,
          generationId: `resume-${Date.now()}`,
          sourceType: 'resume',
          provider: context.llmContext.provider
        };
      } catch (error: any) {
        console.error('Resume question generation error:', error);
        throw new GraphQLError('Failed to generate questions', {
          extensions: { 
            code: 'GENERATION_ERROR', 
            message: error instanceof Error ? error.message : String(error)
          }
        });
      }
    },
    updateStory: async (_: any, { id, input }: { id: string; input: any }) => {
      const { title, situation, task, action, result, categoryIds, traitIds } = input;
      
      // Validation
      if (!title?.trim() || !situation?.trim() || !task?.trim() || !action?.trim() || !result?.trim()) {
        throw new GraphQLError('All STAR fields and title are required', {
          extensions: { code: 'VALIDATION_ERROR' }
        });
      }
      
      return storyService.updateStory(id, {
        title: title.trim(),
        situation: situation.trim(),
        task: task.trim(),
        action: action.trim(),
        result: result.trim(),
        categoryIds: categoryIds || [],
        traitIds: traitIds || []
      });
    },
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

  Experience: {
    questions: async (parent: { id: string }) => {
      return experienceService.getExperienceQuestions(parent.id);
    }
  },

  Project: {
    questions: async (parent: { id: string }) => {
      return projectService.getProjectQuestions(parent.id);
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
      const session = await neo4jConnection.getSession();
      try {
        const result = await session.run(`
          MATCH (q:Question {id: $id})-[:TESTS_FOR]->(j:Job)
          RETURN j
        `, { id: parent.id });
        return result.records[0]?.get('j').properties || null;
      } finally {
        await session.close();
      }
    },
    experience: async (parent: { id: string }) => {
      const session = await neo4jConnection.getSession();
      try {
        const result = await session.run(`
          MATCH (q:Question {id: $id})-[:TESTS_FOR]->(e:Experience)
          RETURN e
        `, { id: parent.id });
        return result.records[0]?.get('e').properties || null;
      } finally {
        await session.close();
      }
    },
    project: async (parent: { id: string }) => {
      const session = await neo4jConnection.getSession();
      try {
        const result = await session.run(`
          MATCH (q:Question {id: $id})-[:TESTS_FOR]->(p:Project)
          RETURN p
        `, { id: parent.id });
        return result.records[0]?.get('p').properties || null;
      } finally {
        await session.close();
      }
    },
    // Add dynamic source info
    sourceInfo: async (parent: { id: string, source?: string }) => {
      const session = await neo4jConnection.getSession();
      try {
        // Check for job relationship
        const jobResult = await session.run(`
          MATCH (q:Question {id: $id})-[:TESTS_FOR]->(j:Job)
          RETURN j.company + ' - ' + j.title as name, 'job' as type
        `, { id: parent.id });
        
        if (jobResult.records.length > 0) {
          return {
            type: 'job',
            name: jobResult.records[0].get('name'),
            displayName: jobResult.records[0].get('name')
          };
        }

        // Check for experience relationship
        const expResult = await session.run(`
          MATCH (q:Question {id: $id})-[:TESTS_FOR]->(e:Experience)
          RETURN e.id as name, 'experience' as type
        `, { id: parent.id });
        
        if (expResult.records.length > 0) {
          const experienceName = expResult.records[0].get('name').replace(/_/g, ' ');
          return {
            type: 'experience',
            name: expResult.records[0].get('name'),
            displayName: experienceName
          };
        }

        // Check for project relationship
        const projResult = await session.run(`
          MATCH (q:Question {id: $id})-[:TESTS_FOR]->(p:Project)
          RETURN p.id as name, 'project' as type
        `, { id: parent.id });
        
        if (projResult.records.length > 0) {
          const projectName = projResult.records[0].get('name').replace(/_/g, ' ');
          return {
            type: 'project',
            name: projResult.records[0].get('name'),
            displayName: projectName
          };
        }

        // Fallback to source field
        const source = parent.source || 'generated';
        return {
          type: source,
          name: source,
          displayName: source === 'seeded' ? 'Generated' : source.charAt(0).toUpperCase() + source.slice(1)
        };
      } finally {
        await session.close();
      }
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