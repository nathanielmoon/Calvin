"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message as MessageType } from "./types";
import Image from "next/image";

function MarkdownEventComponent({
  summary,
  start,
  end,
}: {
  summary: string;
  start: string;
  end: string;
}) {
  return (
    <div className="flex flex-col gap-1 bg-gray-200 rounded-lg p-2 font-normal font-sans my-2 min-w-[200px] max-w-[300px] w-full">
      <p className="font-bold break-words whitespace-break-spaces">{summary}</p>
      <div className="flex gap-1 text-sm">
        <p>{start?.trim() === "" ? "TBD" : start}</p>
        {end?.trim() !== "" && " - "}
        <p>{end?.trim() !== "" && end}</p>
      </div>
    </div>
  );
}

const mdComponents = {
  code: ({
    children,
    className,
    ...rest
  }: {
    children?: React.ReactNode;
    className?: string;
    [key: string]: unknown;
  }) => {
    const match = /language-(\w+)/.exec(className || "");

    // Handle event code blocks
    if (match && match[1] === "event") {
      try {
        const eventData = JSON.parse(String(children));
        return (
          <MarkdownEventComponent
            summary={eventData.summary}
            start={eventData.start}
            end={eventData.end}
          />
        );
      } catch {
        // If parsing fails, render as normal code
        return (
          <div className={className} {...rest}>
            {children}
          </div>
        );
      }
    }

    return (
      <div {...rest} className={className}>
        {children}
      </div>
    );
  },
};

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      {message.role === "assistant" && (
        <div className="flex-shrink-0">
          <div className="w-6 h-6 flex items-center justify-center">
            <Image
              src="/images/logo2.png"
              alt="Calvin"
              width={32}
              height={32}
            />
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
          className={cn("text-sm prose prose-sm max-w-none dark:prose-invert")}
        >
          {message.role === "assistant" ? (
            // @ts-expect-error - This is fine
            <ReactMarkdown components={mdComponents}>
              {message.content}
            </ReactMarkdown>
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
