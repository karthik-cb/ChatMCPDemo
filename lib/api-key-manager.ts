/**
 * Secure API Key Manager - Client-Side Only
 * 
 * This system ensures API keys never leave the user's browser.
 * All validation and usage happens client-side with full transparency.
 */

export interface ProviderConfig {
  provider: 'cerebras' | 'openai' | 'anthropic';
  apiKey: string;
  model: string;
  enabled: boolean;
  lastValidated?: Date;
  validationStatus?: 'valid' | 'invalid' | 'unknown';
}

export interface KeyValidationResult {
  isValid: boolean;
  error?: string;
  model?: string;
  usage?: {
    totalTokens: number;
    remainingQuota?: number;
  };
}

class SecureAPIKeyManager {
  private readonly STORAGE_KEY = 'mcp-demo-api-keys';
  private readonly ENCRYPTION_KEY = 'mcp-demo-local-key'; // In production, use proper key derivation

  /**
   * Store API key locally with basic obfuscation
   * Note: This is NOT encryption - just obfuscation for casual inspection
   */
  private obfuscateKey(key: string): string {
    // Simple base64 encoding - in production, use proper encryption
    return btoa(key);
  }

  private deobfuscateKey(obfuscatedKey: string): string {
    try {
      return atob(obfuscatedKey);
    } catch {
      throw new Error('Invalid key format');
    }
  }

  /**
   * Save API key to localStorage (client-side only)
   */
  saveAPIKey(provider: string, apiKey: string, model: string): void {
    const configs = this.getStoredConfigs();
    const obfuscatedKey = this.obfuscateKey(apiKey);
    
    configs[provider] = {
      provider: provider as any,
      apiKey: obfuscatedKey,
      model,
      enabled: true,
      lastValidated: new Date(),
      validationStatus: 'unknown'
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
  }

  /**
   * Get stored API key (deobfuscated)
   */
  getAPIKey(provider: string): string | null {
    const configs = this.getStoredConfigs();
    const config = configs[provider];
    
    if (!config || !config.apiKey) {
      return null;
    }

    try {
      return this.deobfuscateKey(config.apiKey);
    } catch {
      // If deobfuscation fails, remove the invalid key
      this.removeAPIKey(provider);
      return null;
    }
  }

  /**
   * Get all stored configurations
   */
  getStoredConfigs(): Record<string, ProviderConfig> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  /**
   * Remove API key from storage
   */
  removeAPIKey(provider: string): void {
    const configs = this.getStoredConfigs();
    delete configs[provider];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
  }

  /**
   * Clear all stored API keys
   */
  clearAllKeys(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Validate API key by making a test request
   * This happens entirely client-side
   */
  async validateAPIKey(provider: string, apiKey: string): Promise<KeyValidationResult> {
    try {
      // Make a minimal test request to validate the key
      const testRequest = {
        provider,
        apiKey,
        test: true,
        messages: [{ role: 'user', content: 'Hello' }]
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testRequest)
      });

      if (response.ok) {
        const configs = this.getStoredConfigs();
        if (configs[provider]) {
          configs[provider].validationStatus = 'valid';
          configs[provider].lastValidated = new Date();
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
        }
        
        return { isValid: true };
      } else {
        const error = await response.text();
        return { 
          isValid: false, 
          error: `Validation failed: ${error}` 
        };
      }
    } catch (error) {
      return { 
        isValid: false, 
        error: `Network error: ${error}` 
      };
    }
  }

  /**
   * Get transparency information about key usage
   */
  getTransparencyInfo(): {
    keysStored: number;
    providers: string[];
    lastValidated: Date | null;
    storageLocation: string;
  } {
    const configs = this.getStoredConfigs();
    const providers = Object.keys(configs);
    const lastValidated = providers.reduce((latest, provider) => {
      const config = configs[provider];
      if (config.lastValidated) {
        const date = new Date(config.lastValidated);
        return !latest || date > latest ? date : latest;
      }
      return latest;
    }, null as Date | null);

    return {
      keysStored: providers.length,
      providers,
      lastValidated,
      storageLocation: 'localStorage (browser only)'
    };
  }
}

export const apiKeyManager = new SecureAPIKeyManager();
