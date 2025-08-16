'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Calendar, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
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

interface ChatInterfaceProps {
  className?: string;
}

export default function ChatInterface({ className }: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [includeCalendarContext, setIncludeCalendarContext] = useState(true);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('calvin-chat-history');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('calvin-chat-history', JSON.stringify(messages));
    }
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim(),
          includeCalendarContext,
          conversationHistory: messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: data.id || (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: data.timestamp,
        calendarContextIncluded: !!data.calendarContext,
        suggestedActions: data.suggestedActions,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [includeCalendarContext, isLoading, messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem('calvin-chat-history');
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold">Calvin</h2>
          <span className="text-sm text-muted-foreground">
            Your Calendar Assistant
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIncludeCalendarContext(!includeCalendarContext)}
            className={cn(
              "flex items-center gap-1",
              includeCalendarContext && "bg-primary/10 text-primary"
            )}
          >
            <Calendar className="h-4 w-4" />
            Calendar Context
          </Button>
          
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              Clear History
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Welcome to Calvin
            </h3>
            <p className="text-muted-foreground mb-4">
              Your intelligent calendar assistant. Ask me about your schedule, meetings, or time management.
            </p>
            {!session && (
              <p className="text-sm text-orange-600 mb-6">
                Sign in with Google to get personalized calendar insights.
              </p>
            )}
            
            {/* Suggested Actions */}
            <div className="max-w-md mx-auto space-y-2">
              <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
              <div className="grid gap-2">
                {(session ? [
                  "How busy am I today?",
                  "What's coming up this week?",
                  "Analyze my meeting patterns",
                  "When am I free today?",
                  "Show me my schedule overview"
                ] : [
                  "How can I manage my time better?",
                  "Tips for scheduling meetings",
                  "What makes a good calendar system?",
                  "How to reduce meeting fatigue?"
                ]).map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    className="text-left justify-start h-auto py-2 px-3 whitespace-normal"
                    onClick={() => sendMessage(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              </div>
            )}
            
            <Card
              className={cn(
                "max-w-[80%] p-3",
                message.role === 'user'
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              <div className="whitespace-pre-wrap text-sm">
                {message.content}
              </div>
              
              {/* Suggested Actions */}
              {message.role === 'assistant' && message.suggestedActions && message.suggestedActions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-current/10">
                  <div className="text-xs opacity-70 mb-2">Suggested actions:</div>
                  <div className="grid gap-1">
                    {message.suggestedActions.map((action) => (
                      <Button
                        key={action.id}
                        variant="ghost"
                        size="sm"
                        className="h-auto py-1 px-2 text-xs justify-start text-left whitespace-normal opacity-80 hover:opacity-100"
                        onClick={() => sendMessage(action.action)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-current/10">
                <span className="text-xs opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
                
                {message.role === 'assistant' && message.calendarContextIncluded && (
                  <div className="flex items-center gap-1 text-xs opacity-70">
                    <Calendar className="h-3 w-3" />
                    <span>With calendar data</span>
                  </div>
                )}
              </div>
            </Card>

            {message.role === 'user' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary animate-pulse" />
              </div>
            </div>
            
            <Card className="bg-muted p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.1s]" />
                  <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                </div>
                Calvin is thinking...
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              session
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
    </div>
  );
}