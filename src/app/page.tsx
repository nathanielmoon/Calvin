import { auth } from "@/auth";
import { Dashboard } from "@/components/Dashboard";
import LandingPage from "@/pages/LandingPage";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    return <Dashboard user={session.user} />;
  }

  return <LandingPage />;
}
