"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import {
  CalendarEvent,
  CalendarAnalytics as CalendarAnalyticsType,
} from "@/types/calendar";
import { TodaysSummary } from "./TodaysSummary";
import { TodaysEvents } from "./TodaysEvents";
import { UpcomingEvents } from "./UpcomingEvents";
import { WeeklyStats } from "./WeeklyStats";
import { MeetingHoursChart } from "./MeetingHoursChart";
import { RefreshButton } from "./RefreshButton";
import { cn } from "../../lib/utils";

export default function CalendarAnalytics({
  className,
}: {
  className?: string;
}) {
  const { data: session } = useSession();
  const [todaysEvents, setTodaysEvents] = useState<CalendarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [analytics, setAnalytics] = useState<CalendarAnalyticsType | null>(
    null
  );
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

      // Check for authentication errors and auto-logout
      if (
        todaysResponse.status === 401 ||
        upcomingResponse.status === 401 ||
        analyticsResponse.status === 401
      ) {
        console.log("Authentication failed, signing out user");
        await signOut({ callbackUrl: "/" });
        return;
      }

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
        err instanceof Error ? err.message : "Failed to load calendar data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [session]);

  if (!session) {
    return (
      <div className={cn("p-4", className)}>
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
    <div className="p-4 space-y-8 h-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Calendar Analytics</h2>
        <RefreshButton onRefresh={fetchCalendarData} loading={loading} />
      </div>

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="p-3">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TodaysSummary
          analytics={analytics}
          loading={loading}
          todaysEventsCount={todaysEvents.length}
        />

        <TodaysEvents events={todaysEvents} loading={loading} />

        <UpcomingEvents events={upcomingEvents} loading={loading} />

        {analytics && <WeeklyStats analytics={analytics} />}
      </div>

      <MeetingHoursChart loading={loading} />
    </div>
  );
}
