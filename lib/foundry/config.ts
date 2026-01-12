/**
 * Foundry API Configuration
 * All endpoint paths are centralized here for easy adjustment
 */

export const FOUNDRY_CONFIG = {
  // Base endpoint from environment
  baseUrl: process.env.FOUNDRY_PROJECT_ENDPOINT || '',
  
  // API endpoints (OpenAI Assistants API compatible)
  endpoints: {
    threads: '/openai/threads',
    messages: (threadId: string) => `/openai/threads/${threadId}/messages`,
    runs: (threadId: string) => `/openai/threads/${threadId}/runs`,
    runStatus: (threadId: string, runId: string) => `/openai/threads/${threadId}/runs/${runId}`,
  },
  
  // Configuration
  assistantId: process.env.FOUNDRY_ASSISTANT_ID || '',
  apiKey: process.env.FOUNDRY_API_KEY || '',
  
  // Polling settings
  polling: {
    intervalMs: 500, // Poll every 500ms
    timeoutMs: 25000, // 25 second timeout
  },
  
  // Debug mode
  debug: process.env.DEBUG === 'true',
} as const;

/**
 * Validate that all required environment variables are set
 */
export function validateFoundryConfig(): void {
  const required = {
    FOUNDRY_PROJECT_ENDPOINT: FOUNDRY_CONFIG.baseUrl,
    FOUNDRY_API_KEY: FOUNDRY_CONFIG.apiKey,
    FOUNDRY_ASSISTANT_ID: FOUNDRY_CONFIG.assistantId,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file.'
    );
  }
}
