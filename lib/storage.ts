/**
 * LocalStorage utility for persisting chat data
 */

import type { Message } from '@/types';

const STORAGE_KEYS = {
  MESSAGES: 'dise-cx-chat-messages',
  THREAD_ID: 'dise-cx-thread-id',
  TTS_ENABLED: 'dise-cx-tts-enabled',
  CONVERSATIONS: 'dise-cx-conversations',
} as const;

// Conversation history interfaces
export interface Conversation {
  id: string;
  threadId: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

/**
 * Save messages to localStorage
 */
export function saveMessages(messages: Message[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(
      STORAGE_KEYS.MESSAGES,
      JSON.stringify(messages)
    );
  } catch (error) {
    console.error('Failed to save messages:', error);
  }
}

/**
 * Load messages from localStorage
 */
export function loadMessages(): Message[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    
    // Convert timestamp strings back to Date objects
    return parsed.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  } catch (error) {
    console.error('Failed to load messages:', error);
    return [];
  }
}

/**
 * Save thread ID to localStorage
 */
export function saveThreadId(threadId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.THREAD_ID, threadId);
  } catch (error) {
    console.error('Failed to save thread ID:', error);
  }
}

/**
 * Load thread ID from localStorage
 */
export function loadThreadId(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem(STORAGE_KEYS.THREAD_ID);
  } catch (error) {
    console.error('Failed to load thread ID:', error);
    return null;
  }
}

/**
 * Save TTS enabled state
 */
export function saveTTSEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.TTS_ENABLED, String(enabled));
  } catch (error) {
    console.error('Failed to save TTS setting:', error);
  }
}

/**
 * Load TTS enabled state
 */
export function loadTTSEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TTS_ENABLED);
    return stored === 'true';
  } catch (error) {
    console.error('Failed to load TTS setting:', error);
    return false;
  }
}

/**
 * Clear all stored chat data
 */
export function clearStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.THREAD_ID);
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}

/**
 * Save conversations list
 */
export function saveConversations(conversations: Conversation[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(
      STORAGE_KEYS.CONVERSATIONS,
      JSON.stringify(conversations)
    );
  } catch (error) {
    console.error('Failed to save conversations:', error);
  }
}

/**
 * Load conversations list
 */
export function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    
    // Convert timestamp strings back to Date objects
    return parsed.map((conv: any) => ({
      ...conv,
      timestamp: new Date(conv.timestamp),
    }));
  } catch (error) {
    console.error('Failed to load conversations:', error);
    return [];
  }
}

/**
 * Delete a specific conversation
 */
export function deleteConversation(conversationId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const conversations = loadConversations();
    const updated = conversations.filter(c => c.id !== conversationId);
    saveConversations(updated);
  } catch (error) {
    console.error('Failed to delete conversation:', error);
  }
}
