"use client"

import { MessageSquarePlus, Volume2, VolumeX, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Conversation } from '@/lib/storage';

interface SidebarProps {
  onNewChat: () => void;
  ttsEnabled: boolean;
  onToggleTTS: () => void;
  onClose?: () => void; // For mobile
  isMobile?: boolean;
  conversations?: Conversation[];
  currentThreadId?: string;
  onLoadConversation?: (conversation: Conversation) => void;
  onDeleteConversation?: (conversationId: string) => void;
}

export function Sidebar({
  onNewChat,
  ttsEnabled,
  onToggleTTS,
  onClose,
  isMobile,
  conversations = [],
  currentThreadId,
  onLoadConversation,
  onDeleteConversation,
}: SidebarProps) {
  return (
    <div className="w-64 bg-gray-900 text-white p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">DISE CX </h1>
        {isMobile && onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* New Chat Button */}
      <Button
        onClick={onNewChat}
        className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white"
      >
        <MessageSquarePlus className="h-5 w-5 mr-2" />
        New Chat
      </Button>

      {/* Conversation History */}
      {conversations.length > 0 && (
        <div className="flex-1 overflow-y-auto mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Recent Chats
          </h2>
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  conv.threadId === currentThreadId
                    ? 'bg-blue-600'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
                onClick={() => onLoadConversation?.(conv)}
              >
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-sm font-medium truncate">{conv.title}</p>
                  <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(conv.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation?.(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Settings
        </h2>

        {/* TTS Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            {ttsEnabled ? (
              <Volume2 className="h-5 w-5 text-green-400" />
            ) : (
              <VolumeX className="h-5 w-5 text-gray-400" />
            )}
            <span className="text-sm">Read Aloud</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleTTS}
            className={`${
              ttsEnabled
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-700 hover:bg-gray-600'
            } text-white h-6 px-3`}
          >
            {ttsEnabled ? 'On' : 'Off'}
          </Button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-auto pt-6 text-xs text-gray-400 space-y-2">
        <p>
          Powered by Microsoft Foundry
        </p>
        <p className="text-gray-500">
          Voice + Text Hybrid Mode
        </p>
      </div>
    </div>
  );
}
