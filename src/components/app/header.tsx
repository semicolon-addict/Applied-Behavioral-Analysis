import { Baby } from "lucide-react";
import { UserNav } from "@/components/app/user-nav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { DashboardNav } from "@/components/app/dashboard-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
             <div className="flex items-center gap-2 font-semibold text-lg mb-4">
                <Baby className="w-7 h-7 text-primary" />
                <span>ABA Assessments</span>
             </div>
             <DashboardNav />
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex-1" />
      <UserNav />
    </header>
  );
}
