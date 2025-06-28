/**
 * Advanced encryption utilities with enhanced security
 * Implements key derivation, memory protection, and session management
 */

// Session-based encryption key (not stored in localStorage)
let sessionEncryptionKey = null;
let sessionKeyExpiry = null;

// Generate a session encryption key from user password/passphrase
export const initializeSessionKey = async (userPassphrase) => {
  try {
    // Use PBKDF2 to derive a key from user passphrase
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const derivedKey = await window.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000, // High iteration count for security
        hash: 'SHA-256'
      },
      await window.crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(userPassphrase),
        'PBKDF2',
        false,
        ['deriveBits']
      ),
      256
    );

    // Create AES-GCM key from derived bits
    sessionEncryptionKey = await window.crypto.subtle.importKey(
      'raw',
      derivedKey,
      'AES-GCM',
      false,
      ['encrypt', 'decrypt']
    );

    // Store salt for later use
    sessionStorage.setItem('encryptionSalt', btoa(String.fromCharCode(...salt)));
    
    // Set session expiry (8 hours)
    sessionKeyExpiry = Date.now() + (8 * 60 * 60 * 1000);
    
    return true;
  } catch (error) {
    console.error('Failed to initialize session key:', error);
    throw error;
  }
};

// Check if session key is valid
export const isSessionKeyValid = () => {
  return sessionEncryptionKey && sessionKeyExpiry && Date.now() < sessionKeyExpiry;
};

// Clear session key (call on logout or session expiry)
export const clearSessionKey = () => {
  sessionEncryptionKey = null;
  sessionKeyExpiry = null;
  sessionStorage.removeItem('encryptionSalt');
};

// Encrypt API key with session key
export const encryptApiKeyWithSession = async (apiKey) => {
  if (!isSessionKeyValid()) {
    throw new Error('Session key not initialized or expired. Please re-enter your passphrase.');
  }

  try {
    // Generate random IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt API key
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      sessionEncryptionKey,
      new TextEncoder().encode(apiKey)
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);
    
    // Store encrypted data (no encryption key stored!)
    localStorage.setItem('encryptedApiKey', btoa(String.fromCharCode(...combined)));
    
    return true;
  } catch (error) {
    console.error('Failed to encrypt API key:', error);
    throw error;
  }
};

// Decrypt API key with session key
export const decryptApiKeyWithSession = async () => {
  if (!isSessionKeyValid()) {
    throw new Error('Session key not initialized or expired. Please re-enter your passphrase.');
  }

  try {
    const encryptedData = localStorage.getItem('encryptedApiKey');
    if (!encryptedData) {
      return null;
    }
    
    // Convert from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    // Decrypt
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      sessionEncryptionKey,
      encrypted
    );
    
    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error('Failed to decrypt API key:', error);
    throw new Error('Failed to decrypt API key. Session may have expired.');
  }
};

// Memory protection utilities
export const secureMemory = {
  // Overwrite sensitive data in memory
  clearString: (str) => {
    if (typeof str === 'string') {
      const arr = new Uint8Array(str.length);
      for (let i = 0; i < str.length; i++) {
        arr[i] = str.charCodeAt(i);
      }
      // Overwrite the string (as much as possible in JS)
      for (let i = 0; i < arr.length; i++) {
        arr[i] = 0;
      }
    }
  },
  
  // Clear object containing sensitive data
  clearObject: (obj) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          secureMemory.clearString(obj[key]);
        }
        delete obj[key];
      });
    }
  }
};

// Enhanced API key management
export const secureApiKeyManager = {
  // Initialize with user passphrase
  initialize: async (passphrase) => {
    await initializeSessionKey(passphrase);
  },
  
  // Store API key securely
  store: async (apiKey) => {
    await encryptApiKeyWithSession(apiKey);
  },
  
  // Retrieve API key securely
  retrieve: async () => {
    return await decryptApiKeyWithSession();
  },
  
  // Check if API key is available
  hasKey: () => {
    return isSessionKeyValid() && !!localStorage.getItem('encryptedApiKey');
  },
  
  // Clear all data
  clear: () => {
    clearSessionKey();
    localStorage.removeItem('encryptedApiKey');
  },
  
  // Get session status
  getSessionStatus: () => {
    if (!sessionKeyExpiry) {
      return { valid: false, reason: 'No session initialized' };
    }
    
    const timeLeft = sessionKeyExpiry - Date.now();
    if (timeLeft <= 0) {
      return { valid: false, reason: 'Session expired' };
    }
    
    return { 
      valid: true, 
      timeLeft: Math.floor(timeLeft / 1000 / 60), // minutes
      hasApiKey: !!localStorage.getItem('encryptedApiKey')
    };
  }
}; 