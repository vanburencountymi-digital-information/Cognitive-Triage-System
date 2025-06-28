/**
 * Client-side encryption utilities for API key storage
 * Uses Web Crypto API for AES-GCM encryption
 */

// Generate a random encryption key
export const generateEncryptionKey = async () => {
  const key = await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
  return key;
};

// Export key to a format we can store
export const exportKey = async (key) => {
  const exported = await window.crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
};

// Import key from stored format
export const importKey = async (keyString) => {
  const keyData = Uint8Array.from(atob(keyString), c => c.charCodeAt(0));
  return await window.crypto.subtle.importKey(
    "raw",
    keyData,
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
};

// Encrypt API key
export const encryptApiKey = async (apiKey, encryptionKey) => {
  // Generate a random IV (Initialization Vector)
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Convert API key to Uint8Array
  const apiKeyData = new TextEncoder().encode(apiKey);
  
  // Encrypt the API key
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    encryptionKey,
    apiKeyData
  );
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encryptedData.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedData), iv.length);
  
  // Convert to base64 for storage
  return btoa(String.fromCharCode(...combined));
};

// Decrypt API key
export const decryptApiKey = async (encryptedData, encryptionKey) => {
  try {
    // Convert from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract IV (first 12 bytes)
    const iv = combined.slice(0, 12);
    
    // Extract encrypted data (rest of bytes)
    const encrypted = combined.slice(12);
    
    // Decrypt
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      encryptionKey,
      encrypted
    );
    
    // Convert back to string
    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error('Failed to decrypt API key:', error);
    throw new Error('Failed to decrypt API key. The stored key may be corrupted.');
  }
};

// Store encrypted API key
export const storeEncryptedApiKey = async (apiKey) => {
  try {
    // Generate new encryption key
    const encryptionKey = await generateEncryptionKey();
    
    // Encrypt the API key
    const encryptedApiKey = await encryptApiKey(apiKey, encryptionKey);
    
    // Export the encryption key for storage
    const exportedKey = await exportKey(encryptionKey);
    
    // Store both encrypted key and encryption key
    localStorage.setItem('encryptedApiKey', encryptedApiKey);
    localStorage.setItem('encryptionKey', exportedKey);
    
    return true;
  } catch (error) {
    console.error('Failed to store encrypted API key:', error);
    throw error;
  }
};

// Retrieve and decrypt API key
export const getDecryptedApiKey = async () => {
  try {
    const encryptedApiKey = localStorage.getItem('encryptedApiKey');
    const encryptionKeyString = localStorage.getItem('encryptionKey');
    
    if (!encryptedApiKey || !encryptionKeyString) {
      return null;
    }
    
    // Import the encryption key
    const encryptionKey = await importKey(encryptionKeyString);
    
    // Decrypt the API key
    const apiKey = await decryptApiKey(encryptedApiKey, encryptionKey);
    
    return apiKey;
  } catch (error) {
    console.error('Failed to retrieve API key:', error);
    // Clear corrupted data
    localStorage.removeItem('encryptedApiKey');
    localStorage.removeItem('encryptionKey');
    throw error;
  }
};

// Clear stored API key
export const clearStoredApiKey = () => {
  localStorage.removeItem('encryptedApiKey');
  localStorage.removeItem('encryptionKey');
};

// Check if API key is stored
export const hasStoredApiKey = () => {
  return !!(localStorage.getItem('encryptedApiKey') && localStorage.getItem('encryptionKey'));
}; 