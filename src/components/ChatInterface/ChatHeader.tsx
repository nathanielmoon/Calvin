"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

interface ChatHeaderProps {
  messageCount: number;
  onClearHistory: () => void;
}

export function ChatHeader({ messageCount, onClearHistory }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <Bot className="h-6 w-6 text-primary" />
        <h2 className="text-lg font-semibold">Calvin</h2>
        <span className="text-sm text-muted-foreground">
          Your Calendar Assistant
        </span>
      </div>

      <div className="flex items-center gap-2">
        {messageCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearHistory}>
            Clear History
          </Button>
        )}
      </div>
    </div>
  );
}
