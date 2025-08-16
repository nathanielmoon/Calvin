import OpenAI from "openai";
import { GoogleCalendarClient } from "./google-calendar";
import {
  ChatCalendarContext,
  SuggestedAction,
  ChatMessage,
} from "@/types/chat";

export class CalendarAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async processMessage(
    message: string,
    accessToken: string,
    conversationHistory: ChatMessage[] = [],
    includeCalendarContext: boolean = true,
  ): Promise<{
    response: string;
    calendarContext?: ChatCalendarContext;
    suggestedActions?: SuggestedAction[];
  }> {
    let calendarContext: ChatCalendarContext | undefined;

    // Fetch fresh calendar context if requested
    if (includeCalendarContext) {
      calendarContext = await this.getCalendarContext(accessToken);
    }

    // Build conversation context with calendar data
    const systemPrompt = this.buildSystemPrompt(calendarContext);
    const messages = this.buildConversationMessages(
      systemPrompt,
      conversationHistory,
      message,
      calendarContext,
    );

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
      });

      const response =
        completion.choices[0]?.message?.content ||
        "I apologize, but I encountered an error processing your message.";
      const suggestedActions = this.generateSuggestedActions(
        message,
        calendarContext,
      );

      return {
        response,
        calendarContext,
        suggestedActions,
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to process message with AI");
    }
  }

  async streamMessage(
    message: string,
    accessToken: string,
    conversationHistory: ChatMessage[] = [],
    includeCalendarContext: boolean = true,
  ): Promise<AsyncIterable<string>> {
    let calendarContext: ChatCalendarContext | undefined;

    if (includeCalendarContext) {
      calendarContext = await this.getCalendarContext(accessToken);
    }

    const systemPrompt = this.buildSystemPrompt(calendarContext);
    const messages = this.buildConversationMessages(
      systemPrompt,
      conversationHistory,
      message,
      calendarContext,
    );

    try {
      const stream = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      });

      return this.createStreamIterator(stream);
    } catch (error) {
      console.error("OpenAI streaming error:", error);
      throw new Error("Failed to stream message with AI");
    }
  }

  private async getCalendarContext(
    accessToken: string,
  ): Promise<ChatCalendarContext> {
    const calendarClient = new GoogleCalendarClient(accessToken);

    try {
      const [eventsToday, upcomingEvents, analytics] = await Promise.all([
        calendarClient.getTodaysEvents(),
        calendarClient.getUpcomingEvents(5),
        calendarClient.generateAnalytics(),
      ]);

      const availability = await calendarClient.getAvailability(new Date());

      return {
        eventsToday,
        upcomingEvents,
        analytics,
        availability,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error fetching calendar context:", error);
      // Return minimal context on error
      return {
        eventsToday: [],
        upcomingEvents: [],
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  private buildSystemPrompt(calendarContext?: ChatCalendarContext): string {
    const basePrompt = `You are Calvin, an intelligent calendar assistant powered by real-time Google Calendar data. You help users understand their schedule, manage their time, and make informed decisions about their calendar.

Your capabilities include:
- Analyzing calendar patterns and meeting load
- Providing availability insights and scheduling recommendations
- Offering time management advice based on actual calendar data
- Answering questions about upcoming events and schedules
- Identifying meeting patterns and productivity insights

Always provide helpful, concise, and actionable responses. Use the real-time calendar data provided to give accurate, personalized advice.`;

    if (!calendarContext) {
      return (
        basePrompt +
        "\n\nNote: Calendar data is not available for this request."
      );
    }

    const contextSummary = this.buildCalendarContextSummary(calendarContext);
    return `${basePrompt}

CURRENT CALENDAR CONTEXT (${calendarContext.lastUpdated}):
${contextSummary}

Use this real-time data to provide accurate, personalized responses about the user's schedule and availability.`;
  }

  private buildCalendarContextSummary(context: ChatCalendarContext): string {
    let summary = "";

    // Today's events
    if (context.eventsToday.length > 0) {
      summary += `TODAY'S SCHEDULE (${context.eventsToday.length} events):\n`;
      context.eventsToday.forEach((event) => {
        const time = event.start.dateTime
          ? new Date(event.start.dateTime).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })
          : "All day";
        summary += `- ${time}: ${event.summary}${event.location ? ` (${event.location})` : ""}\n`;
      });
      summary += "\n";
    } else {
      summary += "TODAY: No scheduled events\n\n";
    }

    // Upcoming events
    if (context.upcomingEvents.length > 0) {
      summary += `UPCOMING EVENTS (next ${context.upcomingEvents.length}):\n`;
      context.upcomingEvents.forEach((event) => {
        const date = event.start.dateTime
          ? new Date(event.start.dateTime).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "TBD";
        const time = event.start.dateTime
          ? new Date(event.start.dateTime).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })
          : "All day";
        summary += `- ${date} ${time}: ${event.summary}\n`;
      });
      summary += "\n";
    }

    // Analytics
    if (context.analytics) {
      const { totalEvents, totalMeetingHours, busyHoursToday, freeHoursToday } =
        context.analytics;
      summary += `WEEKLY SUMMARY:\n`;
      summary += `- Total meetings this week: ${totalEvents}\n`;
      summary += `- Total meeting hours: ${totalMeetingHours.toFixed(1)}h\n`;
      summary += `- Today: ${busyHoursToday.toFixed(1)}h busy, ${freeHoursToday.toFixed(1)}h free\n\n`;
    }

    // Availability
    if (context.availability) {
      const { totalFreeTime, totalBusyTime } = context.availability;
      summary += `TODAY'S AVAILABILITY:\n`;
      summary += `- Free time: ${(totalFreeTime / 60).toFixed(1)}h\n`;
      summary += `- Busy time: ${(totalBusyTime / 60).toFixed(1)}h\n`;

      if (context.availability.freeSlots.length > 0) {
        summary += `- Next free slots: ${context.availability.freeSlots
          .slice(0, 3)
          .map((slot) => {
            const start = new Date(slot.start).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            });
            const end = new Date(slot.end).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            });
            return `${start}-${end}`;
          })
          .join(", ")}\n`;
      }
    }

    return summary;
  }

  private buildConversationMessages(
    systemPrompt: string,
    conversationHistory: ChatMessage[],
    currentMessage: string,
    _calendarContext?: ChatCalendarContext,
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add recent conversation history (last 10 messages to stay within token limits)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach((msg) => {
      if (msg.role !== "system") {
        messages.push({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        });
      }
    });

    // Add current message
    messages.push({ role: "user", content: currentMessage });

    return messages;
  }

  private generateSuggestedActions(
    message: string,
    _calendarContext?: ChatCalendarContext,
  ): SuggestedAction[] {
    const actions: SuggestedAction[] = [];
    const lowerMessage = message.toLowerCase();

    // Suggest calendar-related actions based on message content and context
    if (
      lowerMessage.includes("free") ||
      lowerMessage.includes("available") ||
      lowerMessage.includes("schedule")
    ) {
      actions.push({
        id: "check-availability",
        type: "availability",
        label: "Check detailed availability",
        description: "View your free time slots for scheduling",
        action: "What are my available time slots for the rest of the week?",
      });
    }

    if (
      lowerMessage.includes("meeting") ||
      lowerMessage.includes("busy") ||
      lowerMessage.includes("analytics")
    ) {
      actions.push({
        id: "meeting-analytics",
        type: "analytics",
        label: "Meeting analytics",
        description: "Get insights on your meeting patterns",
        action: "Show me my meeting analytics and patterns",
      });
    }

    if (lowerMessage.includes("today") || lowerMessage.includes("schedule")) {
      actions.push({
        id: "todays-schedule",
        type: "calendar_query",
        label: "Today's schedule",
        description: "View your complete schedule for today",
        action: "What does my schedule look like today?",
      });
    }

    if (
      lowerMessage.includes("tomorrow") ||
      lowerMessage.includes("next") ||
      lowerMessage.includes("upcoming")
    ) {
      actions.push({
        id: "upcoming-events",
        type: "calendar_query",
        label: "Upcoming events",
        description: "See your next scheduled events",
        action: "What are my upcoming events?",
      });
    }

    // Add general helpful actions if no specific ones were triggered
    if (actions.length === 0) {
      actions.push(
        {
          id: "schedule-overview",
          type: "calendar_query",
          label: "Schedule overview",
          action: "Give me an overview of my schedule",
        },
        {
          id: "find-meeting-time",
          type: "scheduling",
          label: "Find meeting time",
          action: "When would be a good time for a 1-hour meeting this week?",
        },
      );
    }

    return actions.slice(0, 4); // Limit to 4 suggestions
  }

  private async *createStreamIterator(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
  ): AsyncIterable<string> {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }
}
