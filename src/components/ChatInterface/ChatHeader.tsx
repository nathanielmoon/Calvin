"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Bot, Calendar } from "lucide-react";

interface ChatHeaderProps {
  messageCount: number;
  onClearHistory: () => void;
  onToggleCalendar: () => void;
}

export function ChatHeader({ messageCount, onClearHistory, onToggleCalendar }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <Bot className="h-6 w-6 text-primary" />
        <h2 className="text-lg font-semibold">Calvin</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onToggleCalendar}>
          <Calendar className="h-4 w-4" />
          Calendar
        </Button>
        {messageCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearHistory}>
            Clear History
          </Button>
        )}
      </div>
    </div>
  );
}
