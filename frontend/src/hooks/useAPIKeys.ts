import { useState, useEffect, useCallback } from 'react';
import { APIKeys, APIKeyStatus, LLMProvider } from '../types/apiKeys';
import { secureStorage } from '../utils/secureStorage';

export const useAPIKeys = () => {
  const [apiKeys, setApiKeys] = useState<APIKeys | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load keys on mount
  useEffect(() => {
    try {
      const savedKeys = secureStorage.load();
      if (savedKeys) {
        setApiKeys(savedKeys);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save keys
  const saveAPIKeys = useCallback((keys: APIKeys) => {
    try {
      secureStorage.save(keys);
      setApiKeys(keys);
      return { success: true };
    } catch (error) {
      console.error('Failed to save API keys:', error);
      return { success: false, error: 'Failed to save API keys' };
    }
  }, []);

  // Clear all keys
  const clearAPIKeys = useCallback(() => {
    secureStorage.clear();
    setApiKeys(null);
  }, []);

  const getAPIKeyStatus = useCallback((): APIKeyStatus => {
    if (!apiKeys) {
      return {
        llm: { available: false, providers: [] },
        transcription: { available: false }
      };
    }
  
    const availableLLMProviders: LLMProvider[] = [];
    
    // Check which providers have valid configuration
    if (apiKeys.openai) availableLLMProviders.push('openai');
    if (apiKeys.anthropic) availableLLMProviders.push('anthropic');
    if (apiKeys.gemini) availableLLMProviders.push('gemini');
    if (apiKeys.ollama?.baseUrl) availableLLMProviders.push('ollama');
  
    // Check if selected provider has valid configuration
    const selectedProvider = apiKeys.llm?.provider;
    let isLLMConfigured = false;
    
    if (selectedProvider) {
      switch (selectedProvider) {
        case 'openai':
          isLLMConfigured = !!apiKeys.openai;
          break;
        case 'anthropic':
          isLLMConfigured = !!apiKeys.anthropic;
          break;
        case 'gemini':
          isLLMConfigured = !!apiKeys.gemini;
          break;
        case 'ollama':
          isLLMConfigured = !!apiKeys.ollama?.baseUrl;
          break;
      }
    }
  
    // Check if LLM is enabled AND configured
    const isLLMAvailable = !!(apiKeys.llm?.enabled && isLLMConfigured);
  
    // Check if transcription is enabled AND configured
    const isTranscriptionAvailable = !!(
    apiKeys.transcription?.enabled && 
    apiKeys.transcription?.provider && 
    (apiKeys.transcription?.apiKey || apiKeys.transcription?.provider === 'local')
    );

  
    return {
      llm: {
        available: isLLMAvailable,
        providers: availableLLMProviders,
        selectedProvider: isLLMAvailable ? selectedProvider : undefined
      },
      transcription: {
        available: isTranscriptionAvailable,
        provider: isTranscriptionAvailable ? apiKeys.transcription?.provider : undefined
      }
    };
  }, [apiKeys]);

  // Convenience methods
  const hasLLMEnabled = apiKeys?.llm?.enabled || false;
  const hasTranscriptionEnabled = apiKeys?.transcription?.enabled || false;

  return {
    apiKeys,
    isLoading,
    saveAPIKeys,
    clearAPIKeys,
    getAPIKeyStatus,
    hasLLMEnabled,
    hasTranscriptionEnabled
  };
};