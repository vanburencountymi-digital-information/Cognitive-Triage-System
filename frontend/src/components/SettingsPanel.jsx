import React, { useState, useEffect } from 'react';
import './SettingsPanel.css';

const SettingsPanel = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Load saved API key from localStorage
    const savedApiKey = localStorage.getItem('userApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsValid(true);
    }
  }, []);

  const handleApiKeyChange = (e) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    setValidationMessage('');
    setIsValid(false);
  };

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setValidationMessage('Please enter an API key');
      return;
    }

    setIsValidating(true);
    setValidationMessage('');

    try {
      const response = await fetch('/api/validate-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setValidationMessage('✅ API key is valid!');
        setIsValid(true);
        localStorage.setItem('userApiKey', apiKey.trim());
      } else {
        setValidationMessage(`❌ ${data.error || 'Invalid API key'}`);
        setIsValid(false);
      }
    } catch (error) {
      setValidationMessage('❌ Error validating API key. Please try again.');
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const clearApiKey = () => {
    setApiKey('');
    setIsValid(false);
    setValidationMessage('');
    localStorage.removeItem('userApiKey');
  };

  const handleSave = () => {
    if (isValid) {
      localStorage.setItem('userApiKey', apiKey.trim());
      setValidationMessage('✅ API key saved successfully!');
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="settings-content">
          <div className="setting-section">
            <h3>API Key Configuration</h3>
            <p className="setting-description">
              Enter your OpenAI API key to use the AI agents. Your API key is stored locally and never shared.
            </p>
            
            <div className="api-key-input-group">
              <label htmlFor="apiKey">OpenAI API Key:</label>
              <div className="input-with-button">
                <input
                  type="password"
                  id="apiKey"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  placeholder="sk-..."
                  className={isValid ? 'valid' : ''}
                />
                <button 
                  onClick={validateApiKey}
                  disabled={isValidating || !apiKey.trim()}
                  className="validate-button"
                >
                  {isValidating ? 'Validating...' : 'Validate'}
                </button>
              </div>
              
              {validationMessage && (
                <div className={`validation-message ${isValid ? 'success' : 'error'}`}>
                  {validationMessage}
                </div>
              )}
            </div>

            <div className="api-key-actions">
              <button 
                onClick={handleSave}
                disabled={!isValid}
                className="save-button"
              >
                Save API Key
              </button>
              <button 
                onClick={clearApiKey}
                className="clear-button"
              >
                Clear API Key
              </button>
            </div>

            <div className="api-key-info">
              <h4>How to get your API key:</h4>
              <ol>
                <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI Platform</a></li>
                <li>Sign in or create an account</li>
                <li>Click "Create new secret key"</li>
                <li>Copy the key (starts with "sk-")</li>
                <li>Paste it above and click "Validate"</li>
              </ol>
              <p className="security-note">
                🔒 Your API key is stored locally in your browser and is never sent to our servers except for validation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel; 