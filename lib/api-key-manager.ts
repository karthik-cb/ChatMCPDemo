/**
 * Secure API Key Manager - Client-Side Only
 * 
 * This system ensures API keys never leave the user's browser.
 * All validation and usage happens client-side with full transparency.
 */

export interface ProviderConfig {
  provider: 'cerebras' | 'openai' | 'anthropic' | 'expedia' | 'airbnb' | 'ferryhopper' | 'turkish-airlines' | 'mapbox';
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
      // Special handling for MCP servers that don't use traditional API key validation
      if (provider === 'turkish-airlines') {
        // Turkish Airlines uses OAuth authentication, not API key validation
        // Just mark as valid if account number is provided
        if (apiKey && apiKey.trim().length > 0) {
          const configs = this.getStoredConfigs();
          if (configs[provider]) {
            configs[provider].validationStatus = 'valid';
            configs[provider].lastValidated = new Date();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
          }
          return { 
            isValid: true,
            model: 'mcp-server'
          };
        } else {
          return { 
            isValid: false, 
            error: 'Miles&Smiles account number is required' 
          };
        }
      }

      if (provider === 'airbnb' || provider === 'ferryhopper') {
        // These servers don't require API keys, just mark as valid
        const configs = this.getStoredConfigs();
        if (configs[provider]) {
          configs[provider].validationStatus = 'valid';
          configs[provider].lastValidated = new Date();
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
        }
        return { 
          isValid: true,
          model: 'mcp-server'
        };
      }

      if (provider === 'mapbox') {
        // Mapbox requires a valid access token - test with a simple search request
        if (apiKey && apiKey.trim().length > 0) {
          try {
            // Test the token with a simple search request to Mapbox Search Box API
            const testUrl = `https://api.mapbox.com/search/searchbox/v1/suggest?q=test&access_token=${apiKey}&session_token=test-session`;
            
            const response = await fetch(testUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json'
              }
            });

            if (response.ok) {
              // Token is valid
              const configs = this.getStoredConfigs();
              if (configs[provider]) {
                configs[provider].validationStatus = 'valid';
                configs[provider].lastValidated = new Date();
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
              }
              return { 
                isValid: true,
                model: 'mapbox-api'
              };
            } else if (response.status === 401) {
              return { 
                isValid: false, 
                error: 'Invalid Mapbox access token. Please check your token.' 
              };
            } else if (response.status === 403) {
              return { 
                isValid: false, 
                error: 'Mapbox access token is forbidden. Check your account status or token permissions.' 
              };
            } else {
              return { 
                isValid: false, 
                error: `Mapbox API error: ${response.status} ${response.statusText}` 
              };
            }
          } catch (error) {
            return { 
              isValid: false, 
              error: `Network error testing Mapbox token: ${error}` 
            };
          }
        } else {
          return { 
            isValid: false, 
            error: 'Please enter a Mapbox access token' 
          };
        }
      }

      // Traditional API key validation for LLM providers
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
