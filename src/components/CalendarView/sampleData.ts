import { Event } from "./CalendarTypes";

export const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Team Meeting",
    start: new Date(2024, 11, 15, 10, 0),
    end: new Date(2024, 11, 15, 11, 0),
    color: "bg-blue-500",
  },
  {
    id: "2",
    title: "Project Review",
    start: new Date(2024, 11, 16, 14, 0),
    end: new Date(2024, 11, 16, 15, 30),
    color: "bg-green-500",
  },
  {
    id: "3",
    title: "Client Call",
    start: new Date(2024, 11, 17, 9, 0),
    end: new Date(2024, 11, 17, 10, 0),
    color: "bg-purple-500",
  },
];