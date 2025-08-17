import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { GoogleCalendarClient } from "@/lib/google-calendar";
import {
  calendarApiRateLimiter,
  createRateLimitResponse,
} from "@/lib/rate-limiter";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in with Google" },
        { status: 401 }
      );
    }

    // Rate limiting
    const userIdentifier = session.user?.email || "anonymous";
    const rateLimitResult = calendarApiRateLimiter.isAllowed(userIdentifier);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        createRateLimitResponse(rateLimitResult.resetTime!),
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimitResult.resetTime! - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get("timeMin");
    const timeMax = searchParams.get("timeMax");
    const maxResults = parseInt(searchParams.get("maxResults") || "50");
    const preset = searchParams.get("preset"); // 'today', 'week', 'upcoming'

    const calendarClient = new GoogleCalendarClient(session.accessToken);

    let events;

    switch (preset) {
      case "today":
        events = await calendarClient.getTodaysEvents();
        break;
      case "week":
        events = await calendarClient.getThisWeeksEvents();
        break;
      case "upcoming":
        const count = parseInt(searchParams.get("count") || "10");
        events = await calendarClient.getUpcomingEvents(count);
        break;
      default:
        events = await calendarClient.getEvents(
          timeMin || undefined,
          timeMax || undefined,
          maxResults
        );
    }

    return NextResponse.json({
      events,
      count: events.length,
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Calendar events API error:", error);

    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}
