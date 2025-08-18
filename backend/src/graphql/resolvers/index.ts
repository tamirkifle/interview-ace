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
import { GraphQLError } from 'graphql';
import { neo4jConnection } from '../../db/neo4j';
import { Question } from '../../services/storyService';
import { Record } from 'neo4j-driver';
import { processRecordProperties } from '../../utils/dateTime';

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
    questionsForStories: async (_: any, { storyIds }: { storyIds: string[] }) => {
      if (!storyIds || storyIds.length === 0) {
        return [];
      }
      
      const session = await neo4jConnection.getSession();
      try {
        const result = await session.run(`
          MATCH (s:Story)-[:ANSWERS]->(q:Question)
          WHERE s.id IN $storyIds
          RETURN DISTINCT q
          ORDER BY q.text
        `, { storyIds });
        
        return result.records.map((record: Record) => 
          processRecordProperties(record.get('q').properties)
        );
      } finally {
        await session.close();
      }
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
    
    // Question Generation - NO AUTO-SAVE
    generateQuestions: async (_: any, { input }: { input: any }, context: any) => {
      try {
        if (!context.llmContext) {
          throw new GraphQLError('LLM context not provided', {
            extensions: { code: 'LLM_NOT_CONFIGURED' }
          });
        }
        
        const result = await llmService.generateQuestions(input, context.llmContext);
        return result;
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
    createJob: async (_: any, { input }: { input: any }) => {
      const { company, title, description } = input;
      
      if (!company?.trim() || !title?.trim() || !description?.trim()) {
        throw new GraphQLError('Company, title, and description are required', {
          extensions: { code: 'VALIDATION_ERROR' }
        });
      }
      
      return jobService.createOrFindJob({
        company: company.trim(),
        title: title.trim(),
        description: description.trim()
      });
    },
    createCustomQuestion: async (_: any, { input }: { input: any }) => {
      const { text, categoryIds, traitIds, difficulty, reasoning, source, entityType, entityId, jobId } = input;
      
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
      const question = await questionService.createQuestion({
        text: text.trim(),
        categoryIds: categoryIds || [],
        traitIds: traitIds || [],
        difficulty,
        reasoning,
        commonality: 5,
        source: source || 'custom'
      });

      // Create additional relationships based on source
      const session = await neo4jConnection.getSession();
      try {
        if (entityType && entityId) {
          console.log('Creating entity relationship:', { entityType, entityId, questionId: question.id });
          const nodeType = entityType === 'experience' ? 'Experience' : 'Project';
          await session.run(`
            MATCH (q:Question {id: $questionId})
            MATCH (e:${nodeType} {id: $entityId})
            MERGE (q)-[:TESTS_FOR]->(e)
          `, { questionId: question.id, entityId });
        }

        if (jobId) {
          console.log('Creating job relationship:', { jobId, questionId: question.id });
          
          // First check if the job exists
          const jobCheck = await session.run(`
            MATCH (j:Job {id: $jobId})
            RETURN j.company, j.title
          `, { jobId });
          
          console.log('Job exists check:', jobCheck.records.length > 0, jobCheck.records[0]?.get('j.company'));
          
          if (jobCheck.records.length === 0) {
            console.error('Job not found with ID:', jobId);
          } else {
            const result = await session.run(`
              MATCH (q:Question {id: $questionId})
              MATCH (j:Job {id: $jobId})
              MERGE (q)-[:TESTS_FOR]->(j)
              RETURN j
            `, { questionId: question.id, jobId });
            console.log('Job relationship created, result:', result.records.length);
          }
        }
      } finally {
        await session.close();
      }

      return question;
    },

    createQuestionsBulk: async (_: any, { questions }: { questions: any[] }) => {
      // Validation for bulk operation
      if (!questions || questions.length === 0) {
        throw new GraphQLError('No questions provided', {
          extensions: { code: 'VALIDATION_ERROR' }
        });
      }

      if (questions.length > 20) {
        throw new GraphQLError('Maximum 20 questions allowed per bulk operation', {
          extensions: { code: 'VALIDATION_ERROR' }
        });
      }

      // Validate each question
      for (const question of questions) {
        if (!question.text || question.text.trim().length < 20) {
          throw new GraphQLError('All questions must be at least 20 characters long', {
            extensions: { code: 'VALIDATION_ERROR' }
          });
        }
        
        if ((!question.categoryIds || question.categoryIds.length === 0) && 
            (!question.traitIds || question.traitIds.length === 0)) {
          throw new GraphQLError('All questions must have at least one category or trait', {
            extensions: { code: 'VALIDATION_ERROR' }
          });
        }
        
        const validDifficulties = ['easy', 'medium', 'hard'];
        if (!validDifficulties.includes(question.difficulty)) {
          throw new GraphQLError('Invalid difficulty level in bulk questions', {
            extensions: { code: 'VALIDATION_ERROR' }
          });
        }
      }

      // Check for duplicates in the batch and against existing questions
      const questionTexts = questions.map(q => q.text.trim().toLowerCase());
      const uniqueTexts = new Set(questionTexts);
      if (uniqueTexts.size !== questionTexts.length) {
        throw new GraphQLError('Duplicate questions found in batch', {
          extensions: { code: 'DUPLICATE_ERROR' }
        });
      }

      // Check against existing questions
      for (const question of questions) {
        const existing = await questionService.findByText(question.text.trim());
        if (existing) {
          throw new GraphQLError(`Question already exists: "${question.text.trim()}"`, {
            extensions: { code: 'DUPLICATE_ERROR' }
          });
        }
      }

      // Create all questions in a single transaction
      const session = await neo4jConnection.getSession();
      try {
        const createdQuestions: Question[] = [];
        
        await session.executeWrite(async (tx) => {
          for (const questionInput of questions) {
            const question = await questionService.createQuestion({
              text: questionInput.text.trim(),
              categoryIds: questionInput.categoryIds || [],
              traitIds: questionInput.traitIds || [],
              difficulty: questionInput.difficulty,
              reasoning: questionInput.reasoning,
              commonality: 5,
              source: questionInput.source || 'bulk'
            });

            // Create additional relationships based on source
            if (questionInput.entityType && questionInput.entityId) {
              const nodeType = questionInput.entityType === 'experience' ? 'Experience' : 'Project';
              await session.run(`
                MATCH (q:Question {id: $questionId})
                MATCH (e:${nodeType} {id: $entityId})
                MERGE (q)-[:TESTS_FOR]->(e)
              `, { questionId: question.id, entityId: questionInput.entityId });
            }

            if (questionInput.jobId) {
              await session.run(`
                MATCH (q:Question {id: $questionId})
                MATCH (j:Job {id: $jobId})
                MERGE (q)-[:TESTS_FOR]->(j)
              `, { questionId: question.id, jobId: questionInput.jobId });
            }

            createdQuestions.push(question);
          }
        });

        return createdQuestions;
      } finally {
        await session.close();
      }
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
        const analysis = await llmService.processResume(input.resumeText, context.llmContext);
        
        const processedExperiences = [];
        const processedProjects = [];
        
        // Process experiences
        for (const exp of analysis.experiences || []) {
          const consolidationFn = async (oldDesc: string, newDesc: string) => {
            const provider = llmService.getProvider(context.llmContext);
            return await llmService.consolidateDescription(oldDesc, newDesc, provider);
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
            const provider = llmService.getProvider(context.llmContext);
            return await llmService.consolidateDescription(oldDesc, newDesc, provider);
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
        const { entityType, entityId, count = 5 } = input;
        
        console.log('generateResumeQuestions input:', { entityType, entityId, count });
        
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
        
        const result = await llmService.generateResumeQuestions(
          entityType,
          entityId,
          entity.description,
          count,
          context.llmContext
        );
        
        console.log('generateResumeQuestions result:', result);
        
        return result;
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
        console.log('sourceInfo called for question:', { id: parent.id, source: parent.source });
        
        // Check for job relationship
        const jobResult = await session.run(`
          MATCH (q:Question {id: $id})-[:TESTS_FOR]->(j:Job)
          RETURN j.company + ' - ' + j.title as displayName, j.company + ' - ' + j.title as name, 'job' as type
        `, { id: parent.id });
        
        console.log('jobResult:', jobResult.records.length);
        if (jobResult.records.length > 0) {
          const result = {
            type: 'job',
            name: jobResult.records[0].get('name'),
            displayName: jobResult.records[0].get('displayName')
          };
          console.log('returning job result:', result);
          return result;
        }

        // Check for experience relationship
        const expResult = await session.run(`
          MATCH (q:Question {id: $id})-[:TESTS_FOR]->(e:Experience)
          RETURN e.id as name, e.id as rawName, 'experience' as type
        `, { id: parent.id });
        
        console.log('expResult:', expResult.records.length);
        if (expResult.records.length > 0) {
          const rawName = expResult.records[0].get('rawName');
          const displayName = rawName.replace(/_/g, ' ');
          const result = {
            type: 'experience',
            name: rawName,
            displayName: displayName
          };
          console.log('returning experience result:', result);
          return result;
        }

        // Check for project relationship
        const projResult = await session.run(`
          MATCH (q:Question {id: $id})-[:TESTS_FOR]->(p:Project)
          RETURN p.id as name, p.id as rawName, 'project' as type
        `, { id: parent.id });
        
        console.log('projResult:', projResult.records.length);
        if (projResult.records.length > 0) {
          const rawName = projResult.records[0].get('rawName');
          const displayName = rawName.replace(/_/g, ' ');
          const result = {
            type: 'project',
            name: rawName,
            displayName: displayName
          };
          console.log('returning project result:', result);
          return result;
        }

        // Fallback to source field - check if it matches our expected types
        const source = parent.source || 'generated';
        console.log('falling back to source field:', source);
        
        let displayName = source;
        let type = source;
        
        // Handle specific source types that don't have relationships yet
        if (source === 'experience' || source === 'project') {
          // If source indicates experience/project but no relationship exists,
          // this might be a newly generated question not yet saved
          displayName = source.charAt(0).toUpperCase() + source.slice(1);
          type = source;
        } else if (source === 'job') {
          displayName = 'Job Description';
          type = 'job';
        } else if (source === 'custom') {
          displayName = 'Custom';
          type = 'custom';
        } else {
          displayName = 'Generated';
          type = 'generated';
        }
        
        const result = {
          type,
          name: source,
          displayName
        };
        console.log('returning fallback result:', result);
        return result;
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