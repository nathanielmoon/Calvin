"use client";

import { useState } from "react";
import { addDays, addWeeks, addMonths, subWeeks, subMonths } from "date-fns";
import type { CalendarView } from "./CalendarTypes";
import { CalendarHeader } from "./CalendarHeader";
import { DayView } from "./DayView";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { sampleEvents } from "./sampleData";

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");

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

  return (
    <div className="flex flex-col h-full">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onNavigate={navigateDate}
        onToday={handleToday}
      />

      <div className="flex-1 p-4">
        {view === "day" && <DayView currentDate={currentDate} events={sampleEvents} />}
        {view === "week" && <WeekView currentDate={currentDate} events={sampleEvents} />}
        {view === "month" && <MonthView currentDate={currentDate} events={sampleEvents} />}
      </div>
    </div>
  );
}
