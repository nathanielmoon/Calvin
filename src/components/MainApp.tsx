"use client";

import React, { useState } from "react";
import { SessionProvider } from "next-auth/react";
import ChatInterface from "@/components/ChatInterface";
import Header from "@/components/Header";
import CalendarContextPanel from "@/components/CalendarContextPanel";
import { Button } from "@/components/ui/button";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/utils";

interface MainAppProps {
  session: any;
}

export default function MainApp({ session }: MainAppProps) {
  const [showCalendarPanel, setShowCalendarPanel] = useState(false);

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
            <div className="flex items-center justify-between p-2 border-b">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCalendarPanel(!showCalendarPanel)}
                  className="flex items-center gap-1"
                >
                  {showCalendarPanel ? (
                    <PanelLeftClose className="h-4 w-4" />
                  ) : (
                    <PanelLeft className="h-4 w-4" />
                  )}
                  Calendar Panel
                </Button>
              </div>
            </div>

            <ChatInterface className="flex-1" />
          </div>

          {/* Optional Calendar Context Panel */}
          {showCalendarPanel && (
            <div className="w-80 border-l bg-muted/30">
              <CalendarContextPanel />
            </div>
          )}
        </div>
      </div>
    </SessionProvider>
  );
}
