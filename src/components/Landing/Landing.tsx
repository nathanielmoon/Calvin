import { SignInButton } from "../SignInButton";

import { Title } from "./Title";
import { HeroImage } from "./HeroImage";
import { SubTitle } from "./SubTitle";
import Header from "../Header";

export default function Landing() {
  return (
    <div className="p-2 md:p-6 flex-col items-center justify-start min-h-screen w-screen bg-[#f8f8f8]">
      <Header />
      <div className="relative flex flex-col items-center justify-center gap-2 w-full mt-4">
        <HeroImage />
        <div className="relative flex flex-col items-center justify-center gap-2">
          <Title />
        </div>
        <SubTitle />
        <SignInButton />
      </div>
    </div>
  );
}
