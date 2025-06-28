import React, { useState, useEffect } from 'react';
import './SettingsPanel.css';
import { secureApiKeyManager } from '../utils/advanced-encryption';
import { validateApiKey } from '../api';

const SecureSettingsPanel = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStatus, setSessionStatus] = useState(null);
  const [showPassphraseInput, setShowPassphraseInput] = useState(false);

  useEffect(() => {
    // Check session status on load
    const status = secureApiKeyManager.getSessionStatus();
    setSessionStatus(status);
    
    if (status.valid && status.hasApiKey) {
      setIsValid(true);
      setApiKey('••••••••••••••••••••••••••••••••••••••••');
    }
    
    setIsLoading(false);
  }, []);

  const handlePassphraseSubmit = async () => {
    if (!passphrase.trim()) {
      setValidationMessage('Please enter a passphrase');
      return;
    }

    setIsValidating(true);
    setValidationMessage('');

    try {
      // Initialize session with passphrase
      await secureApiKeyManager.initialize(passphrase);
      
      // Try to retrieve existing API key
      const existingKey = await secureApiKeyManager.retrieve();
      if (existingKey) {
        setApiKey('••••••••••••••••••••••••••••••••••••••••');
        setIsValid(true);
        setValidationMessage('✅ Session initialized successfully!');
        setShowPassphraseInput(false);
      } else {
        setValidationMessage('✅ Session initialized. Please enter your API key.');
        setShowPassphraseInput(false);
      }
    } catch (error) {
      setValidationMessage(`❌ Failed to initialize session: ${error.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  const handleApiKeyChange = (e) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    setValidationMessage('');
    setIsValid(false);
  };

  const validateAndStoreApiKey = async () => {
    if (!apiKey.trim()) {
      setValidationMessage('Please enter an API key');
      return;
    }

    // Client-side validation
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
      // Validate with OpenAI
      await validateApiKey(apiKey.trim());
      
      // Store encrypted version
      await secureApiKeyManager.store(apiKey.trim());
      
      setValidationMessage('✅ API key validated and stored securely!');
      setIsValid(true);
      setApiKey('••••••••••••••••••••••••••••••••••••••••');
      
      // Update session status
      setSessionStatus(secureApiKeyManager.getSessionStatus());
      
    } catch (error) {
      setValidationMessage(`❌ ${error.message || 'Invalid API key'}`);
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const clearAllData = () => {
    secureApiKeyManager.clear();
    setApiKey('');
    setPassphrase('');
    setIsValid(false);
    setValidationMessage('');
    setSessionStatus(secureApiKeyManager.getSessionStatus());
    setShowPassphraseInput(true);
  };

  const handleSave = () => {
    if (isValid) {
      setValidationMessage('✅ Settings saved securely!');
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
          <h2>🔐 Secure Settings</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="settings-content">
          <div className="setting-section">
            <h3>🔑 Secure API Key Management</h3>
            <p className="setting-description">
              Your API key is protected with military-grade encryption and requires a passphrase for access.
            </p>
            
            {/* Session Status */}
            {sessionStatus && (
              <div className="session-status">
                <h4>Session Status:</h4>
                {sessionStatus.valid ? (
                  <div className="status-valid">
                    ✅ Session Active ({sessionStatus.timeLeft} minutes remaining)
                    {sessionStatus.hasApiKey && <span> • API Key Available</span>}
                  </div>
                ) : (
                  <div className="status-invalid">
                    ❌ {sessionStatus.reason}
                  </div>
                )}
              </div>
            )}

            {/* Passphrase Input */}
            {showPassphraseInput && (
              <div className="passphrase-section">
                <label htmlFor="passphrase">🔐 Security Passphrase:</label>
                <div className="input-with-button">
                  <input
                    type="password"
                    id="passphrase"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Enter your security passphrase"
                    disabled={isValidating}
                  />
                  <button 
                    onClick={handlePassphraseSubmit}
                    disabled={isValidating || !passphrase.trim()}
                    className="validate-button"
                  >
                    {isValidating ? 'Initializing...' : 'Initialize Session'}
                  </button>
                </div>
                <p className="passphrase-info">
                  This passphrase protects your API key. You'll need to enter it each time you start a new session.
                </p>
              </div>
            )}

            {/* API Key Input */}
            {!showPassphraseInput && (
              <div className="api-key-input-group">
                <label htmlFor="apiKey">OpenAI API Key:</label>
                <div className="input-with-button">
                  <input
                    type="password"
                    id="apiKey"
                    value={apiKey}
                    onChange={handleApiKeyChange}
                    placeholder={isLoading ? "Loading..." : "sk-..."}
                    disabled={isLoading || isValid}
                    className={isValid ? 'valid' : ''}
                  />
                  {!isValid && (
                    <button 
                      onClick={validateAndStoreApiKey}
                      disabled={isValidating || !apiKey.trim() || isLoading}
                      className="validate-button"
                    >
                      {isValidating ? 'Validating...' : 'Validate & Store'}
                    </button>
                  )}
                </div>
                
                {validationMessage && (
                  <div className={`validation-message ${isValid ? 'success' : 'error'}`}>
                    {validationMessage}
                  </div>
                )}
              </div>
            )}

            <div className="api-key-actions">
              {isValid && (
                <button 
                  onClick={handleSave}
                  className="save-button"
                >
                  Save Settings
                </button>
              )}
              <button 
                onClick={clearAllData}
                className="clear-button"
              >
                Clear All Data
              </button>
              {!showPassphraseInput && (
                <button 
                  onClick={() => setShowPassphraseInput(true)}
                  className="btn btn-outline-secondary"
                >
                  Change Passphrase
                </button>
              )}
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
                  <li><strong>PBKDF2 Key Derivation:</strong> Your passphrase is converted to a strong encryption key</li>
                  <li><strong>AES-256-GCM Encryption:</strong> Military-grade encryption for your API key</li>
                  <li><strong>Session Management:</strong> Keys expire after 8 hours for security</li>
                  <li><strong>Memory Protection:</strong> Sensitive data is cleared from memory</li>
                  <li><strong>No Server Storage:</strong> Your API key never leaves your device</li>
                </ul>
              </div>
              
              <p className="security-note">
                <strong>⚠️ Security Note:</strong> This provides strong protection against most attacks, but no system is 100% secure. 
                Use only on trusted devices and never share your passphrase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureSettingsPanel; 