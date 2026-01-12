/**
 * Chat API Route
 * POST /api/chat
 * Handles chat requests from the frontend and proxies to Foundry
 */

import { NextRequest, NextResponse } from 'next/server';
import { callFoundryAgent } from '@/lib/foundry/client';
import { FOUNDRY_CONFIG } from '@/lib/foundry/config';
import type { ChatRequest, ChatResponse, ErrorResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ChatRequest = await request.json();
    
    // Validate input
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_INPUT',
            message: 'Message is required and must be a string',
          } as ErrorResponse,
        },
        { status: 400 }
      );
    }

    // Trim and check empty
    const message = body.message.trim();
    if (!message) {
      return NextResponse.json(
        {
          error: {
            code: 'EMPTY_MESSAGE',
            message: 'Message cannot be empty',
          } as ErrorResponse,
        },
        { status: 400 }
      );
    }

    // Call Foundry Agent
    const response: ChatResponse = await callFoundryAgent(
      message,
      body.threadId
    );

    // Return successful response
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('Chat API error:', error);

    // Determine error type and message
    let errorCode = 'INTERNAL_ERROR';
    let errorMessage = 'An unexpected error occurred. Please try again.';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // Categorize errors
      if (errorMessage.includes('timeout')) {
        errorCode = 'TIMEOUT';
        errorMessage = 'Request timed out. The assistant may be busy. Please try again.';
        statusCode = 504;
      } else if (errorMessage.includes('Run failed')) {
        errorCode = 'RUN_FAILED';
        errorMessage = 'Assistant execution failed. Please try again.';
        statusCode = 500;
      } else if (errorMessage.includes('environment variable')) {
        errorCode = 'CONFIG_ERROR';
        errorMessage = 'Server configuration error. Please contact support.';
        statusCode = 500;
      } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
        errorCode = 'AUTH_ERROR';
        errorMessage = 'Authentication failed. Please contact support.';
        statusCode = 500;
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorCode = 'NETWORK_ERROR';
        errorMessage = 'Network error. Please check your connection and try again.';
        statusCode = 503;
      }
    }

    // Build error response
    const errorResponse: ErrorResponse = {
      code: errorCode,
      message: errorMessage,
      debug: FOUNDRY_CONFIG.debug ? error instanceof Error ? error.message : String(error) : undefined,
    };

    return NextResponse.json(
      { error: errorResponse },
      { status: statusCode }
    );
  }
}

// OPTIONS handler for CORS (if needed in production)
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200 });
}
