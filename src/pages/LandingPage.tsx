import { SignInButton } from "@/components/SignInButton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="p-6 flex items-center justify-center min-h-screen">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Calvin</CardTitle>
          <CardDescription>Your intelligent calendar agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect your Google Calendar to start managing your schedule with AI
          </p>
          <SignInButton />
          <p className="text-xs text-muted-foreground">
            We&apos;ll access your calendar and email to help you schedule
            meetings and manage your time
          </p>
        </CardContent>
      </Card>
    </div>
  );
}