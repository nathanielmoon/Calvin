"use client";

import { TypeAnimation } from "react-type-animation";
import { cn } from "../../lib/utils";
import { titleFont } from "../../fonts";

export function SubTitle() {
  return (
    <div className="h-20">
      <TypeAnimation
        sequence={[
          "I'm Calvin, your calendar assistant",
          2000,
          "Ask me what you have planned today",
          2000,
          "Ask me how to free up your mornings",
          2000,
          "Ask me who you're meeting later",
          2000,
        ]}
        wrapper="span"
        speed={60}
        repeat={Infinity}
        className={cn(
          titleFont.className,
          "text-xl sm:text-2xl md:text-4xl font-bold z-10 text-center leading-none"
        )}
      />
    </div>
  );
}
