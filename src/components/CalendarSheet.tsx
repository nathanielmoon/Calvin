"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CalendarAnalytics } from "@/components/CalendarAnalytics";

interface CalendarSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CalendarSheet({ open, onOpenChange }: CalendarSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 p-0">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle>Calendar Context</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <CalendarAnalytics />
        </div>
      </SheetContent>
    </Sheet>
  );
}