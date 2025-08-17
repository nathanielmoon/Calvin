"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { Bot, User } from "lucide-react";
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
          "max-w-[80%] p-3 gap-2 min-w-[140px]",
          message.role === "user"
            ? "bg-sky-700 text-primary-foreground"
            : "bg-muted"
        )}
      >
        <div
          className={cn(
            "text-sm prose prose-sm max-w-none dark:prose-invert",
            message.role === "user" && "text-right"
          )}
        >
          {message.role === "assistant" ? (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
        </div>

        <div
          className={cn(
            "flex items-center border-current/10",
            message.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-xs opacity-70">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
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
