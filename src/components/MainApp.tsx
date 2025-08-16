"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import ChatInterface from "@/components/ChatInterface";
import Header from "@/components/Header";
import CalendarContextPanel from "@/components/CalendarContextPanel";

interface MainAppProps {
  session: any;
}

export default function MainApp({ session }: MainAppProps) {
  const handleNewConversation = () => {
    // Clear chat history
    localStorage.removeItem("calvin-chat-history");
    // Force a re-render by reloading the page (simple approach)
    window.location.reload();
  };

  return (
    <SessionProvider session={session}>
      <div className="h-screen flex flex-col bg-background">
        {/* Header */}
        <Header onNewConversation={handleNewConversation} />

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chat Interface - Primary Focus */}
          <div className="flex-1 flex flex-col min-w-0">
            <ChatInterface className="flex-1" />
          </div>

          {/* Calendar Context Panel */}
          <div className="w-80 border-l bg-muted/30">
            <CalendarContextPanel />
          </div>
        </div>
      </div>
    </SessionProvider>
  );
}
