"use client"

import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Sidebar } from '@/components/layout/Sidebar';
import { DebugPanel } from '@/components/layout/DebugPanel';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { textToSpeech } from '@/lib/voice/text-to-speech';
import { generateId } from '@/lib/utils';
import {
  saveMessages,
  loadMessages,
  saveThreadId,
  loadThreadId,
  saveTTSEnabled,
  loadTTSEnabled,
  clearStorage,
  saveConversations,
  loadConversations,
  deleteConversation,
  type Conversation,
} from '@/lib/storage';
import type { Message, ChatResponse, DebugInfo } from '@/types';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { toast } = useToast();

  // Load persisted data on mount
  useEffect(() => {
    const savedMessages = loadMessages();
    const savedThreadId = loadThreadId();
    const savedTTS = loadTTSEnabled();
    const savedConversations = loadConversations();

    if (savedMessages.length > 0) {
      setMessages(savedMessages);
    }
    if (savedThreadId) {
      setThreadId(savedThreadId);
    }
    setTtsEnabled(savedTTS);
    setConversations(savedConversations);
  }, []);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages]);

  // Save thread ID whenever it changes
  useEffect(() => {
    if (threadId) {
      saveThreadId(threadId);
    }
  }, [threadId]);

  // Save conversation after messages update
  useEffect(() => {
    if (messages.length >= 2 && threadId) {
      // Get first user message as title
      const firstUserMsg = messages.find(m => m.role === 'user');
      const lastMsg = messages[messages.length - 1];
      
      if (firstUserMsg && lastMsg) {
        const title = firstUserMsg.content.slice(0, 50) + (firstUserMsg.content.length > 50 ? '...' : '');
        const lastMessage = lastMsg.content.slice(0, 100) + (lastMsg.content.length > 100 ? '...' : '');
        
        const existingConvs = loadConversations();
        const existingIndex = existingConvs.findIndex(c => c.threadId === threadId);
        
        const conversation: Conversation = {
          id: threadId,
          threadId,
          title,
          lastMessage,
          timestamp: new Date(),
          messageCount: messages.length,
        };
        
        let updatedConvs: Conversation[];
        if (existingIndex >= 0) {
          updatedConvs = [...existingConvs];
          updatedConvs[existingIndex] = conversation;
        } else {
          updatedConvs = [conversation, ...existingConvs];
        }
        
        saveConversations(updatedConvs);
        setConversations(updatedConvs);
      }
    }
  }, [messages, threadId]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call backend API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          threadId,
        }),
      });

      const data: ChatResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get response');
      }

      // Update thread ID if new
      if (data.threadId && data.threadId !== threadId) {
        setThreadId(data.threadId);
      }

      // Update debug info
      if (data.debug) {
        setDebugInfo(data.debug);
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Speak response if TTS is enabled
      if (ttsEnabled && textToSpeech.isSupported()) {
        textToSpeech.speak(data.text, {
          onError: (error) => {
            console.error('TTS error:', error);
          },
        });
      }

      // Show success toast
      toast({
        title: 'Response received',
        description: 'The assistant has responded.',
      });
    } catch (error) {
      console.error('Chat error:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });

      // Update debug info with error
      setDebugInfo({
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    if (
      messages.length > 0 &&
      !confirm('Start a new conversation? Current chat will be saved.')
    ) {
      return;
    }

    setMessages([]);
    setThreadId(null);
    setDebugInfo(null);
    clearStorage();
    textToSpeech.stop();

    toast({
      title: 'New chat started',
      description: 'Previous conversation has been saved.',
    });
  };

  const handleToggleTTS = () => {
    const newValue = !ttsEnabled;
    setTtsEnabled(newValue);
    saveTTSEnabled(newValue);

    if (!newValue) {
      textToSpeech.stop();
    }

    toast({
      title: newValue ? 'Read Aloud Enabled' : 'Read Aloud Disabled',
      description: newValue
        ? 'Assistant messages will be read aloud.'
        : 'Assistant messages will not be read aloud.',
    });
  };

  const handleLoadConversation = (conversation: Conversation) => {
    // Load the conversation's messages
    // Note: In a real app, you'd fetch messages by thread ID
    // For now, we'll just clear and set the thread ID
    setMessages([]);
    setThreadId(conversation.threadId);
    clearStorage();
    saveThreadId(conversation.threadId);
    
    toast({
      title: 'Conversation loaded',
      description: `Loaded: ${conversation.title}`,
    });
  };

  const handleDeleteConversation = (conversationId: string) => {
    if (!confirm('Delete this conversation? This cannot be undone.')) {
      return;
    }

    deleteConversation(conversationId);
    const updated = loadConversations();
    setConversations(updated);

    // If we're currently viewing the deleted conversation, start new chat
    if (threadId === conversationId) {
      setMessages([]);
      setThreadId(null);
      clearStorage();
    }

    toast({
      title: 'Conversation deleted',
      description: 'The conversation has been removed.',
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar
          onNewChat={handleNewChat}
          ttsEnabled={ttsEnabled}
          onToggleTTS={handleToggleTTS}
          conversations={conversations}
          currentThreadId={threadId || undefined}
          onLoadConversation={handleLoadConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>

      {/* Sidebar - Mobile (Overlay) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0">
            <Sidebar
              onNewChat={() => {
                handleNewChat();
                setSidebarOpen(false);
              }}
              ttsEnabled={ttsEnabled}
              onToggleTTS={handleToggleTTS}
              conversations={conversations}
              currentThreadId={threadId || undefined}
              onLoadConversation={(conv) => {
                handleLoadConversation(conv);
                setSidebarOpen(false);
              }}
              onDeleteConversation={handleDeleteConversation}
              onClose={() => setSidebarOpen(false)}
              isMobile
            />
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Dise CX Assistant
              </h1>
              <p className="text-xs text-gray-500">
                {threadId ? `Thread: ${threadId.slice(0, 12)}...` : 'New conversation'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
              }`}
              title={isLoading ? 'Processing...' : 'Connected'}
            />
            <span className="text-xs text-gray-500">
              {isLoading ? 'Processing' : 'Connected'}
            </span>
          </div>
        </div>

        {/* Messages */}
        <MessageList messages={messages} isLoading={isLoading} />

        {/* Debug Panel */}
        <DebugPanel debugInfo={debugInfo} />

        {/* Input */}
        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
