import { titleFont } from "../../fonts";
import { cn } from "../../lib/utils";

export function Title() {
  return (
    <h1
      className={cn(
        titleFont.className,
        "text-[6rem] sm:text-[10rem] md:text-[12rem] font-bold z-10 text-center leading-none tracking-wide"
      )}
    >
      Calvin
    </h1>
  );
}
