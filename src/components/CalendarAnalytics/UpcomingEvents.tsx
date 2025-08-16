"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import { CalendarEvent } from "@/types/calendar";

interface UpcomingEventsProps {
  events: CalendarEvent[];
  loading: boolean;
}

export function UpcomingEvents({ events, loading }: UpcomingEventsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Upcoming
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-2">
            {events.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="text-xs p-2 rounded border bg-background"
              >
                <div className="font-medium truncate">{event.summary}</div>
                <div className="text-muted-foreground">
                  {event.start.dateTime
                    ? new Date(event.start.dateTime).toLocaleDateString()
                    : event.start.date}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No upcoming events</p>
        )}
      </CardContent>
    </Card>
  );
}
