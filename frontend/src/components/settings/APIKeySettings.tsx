import { useState, useEffect } from 'react';
import { Eye, EyeOff, Save, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAPIKeys } from '../../hooks/useAPIKeys';
import { APIKeys } from '../../types/apiKeys';

export const APIKeySettings = () => {
    const { apiKeys, saveAPIKeys, clearAPIKeys, getAPIKeyStatus } = useAPIKeys();
    const [formData, setFormData] = useState<APIKeys>({});
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    useEffect(() => {
        if (apiKeys) {
            setFormData(apiKeys);
        }
    }, [apiKeys]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => {
          const keys = { ...prev };
          
          if (field.includes('.')) {
            const [parent, child] = field.split('.');
            if (parent === 'ollama') {
              keys.ollama = { ...keys.ollama, [child]: value };
            } else if (parent === 'transcription') {
              keys.transcription = { 
                ...keys.transcription, 
                [child]: child === 'enabled' ? value === 'true' : value 
              };
            } else if (parent === 'llm') {
              keys.llm = { 
                ...keys.llm, 
                [child]: child === 'enabled' ? value === 'true' : value 
              };
            }
          } else {
            keys[field as keyof APIKeys] = value as any;
          }
          
          return keys;
        });
        setSaveStatus('idle');
      };

    const handleSave = () => {
        setSaveStatus('saving');
        const result = saveAPIKeys(formData);

        if (result.success) {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    const handleClear = () => {
        clearAPIKeys();
        setFormData({});
        setShowClearConfirm(false);
        setSaveStatus('idle');
    };

    const toggleShowKey = (field: string) => {
        setShowKeys(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const status = getAPIKeyStatus();

    return (
        <div className="space-y-6">
            {/* Status Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Feature Status</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${status.llm.available && status.llm.selectedProvider ? 'bg-green-500' :
                            status.llm.available ? 'bg-yellow-500' : 'bg-gray-300'
                            }`} />
                        <div>
                            <p className="font-medium text-sm">Question Generation</p>
                            <p className="text-xs text-gray-500">
                                {status.llm.available && status.llm.selectedProvider
                                    ? `Active: ${status.llm.selectedProvider}`
                                    : status.llm.available
                                        ? `${status.llm.providers.length} configured, none selected`
                                        : 'No LLM providers configured'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${status.transcription.available ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div>
                            <p className="font-medium text-sm">Transcription</p>
                            <p className="text-xs text-gray-500">
                                {status.transcription.available
                                    ? `${status.transcription.provider} configured`
                                    : 'Not configured'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* LLM Providers */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">AI Question Generation</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Generate behavioral interview questions using AI
                        </p>
                    </div>
                    <button
                        onClick={() => handleInputChange('llm.enabled', (!formData.llm?.enabled).toString())}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.llm?.enabled ? 'bg-primary-600' : 'bg-gray-200'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.llm?.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {formData.llm?.enabled && (
                    <div className="space-y-4 mt-6 pt-6 border-t border-gray-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Provider
                            </label>
                            <select
                                value={formData.llm?.provider || ''}
                                onChange={(e) => handleInputChange('llm.provider', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">Select a provider...</option>
                                <option value="openai">OpenAI (GPT-4)</option>
                                <option value="anthropic">Anthropic (Claude)</option>
                                <option value="gemini">Google Gemini</option>
                                <option value="ollama">Ollama (Local)</option>
                            </select>
                        </div>

                        {/* OpenAI */}
                        {formData.llm?.provider === 'openai' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    OpenAI API Key
                                </label>
                                <div className="flex">
                                    <input
                                        type={showKeys.openai ? 'text' : 'password'}
                                        value={formData.openai || ''}
                                        onChange={(e) => handleInputChange('openai', e.target.value)}
                                        placeholder="sk-..."
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    <button
                                        onClick={() => toggleShowKey('openai')}
                                        className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-50"
                                    >
                                        {showKeys.openai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">platform.openai.com</a>
                                </p>
                            </div>
                        )}

                        {/* Anthropic */}
                        {formData.llm?.provider === 'anthropic' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Anthropic API Key
                                </label>
                                <div className="flex">
                                    <input
                                        type={showKeys.anthropic ? 'text' : 'password'}
                                        value={formData.anthropic || ''}
                                        onChange={(e) => handleInputChange('anthropic', e.target.value)}
                                        placeholder="sk-ant-..."
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    <button
                                        onClick={() => toggleShowKey('anthropic')}
                                        className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-50"
                                    >
                                        {showKeys.anthropic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Get your key from <a href="https://console.anthropic.com/keys" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">console.anthropic.com</a>
                                </p>
                            </div>
                        )}

                        {/* Google Gemini */}
                        {formData.llm?.provider === 'gemini' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Google Gemini API Key
                                </label>
                                <div className="flex">
                                    <input
                                        type={showKeys.gemini ? 'text' : 'password'}
                                        value={formData.gemini || ''}
                                        onChange={(e) => handleInputChange('gemini', e.target.value)}
                                        placeholder="AIza..."
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    <button
                                        onClick={() => toggleShowKey('gemini')}
                                        className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-50"
                                    >
                                        {showKeys.gemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Get your key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Google AI Studio</a>
                                </p>
                            </div>
                        )}

                        {/* Ollama */}
                        {formData.llm?.provider === 'ollama' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ollama Base URL
                                </label>
                                <input
                                    type="text"
                                    value={formData.ollama?.baseUrl || ''}
                                    onChange={(e) => handleInputChange('ollama.baseUrl', e.target.value)}
                                    placeholder="http://localhost:11434"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    For local Ollama installation. No API key needed.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Transcription Providers */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Transcription</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Automatically convert your recordings to text
                        </p>
                    </div>
                    <button
                        onClick={() => handleInputChange('transcription.enabled', (!formData.transcription?.enabled).toString())}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.transcription?.enabled ? 'bg-primary-600' : 'bg-gray-200'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.transcription?.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {formData.transcription?.enabled && (
                    <div className="space-y-4 mt-6 pt-6 border-t border-gray-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Provider
                            </label>
                            <select
                                value={formData.transcription?.provider || ''}
                                onChange={(e) => handleInputChange('transcription.provider', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">Select a provider...</option>
                                <option value="openai">OpenAI Whisper</option>
                                <option value="google">Google Speech-to-Text</option>
                                <option value="aws">AWS Transcribe</option>
                                <option value="local">Local (Whisper)</option>
                            </select>
                        </div>

                        {formData.transcription?.provider && formData.transcription.provider !== 'local' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    API Key
                                </label>
                                <div className="flex">
                                    <input
                                        type={showKeys.transcription ? 'text' : 'password'}
                                        value={formData.transcription?.apiKey || ''}
                                        onChange={(e) => handleInputChange('transcription.apiKey', e.target.value)}
                                        placeholder={formData.transcription?.provider === 'openai' ? 'Use same as OpenAI above' : 'Enter API key'}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    <button
                                        onClick={() => toggleShowKey('transcription')}
                                        className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-50"
                                    >
                                        {showKeys.transcription ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>


            {/* Action Buttons */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setShowClearConfirm(true)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 transition-colors"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Keys
                </button>

                <button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
                >
                    {saveStatus === 'saving' ? (
                        <>
                            <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : saveStatus === 'saved' ? (
                        <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Keys
                        </>
                    )}
                </button>
            </div>

            {/* Save Status Messages */}
            {saveStatus === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center text-red-700">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm">Failed to save API keys. Please try again.</span>
                    </div>
                </div>
            )}

            {/* Clear Confirmation Dialog */}
            {showClearConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Clear All API Keys?</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            This will remove all stored API keys. You'll need to re-enter them to use AI features again.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClear}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                            >
                                Clear Keys
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};