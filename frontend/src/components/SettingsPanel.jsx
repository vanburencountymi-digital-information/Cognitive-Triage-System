import React, { useState, useEffect } from 'react';
import './SettingsPanel.css';
import { 
  storeEncryptedApiKey, 
  getDecryptedApiKey, 
  clearStoredApiKey, 
  hasStoredApiKey 
} from '../utils/encryption';

const SettingsPanel = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved API key from encrypted storage
    const loadSavedApiKey = async () => {
      try {
        if (hasStoredApiKey()) {
          const savedApiKey = await getDecryptedApiKey();
          if (savedApiKey) {
            setApiKey(savedApiKey);
            setIsValid(true);
          }
        }
      } catch (error) {
        console.error('Failed to load saved API key:', error);
        setValidationMessage('❌ Failed to load saved API key. Please re-enter your key.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedApiKey();
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

    // Additional client-side validation
    if (!apiKey.trim().startsWith('sk-')) {
      setValidationMessage('❌ Invalid API key format. Should start with "sk-"');
      return;
    }

    if (apiKey.trim().length < 20) {
      setValidationMessage('❌ API key appears too short. Please check your key.');
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
        // Store encrypted version after successful validation
        try {
          await storeEncryptedApiKey(apiKey.trim());
        } catch (encryptError) {
          console.error('Failed to encrypt API key:', encryptError);
          setValidationMessage('✅ API key is valid, but failed to save securely. Please try again.');
          setIsValid(false);
        }
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
    clearStoredApiKey();
  };

  const handleSave = () => {
    if (isValid) {
      setValidationMessage('✅ API key saved securely!');
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
              Enter your OpenAI API key to use the AI agents. Your API key is encrypted using military-grade AES-256-GCM encryption and stored locally in your browser.
            </p>
            
            <div className="api-key-input-group">
              <label htmlFor="apiKey">OpenAI API Key:</label>
              <div className="input-with-button">
                <input
                  type="password"
                  id="apiKey"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  placeholder={isLoading ? "Loading..." : "sk-..."}
                  disabled={isLoading}
                  className={isValid ? 'valid' : ''}
                />
                <button 
                  onClick={validateApiKey}
                  disabled={isValidating || !apiKey.trim() || isLoading}
                  className="validate-button"
                >
                  {isValidating ? 'Validating...' : 'Validate & Store'}
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
                <li>Paste it above and click "Validate & Store"</li>
              </ol>
              
              <div className="security-features">
                <h4>🔒 Security Features:</h4>
                <ul>
                  <li><strong>AES-256-GCM Encryption:</strong> Military-grade encryption for your API key</li>
                  <li><strong>Random Encryption Keys:</strong> Each encryption uses a unique, randomly generated key</li>
                  <li><strong>Memory Protection:</strong> Decrypted key only exists in memory during API calls</li>
                  <li><strong>No Server Storage:</strong> Your API key never leaves your device</li>
                  <li><strong>Corruption Protection:</strong> Automatic cleanup of corrupted encrypted data</li>
                </ul>
              </div>
              
              <p className="security-note">
                🔒 Your API key is encrypted using AES-256-GCM encryption and stored locally in your browser. 
                It is never sent to our servers except for validation and workflow execution.
                <br />
                <strong>Security Note:</strong> While encrypted, the key can still be accessed by scripts running on this page. 
                Only use this on trusted devices and clear your API key when using shared computers.
                <br />
                <strong>Enhanced Security Available:</strong> For even stronger protection, consider using the enhanced security mode 
                with passphrase-based encryption and session management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel; 