import { signOut } from "@/auth";
import { User } from "next-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Calvin</CardTitle>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage
                src={user.image || undefined}
                alt={user.name || "User"}
              />
              <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <Button type="submit" variant="destructive" size="sm">
                Sign Out
              </Button>
            </form>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Authentication Successful!</CardTitle>
          </CardHeader>
          <p className="text-muted-foreground mb-4">
            Your Google Calendar is now connected.
          </p>
          <p className="text-sm text-muted-foreground">
            Calendar features and chat interface coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
