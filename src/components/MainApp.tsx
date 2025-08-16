"use client";

import React, { useState } from "react";
import { SessionProvider } from "next-auth/react";
import ChatInterface from "@/components/ChatInterface";
import Header from "@/components/Header";
import { Toolbar } from "@/components/Toolbar";
import { Message } from "@/components/ChatInterface/types";
import type { Session } from "next-auth";
import CalendarAnalytics from "./CalendarAnalytics/CalendarAnalytics";
import { ContentContainer } from "./ContentContainer";

interface MainAppProps {
  session: Session | null;
}

export default function MainApp({ session }: MainAppProps) {
  const [currentView, setCurrentView] = useState<"chat" | "calendar" | "analytics">("chat");
  const [messages, setMessages] = useState<Message[]>([]);
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

  const handleViewToggle = (view: "chat" | "calendar" | "analytics") => {
    setCurrentView(view);
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
        />

        {/* Main Content Area */}
        <ContentContainer>
          {currentView === "analytics" ? (
            <CalendarAnalytics />
          ) : (
            <ChatInterface
              className="flex-1"
              currentView={currentView}
              onMessagesChange={setMessages}
            />
          )}
        </ContentContainer>
      </div>
    </SessionProvider>
  );
}
