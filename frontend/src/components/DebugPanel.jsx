import React, { useState } from 'react';
import { apiService } from '../api';

const DebugPanel = ({ isOpen, onClose }) => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test, success, message, details = null) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      message,
      details,
      timestamp: new Date().toISOString()
    }]);
  };

  const runTest = async (testName, testFunc) => {
    setIsRunning(true);
    try {
      const result = await testFunc();
      addResult(testName, true, result.message || 'Test passed', result);
    } catch (error) {
      addResult(testName, false, error.message || 'Test failed', error);
    } finally {
      setIsRunning(false);
    }
  };

  const testHealthCheck = async () => {
    const response = await fetch('/health');
    const data = await response.json();
    return { message: `Health check: ${data.status}`, data };
  };

  const testApiKeyValidation = async () => {
    const apiKey = await apiService.getUserApiKey();
    if (!apiKey) {
      throw new Error('No API key available');
    }

    const response = await fetch('/api/validate-api-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Validation failed');
    }
    
    return { message: 'API key validation successful', data };
  };

  const testSimpleCrew = async () => {
    const apiKey = await apiService.getUserApiKey();
    if (!apiKey) {
      throw new Error('No API key available');
    }

    const response = await fetch('/api/debug/test-crew', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_api_key: apiKey })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.details || 'Crew test failed');
    }
    
    return { message: 'Simple crew test successful', data };
  };

  const testPersonas = async () => {
    const response = await fetch('/api/personas');
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to load personas');
    }
    
    return { message: `Loaded ${data.length} personas`, data };
  };

  const testSystems = async () => {
    const response = await fetch('/api/systems');
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to load systems');
    }
    
    return { message: `Loaded ${data.length} systems`, data };
  };

  const runAllTests = async () => {
    setTestResults([]);
    
    const tests = [
      ['Health Check', testHealthCheck],
      ['API Key Validation', testApiKeyValidation],
      ['Personas Loading', testPersonas],
      ['Systems Loading', testSystems],
      ['Simple Crew Test', testSimpleCrew],
    ];

    for (const [testName, testFunc] of tests) {
      await runTest(testName, testFunc);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const generateErrorReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      testResults: testResults,
      summary: {
        total: testResults.length,
        passed: testResults.filter(r => r.success).length,
        failed: testResults.filter(r => !r.success).length,
        failedTests: testResults.filter(r => !r.success).map(r => r.test)
      }
    };

    return JSON.stringify(report, null, 2);
  };

  const copyErrorReport = async () => {
    try {
      const report = generateErrorReport();
      await navigator.clipboard.writeText(report);
      alert('Error report copied to clipboard! You can now paste it in an email or message.');
    } catch (error) {
      console.error('Failed to copy report:', error);
      alert('Failed to copy report. Please manually copy the report below.');
    }
  };

  const hasFailures = testResults.some(r => !r.success);

  if (!isOpen) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-panel" style={{ maxWidth: '800px' }}>
        <div className="settings-header">
          <h2>🔧 Debug Panel</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="settings-content">
          <div className="setting-section">
            <h3>API Testing</h3>
            <p className="setting-description">
              Test various API endpoints to identify issues with the crew execution.
            </p>

            <div className="debug-actions">
              <button 
                onClick={runAllTests}
                disabled={isRunning}
                className="btn btn-primary"
              >
                {isRunning ? 'Running Tests...' : 'Run All Tests'}
              </button>
              <button 
                onClick={clearResults}
                className="btn btn-secondary"
              >
                Clear Results
              </button>
              {hasFailures && (
                <button 
                  onClick={copyErrorReport}
                  className="btn btn-warning"
                  title="Copy error report for support"
                >
                  📋 Copy Report
                </button>
              )}
            </div>

            <div className="test-results">
              <h4>Test Results:</h4>
              {testResults.length === 0 ? (
                <p>No tests run yet. Click "Run All Tests" to start debugging.</p>
              ) : (
                <div className="results-list">
                  {testResults.map((result, index) => (
                    <div 
                      key={index} 
                      className={`test-result ${result.success ? 'success' : 'error'}`}
                    >
                      <div className="test-header">
                        <span className="test-name">{result.test}</span>
                        <span className={`test-status ${result.success ? 'success' : 'error'}`}>
                          {result.success ? '✅' : '❌'}
                        </span>
                      </div>
                      <div className="test-message">{result.message}</div>
                      {result.details && (
                        <details className="test-details">
                          <summary>View Details</summary>
                          <pre>{JSON.stringify(result.details, null, 2)}</pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {hasFailures && (
              <div className="error-report-section">
                <h4>📋 Error Report</h4>
                <p>If you're experiencing issues, copy the error report below and send it to the developer:</p>
                <div className="report-actions">
                  <button 
                    onClick={copyErrorReport}
                    className="btn btn-warning"
                  >
                    📋 Copy Report to Clipboard
                  </button>
                </div>
                <details className="report-details">
                  <summary>View Full Error Report</summary>
                  <pre className="error-report">{generateErrorReport()}</pre>
                </details>
              </div>
            )}

            <div className="debug-info">
              <h4>Debug Information:</h4>
              <ul>
                <li><strong>Health Check:</strong> Tests if the backend is responding</li>
                <li><strong>API Key Validation:</strong> Tests if your API key is working</li>
                <li><strong>Personas Loading:</strong> Tests if personas can be loaded</li>
                <li><strong>Systems Loading:</strong> Tests if systems can be loaded</li>
                <li><strong>Simple Crew Test:</strong> Tests basic CrewAI functionality</li>
              </ul>
              
              <p className="debug-note">
                <strong>Note:</strong> If the Simple Crew Test fails, it indicates an issue with CrewAI 
                or OpenAI integration. Check the details for specific error messages.
              </p>
              
              <div className="support-info">
                <h5>Need Help?</h5>
                <p>
                  If you're experiencing issues:
                </p>
                <ol>
                  <li>Run all tests using the "Run All Tests" button</li>
                  <li>If any tests fail, click "Copy Report" to copy the error details</li>
                  <li>Send the error report to the developer with a description of what you were trying to do</li>
                  <li>Include any error messages you see in the browser console</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel; 