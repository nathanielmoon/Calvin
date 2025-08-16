import { auth } from "@/auth";
import MainApp from "@/components/MainApp";
import LandingPage from "@/pages/LandingPage";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    return <MainApp session={session} />;
  }

  return <LandingPage />;
}
