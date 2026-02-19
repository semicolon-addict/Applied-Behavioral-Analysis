///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: User navigation dropdown with real Firebase Auth data and proper sign-out
// Outcome: Displays authenticated user's name and email, with working logout via Firebase signOut
// Short Description: Enhanced user-nav with real user data, Super Admin support, and proper logout
/////////////////////////////////////////////////////////////

"use client";

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
import { logoutUser } from "@/lib/sheets-auth";
import { useToast } from "@/hooks/use-toast";

export function UserNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const getRole = () => {
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
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    if (role === 'Admin') return "Admin User";
    if (role === 'Clinician') return "Dr. Evelyn Reed";
    if (role === 'Parent') return "Mark Johnson";
    return "User";
  }

  const getEmail = () => {
    if (user?.email) return user.email;
    if (role === 'Admin') return "admin@abaassessments.com";
    if (role === 'Clinician') return "e.reed@clinic.com";
    if (role === 'Parent') return "m.johnson@example.com";
    return "user@example.com";
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
