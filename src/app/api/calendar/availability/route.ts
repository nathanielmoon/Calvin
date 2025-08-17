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
    const dateParam = searchParams.get("date");
    const daysParam = searchParams.get("days");

    const calendarClient = new GoogleCalendarClient(session.accessToken);

    // Default to today if no date provided
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    const days = daysParam ? parseInt(daysParam) : 1;

    if (days === 1) {
      // Single day availability
      const availability = await calendarClient.getAvailability(targetDate);

      return NextResponse.json({
        ...availability,
        generated_at: new Date().toISOString(),
      });
    } else {
      // Multiple days availability
      const availabilities = [];

      for (let i = 0; i < days; i++) {
        const date = new Date(targetDate);
        date.setDate(date.getDate() + i);

        const availability = await calendarClient.getAvailability(date);
        availabilities.push(availability);
      }

      return NextResponse.json({
        availabilities,
        summary: {
          totalDays: days,
          averageFreeTime:
            availabilities.reduce((sum, day) => sum + day.totalFreeTime, 0) /
            days,
          averageBusyTime:
            availabilities.reduce((sum, day) => sum + day.totalBusyTime, 0) /
            days,
        },
        generated_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Calendar availability API error:", error);

    return NextResponse.json(
      { error: "Failed to fetch calendar availability" },
      { status: 500 }
    );
  }
}
