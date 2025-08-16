"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
  onRefresh: () => void;
  loading: boolean;
}

export function RefreshButton({ onRefresh, loading }: RefreshButtonProps) {
  return (
    <div className="flex justify-center">
      <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
        Refresh <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
      </Button>
    </div>
  );
}
