"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { Calendar, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message as MessageType } from "./types";

interface MessageProps {
  message: MessageType;
  onSendMessage: (content: string) => void;
}

export function Message({ message, onSendMessage }: MessageProps) {
  return (
    <div
      className={cn(
        "flex gap-3",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      {message.role === "assistant" && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
        </div>
      )}

      <Card
        className={cn(
          "max-w-[80%] p-3",
          message.role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
          {message.role === "assistant" ? (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-current/10">
          <span className="text-xs opacity-70">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>

          {message.role === "assistant" && message.calendarContextIncluded && (
            <div className="flex items-center gap-1 text-xs opacity-70">
              <Calendar className="h-3 w-3" />
              <span>With calendar data</span>
            </div>
          )}
        </div>
      </Card>

      {message.role === "user" && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
        </div>
      )}
    </div>
  );
}
