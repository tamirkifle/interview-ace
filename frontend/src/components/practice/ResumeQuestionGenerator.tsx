import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Upload, FileText, Briefcase, Code, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { gql } from '@apollo/client';

const PROCESS_RESUME = gql`
  mutation ProcessResume($input: ProcessResumeInput!) {
    processResume(input: $input) {
      experiencesProcessed
      projectsProcessed
      experiences {
        id
        description
      }
      projects {
        id
        description
      }
    }
  }
`;

const GENERATE_RESUME_QUESTIONS = gql`
  mutation GenerateResumeQuestions($input: GenerateResumeQuestionsInput!) {
    generateResumeQuestions(input: $input) {
      questions {
        text
        difficulty
        reasoning
      }
      generationId
      sourceType
      provider
    }
  }
`;

const GET_EXPERIENCES_AND_PROJECTS = gql`
  query GetExperiencesAndProjects {
    experiences {
      id
      description
      updatedAt
    }
    projects {
      id
      description
      updatedAt
    }
  }
`;

interface ResumeQuestionGeneratorProps {
  onQuestionsGenerated: (result: any) => void;
  isConfigured: boolean;
}

export const ResumeQuestionGenerator = ({ 
  onQuestionsGenerated, 
  isConfigured 
}: ResumeQuestionGeneratorProps) => {
  const [resumeText, setResumeText] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<{type: 'experience' | 'project', id: string} | null>(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [activeTab, setActiveTab] = useState<'upload' | 'existing'>('upload');

  const { data: entitiesData, refetch: refetchEntities } = useQuery(GET_EXPERIENCES_AND_PROJECTS);
  
  const [processResume, { loading: processing, error: processError }] = useMutation(PROCESS_RESUME, {
    onCompleted: (data) => {
      refetchEntities();
      setActiveTab('existing');
    }
  });

  const [generateQuestions, { loading: generating }] = useMutation(GENERATE_RESUME_QUESTIONS, {
    onCompleted: (data) => {
      onQuestionsGenerated(data.generateResumeQuestions);
    }
  });

  const handleProcessResume = async () => {
    if (!resumeText.trim()) return;
    
    await processResume({
      variables: { input: { resumeText: resumeText.trim() } }
    });
  };

  const handleGenerateQuestions = async () => {
    if (!selectedEntity) return;
    
    await generateQuestions({
      variables: {
        input: {
          entityType: selectedEntity.type,
          entityId: selectedEntity.id,
          count: questionCount
        }
      }
    });
  };

  if (!isConfigured) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <AlertCircle className="w-5 h-5 text-amber-600 mb-2" />
        <p className="text-sm text-amber-700">
          Configure an LLM provider in settings to use resume-based question generation.
        </p>
      </div>
    );
  }

  const experiences = entitiesData?.experiences || [];
  const projects = entitiesData?.projects || [];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upload'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Process Resume
          </button>
          <button
            onClick={() => setActiveTab('existing')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'existing'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Briefcase className="w-4 h-4 inline mr-2" />
            Generate from Existing ({experiences.length + projects.length})
          </button>
        </nav>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Process Your Resume
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Paste your resume content below. AI will extract experiences and projects automatically.
          </p>
          
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume content here..."
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 resize-none"
          />
          
          {processError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 mr-2 inline" />
              <span className="text-sm text-red-700">{processError.message}</span>
            </div>
          )}
          
          <button
            onClick={handleProcessResume}
            disabled={!resumeText.trim() || processing}
            className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Process Resume
              </>
            )}
          </button>
        </div>
      )}

      {/* Existing Tab */}
      {activeTab === 'existing' && (
        <div className="space-y-6">
          {/* Entity Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Select Experience or Project
            </h3>
            
            <div className="space-y-4">
              {/* Experiences */}
              {experiences.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Experiences</h4>
                  <div className="grid gap-2">
                    {experiences.map((exp: any) => (
                      <label
                        key={exp.id}
                        className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedEntity?.type === 'experience' && selectedEntity?.id === exp.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="entity"
                          checked={selectedEntity?.type === 'experience' && selectedEntity?.id === exp.id}
                          onChange={() => setSelectedEntity({type: 'experience', id: exp.id})}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <Briefcase className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium text-sm">{exp.id.replace(/_/g, ' ')}</span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {exp.description.split('\n')[0].replace('• ', '')}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Projects</h4>
                  <div className="grid gap-2">
                    {projects.map((proj: any) => (
                      <label
                        key={proj.id}
                        className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedEntity?.type === 'project' && selectedEntity?.id === proj.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="entity"
                          checked={selectedEntity?.type === 'project' && selectedEntity?.id === proj.id}
                          onChange={() => setSelectedEntity({type: 'project', id: proj.id})}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <Code className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium text-sm">{proj.id.replace(/_/g, ' ')}</span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {proj.description.split('\n')[0].replace('• ', '')}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {(experiences.length === 0 && projects.length === 0) && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No experiences or projects found.</p>
                <p className="text-sm text-gray-400">Process your resume first to extract experiences and projects.</p>
              </div>
            )}
          </div>

          {/* Generation Options */}
          {selectedEntity && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Generation Options</h3>
              
              <div className="flex items-center space-x-4 mb-4">
                <label className="text-sm font-medium text-gray-700">Number of Questions:</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={3}>3 questions</option>
                  <option value={5}>5 questions</option>
                  <option value={7}>7 questions</option>
                  <option value={10}>10 questions</option>
                </select>
              </div>

              <button
                onClick={handleGenerateQuestions}
                disabled={generating}
                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Generate Questions
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};