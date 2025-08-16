import { useState, useEffect, useCallback } from "react";
import { Event } from "@/components/CalendarView/CalendarTypes";
import { CalendarEvent } from "@/types/calendar";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

interface UseCalendarEventsResult {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCalendarEvents(
  currentDate: Date,
  view: "day" | "week" | "month",
): UseCalendarEventsResult {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let startDate: Date;
      let endDate: Date;

      // Calculate date range based on view
      switch (view) {
        case "day":
          startDate = startOfDay(currentDate);
          endDate = endOfDay(currentDate);
          break;
        case "week":
          startDate = startOfWeek(currentDate);
          endDate = endOfWeek(currentDate);
          break;
        case "month":
          startDate = startOfMonth(currentDate);
          endDate = endOfMonth(currentDate);
          break;
      }

      const params = new URLSearchParams({
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        maxResults: "250",
      });

      const response = await fetch(`/api/calendar/events?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform CalendarEvent to Event format
      const transformedEvents: Event[] = data.events.map(
        (event: CalendarEvent) => ({
          id: event.id,
          title: event.summary,
          start: event.start.dateTime
            ? new Date(event.start.dateTime)
            : new Date(event.start.date || ""),
          end: event.end.dateTime
            ? new Date(event.end.dateTime)
            : new Date(event.end.date || ""),
          color: getEventColor(event),
        }),
      );

      setEvents(transformedEvents);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch calendar events",
      );
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentDate, view]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
  };
}

// Simple color assignment based on event properties
function getEventColor(event: CalendarEvent): string {
  // You can customize this logic based on your needs
  if (event.attendees && event.attendees.length > 5) {
    return "bg-purple-500"; // Large meetings
  }
  if (event.location && event.location.toLowerCase().includes("room")) {
    return "bg-green-500"; // In-person meetings
  }
  if (event.hangoutLink || event.conferenceData) {
    return "bg-blue-500"; // Virtual meetings
  }
  return "bg-gray-500"; // Default
}
