export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  creator?: {
    email: string;
    displayName?: string;
  };
  organizer?: {
    email: string;
    displayName?: string;
  };
  status?: 'confirmed' | 'tentative' | 'cancelled';
  recurring?: boolean;
  recurringEventId?: string;
  hangoutLink?: string;
  conferenceData?: {
    conferenceSolution?: {
      name: string;
    };
    entryPoints?: Array<{
      entryPointType: string;
      uri: string;
      label?: string;
    }>;
  };
}

export interface CalendarAnalytics {
  totalEvents: number;
  totalMeetingHours: number;
  averageMeetingLength: number;
  busyHoursToday: number;
  freeHoursToday: number;
  upcomingEvents: CalendarEvent[];
  meetingsByDay: Record<string, number>;
  topAttendees: Array<{
    email: string;
    displayName?: string;
    meetingCount: number;
  }>;
  meetingTypes: {
    inPerson: number;
    virtual: number;
    unknown: number;
  };
}

export interface AvailabilitySlot {
  start: string;
  end: string;
  duration: number; // in minutes
}

export interface CalendarAvailability {
  date: string;
  freeSlots: AvailabilitySlot[];
  busySlots: AvailabilitySlot[];
  totalFreeTime: number; // in minutes
  totalBusyTime: number; // in minutes
  workingHours: {
    start: string;
    end: string;
  };
}

export interface GoogleCalendarListResponse {
  events: CalendarEvent[];
  nextPageToken?: string;
}