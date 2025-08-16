"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarAnalytics } from "@/types/calendar";

interface WeeklyStatsProps {
  analytics: CalendarAnalytics;
}

export function WeeklyStats({ analytics }: WeeklyStatsProps) {
  return (
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
            <div className="text-muted-foreground text-xs">Meeting Types:</div>
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
  );
}
