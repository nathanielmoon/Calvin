import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Event } from "./CalendarTypes";

interface WeekViewProps {
  currentDate: Date;
  events: Event[];
}

export function WeekView({ currentDate, events }: WeekViewProps) {
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.start, date));
  };

  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <Card className="flex-1">
      <CardContent className="p-4">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-0 min-h-[600px]">
          <div className="border-r">
            <div className="h-12 border-b" />
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-12 border-b text-xs text-muted-foreground p-1"
              >
                {hour === 0
                  ? "12 AM"
                  : hour < 12
                  ? `${hour} AM`
                  : hour === 12
                  ? "12 PM"
                  : `${hour - 12} PM`}
              </div>
            ))}
          </div>
          {weekDays.map((day, dayIndex) => (
            <div key={dayIndex} className="border-r last:border-r-0">
              <div className="h-12 border-b p-2 text-center">
                <div className="text-xs text-muted-foreground">
                  {format(day, "EEE")}
                </div>
                <div
                  className={cn(
                    "text-sm font-medium",
                    isSameDay(day, new Date()) &&
                      "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mx-auto"
                  )}
                >
                  {format(day, "d")}
                </div>
              </div>
              <div className="relative">
                {hours.map((hour) => (
                  <div key={hour} className="h-12 border-b border-border/50" />
                ))}
                {getEventsForDate(day).map((event) => {
                  const startHour = event.start.getHours();
                  const startMinutes = event.start.getMinutes();
                  const duration =
                    (event.end.getTime() - event.start.getTime()) /
                    (1000 * 60 * 60);
                  const top = (startHour + startMinutes / 60) * 48;
                  const height = duration * 48;

                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "absolute left-1 right-1 rounded p-1 text-xs text-white",
                        event.color || "bg-blue-500"
                      )}
                      style={{ top: `${top}px`, height: `${height}px` }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
