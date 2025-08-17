"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export function LoadingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="flex-shrink-0">
        <div className="w-6 h-6 rounded-full flex items-center justify-center">
          <Image src="/images/logo2.png" alt="Calvin" width={32} height={32} />
        </div>
      </div>

      <Card className="bg-muted p-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-current animate-bounce" />
            <div className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:0.1s]" />
            <div className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
          </div>
          Calvin is thinking...
        </div>
      </Card>
    </div>
  );
}
