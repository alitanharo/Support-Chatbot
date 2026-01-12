"use client"

import { useState } from 'react';
import { ChevronDown, ChevronUp, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DebugInfo } from '@/types';

interface DebugPanelProps {
  debugInfo: DebugInfo | null;
}

export function DebugPanel({ debugInfo }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!debugInfo) return null;

  return (
    <div className="border-t bg-gray-50">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm"
      >
        <div className="flex items-center gap-2">
          <Bug className="h-4 w-4 text-gray-500" />
          <span className="text-gray-700 font-medium">Debug Information</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </Button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-2 text-sm font-mono">
          {debugInfo.threadId && (
            <div>
              <span className="text-gray-600">Thread ID:</span>{' '}
              <span className="text-gray-900">{debugInfo.threadId}</span>
            </div>
          )}
          
          {debugInfo.runId && (
            <div>
              <span className="text-gray-600">Run ID:</span>{' '}
              <span className="text-gray-900">{debugInfo.runId}</span>
            </div>
          )}
          
          {debugInfo.status && (
            <div>
              <span className="text-gray-600">Status:</span>{' '}
              <span className={`font-semibold ${
                debugInfo.status === 'completed' ? 'text-green-600' : 'text-gray-900'
              }`}>
                {debugInfo.status}
              </span>
            </div>
          )}
          
          {debugInfo.duration && (
            <div>
              <span className="text-gray-600">Duration:</span>{' '}
              <span className="text-gray-900">{debugInfo.duration}</span>
            </div>
          )}
          
          {debugInfo.error && (
            <div>
              <span className="text-red-600">Error:</span>{' '}
              <span className="text-red-900">{debugInfo.error}</span>
            </div>
          )}
          
          <div className="text-xs text-gray-500 pt-2">
            Last updated: {new Date(debugInfo.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
