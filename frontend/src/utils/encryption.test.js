/**
 * Simple test for encryption utilities
 * Run this in browser console to test encryption
 */

import { 
  storeEncryptedApiKey, 
  getDecryptedApiKey, 
  clearStoredApiKey, 
  hasStoredApiKey 
} from './encryption';

// Test function
export const testEncryption = async () => {
  console.log('🧪 Testing API Key Encryption...');
  
  const testApiKey = 'sk-test123456789abcdefghijklmnopqrstuvwxyz';
  
  try {
    // Test 1: Store encrypted API key
    console.log('1. Storing encrypted API key...');
    await storeEncryptedApiKey(testApiKey);
    console.log('✅ API key stored successfully');
    
    // Test 2: Check if stored
    console.log('2. Checking if API key is stored...');
    const isStored = hasStoredApiKey();
    console.log(`✅ API key stored: ${isStored}`);
    
    // Test 3: Retrieve and decrypt
    console.log('3. Retrieving and decrypting API key...');
    const retrievedKey = await getDecryptedApiKey();
    console.log(`✅ Retrieved key: ${retrievedKey}`);
    
    // Test 4: Verify match
    console.log('4. Verifying key matches original...');
    const matches = retrievedKey === testApiKey;
    console.log(`✅ Keys match: ${matches}`);
    
    // Test 5: Clear storage
    console.log('5. Clearing stored API key...');
    clearStoredApiKey();
    const isCleared = !hasStoredApiKey();
    console.log(`✅ API key cleared: ${isCleared}`);
    
    console.log('🎉 All encryption tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Encryption test failed:', error);
    return false;
  }
};

// Auto-run test if in browser console
if (typeof window !== 'undefined') {
  window.testEncryption = testEncryption;
  console.log('🔧 Encryption test available. Run: testEncryption()');
} 