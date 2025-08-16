import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  addDays,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Event } from "./CalendarTypes";

interface MonthViewProps {
  currentDate: Date;
  events: Event[];
}

export function MonthView({ currentDate, events }: MonthViewProps) {
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.start, date));
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = addDays(startOfWeek(monthEnd), 6);

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <Card className="flex-1">
      <CardContent className="p-4">
        <div className="grid grid-cols-7 gap-0 border rounded-lg overflow-hidden">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-3 border-b bg-muted/50 text-center text-sm font-medium"
            >
              {day}
            </div>
          ))}
          {weeks.map((week, weekIndex) =>
            week.map((day, dayIndex) => {
              const dayEvents = getEventsForDate(day);
              const isCurrentMonth =
                day.getMonth() === currentDate.getMonth();
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={cn(
                    "min-h-[120px] border-r border-b p-2 last:border-r-0",
                    !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "text-sm mb-2",
                      isToday &&
                        "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center",
                    )}
                  >
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "text-xs p-1 rounded text-white truncate",
                          event.color || "bg-blue-500",
                        )}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            }),
          )}
        </div>
      </CardContent>
    </Card>
  );
}