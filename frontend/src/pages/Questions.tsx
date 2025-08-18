import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { MessageCircleQuestion, Sparkles, Plus, FileText } from 'lucide-react';
import { CREATE_CUSTOM_QUESTION, CREATE_QUESTIONS_BULK } from '../graphql/mutations';
import { LoadingSpinner } from '../components/ui';
import { QuestionsTable } from '../components/library/QuestionsTable';
import { QuestionGenerator } from '../components/practice/QuestionGenerator';
import { GeneratedQuestions } from '../components/practice/GeneratedQuestions';
import { ResumeQuestionGenerator } from '../components/practice/ResumeQuestionGenerator';
import { CustomQuestion } from '../components/practice/CustomQuestion';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { GraphQLErrorBoundary } from '../components/GraphQLErrorBoundary';
import { useQuestionsPaginated } from '../hooks/useQuestions';
import { ResolvedGeneratedQuestion, QuestionGenerationResult } from '../types';
import { useAPIKeys } from '../hooks/useAPIKeys';

export const Questions = () => {
  const questionsData = useQuestionsPaginated();
  const { totalCount, loading, error, refetch } = questionsData;
  const { getAPIKeyStatus } = useAPIKeys();
  const [activeTab, setActiveTab] = useState<'library' | 'generate' | 'custom' | 'resume'>('library');
  const [generationResult, setGenerationResult] = useState<QuestionGenerationResult & { 
    jobId?: string; 
    entityType?: string; 
    entityId?: string;
    company?: string;
    jobTitle?: string;
  } | null>(null);

  const apiKeyStatus = getAPIKeyStatus();
  const isLLMConfigured = apiKeyStatus.llm.available;

  const [createCustomQuestion] = useMutation(CREATE_CUSTOM_QUESTION, {
    onCompleted: () => {
      refetch();
    }
  });

  const [createQuestionsBulk] = useMutation(CREATE_QUESTIONS_BULK, {
    onCompleted: () => {
      refetch();
    }
  });

  const handleQuestionsGenerated = (result: QuestionGenerationResult & { 
    jobId?: string; 
    entityType?: string; 
    entityId?: string;
    company?: string;
    jobTitle?: string;
  }) => {
    setGenerationResult(result);
  };

  const handleSaveGeneratedQuestion = async (question: ResolvedGeneratedQuestion) => {
    try {
      const input: any = {
        text: question.text,
        categoryIds: question.suggestedCategories?.map(c => c.id) || [],
        traitIds: question.suggestedTraits?.map(t => t.id) || [],
        difficulty: question.difficulty,
        reasoning: question.reasoning,
      };

      // Add source and metadata based on generation type
      if (generationResult) {
        input.source = generationResult.sourceType;
        
        if (generationResult.jobId) {
          input.jobId = generationResult.jobId;
        }
        
        if (generationResult.entityType && generationResult.entityId) {
          input.entityType = generationResult.entityType;
          input.entityId = generationResult.entityId;
        }
      }

      await createCustomQuestion({ variables: { input } });
    } catch (err) {
      console.error('Failed to save generated question:', err);
    }
  };

  const handleSaveBulkQuestions = async (questions: ResolvedGeneratedQuestion[]) => {
    try {
      const questionsInput = questions.map(question => {
        const input: any = {
          text: question.text,
          categoryIds: question.suggestedCategories?.map(c => c.id) || [],
          traitIds: question.suggestedTraits?.map(t => t.id) || [],
          difficulty: question.difficulty,
          reasoning: question.reasoning,
        };

        // Add source and metadata based on generation type
        if (generationResult) {
          input.source = generationResult.sourceType;
          
          if (generationResult.jobId) {
            input.jobId = generationResult.jobId;
          }
          
          if (generationResult.entityType && generationResult.entityId) {
            input.entityType = generationResult.entityType;
            input.entityId = generationResult.entityId;
          }
        }

        return input;
      });

      await createQuestionsBulk({ variables: { questions: questionsInput } });
    } catch (err) {
      console.error('Failed to save bulk questions:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading questions..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <GraphQLErrorBoundary error={error} onRetry={refetch}>
        <div>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Interview Questions</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage your question library, generate new questions, or create custom ones for your interview preparation.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('library')}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'library'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <MessageCircleQuestion className="w-4 h-4 inline mr-2" />
                  Question Library ({totalCount})
                </button>
                <button
                  onClick={() => setActiveTab('generate')}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'generate'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Generate Questions
                  {!isLLMConfigured && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                      Setup Required
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('resume')}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'resume'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Resume Questions
                  {!isLLMConfigured && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                      Setup Required
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('custom')}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'custom'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Custom Question
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'library' && (
              <div>
                {totalCount === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <MessageCircleQuestion className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                    <p className="text-gray-600 mb-6">
                      Start by generating questions or creating custom ones.
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => setActiveTab('generate')}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Questions
                      </button>
                      <button
                        onClick={() => setActiveTab('custom')}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Custom
                      </button>
                    </div>
                  </div>
                ) : (
                  <QuestionsTable questionsData={questionsData} />
                )}
              </div>
            )}

            {activeTab === 'generate' && (
              <div className="max-w-4xl mx-auto">
                {generationResult ? (
                  <GeneratedQuestions
                    result={generationResult}
                    onClose={() => setGenerationResult(null)}
                    onSaveQuestion={handleSaveGeneratedQuestion}
                    onSaveBulkQuestions={handleSaveBulkQuestions}
                    onRecordAnswer={() => {}}
                  />
                ) : (
                  <QuestionGenerator
                    onQuestionsGenerated={handleQuestionsGenerated}
                    isConfigured={isLLMConfigured}
                  />
                )}
              </div>
            )}

            {activeTab === 'resume' && (
              <div className="max-w-4xl mx-auto">
                {generationResult ? (
                  <GeneratedQuestions
                    result={generationResult}
                    onClose={() => setGenerationResult(null)}
                    onSaveQuestion={handleSaveGeneratedQuestion}
                    onSaveBulkQuestions={handleSaveBulkQuestions}
                    onRecordAnswer={() => {}}
                  />
                ) : (
                  <ResumeQuestionGenerator
                    onQuestionsGenerated={handleQuestionsGenerated}
                    isConfigured={isLLMConfigured}
                  />
                )}
              </div>
            )}

            {activeTab === 'custom' && (
              <div className="max-w-3xl mx-auto">
                <CustomQuestion
                  onQuestionCreated={() => {
                    setActiveTab('library');
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </GraphQLErrorBoundary>
    </ErrorBoundary>
  );
};