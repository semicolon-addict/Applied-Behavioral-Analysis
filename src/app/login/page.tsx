'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Baby } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUserRole } from '@/lib/auth';
import { useFirestore } from '@/firebase/provider';


const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isRedirecting, setIsRedirecting] = useState(false);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user && !isUserLoading && !isRedirecting) {
        setIsRedirecting(true);
        getUserRole(firestore, user.uid).then(role => {
            let dashboardUrl = '/login';
            switch (role) {
                case 'Admin':
                    dashboardUrl = '/admin/dashboard';
                    break;
                case 'Clinician':
                    dashboardUrl = '/clinician/dashboard';
                    break;
                case 'Parent':
                    dashboardUrl = '/parent/dashboard';
                    break;
            }
            router.push(dashboardUrl);
        }).catch(error => {
            toast({
                variant: "destructive",
                title: 'Routing Error',
                description: 'Could not determine user role.',
            });
            setIsRedirecting(false);
        });
    }
  }, [user, isUserLoading, firestore, router, toast, isRedirecting]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      initiateEmailSignIn(auth, values.email, values.password);
      toast({
        title: 'Login Attempted',
        description: "Please wait while we log you in.",
      });
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: 'Login Failed',
        description: error.message,
      });
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Baby className="w-7 h-7 text-primary" />
          <span>ABA Assessments</span>
        </Link>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isRedirecting || isUserLoading}>
                {isRedirecting || isUserLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
