///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: Dashboard layout with RouteGuard for authentication and authorization
// Outcome: All dashboard pages require authentication and correct role to access
// Short Description: Wrapped dashboard layout with RouteGuard for RBAC enforcement
/////////////////////////////////////////////////////////////

import { ReactNode } from "react";
import { Header } from "@/components/app/header";
import { DashboardNav } from "@/components/app/dashboard-nav";
import { Baby } from "lucide-react";
import { RouteGuard } from "@/components/auth/route-guard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RouteGuard>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-card md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <Baby className="w-7 h-7 text-primary" />
                <span>ABA Assessments</span>
              </div>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <DashboardNav />
              </nav>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <Header />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background/90">
            {children}
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
