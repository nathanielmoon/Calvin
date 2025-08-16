import Image from "next/image";

export default function Landing() {
  return (
    <div className="p-6 flex items-center justify-center min-h-screen w-screen">
      <div>
        <Image src="/images/logo.png" alt="Calvin" width={500} height={500} />
      </div>
    </div>
  );
}
