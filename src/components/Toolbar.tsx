"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, BarChart3 } from "lucide-react";

interface ToolbarProps {
  messageCount: number;
  currentView: "chat" | "calendar" | "analytics";
  onClearHistory: () => void;
  onViewToggle: (view: "chat" | "calendar" | "analytics") => void;
}

export function Toolbar({
  messageCount,
  currentView,
  onClearHistory,
  onViewToggle,
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-center px-4">
      <div className="flex flex-row items-center gap-2 w-full max-w-4xl justify-between">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={currentView === "chat" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewToggle("chat")}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            variant={currentView === "calendar" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewToggle("calendar")}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            variant={currentView === "analytics" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewToggle("analytics")}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {currentView === "chat" && messageCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearHistory}>
              Clear History
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
