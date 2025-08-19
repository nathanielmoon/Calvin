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
    includeCalendarContext: boolean = true
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
      calendarContext
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
        calendarContext
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
    timestamp?: string
  ): Promise<AsyncIterable<string>> {
    let calendarContext: ChatCalendarContext | undefined;

    if (includeCalendarContext) {
      calendarContext = await this.getCalendarContext(accessToken);
    }

    const systemPrompt = this.buildSystemPrompt(calendarContext, timestamp);
    const messages = this.buildConversationMessages(
      systemPrompt,
      conversationHistory,
      message,
      calendarContext
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
    accessToken: string
  ): Promise<ChatCalendarContext> {
    const calendarClient = new GoogleCalendarClient(accessToken);

    try {
      // Calculate yesterday's date range
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [eventsYesterday, eventsToday, upcomingEvents, analytics] =
        await Promise.all([
          calendarClient.getEventsInDateRange(yesterday, todayStart),
          calendarClient.getTodaysEvents(),
          calendarClient.getUpcomingEvents(5),
          calendarClient.generateAnalytics(),
        ]);

      const availability = await calendarClient.getAvailability(new Date());

      return {
        eventsYesterday,
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

  private buildSystemPrompt(
    calendarContext?: ChatCalendarContext,
    timestamp?: string
  ): string {
    const basePrompt = `
${timestamp ? `The current time is ${timestamp}.` : ""}

You are Calvin, an intelligent calendar assistant powered by real-time Google Calendar data. You help users understand their schedule, manage their time, and make informed decisions about their calendar.

Your capabilities include:
- Analyzing calendar patterns and meeting load
- Providing availability insights and scheduling recommendations
- Offering time management advice based on actual calendar data
- Answering questions about upcoming events and schedules
- Identifying meeting patterns and productivity insights

You should produce responses in markdown format with double newlines.

When presenting calendar events in your responses, you can use a special markdown format for better visualization:
\`\`\`event
{
  "summary": "Event Title",
  "start": "Start Time (e.g., 2:00 PM)",
  "end": "End Time (e.g., 3:00 PM)"
}
\`\`\`

This will render as a formatted event component. Use this format when displaying individual events to the user for better readability.

If you are asked to draft one or more emails:
- Draft the emails separately
- Make them concise
- Recommend times for meetings based on the user's availability

Always provide helpful, concise, and actionable responses. Use the real-time calendar data provided to give accurate, personalized advice.
`;

    if (!calendarContext) {
      return (
        basePrompt +
        "\n\nNote: Calendar data is not available for this request."
      );
    }

    const contextSummary = this.buildCalendarContextSummary(calendarContext);
    console.log("CONTEXT SUMMARY", contextSummary);
    return `${basePrompt}

CURRENT CALENDAR CONTEXT (${calendarContext.lastUpdated}):
${contextSummary}

Use this real-time data to provide accurate, personalized responses about the user's schedule and availability.`;
  }

  private buildCalendarContextSummary(context: ChatCalendarContext): string {
    let summary = "";
    const now = new Date();

    // Calculate tomorrow's date range
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Yesterday's events
    if (context.eventsYesterday && context.eventsYesterday.length > 0) {
      summary += `YESTERDAY'S SCHEDULE (${context.eventsYesterday.length} events):\n`;
      context.eventsYesterday.forEach((event) => {
        const eventStartTime = event.start.dateTime
          ? new Date(event.start.dateTime)
          : null;
        const eventEndTime = event.end?.dateTime
          ? new Date(event.end.dateTime)
          : null;

        let timeRange = "All day";
        if (eventStartTime && eventEndTime) {
          const startTime = eventStartTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });
          const endTime = eventEndTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });
          timeRange = `${startTime} - ${endTime}`;
        } else if (eventStartTime) {
          timeRange = eventStartTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });
        }

        summary += `- [DONE] ${timeRange}: ${event.summary}${
          event.location ? ` (${event.location})` : ""
        }\n`;
      });
      summary += "\n";
    }

    // Today's events
    if (context.eventsToday.length > 0) {
      summary += `TODAY'S SCHEDULE (${context.eventsToday.length} events):\n`;
      context.eventsToday.forEach((event) => {
        const eventStartTime = event.start.dateTime
          ? new Date(event.start.dateTime)
          : null;
        const eventEndTime = event.end?.dateTime
          ? new Date(event.end.dateTime)
          : null;

        // Determine if event has passed
        const isPast = eventEndTime
          ? eventEndTime < now
          : eventStartTime && eventStartTime < now;
        const status = isPast ? "[DONE]" : "[PENDING]";

        let timeRange = "All day";
        if (eventStartTime && eventEndTime) {
          const startTime = eventStartTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });
          const endTime = eventEndTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });
          timeRange = `${startTime} - ${endTime}`;
        } else if (eventStartTime) {
          timeRange = eventStartTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });
        }

        summary += `- ${status} ${timeRange}: ${event.summary}${
          event.location ? ` (${event.location})` : ""
        }\n`;
      });
      summary += "\n";
    } else {
      summary += "TODAY: No scheduled events\n\n";
    }

    // Tomorrow's events (filter from upcoming events)
    const tomorrowEvents = context.upcomingEvents.filter((event) => {
      const eventDate = event.start.dateTime
        ? new Date(event.start.dateTime)
        : null;
      return eventDate && eventDate >= tomorrow && eventDate < dayAfterTomorrow;
    });

    if (tomorrowEvents.length > 0) {
      summary += `TOMORROW'S SCHEDULE (${tomorrowEvents.length} events):\n`;
      tomorrowEvents.forEach((event) => {
        const eventStartTime = event.start.dateTime
          ? new Date(event.start.dateTime)
          : null;
        const eventEndTime = event.end?.dateTime
          ? new Date(event.end.dateTime)
          : null;

        let timeRange = "All day";
        if (eventStartTime && eventEndTime) {
          const startTime = eventStartTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });
          const endTime = eventEndTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });
          timeRange = `${startTime} - ${endTime}`;
        } else if (eventStartTime) {
          timeRange = eventStartTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });
        }

        summary += `- [PENDING] ${timeRange}: ${event.summary}${
          event.location ? ` (${event.location})` : ""
        }\n`;
      });
      summary += "\n";
    } else {
      summary += "TOMORROW: No scheduled events\n\n";
    }

    // Remaining upcoming events (after tomorrow)
    const laterEvents = context.upcomingEvents.filter((event) => {
      const eventDate = event.start.dateTime
        ? new Date(event.start.dateTime)
        : null;
      return eventDate && eventDate >= dayAfterTomorrow;
    });

    if (laterEvents.length > 0) {
      summary += `UPCOMING EVENTS (after tomorrow):\n`;
      laterEvents.forEach((event) => {
        const eventStartTime = event.start.dateTime
          ? new Date(event.start.dateTime)
          : null;
        const eventEndTime = event.end?.dateTime
          ? new Date(event.end.dateTime)
          : null;

        // Determine if event has passed (for edge cases where it might be in upcoming but already done)
        const isPast = eventEndTime
          ? eventEndTime < now
          : eventStartTime && eventStartTime < now;
        const status = isPast ? "[DONE]" : "[PENDING]";

        const date = eventStartTime
          ? eventStartTime.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "TBD";

        let timeRange = "All day";
        if (eventStartTime && eventEndTime) {
          const startTime = eventStartTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });
          const endTime = eventEndTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });
          timeRange = `${startTime} - ${endTime}`;
        } else if (eventStartTime) {
          timeRange = eventStartTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });
        }

        summary += `- ${status} ${date} ${timeRange}: ${event.summary}\n`;
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
      summary += `- Today: ${busyHoursToday.toFixed(
        1
      )}h busy, ${freeHoursToday.toFixed(1)}h free\n\n`;
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
    _calendarContext?: ChatCalendarContext
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
    _calendarContext?: ChatCalendarContext
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
        }
      );
    }

    return actions.slice(0, 4); // Limit to 4 suggestions
  }

  private async *createStreamIterator(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
  ): AsyncIterable<string> {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }
}
