import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Stethoscope, Users, Baby } from 'lucide-react';

const roles = [
  {
    name: 'Admin',
    description: 'Manage clinicians, parents, and system settings.',
    icon: <ShieldCheck className="w-12 h-12 text-primary" />,
    href: '/admin/dashboard',
  },
  {
    name: 'Clinician',
    description: 'Track assessments, manage children, and communicate.',
    icon: <Stethoscope className="w-12 h-12 text-primary" />,
    href: '/clinician/dashboard',
  },
  {
    name: 'Parent',
    description: 'View child\'s progress and communicate with clinicians.',
    icon: <Users className="w-12 h-12 text-primary" />,
    href: '/parent/dashboard',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <Baby className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tighter">ABA Assessments</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold font-headline tracking-tight">
            A Modern Approach to Behavioral Assessment
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            ABA Assessments provides a comprehensive platform for ABLLS, AFLLS, and DAYC-2 assessments, connecting admins, clinicians, and parents.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {roles.map((role) => (
            <Card key={role.name} className="flex flex-col items-center text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="p-0">
                <div className="p-4 bg-accent rounded-full mb-4">
                  {role.icon}
                </div>
                <CardTitle className="text-2xl font-headline">{role.name}</CardTitle>
                <CardDescription className="mt-2 h-12">{role.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-0 mt-6 w-full">
                <Button asChild className="w-full">
                  <Link href={role.href}>
                    Go to {role.name} Portal
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} ABA Assessments. All Rights Reserved.
      </footer>
    </div>
  );
}
