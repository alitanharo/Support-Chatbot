"use client"

import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import type { Message } from '@/types';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Dise CX  Assistant
            </h2>
            <p className="text-gray-600 mb-6">
              I'm here to help you with the DISE CX Content Management System. 
              You can ask me about documentation, search for media, or just chat.
            </p>
            <div className="text-sm text-gray-500 space-y-2">
              <p>Try asking:</p>
              <ul className="list-disc list-inside text-left">
                
                <li>"Search for media!"</li>
                <li>"What can you help me with cms?"</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
            <TypingIndicator />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
