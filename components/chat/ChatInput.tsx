"use client"

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { speechToText } from '@/lib/voice/speech-to-text';
import { VoiceActivityDetector } from '@/lib/voice/voice-activity-detection';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isVoiceChatMode, setIsVoiceChatMode] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const vadRef = useRef<VoiceActivityDetector | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const message = input.trim();
    if (!message || disabled) return;

    onSendMessage(message);
    setInput('');
    setInterimTranscript('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      // Stop listening
      speechToText.stopListening();
      setIsListening(false);
      setInterimTranscript('');
    } else {
      // Start listening
      if (!speechToText.isSupported()) {
        alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
        return;
      }

      speechToText.startListening({
        onResult: (transcript, isFinal) => {
          if (isFinal) {
            // Final transcript - add to input
            setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
            setInterimTranscript('');
          } else {
            // Interim transcript - show as preview
            setInterimTranscript(transcript);
          }
        },
        onError: (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
          setInterimTranscript('');
          // Don't alert for common errors like no-speech
          if (!error.includes('No speech')) {
            alert(error);
          }
        },
        onStart: () => {
          setIsListening(true);
        },
        onEnd: () => {
          setIsListening(false);
          setInterimTranscript('');
        },
      });
    }
  };

  return (
    <div className="border-t bg-white p-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? 'Listening... Speak now'
                : 'Type a message or use voice input...'
            }
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed max-h-32"
            aria-label="Chat message input"
          />
          
          {/* Interim transcript overlay */}
          {isListening && interimTranscript && (
            <div className="absolute bottom-full left-0 right-0 mb-1 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-600 italic">
              {interimTranscript}
            </div>
          )}

          {/* Voice button inside textarea */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleVoiceInput}
            disabled={disabled}
            className={`absolute right-2 bottom-2 h-8 w-8 ${
              isListening ? 'text-red-600 hover:text-red-700' : 'text-gray-500 hover:text-gray-700'
            }`}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          >
            {isListening ? (
              <MicOff className="h-5 w-5 animate-pulse" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        </div>

        <Button
          type="submit"
          disabled={disabled || (!input.trim() && !isListening)}
          size="icon"
          className="h-12 w-12 shrink-0"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>

      {/* Listening indicator */}
      {isListening && (
        <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-blue-600 rounded-full animate-pulse" />
            <div className="w-1 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-1 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <span>Listening... Speak clearly</span>
        </div>
      )}
    </div>
  );
}
