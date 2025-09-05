"use client";

import { Button } from "@/components/ui/button";
import { cn } from "../lib/utils";
import { titleFont } from "../fonts";

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function CallButton() {
  const handleCall = () => {
    window.location.href = "tel:000-000-0000";
  };

  return (
    <div className="w-full max-w-[400px] opacity-0 delay-800 animate-fade-in">
      <Button
        onClick={handleCall}
        variant="ghost"
        size="lg"
        className={cn(
          "w-full text-lg gap-3 h-14 mt-4 bg-white duration-300 z-10 delay-0",
          titleFont.className
        )}
        style={{
          boxShadow: "rgba(0, 0, 0, 0.05) 0px 14px 20px 0px",
        }}
      >
        <PhoneIcon className="w-5 h-5" />
        Call us at 000-000-0000
      </Button>
    </div>
  );
}