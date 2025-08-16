import { format, startOfWeek, addDays } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar, Clock, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarView } from "./CalendarTypes";

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onNavigate: (direction: "prev" | "next") => void;
  onToday: () => void;
}

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onNavigate,
  onToday,
}: CalendarHeaderProps) {
  const getViewTitle = () => {
    switch (view) {
      case "day":
        return format(currentDate, "EEEE, MMMM d, yyyy");
      case "week":
        const weekStart = startOfWeek(currentDate);
        const weekEnd = addDays(weekStart, 6);
        return `${format(weekStart, "MMM d")} - ${format(
          weekEnd,
          "MMM d, yyyy"
        )}`;
      case "month":
        return format(currentDate, "MMMM yyyy");
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col items-start md:flex-row md:items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-semibold">{getViewTitle()}</h2>
      </div>

      <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-2">
        <div className="flex items-center border rounded-lg">
          <Button
            variant={view === "day" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("day")}
            className="rounded-r-none border-r"
          >
            <List className="w-4 h-4 hidden md:inline-block" />
            Day
          </Button>
          <Button
            variant={view === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("week")}
            className="rounded-none border-r"
          >
            <Clock className="w-4 h-4 hidden md:inline-block" />
            Week
          </Button>
          <Button
            variant={view === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("month")}
            className="rounded-l-none"
          >
            <Calendar className="w-4 h-4 hidden md:inline-block" />
            Month
          </Button>
        </div>

        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("prev")}
            className="rounded-r-none"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onToday}
            className="rounded-none border-x-0"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("next")}
            className="rounded-l-none"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
