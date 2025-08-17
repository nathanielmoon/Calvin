import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { CalendarAIService } from "@/lib/ai-service";
import {
  chatApiRateLimiter,
  createRateLimitResponse,
} from "@/lib/rate-limiter";
import { ChatResponse } from "@/types/chat";
import { z } from "zod";

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().optional(),
  includeCalendarContext: z.boolean().optional().default(true),
  timestamp: z.string().optional(),
  conversationHistory: z
    .array(
      z.object({
        id: z.string(),
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
        timestamp: z.string(),
        metadata: z
          .object({
            calendarContext: z.any().optional(),
            suggestedActions: z.any().optional(),
            processingTime: z.number().optional(),
          })
          .optional(),
      })
    )
    .optional()
    .default([]),
  contextPreferences: z
    .object({
      includeToday: z.boolean().optional().default(true),
      includeUpcoming: z.boolean().optional().default(true),
      includeAnalytics: z.boolean().optional().default(true),
      includeAvailability: z.boolean().optional().default(true),
      maxEvents: z.number().min(1).max(50).optional().default(10),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in with Google" },
        { status: 401 }
      );
    }

    // Rate limiting
    const userIdentifier = session.user?.email || "anonymous";
    const rateLimitResult = chatApiRateLimiter.isAllowed(userIdentifier);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        createRateLimitResponse(rateLimitResult.resetTime!),
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimitResult.resetTime! - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedRequest = ChatRequestSchema.parse(body);

    console.log("Timestamp", validatedRequest.timestamp);

    // Initialize AI service
    const aiService = new CalendarAIService();

    // Process the message with calendar context
    const result = await aiService.processMessage(
      validatedRequest.message,
      session.accessToken,
      validatedRequest.conversationHistory,
      validatedRequest.includeCalendarContext
    );

    const processingTime = Date.now() - startTime;

    // Build response
    const response: ChatResponse = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: result.response,
      timestamp: new Date().toISOString(),
      calendarContext: result.calendarContext,
      suggestedActions: result.suggestedActions,
      processingTime,
      metadata: {
        model: "gpt-4-turbo-preview",
        contextLength: validatedRequest.conversationHistory.length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request format",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("invalid_grant")) {
      return NextResponse.json(
        { error: "Authentication expired - Please sign in again" },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message.includes("OpenAI")) {
      return NextResponse.json(
        { error: "AI service temporarily unavailable" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
