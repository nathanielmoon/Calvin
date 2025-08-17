"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonalIcon } from "lucide-react";

interface ChatInputProps {
  inputMessage: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export function ChatInput({
  inputMessage,
  isLoading,
  onInputChange,
  onSubmit,
  onKeyDown,
}: ChatInputProps) {
  return (
    <div className="p-4 pb-4 md:pb-12 flex flex-row items-center justify-center">
      <form
        onSubmit={onSubmit}
        className="flex gap-2 relative w-full max-w-4xl"
      >
        <Textarea
          value={inputMessage}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={"Ask me about your calendar ..."}
          className="flex-1 min-h-[40px] max-h-[120px] resize-none pr-14 bg-white rounded-full py-3 px-4 shadow-lg"
          disabled={isLoading}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Button
            type="submit"
            size="icon"
            disabled={!inputMessage.trim() || isLoading}
            className="h-[40px] w-[40px]"
            variant="ghost"
          >
            <SendHorizonalIcon className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
