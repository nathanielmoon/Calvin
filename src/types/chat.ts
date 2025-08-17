import {
  CalendarEvent,
  CalendarAnalytics,
  CalendarAvailability,
} from "./calendar";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  metadata?: {
    calendarContext?: ChatCalendarContext;
    suggestedActions?: SuggestedAction[];
    processingTime?: number;
  };
}

export interface ChatCalendarContext {
  eventsYesterday?: CalendarEvent[];
  eventsToday: CalendarEvent[];
  upcomingEvents: CalendarEvent[];
  analytics?: CalendarAnalytics;
  availability?: CalendarAvailability;
  lastUpdated: string;
}

export interface SuggestedAction {
  id: string;
  type: "calendar_query" | "scheduling" | "analytics" | "availability";
  label: string;
  description?: string;
  action: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  includeCalendarContext?: boolean;
  contextPreferences?: {
    includeToday?: boolean;
    includeUpcoming?: boolean;
    includeAnalytics?: boolean;
    includeAvailability?: boolean;
    maxEvents?: number;
  };
}

export interface ChatResponse {
  id: string;
  message: string;
  timestamp: string;
  calendarContext?: ChatCalendarContext;
  suggestedActions?: SuggestedAction[];
  processingTime: number;
  metadata?: {
    model: string;
    tokensUsed?: number;
    contextLength?: number;
  };
}

export interface ChatStreamChunk {
  id: string;
  type: "content" | "context" | "actions" | "done";
  content?: string;
  calendarContext?: ChatCalendarContext;
  suggestedActions?: SuggestedAction[];
  metadata?: {
    processingTime?: number;
    model?: string;
  };
}

export interface ConversationContext {
  userId: string;
  sessionId: string;
  messages: ChatMessage[];
  calendarContext?: ChatCalendarContext;
  lastActivity: string;
}
