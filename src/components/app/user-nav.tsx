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
import Link from "next/link";
import { usePathname } from "next/navigation";

export function UserNav() {
  const pathname = usePathname();
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
  
  const getName = () => {
    if (role === 'Admin') return "Admin User";
    if (role === 'Clinician') return "Dr. Evelyn Reed";
    if (role === 'Parent') return "Mark Johnson";
    return "User";
  }

  const getEmail = () => {
    if (role === 'Admin') return "admin@abaassessments.com";
    if (role === 'Clinician') return "e.reed@clinic.com";
    if (role === 'Parent') return "m.johnson@example.com";
    return "user@example.com";
  }


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={getAvatar()} alt="@shadcn" />
            <AvatarFallback>{getName().charAt(0)}</AvatarFallback>
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
        <DropdownMenuItem asChild>
          <Link href="/">Log out</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
