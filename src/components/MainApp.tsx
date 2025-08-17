"use client";

import React, { useState } from "react";
import { SessionProvider } from "next-auth/react";
import ChatInterface from "@/components/ChatInterface";
import Header from "@/components/Header";
import { Toolbar } from "@/components/Toolbar";
import type { Session } from "next-auth";
import CalendarAnalytics from "./CalendarAnalytics/CalendarAnalytics";
import { ContentContainer } from "./ContentContainer";

interface MainAppProps {
  session: Session | null;
}

export default function MainApp({ session }: MainAppProps) {
  const [ticker, setTicker] = useState(2);
  const [currentView, setCurrentView] = useState<
    "chat" | "calendar" | "analytics"
  >("chat");

  const clearHistory = () => {
    // TODO: Clear history
    localStorage.removeItem("calvin-chat-history");
    setTicker(ticker % 2 === 0 ? ticker + 1 : ticker - 1);
  };

  const handleNewConversation = () => {
    clearHistory();
    setCurrentView("chat");
  };

  const handleViewToggle = (view: "chat" | "calendar" | "analytics") => {
    setCurrentView(view);
  };

  return (
    <SessionProvider session={session}>
      <div className="h-screen w-screen flex flex-col bg-background">
        {/* Header */}
        <Header />

        {/* Toolbar */}
        <Toolbar
          currentView={currentView}
          onViewToggle={handleViewToggle}
          onNewConversation={handleNewConversation}
        />

        {/* Main Content Area */}
        <ContentContainer>
          {currentView === "analytics" ? (
            <CalendarAnalytics className="pt-8" />
          ) : (
            <ChatInterface
              className="flex-1"
              currentView={currentView}
              key={ticker}
            />
          )}
        </ContentContainer>
      </div>
    </SessionProvider>
  );
}
