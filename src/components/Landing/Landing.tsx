
import { SignInButton } from "../SignInButton";

import { Title } from "./Title";
import { CalvinsHead } from "./CalvinsHead";
import { SubTitle } from "./SubTitle";


export default function Landing() {
  return (
    <div className="p-6 flex items-start justify-center min-h-screen w-screen bg-[#f8f8f8]">
      <div className="flex flex-col items-center justify-center gap-2 w-full mt-12">
        <div className="relative flex flex-col items-center justify-center gap-2">
          <CalvinsHead />
          <Title />
          <SubTitle />
        </div>
        <SignInButton />
      </div>
    </div>
  );
}
