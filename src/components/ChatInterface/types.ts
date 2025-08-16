export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  calendarContextIncluded?: boolean;
  suggestedActions?: Array<{
    id: string;
    type: string;
    label: string;
    action: string;
    description?: string;
  }>;
}

export interface ChatInterfaceProps {
  className?: string;
  currentView?: "chat" | "calendar";
  onMessagesChange?: (messages: Message[]) => void;
}
