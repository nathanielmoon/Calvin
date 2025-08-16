import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { CalendarAIService } from "@/lib/ai-service";
import {
  chatApiRateLimiter,
  createRateLimitResponse,
} from "@/lib/rate-limiter";
import { ChatStreamChunk } from "@/types/chat";
import { z } from "zod";

const StreamRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().optional(),
  includeCalendarContext: z.boolean().optional().default(true),
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
      }),
    )
    .optional()
    .default([]),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const session = await auth();

    if (!session?.accessToken) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Please sign in with Google" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Rate limiting
    const userIdentifier = session.user?.email || "anonymous";
    const rateLimitResult = chatApiRateLimiter.isAllowed(userIdentifier);

    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify(createRateLimitResponse(rateLimitResult.resetTime!)),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil(
              (rateLimitResult.resetTime! - Date.now()) / 1000,
            ).toString(),
          },
        },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedRequest = StreamRequestSchema.parse(body);

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // Initialize AI service
          const aiService = new CalendarAIService();

          // Send initial context chunk if calendar context is requested
          if (validatedRequest.includeCalendarContext) {
            const contextChunk: ChatStreamChunk = {
              id: messageId,
              type: "context",
              content: "Fetching calendar context...",
            };

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(contextChunk)}\n\n`),
            );
          }

          // Get streaming response from AI
          const streamIterator = await aiService.streamMessage(
            validatedRequest.message,
            session.accessToken!,
            validatedRequest.conversationHistory,
            validatedRequest.includeCalendarContext,
          );

          // Stream AI response chunks
          for await (const chunk of streamIterator) {
            const streamChunk: ChatStreamChunk = {
              id: messageId,
              type: "content",
              content: chunk,
            };

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(streamChunk)}\n\n`),
            );
          }

          // Send final chunk with metadata
          const processingTime = Date.now() - startTime;
          const doneChunk: ChatStreamChunk = {
            id: messageId,
            type: "done",
            metadata: {
              processingTime,
              model: "gpt-4-turbo-preview",
            },
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(doneChunk)}\n\n`),
          );

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);

          const errorChunk: ChatStreamChunk = {
            id: `error_${Date.now()}`,
            type: "content",
            content:
              "I apologize, but I encountered an error processing your message. Please try again.",
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorChunk)}\n\n`),
          );

          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Stream API error:", error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Invalid request format",
          details: error.issues,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({ error: "Failed to process streaming chat message" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
