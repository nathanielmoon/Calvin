"use client";

import { useState } from "react";
import { addDays, addWeeks, addMonths, subWeeks, subMonths } from "date-fns";
import type { CalendarView } from "./CalendarTypes";
import { CalendarHeader } from "./CalendarHeader";
import { DayView } from "./DayView";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { Skeleton } from "../ui/skeleton";

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const { events, loading, error, refetch } = useCalendarEvents(
    currentDate,
    view
  );

  const navigateDate = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      switch (view) {
        case "day":
          return direction === "next" ? addDays(prev, 1) : addDays(prev, -1);
        case "week":
          return direction === "next" ? addWeeks(prev, 1) : subWeeks(prev, 1);
        case "month":
          return direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1);
        default:
          return prev;
      }
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <CalendarHeader
          currentDate={currentDate}
          view={view}
          onViewChange={setView}
          onNavigate={navigateDate}
          onToday={handleToday}
        />
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">
              Error loading calendar events: {error}
            </p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onNavigate={navigateDate}
        onToday={handleToday}
      />

      <div className="flex-1 p-4 h-full w-full overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <>
            {view === "day" && (
              <DayView currentDate={currentDate} events={events} />
            )}
            {view === "week" && (
              <WeekView currentDate={currentDate} events={events} />
            )}
            {view === "month" && (
              <MonthView currentDate={currentDate} events={events} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
