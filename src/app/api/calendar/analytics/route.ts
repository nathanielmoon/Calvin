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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const preset = searchParams.get("preset"); // 'today', 'week', 'month'

    const calendarClient = new GoogleCalendarClient(session.accessToken);

    let dateRange;

    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate),
      };
    } else if (preset) {
      const now = new Date();

      switch (preset) {
        case "today":
          dateRange = {
            start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          };
          break;
        case "week":
          const startOfWeek = new Date(
            now.getTime() - now.getDay() * 24 * 60 * 60 * 1000
          );
          dateRange = {
            start: startOfWeek,
            end: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000),
          };
          break;
        case "month":
          dateRange = {
            start: new Date(now.getFullYear(), now.getMonth(), 1),
            end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          };
          break;
      }
    }

    const analytics = await calendarClient.generateAnalytics(dateRange);

    return NextResponse.json({
      ...analytics,
      period: dateRange
        ? {
            start: dateRange.start.toISOString(),
            end: dateRange.end.toISOString(),
          }
        : "default_week",
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Calendar analytics API error:", error);

    // Handle various authentication errors
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      if (
        errorMessage.includes("invalid_grant") ||
        errorMessage.includes("invalid authentication credentials") ||
        errorMessage.includes("expected oauth 2 access token") ||
        errorMessage.includes("authentication credential")
      ) {
        return NextResponse.json(
          { error: "Authentication expired - Please sign in again" },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate calendar analytics" },
      { status: 500 }
    );
  }
}
