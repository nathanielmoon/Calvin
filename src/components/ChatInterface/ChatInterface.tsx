"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { ChatHeader } from "./ChatHeader";
import { MessagesArea } from "./MessagesArea";
import { ChatInput } from "./ChatInput";
import { Message, ChatInterfaceProps } from "./types";

export function ChatInterface({ className }: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const includeCalendarContext = true;

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("calvin-chat-history");
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed);
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("calvin-chat-history", JSON.stringify(messages));
    }
  }, [messages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputMessage("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat/message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: content.trim(),
            includeCalendarContext,
            conversationHistory: messages.map((msg) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp,
            })),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to send message");
        }

        const data = await response.json();

        const assistantMessage: Message = {
          id: data.id || (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          timestamp: data.timestamp,
          calendarContextIncluded: !!data.calendarContext,
          suggestedActions: data.suggestedActions,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Failed to send message:", error);

        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [includeCalendarContext, isLoading, messages],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem("calvin-chat-history");
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <ChatHeader
        messageCount={messages.length}
        onClearHistory={clearHistory}
      />

      <MessagesArea
        messages={messages}
        isLoading={isLoading}
        hasSession={!!session}
        onSendMessage={sendMessage}
      />

      <ChatInput
        inputMessage={inputMessage}
        isLoading={isLoading}
        hasSession={!!session}
        onInputChange={setInputMessage}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
