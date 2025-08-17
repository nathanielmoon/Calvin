"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { format, subWeeks, startOfWeek, endOfWeek, parseISO } from "date-fns";
import { Skeleton } from "../ui/skeleton";

interface WeeklyMeetingHours {
  weekStart: string;
  weekEnd: string;
  hours: number;
  displayLabel: string;
}

interface MeetingHoursChartProps {
  loading?: boolean;
}

export function MeetingHoursChart({ loading }: MeetingHoursChartProps) {
  const { data: session } = useSession();
  const [chartData, setChartData] = useState<WeeklyMeetingHours[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  const fetchMeetingHoursData = async () => {
    if (!session?.accessToken) return;

    setChartLoading(true);
    try {
      // Get data for the past 4 weeks
      const endDate = new Date();
      const startDate = subWeeks(endDate, 4);

      console.log("Start date:", startDate.toISOString());
      console.log("End date:", endDate.toISOString());

      // Process the meetingsByDay data and combine it with events to calculate hours per week
      const params = new URLSearchParams({
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        maxResults: "250",
      });
      const eventsResponse = await fetch(
        `/api/calendar/events?${params.toString()}`
      );

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        console.log("Events response:", {...eventsData});
        const events = eventsData.events ?? [];

        // Group events by week and calculate hours
        const hoursByWeek: Record<string, number> = {};

        events.forEach(
          (event: {
            start: { dateTime?: string };
            end: { dateTime?: string };
          }) => {
            if (event.start.dateTime && event.end.dateTime) {
              const start = new Date(event.start.dateTime);
              const end = new Date(event.end.dateTime);
              const weekStart = startOfWeek(start, { weekStartsOn: 0 }); // Sunday as start of week
              const weekKey = format(weekStart, "yyyy-MM-dd");
              const duration =
                (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours

              hoursByWeek[weekKey] = (hoursByWeek[weekKey] || 0) + duration;
            }
          }
        );

        // Create chart data for the past 4 weeks
        const chartData: WeeklyMeetingHours[] = [];
        for (let i = 3; i >= 0; i--) {
          const weekEnd = subWeeks(endDate, i);
          const weekStart = startOfWeek(weekEnd, { weekStartsOn: 0 });
          const weekEndDate = endOfWeek(weekEnd, { weekStartsOn: 0 });
          const weekKey = format(weekStart, "yyyy-MM-dd");
          const hours = hoursByWeek[weekKey] || 0;

          chartData.push({
            weekStart: weekKey,
            weekEnd: format(weekEndDate, "yyyy-MM-dd"),
            hours: Math.round(hours * 10) / 10, // Round to 1 decimal place
            displayLabel: `${format(weekStart, "MMM d")}`,
          });
        }

        setChartData(chartData);
      }
    } catch (error) {
      console.error("Error fetching meeting hours data:", error);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingHoursData();
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  const chartConfig = {
    hours: {
      label: "Meeting Hours",
      color: "hsl(var(--primary))",
    },
  };

  if (!session) {
    return null;
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Weekly Meeting Hours</CardTitle>
        <p className="text-xs text-muted-foreground">
          Total meeting hours per week for the past 4 weeks
        </p>
      </CardHeader>
      <CardContent>
        {loading || chartLoading ? (
          <div className="h-[200px] flex items-center justify-center">
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="displayLabel"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: "Hours",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 12 },
                  }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`${value}h`, "Total Hours"]}
                      labelFormatter={(label) => {
                        const dataPoint = chartData.find(
                          (d) => d.displayLabel === label
                        );
                        return dataPoint
                          ? `${format(
                              parseISO(dataPoint.weekStart),
                              "MMM d"
                            )} - ${format(
                              parseISO(dataPoint.weekEnd),
                              "MMM d, yyyy"
                            )}`
                          : label;
                      }}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{
                    fill: "var(--color-primary)",
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                    stroke: "var(--color-primary)",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
