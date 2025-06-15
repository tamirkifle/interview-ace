import { useState } from 'react';
import { Settings as SettingsIcon, Key, Shield } from 'lucide-react';
import { APIKeySettings } from '../components/settings/APIKeySettings';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState<'api-keys' | 'preferences'>('api-keys');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <SettingsIcon className="w-8 h-8 mr-3" />
          Settings
        </h1>
        <p className="text-gray-600">
          Configure your API keys and preferences
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'api-keys'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Key className="w-4 h-4 inline mr-2" />
            API Keys
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'preferences'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Preferences
          </button>
        </nav>
      </div>

      {/* Security Notice */}
      {activeTab === 'api-keys' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-blue-900 font-medium mb-1">Your API keys are encrypted</p>
              <p className="text-blue-700">
                API keys are encrypted and stored locally in your browser. They are never sent to our servers
                and remain under your control. Clear your browser data to remove all stored keys.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'api-keys' && <APIKeySettings />}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-500 text-center py-8">
            Preferences coming soon...
          </p>
        </div>
      )}
    </div>
  );
};