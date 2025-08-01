import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  LogOutIcon,
  Search,
  Settings,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { auth, signOut } from "~/server/auth";
import SignInButton from "./sign-in-button";

export default async function Header() {
  const session = await auth();

  return (
    <header className="border-gray-800 border-b">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
            <Input
              placeholder="Search in Drive"
              className="w-96 border-gray-700 bg-gray-800 pl-10 text-white placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="flex size-8 cursor-pointer ">
                  <AvatarImage
                    className="aspect-square size-full rounded-full object-cover"
                    src={session.user.image ?? "/placeholder-user.jpg"}
                    alt={session.user.name ?? "User"}
                  />
                  <AvatarFallback className="flex flex-1 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {session.user.name?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="mt-2 w-64">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="font-medium text-base">
                    {session.user.name}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    @{session.user.username}
                  </span>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href="/dashboard">
                    <SettingsIcon className="size-4" />
                    Account preferences
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <LogOutIcon className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
    </header>
  );
}
