import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { calendar_v3 } from "googleapis";
import {
  CalendarEvent,
  CalendarAnalytics,
  CalendarAvailability,
  AvailabilitySlot,
} from "@/types/calendar";
import { auth, signOut } from "../auth";
import get from "lodash.get";

export class GoogleCalendarClient {
  private calendar;
  private auth: OAuth2Client;

  constructor(accessToken: string) {
    this.auth = new OAuth2Client();
    this.auth.setCredentials({ access_token: accessToken });
    this.calendar = google.calendar({ version: "v3", auth: this.auth });
  }

  async getEvents(
    timeMin?: string,
    timeMax?: string,
    maxResults: number = 250,
  ): Promise<CalendarEvent[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId: "primary",
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax,
        maxResults,
        singleEvents: true,
        orderBy: "startTime",
      });

      return (response.data.items || [])
        .filter((event): event is calendar_v3.Schema$Event => !!event.id)
        .map(this.formatEvent);
    } catch (error) {
      if (get(error, "status") === 401) {
        await signOut({ redirect: true, redirectTo: "/" });
      }
      console.error("Error fetching calendar events:", {error});
      throw new Error("Failed to fetch calendar events");
    }
  }

  async getEventsInDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<CalendarEvent[]> {
    return this.getEvents(startDate.toISOString(), endDate.toISOString());
  }

  async getTodaysEvents(): Promise<CalendarEvent[]> {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    return this.getEventsInDateRange(startOfDay, endOfDay);
  }

  async getThisWeeksEvents(): Promise<CalendarEvent[]> {
    const today = new Date();
    const startOfWeek = new Date(
      today.getTime() - today.getDay() * 24 * 60 * 60 * 1000,
    );
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);

    return this.getEventsInDateRange(startOfWeek, endOfWeek);
  }

  async getUpcomingEvents(count: number = 10): Promise<CalendarEvent[]> {
    const now = new Date();
    const events = await this.getEvents(now.toISOString(), undefined, count);
    return events.slice(0, count);
  }

  async generateAnalytics(dateRange?: {
    start: Date;
    end: Date;
  }): Promise<CalendarAnalytics> {
    let events: CalendarEvent[];

    if (dateRange) {
      events = await this.getEventsInDateRange(dateRange.start, dateRange.end);
    } else {
      events = await this.getThisWeeksEvents();
    }

    const totalEvents = events.length;
    let totalMeetingMinutes = 0;
    const meetingsByDay: Record<string, number> = {};
    const attendeeCount: Record<string, number> = {};
    let virtualMeetings = 0;
    let inPersonMeetings = 0;

    events.forEach((event) => {
      // Calculate duration
      if (event.start.dateTime && event.end.dateTime) {
        const start = new Date(event.start.dateTime);
        const end = new Date(event.end.dateTime);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60);
        totalMeetingMinutes += duration;

        // Count meetings by day
        const dayKey = start.toISOString().split("T")[0];
        meetingsByDay[dayKey] = (meetingsByDay[dayKey] || 0) + 1;
      }

      // Count attendees
      event.attendees?.forEach((attendee) => {
        const key = `${attendee.email}:${attendee.displayName || attendee.email}`;
        attendeeCount[key] = (attendeeCount[key] || 0) + 1;
      });

      // Categorize meeting types
      if (event.hangoutLink || event.conferenceData) {
        virtualMeetings++;
      } else if (event.location) {
        inPersonMeetings++;
      }
    });

    const topAttendees = Object.entries(attendeeCount)
      .map(([key, count]) => {
        const [email, displayName] = key.split(":");
        return {
          email,
          displayName: displayName !== email ? displayName : undefined,
          meetingCount: count,
        };
      })
      .sort((a, b) => b.meetingCount - a.meetingCount)
      .slice(0, 10);

    const totalMeetingHours = totalMeetingMinutes / 60;
    const averageMeetingLength =
      totalEvents > 0 ? totalMeetingMinutes / totalEvents : 0;

    // Get today's busy/free hours
    const todaysEvents = await this.getTodaysEvents();
    const { totalBusyTime } = this.calculateAvailability(
      new Date(),
      todaysEvents,
    );
    const busyHoursToday = totalBusyTime / 60;
    const freeHoursToday = Math.max(0, 8 - busyHoursToday); // Assuming 8-hour workday

    const upcomingEvents = await this.getUpcomingEvents(5);

    return {
      totalEvents,
      totalMeetingHours,
      averageMeetingLength,
      busyHoursToday,
      freeHoursToday,
      upcomingEvents,
      meetingsByDay,
      topAttendees,
      meetingTypes: {
        inPerson: inPersonMeetings,
        virtual: virtualMeetings,
        unknown: totalEvents - virtualMeetings - inPersonMeetings,
      },
    };
  }

  async getAvailability(date: Date): Promise<CalendarAvailability> {
    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      9,
      0,
    ); // 9 AM
    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      17,
      0,
    ); // 5 PM

    const events = await this.getEventsInDateRange(startOfDay, endOfDay);

    return {
      date: date.toISOString().split("T")[0],
      ...this.calculateAvailability(date, events),
      workingHours: {
        start: "09:00",
        end: "17:00",
      },
    };
  }

  private calculateAvailability(date: Date, events: CalendarEvent[]) {
    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      9,
      0,
    );
    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      17,
      0,
    );

    // Get busy slots from events
    const busySlots: AvailabilitySlot[] = events
      .filter((event) => event.start.dateTime && event.end.dateTime)
      .map((event) => {
        const start = new Date(event.start.dateTime!);
        const end = new Date(event.end.dateTime!);
        return {
          start: start.toISOString(),
          end: end.toISOString(),
          duration: (end.getTime() - start.getTime()) / (1000 * 60),
        };
      })
      .sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );

    // Calculate free slots
    const freeSlots: AvailabilitySlot[] = [];
    let currentTime = startOfDay.getTime();

    busySlots.forEach((busySlot) => {
      const busyStart = new Date(busySlot.start).getTime();

      if (currentTime < busyStart) {
        const freeEnd = Math.min(busyStart, endOfDay.getTime());
        if (freeEnd > currentTime) {
          freeSlots.push({
            start: new Date(currentTime).toISOString(),
            end: new Date(freeEnd).toISOString(),
            duration: (freeEnd - currentTime) / (1000 * 60),
          });
        }
      }

      currentTime = Math.max(currentTime, new Date(busySlot.end).getTime());
    });

    // Add final free slot if there's time left
    if (currentTime < endOfDay.getTime()) {
      freeSlots.push({
        start: new Date(currentTime).toISOString(),
        end: endOfDay.toISOString(),
        duration: (endOfDay.getTime() - currentTime) / (1000 * 60),
      });
    }

    const totalBusyTime = busySlots.reduce(
      (total, slot) => total + slot.duration,
      0,
    );
    const totalFreeTime = freeSlots.reduce(
      (total, slot) => total + slot.duration,
      0,
    );

    return {
      freeSlots,
      busySlots,
      totalFreeTime,
      totalBusyTime,
    };
  }

  private formatEvent(event: calendar_v3.Schema$Event): CalendarEvent {
    return {
      id: event.id!,
      summary: event.summary || "No title",
      description: event.description || undefined,
      start: {
        dateTime: event.start?.dateTime || undefined,
        date: event.start?.date || undefined,
        timeZone: event.start?.timeZone || undefined,
      },
      end: {
        dateTime: event.end?.dateTime || undefined,
        date: event.end?.date || undefined,
        timeZone: event.end?.timeZone || undefined,
      },
      location: event.location || undefined,
      attendees: event.attendees?.map((attendee) => ({
        email: attendee.email!,
        displayName: attendee.displayName || undefined,
        responseStatus: attendee.responseStatus as
          | "needsAction"
          | "declined"
          | "tentative"
          | "accepted"
          | undefined,
      })),
      creator: event.creator
        ? {
            email: event.creator.email!,
            displayName: event.creator.displayName || undefined,
          }
        : undefined,
      organizer: event.organizer
        ? {
            email: event.organizer.email!,
            displayName: event.organizer.displayName || undefined,
          }
        : undefined,
      status: event.status as
        | "confirmed"
        | "tentative"
        | "cancelled"
        | undefined,
      recurring: !!event.recurringEventId,
      recurringEventId: event.recurringEventId || undefined,
      hangoutLink: event.hangoutLink || undefined,
      conferenceData: event.conferenceData
        ? {
            conferenceSolution: event.conferenceData.conferenceSolution?.name
              ? {
                  name: event.conferenceData.conferenceSolution.name,
                }
              : undefined,
            entryPoints: event.conferenceData.entryPoints?.map((entry) => ({
              entryPointType: entry.entryPointType || "",
              uri: entry.uri || "",
              label: entry.label || undefined,
            })),
          }
        : undefined,
    };
  }
}
