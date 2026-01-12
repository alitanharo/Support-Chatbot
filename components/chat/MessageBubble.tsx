"use client"

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/utils';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div
      className={`flex w-full mb-4 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[80%] md:max-w-[70%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-white border border-gray-200 text-gray-900'
        }`}
      >
        {/* Message content */}
        <div className="break-words">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                  code: ({ node, inline, ...props }: any) =>
                    inline ? (
                      <code
                        className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono"
                        {...props}
                      />
                    ) : (
                      <code
                        className="block bg-gray-100 p-2 rounded text-sm font-mono overflow-x-auto"
                        {...props}
                      />
                    ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer with timestamp and copy button */}
        <div
          className={`flex items-center justify-between mt-2 text-xs ${
            isUser ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          <span>{formatTime(message.timestamp)}</span>
          
          {!isUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 px-2 hover:bg-gray-100"
              aria-label="Copy message"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
