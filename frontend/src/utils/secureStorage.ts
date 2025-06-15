import CryptoJS from 'crypto-js';

class SecureStorage {
  private static STORAGE_KEY = 'interview_prep_keys';
  private static SALT_KEY = 'interview_prep_salt';
  
  private salt: string;

  constructor() {
    // Generate or retrieve unique salt for this browser
    this.salt = this.getOrCreateSalt();
  }

  private getOrCreateSalt(): string {
    let salt = localStorage.getItem(SecureStorage.SALT_KEY);
    if (!salt) {
      // Generate a random salt for this browser instance
      salt = CryptoJS.lib.WordArray.random(128/8).toString();
      localStorage.setItem(SecureStorage.SALT_KEY, salt);
    }
    return salt;
  }

  private getDerivedKey(): string {
    // Derive a key from browser fingerprint and salt
    const browserInfo = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset().toString(),
      screen.width.toString(),
      screen.height.toString()
    ].join('|');
    
    return CryptoJS.PBKDF2(browserInfo, this.salt, {
      keySize: 256/32,
      iterations: 1000
    }).toString();
  }

  encrypt(data: any): string {
    try {
      const jsonString = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(jsonString, this.getDerivedKey()).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  decrypt(encryptedData: string): any {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.getDerivedKey());
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!jsonString) {
        throw new Error('Failed to decrypt - invalid key or corrupted data');
      }
      
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decryption error:', error);
      // Handle corruption gracefully
      this.clear();
      return null;
    }
  }

  save(data: any): void {
    try {
      const encrypted = this.encrypt(data);
      localStorage.setItem(SecureStorage.STORAGE_KEY, encrypted);
    } catch (error) {
      console.error('Failed to save secure data:', error);
      throw error;
    }
  }

  load(): any {
    try {
      const encrypted = localStorage.getItem(SecureStorage.STORAGE_KEY);
      if (!encrypted) return null;
      
      return this.decrypt(encrypted);
    } catch (error) {
      console.error('Failed to load secure data:', error);
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(SecureStorage.STORAGE_KEY);
    // Keep the salt to maintain consistency
  }

  clearAll(): void {
    localStorage.removeItem(SecureStorage.STORAGE_KEY);
    localStorage.removeItem(SecureStorage.SALT_KEY);
  }
}

export const secureStorage = new SecureStorage();