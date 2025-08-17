"use client";

import { useEffect, useState } from "react";

export function ContentContainer({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`flex flex-1 justify-center items-start overflow-hidden py-4 px-0 md:px-4 transition-all duration-600 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="w-full h-full max-w-full md:max-w-7xl md:border md:shadow-lg md:rounded-lg md:bg-white">
        {children}
      </div>
    </div>
  );
}
