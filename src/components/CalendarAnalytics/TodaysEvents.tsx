"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Users } from "lucide-react";
import { CalendarEvent } from "@/types/calendar";

interface TodaysEventsProps {
  events: CalendarEvent[];
  loading: boolean;
}

export function TodaysEvents({ events, loading }: TodaysEventsProps) {
  const formatTime = (
    dateTimeString: string | undefined,
    dateString: string | undefined
  ) => {
    if (dateTimeString) {
      return new Date(dateTimeString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (dateString) {
      return "All day";
    }
    return "";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Today&apos;s Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-2">
            {events.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="text-xs p-2 rounded border bg-background"
              >
                <div className="font-medium truncate">{event.summary}</div>
                <div className="text-muted-foreground">
                  {formatTime(event.start.dateTime, event.start.date)}
                </div>
                {event.attendees && event.attendees.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="h-3 w-3" />
                    <span>{event.attendees.length}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No events today</p>
        )}
      </CardContent>
    </Card>
  );
}
