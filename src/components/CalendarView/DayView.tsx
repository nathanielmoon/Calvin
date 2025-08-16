import { format, isSameDay } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Event } from "./CalendarTypes";

interface DayViewProps {
  currentDate: Date;
  events: Event[];
}

export function DayView({ currentDate, events }: DayViewProps) {
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.start, date));
  };

  const dayEvents = getEventsForDate(currentDate);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <Card className="flex-1">
      <CardContent className="p-4">
        <div className="grid grid-cols-[60px_1fr] gap-0 min-h-[600px]">
          <div className="border-r">
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
          <div className="relative">
            {hours.map((hour) => (
              <div key={hour} className="h-12 border-b border-border/50" />
            ))}
            {dayEvents.map((event) => {
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
                    event.color || "bg-blue-500",
                  )}
                  style={{ top: `${top}px`, height: `${height}px` }}
                >
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="text-xs opacity-90">
                    {format(event.start, "h:mm a")} -{" "}
                    {format(event.end, "h:mm a")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
