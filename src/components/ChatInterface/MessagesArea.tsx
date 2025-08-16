"use client";

import React from "react";
import { Message } from "./Message";
import { EmptyState } from "./EmptyState";
import { LoadingIndicator } from "./LoadingIndicator";
import { Message as MessageType } from "./types";

interface MessagesAreaProps {
  messages: MessageType[];
  isLoading: boolean;
  hasSession: boolean;
  onSendMessage: (content: string) => void;
}

export function MessagesArea({
  messages,
  isLoading,
  hasSession,
  onSendMessage,
}: MessagesAreaProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <EmptyState hasSession={hasSession} onSendMessage={onSendMessage} />
      )}

      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          onSendMessage={onSendMessage}
        />
      ))}

      {isLoading && <LoadingIndicator />}
    </div>
  );
}
