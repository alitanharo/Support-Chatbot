// Message types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Chat state
export interface ChatState {
  messages: Message[];
  threadId: string | null;
  isLoading: boolean;
  error: string | null;
  debugInfo: DebugInfo | null;
}

// Debug information
export interface DebugInfo {
  threadId?: string;
  runId?: string;
  status?: string;
  duration?: string;
  error?: string;
  timestamp: string;
}

// API Request/Response types
export interface ChatRequest {
  message: string;
  threadId?: string;
}

export interface ChatResponse {
  threadId: string;
  text: string;
  debug?: DebugInfo;
  error?: ErrorResponse;
}

export interface ErrorResponse {
  code: string;
  message: string;
  debug?: string;
}

// Foundry API types
export interface FoundryThread {
  id: string;
  object: string;
  created_at: number;
  metadata?: Record<string, unknown>;
}

export interface FoundryMessage {
  id: string;
  object: string;
  created_at: number;
  thread_id: string;
  role: 'user' | 'assistant';
  content: Array<{
    type: string;
    text: {
      value: string;
      annotations: unknown[];
    };
  }>;
}

export interface FoundryRun {
  id: string;
  object: string;
  created_at: number;
  thread_id: string;
  assistant_id: string;
  status: 'queued' | 'in_progress' | 'requires_action' | 'cancelling' | 'cancelled' | 'failed' | 'completed' | 'expired';
  required_action?: unknown;
  last_error?: {
    code: string;
    message: string;
  };
  expires_at?: number;
  started_at?: number;
  cancelled_at?: number;
  failed_at?: number;
  completed_at?: number;
  model?: string;
  instructions?: string;
  tools?: unknown[];
  metadata?: Record<string, unknown>;
}

export interface FoundryMessageList {
  object: string;
  data: FoundryMessage[];
  first_id: string;
  last_id: string;
  has_more: boolean;
}

// Voice settings
export interface VoiceSettings {
  micEnabled: boolean;
  ttsEnabled: boolean;
  isListening: boolean;
  isSpeaking: boolean;
}
