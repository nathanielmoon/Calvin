"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { cn } from "../lib/utils";
import { titleFont } from "../fonts";

export default function Header() {
  const sessionResponse = useSession();

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo2.png"
            alt="Calvin"
            width={32}
            height={32}
            className="-translate-y-[2px]"
          />
          <span
            className={cn(titleFont.className, "text-2xl font-extrabold ml-1 text-muted-foreground/80")}
          >
            CALVIN
          </span>
        </div>

        {/* Navigation - Keep minimal */}
        <div className="flex items-center gap-4">
          {/* Authentication Section */}
          {sessionResponse?.status === "loading" ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : (
            sessionResponse?.data && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full bg-sky-600"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={sessionResponse?.data.user?.image || ""}
                        alt={sessionResponse?.data.user?.name || ""}
                      />
                      <AvatarFallback className="text-xs text-white bg-sky-700">
                        {sessionResponse?.data.user?.name?.charAt(0) ||
                          sessionResponse?.data.user?.email?.charAt(0) ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {sessionResponse?.data.user?.name && (
                        <p className="font-medium">
                          {sessionResponse?.data.user.name}
                        </p>
                      )}
                      {sessionResponse?.data.user?.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {sessionResponse?.data.user.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-border my-1" />

                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          )}
        </div>
      </div>
    </header>
  );
}
