import Image from "next/image";

const styles = {
  maskImage:
    "linear-gradient(to bottom, black 0%, transparent 50%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(to bottom, black 0%, transparent 50%, transparent 100%)",
    boxShadow: "0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)",
};

export function HeroImage() {
  return (
    <>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[800px]"
        style={styles}
      >
        <Image
          src="/images/mock.png"
          alt="Calvin"
          width={800}
          height={800}
          className="w-full max-w-full rounded"
          style={{
            boxShadow: "0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)",
          }}
        />
      </div>
      <div className="h-28 sm:h-56 md:h-64 w-full" />
    </>
  );
}
