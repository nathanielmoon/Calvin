"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon } from "lucide-react";
import { CalendarAnalytics } from "@/types/calendar";

interface TodaysSummaryProps {
  analytics: CalendarAnalytics | null;
  loading: boolean;
  todaysEventsCount: number;
}

export function TodaysSummary({ analytics, loading, todaysEventsCount }: TodaysSummaryProps) {
  return (
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
              <span className="font-medium">{todaysEventsCount}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No data available</p>
        )}
      </CardContent>
    </Card>
  );
}