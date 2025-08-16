"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Bot } from "lucide-react";

export function LoadingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary animate-pulse" />
        </div>
      </div>

      <Card className="bg-muted p-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.1s]" />
            <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
          </div>
          Calvin is thinking...
        </div>
      </Card>
    </div>
  );
}
