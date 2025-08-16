"use client";

import React, { useState } from "react";
import { SessionProvider } from "next-auth/react";
import ChatInterface from "@/components/ChatInterface";
import Header from "@/components/Header";
import { Toolbar } from "@/components/Toolbar";
import { Message } from "@/components/ChatInterface/types";
import type { Session } from "next-auth";
import { CalendarAnalyticsSheet } from "./CalendarAnalyticsSheet";
import { ContentContainer } from "./ContentContainer";

interface MainAppProps {
  session: Session | null;
}

export default function MainApp({ session }: MainAppProps) {
  const [currentView, setCurrentView] = useState<"chat" | "calendar">("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [calendarAnalyticsOpen, setCalendarAnalyticsOpen] = useState(false);
  const handleNewConversation = () => {
    // Clear chat history
    localStorage.removeItem("calvin-chat-history");
    setMessages([]);
    // Force a re-render by reloading the page (simple approach)
    window.location.reload();
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem("calvin-chat-history");
  };

  const handleViewToggle = (view: "chat" | "calendar") => {
    setCurrentView(view);
  };

  const onCalendarAnalyticsToggle = () => {
    setCalendarAnalyticsOpen(!calendarAnalyticsOpen);
  };

  return (
    <SessionProvider session={session}>
      <div className="h-screen w-screen flex flex-col bg-background">
        {/* Header */}
        <Header onNewConversation={handleNewConversation} />

        {/* Toolbar */}
        <Toolbar
          messageCount={messages.length}
          currentView={currentView}
          onClearHistory={clearHistory}
          onViewToggle={handleViewToggle}
          onCalendarAnalyticsToggle={onCalendarAnalyticsToggle}
        />

        {/* Main Content Area */}
        <ContentContainer>
          {/* Chat Interface - Full Width */}
          <ChatInterface
            className="flex-1"
            currentView={currentView}
            onMessagesChange={setMessages}
          />
        </ContentContainer>

        <CalendarAnalyticsSheet
          open={calendarAnalyticsOpen}
          onOpenChange={setCalendarAnalyticsOpen}
        />
      </div>
    </SessionProvider>
  );
}
