import Image from "next/image";
const styles = {
  maskImage:
    "linear-gradient(to bottom, black 0%, transparent 50%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(to bottom, black 0%, transparent 50%, transparent 100%)",
};
export function CalvinsHead() {
  return (
    <>
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full"
      style={styles}
    >
    <Image
      src="/images/logo.png"
      alt="Calvin"
      width={800}
      height={800}
      className="w-full max-w-full"
    />
  </div>
  <div className="h-36 sm:h-56 md:h-72 w-full" />
  </>
  )
}