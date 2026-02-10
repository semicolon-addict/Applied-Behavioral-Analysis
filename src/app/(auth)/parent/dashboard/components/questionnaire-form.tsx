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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore, setDocumentNonBlocking, useUser } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Child } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useEffect } from 'react';


const formSchema = z.object({
  childName: z.string().min(1, 'Child name is required.'),
  childAge: z.coerce.number().min(0, 'Age must be a positive number.'),
  childDob: z.string().min(1, 'Date of Birth is required.'),
  guardian1: z.string().min(1, 'At least one guardian is required.'),
  guardian2: z.string().optional(),
  medicalCond: z.string().min(1, 'Please describe medical conditions or enter N/A.'),
  commStyle: z.string().min(1, 'Please describe communication style.'),
  behavior: z.string().min(1, 'Please describe behavior.'),
  settings: z.string().min(1, 'Please list impacted settings.'),
  goals: z.string().min(1, 'Please list your top goals.'),
  comments: z.string().optional(),
});

type QuestionnaireFormProps = {
    child: Child;
    onFormSubmit: () => void;
};

export function QuestionnaireForm({ child, onFormSubmit }: QuestionnaireFormProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      childName: child.name,
      childAge: 0, // Set initial age to 0 to avoid hydration mismatch
      childDob: child.dob,
      guardian1: '',
      guardian2: '',
      medicalCond: '',
      commStyle: '',
      behavior: '',
      settings: '',
      goals: '',
      comments: '',
    },
  });

  useEffect(() => {
    // Calculate and set age on the client side to avoid hydration errors
    const age = Math.floor((new Date().getTime() - new Date(child.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    form.setValue('childAge', age);
  }, [child.dob, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !child) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to submit.' });
        return;
    }

    const questionnaireId = uuidv4();
    const questionnaireRef = doc(firestore, `users/${user.uid}/children/${child.id}/questionnaires`, questionnaireId);

    const data = {
        ...values,
        id: questionnaireId,
        childId: child.id,
        parentId: user.uid,
        createdAt: new Date().toISOString(),
    };
    
    setDocumentNonBlocking(questionnaireRef, data, { merge: false });
    toast({ title: 'Success', description: 'Questionnaire submitted successfully!' });
    onFormSubmit();
  }

  return (
    <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Parent Intake & Behavioral Questionnaire</CardTitle>
          <CardDescription>Please fill out the form below for {child.name}.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <h2 className="text-lg font-semibold text-accent-foreground border-b pb-2">Identifiers</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="childName" render={({ field }) => (
                        <FormItem><FormLabel>Child Name</FormLabel><FormControl><Input placeholder="e.g., Riya Patil" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="childAge" render={({ field }) => (
                        <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" placeholder="e.g., 6" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="childDob" render={({ field }) => (
                        <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                
                <h2 className="text-lg font-semibold text-accent-foreground border-b pb-2">Caregivers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="guardian1" render={({ field }) => (
                        <FormItem><FormLabel>Parent / Guardian 1</FormLabel><FormControl><Input placeholder="Parent/Guardian name" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="guardian2" render={({ field }) => (
                        <FormItem><FormLabel>Parent / Guardian 2 (Optional)</FormLabel><FormControl><Input placeholder="Parent/Guardian name" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>

                <h2 className="text-lg font-semibold text-accent-foreground border-b pb-2">Medical & Development</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="medicalCond" render={({ field }) => (
                        <FormItem><FormLabel>Medical Conditions</FormLabel><FormControl><Textarea rows={3} placeholder="Mention any known conditions..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="commStyle" render={({ field }) => (
                        <FormItem><FormLabel>Communication Style</FormLabel><FormControl><Textarea rows={3} placeholder="Describe communication style..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>

                <h2 className="text-lg font-semibold text-accent-foreground border-b pb-2">Behavior Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="behavior" render={({ field }) => (
                        <FormItem><FormLabel>Describe behavior</FormLabel><FormControl><Textarea rows={3} placeholder="Describe typical behavior..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="settings" render={({ field }) => (
                        <FormItem><FormLabel>Settings most impacted</FormLabel><FormControl><Textarea rows={2} placeholder="e.g., School, Home, Social gatherings..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>

                <h2 className="text-lg font-semibold text-accent-foreground border-b pb-2">Goals</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="goals" render={({ field }) => (
                        <FormItem><FormLabel>Family’s Top Goals</FormLabel><FormControl><Textarea rows={3} placeholder="List your main treatment goals..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="comments" render={({ field }) => (
                        <FormItem><FormLabel>Additional Comments (Optional)</FormLabel><FormControl><Textarea rows={2} placeholder="Any extra notes or comments..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>

                <div className="flex gap-2 justify-end">
                    <Button type="reset" variant="outline" onClick={() => form.reset()}>Reset</Button>
                    <Button type="submit">Save Questionnaire</Button>
                </div>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
