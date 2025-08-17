"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "../../lib/utils";
import { titleFont } from "../../fonts";

interface EmptyStateProps {
  hasSession: boolean;
  onSendMessage: (content: string) => void;
}

export function EmptyState({ hasSession, onSendMessage }: EmptyStateProps) {
  const suggestions = hasSession
    ? [
        "How busy am I today?",
        "What's coming up this week?",
        "Analyze my meeting patterns",
        "When am I free today?",
        "Show me my schedule overview",
      ]
    : [
        "How can I manage my time better?",
        "Tips for scheduling meetings",
        "What makes a good calendar system?",
        "How to reduce meeting fatigue?",
      ];

  return (
    <div className="text-center mt-6 md:mt-12">
      <h3
        className={cn(
          titleFont.className,
          "text-3xl sm:text-4xl font-semibold mb-2"
        )}
      >
        Welcome to Calvin
      </h3>
      <p className="text-muted-foreground mb-4">
        Your intelligent calendar assistant. Ask me about your schedule,
        meetings, or time management.
      </p>
      {!hasSession && (
        <p className="text-sm text-orange-600 mb-6">
          Sign in with Google to get personalized calendar insights.
        </p>
      )}

      {/* Suggested Actions */}
      <div className="max-w-md mx-auto space-y-2">
        <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
        <div className="grid gap-2">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              variant="ghost"
              size="sm"
              className="text-left justify-start h-auto py-2 px-3 whitespace-normal"
              onClick={() => onSendMessage(suggestion)}
            >
              <span className="mr-1">&gt; </span>
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
