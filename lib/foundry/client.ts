/**
 * Foundry API Client - Using Azure AI Projects SDK with Agents API
 * Handles all communication with Microsoft Foundry Agent Service
 * Uses Azure SDK with DefaultAzureCredential for proper authentication
 */

import { AIProjectClient } from '@azure/ai-projects';
import { DefaultAzureCredential } from '@azure/identity';
import { FOUNDRY_CONFIG, validateFoundryConfig } from './config';
import type { ChatResponse, DebugInfo } from '@/types';

// Cached client
let projectClient: AIProjectClient | null = null;

/**
 * Get or create the Azure AI Project client
 */
async function getProjectClient(): Promise<AIProjectClient> {
  if (!projectClient) {
    validateFoundryConfig();
    
    // Create client with DefaultAzureCredential
    projectClient = new AIProjectClient(
      FOUNDRY_CONFIG.baseUrl,
      new DefaultAzureCredential()
    );
    
    if (FOUNDRY_CONFIG.debug) {
      console.log('Created Azure AI Project client:', FOUNDRY_CONFIG.baseUrl);
    }
  }
  
  return projectClient;
}

/**
 * Main function: Call Foundry Agent with user text
 * This orchestrates the entire flow using the Azure Agents API
 */
export async function callFoundryAgent(
  userText: string,
  existingThreadId?: string
): Promise<ChatResponse> {
  const startTime = Date.now();
  let debugInfo: DebugInfo | undefined;

  try {
    // Get the authenticated project client
    const project = await getProjectClient();
    
    // Step 1: Get or create thread
    let threadId = existingThreadId;
    if (!threadId) {
      const thread = await project.agents.threads.create();
      threadId = thread.id;
      if (FOUNDRY_CONFIG.debug) {
        console.log('Created new thread:', threadId);
      }
    }

    // Step 2: Add user message
    const message = await project.agents.messages.create(
      threadId,
      'user',
      userText
    );
    
    if (FOUNDRY_CONFIG.debug) {
      console.log('Created message:', message.id, 'in thread:', threadId);
    }

    // Step 3: Create run with your agent
    let run = await project.agents.runs.create(threadId, FOUNDRY_CONFIG.assistantId);
    const runId = run.id;
    
    if (FOUNDRY_CONFIG.debug) {
      console.log('Created run:', runId, 'with agent:', FOUNDRY_CONFIG.assistantId);
    }

    // Step 4: Poll until completed
    const { intervalMs, timeoutMs } = FOUNDRY_CONFIG.polling;
    const pollStartTime = Date.now();
    
    while (run.status === 'queued' || run.status === 'in_progress' || run.status === 'requires_action') {
      // Check timeout
      if (Date.now() - pollStartTime > timeoutMs) {
        throw new Error('Run polling timeout after 25 seconds');
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      
      // Get run status
      run = await project.agents.runs.get(threadId, runId);
      
      if (FOUNDRY_CONFIG.debug) {
        console.log('Run status:', run.status);
      }
    }

    // Check for failures
    if (run.status === 'failed') {
      const errorMsg = run.lastError?.message || 'Run failed';
      throw new Error(`Run failed: ${errorMsg}`);
    }

    if (run.status === 'cancelled' || run.status === 'expired') {
      throw new Error(`Run ${run.status}`);
    }

    if (FOUNDRY_CONFIG.debug) {
      console.log('Run completed with status:', run.status);
    }

    // Step 5: Get messages and extract assistant response
    const messages = await project.agents.messages.list(threadId, { order: 'asc' });
    
    // Find the last assistant message
    let assistantMessage: any = null;
    for await (const msg of messages) {
      if (msg.role === 'assistant') {
        assistantMessage = msg;
      }
    }
    
    if (!assistantMessage) {
      throw new Error('No assistant response found');
    }

    // Extract text from message content
    const textContent = assistantMessage.content.find((c: any) => 
      c.type === 'text' && 'text' in c
    );
    
    const text = textContent?.text?.value || 'No response generated';

    // Build debug info
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    if (FOUNDRY_CONFIG.debug) {
      debugInfo = {
        threadId,
        runId,
        status: run.status,
        duration: `${duration}s`,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      threadId,
      text,
      debug: debugInfo,
    };
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.error('Foundry Agent Error:', error);
    
    // Build error debug info
    if (FOUNDRY_CONFIG.debug) {
      debugInfo = {
        threadId: existingThreadId,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}s`,
        timestamp: new Date().toISOString(),
      };
    }

    throw error;
  }
}

/**
 * Reset client (useful for testing or credential refresh)
 */
export function resetClient(): void {
  projectClient = null;
  if (FOUNDRY_CONFIG.debug) {
    console.log('Reset Azure SDK client');
  }
}
