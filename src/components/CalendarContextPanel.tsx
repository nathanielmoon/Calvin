"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarIcon,
  Clock,
  Users,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { CalendarEvent, CalendarAnalytics } from "@/types/calendar";
import { cn } from "@/lib/utils";

export default function CalendarContextPanel() {
  const { data: session } = useSession();
  const [todaysEvents, setTodaysEvents] = useState<CalendarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [analytics, setAnalytics] = useState<CalendarAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarData = async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const [todaysResponse, upcomingResponse, analyticsResponse] =
        await Promise.all([
          fetch("/api/calendar/events?preset=today"),
          fetch("/api/calendar/events?preset=upcoming&count=5"),
          fetch("/api/calendar/analytics?preset=today"),
        ]);

      if (!todaysResponse.ok || !upcomingResponse.ok || !analyticsResponse.ok) {
        throw new Error("Failed to fetch calendar data");
      }

      const [todaysData, upcomingData, analyticsData] = await Promise.all([
        todaysResponse.json(),
        upcomingResponse.json(),
        analyticsResponse.json(),
      ]);

      setTodaysEvents(todaysData.events || []);
      setUpcomingEvents(upcomingData.events || []);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load calendar data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [session]);

  const formatTime = (
    dateTimeString: string | undefined,
    dateString: string | undefined,
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

  if (!session) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Sign in to view your calendar
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchCalendarData}
          disabled={loading}
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="p-3">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Today's Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Today&apos;s Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : analytics ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Busy:</span>
                <span className="font-medium">
                  {analytics.busyHoursToday.toFixed(1)}h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Free:</span>
                <span className="font-medium">
                  {analytics.freeHoursToday.toFixed(1)}h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Events:</span>
                <span className="font-medium">{todaysEvents.length}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No data available</p>
          )}
        </CardContent>
      </Card>

      {/* Today's Events */}
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
          ) : todaysEvents.length > 0 ? (
            <div className="space-y-2">
              {todaysEvents.slice(0, 5).map((event) => (
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

      {/* Upcoming Events */}
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
          ) : upcomingEvents.length > 0 ? (
            <div className="space-y-2">
              {upcomingEvents.slice(0, 3).map((event) => (
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

      {/* Meeting Stats */}
      {analytics && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">This Week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total meetings:</span>
              <span className="font-medium">{analytics.totalEvents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Meeting hours:</span>
              <span className="font-medium">
                {analytics.totalMeetingHours.toFixed(1)}h
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg. length:</span>
              <span className="font-medium">
                {analytics.averageMeetingLength.toFixed(0)}m
              </span>
            </div>

            {analytics.meetingTypes && (
              <div className="mt-3 space-y-1">
                <div className="text-muted-foreground text-xs">
                  Meeting Types:
                </div>
                <div className="flex flex-wrap gap-1">
                  {analytics.meetingTypes.virtual > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      Virtual {analytics.meetingTypes.virtual}
                    </Badge>
                  )}
                  {analytics.meetingTypes.inPerson > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      In-person {analytics.meetingTypes.inPerson}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
