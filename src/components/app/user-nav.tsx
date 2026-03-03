///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: User navigation dropdown with real Firebase Auth data and proper sign-out
// Outcome: Displays authenticated user's name and email, with working logout via Firebase signOut
// Short Description: Enhanced user-nav with real user data, Super Admin support, and proper logout
/////////////////////////////////////////////////////////////

"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { getSession, logoutUser } from "@/lib/sheets-auth";
import { useToast } from "@/hooks/use-toast";

export function UserNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const [sessionRole, setSessionRole] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    setSessionRole(session?.role ?? null);
  }, [pathname, user?.uid]);

  const getRole = () => {
    if (sessionRole) return sessionRole;
    if (pathname.startsWith("/admin")) return "Admin";
    if (pathname.startsWith("/clinician")) return "Clinician";
    if (pathname.startsWith("/parent")) return "Parent";
    return "User";
  };
  const role = getRole();

  const getAvatar = () => {
    if (role === 'Admin') return PlaceHolderImages.find(p => p.id === 'avatar-3')?.imageUrl;
    if (role === 'Clinician') return PlaceHolderImages.find(p => p.id === 'avatar-1')?.imageUrl;
    if (role === 'Parent') return PlaceHolderImages.find(p => p.id === 'avatar-2')?.imageUrl;
    return PlaceHolderImages.find(p => p.id === 'avatar-4')?.imageUrl;
  }

  // Use real Firebase user data when available
  const getName = () => {
    const session = getSession();
    if (session?.firstName || session?.lastName) {
      return `${session.firstName || ""} ${session.lastName || ""}`.trim();
    }
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return "User";
  }

  const getEmail = () => {
    const session = getSession();
    if (session?.email) return session.email;
    if (user?.email) return user.email;
    return "";
  }

  // Proper logout handler
  const handleLogout = async () => {
    try {
      // Clear Apps Script session
      logoutUser();
      // Sign out from Firebase
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: 'Logout Error',
        description: error.message,
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={getAvatar()} alt="@user" />
            <AvatarFallback>{getName().charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getName()}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {getEmail()}
            </p>
            <p className="text-xs leading-none text-muted-foreground mt-1">
              Role: {role}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
