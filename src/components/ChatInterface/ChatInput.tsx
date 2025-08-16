"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  inputMessage: string;
  isLoading: boolean;
  hasSession: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export function ChatInput({
  inputMessage,
  isLoading,
  hasSession,
  onInputChange,
  onSubmit,
  onKeyDown,
}: ChatInputProps) {
  return (
    <div className="p-4 border-t">
      <form onSubmit={onSubmit} className="flex gap-2">
        <Textarea
          value={inputMessage}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={
            hasSession
              ? "Ask me about your calendar, schedule, or time management..."
              : "Ask me general questions about time management..."
          }
          className="flex-1 min-h-[40px] max-h-[120px] resize-none"
          disabled={isLoading}
        />

        <Button
          type="submit"
          size="icon"
          disabled={!inputMessage.trim() || isLoading}
          className="h-[40px] w-[40px]"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
