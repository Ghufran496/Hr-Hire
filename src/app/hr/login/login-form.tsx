"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { getTrustedRoleAction } from "@/lib/actions/auth";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const signUpSchema = z.object({
  full_name: z.string().min(2, "Tell us your name."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Use at least 8 characters."),
});

type SignInInput = z.infer<typeof signInSchema>;
type SignUpInput = z.infer<typeof signUpSchema>;

const SIGNIN_ERROR = "Wrong email or password.";

function destinationFor(role: string | null, fallback: string): string {
  if (role === "admin") return "/hr/dashboard";
  if (fallback && fallback !== "/hr/dashboard") return fallback;
  return "/candidate/dashboard";
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";

  return (
    <Tabs defaultValue="signin" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign in</TabsTrigger>
        <TabsTrigger value="signup">Create account</TabsTrigger>
      </TabsList>
      <TabsContent value="signin" className="mt-6">
        <SignInPanel redirectTo={redirectTo} />
      </TabsContent>
      <TabsContent value="signup" className="mt-6">
        <SignUpPanel redirectTo={redirectTo} />
      </TabsContent>
    </Tabs>
  );
}

function SignInPanel({ redirectTo }: { redirectTo: string }) {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: SignInInput) {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error || !data.user) {
        toast.error(SIGNIN_ERROR);
        return;
      }

      const roleResult = await getTrustedRoleAction(data.user.id);
      const role = roleResult.ok ? roleResult.role : null;
      toast.success("Signed in.");
      window.location.assign(destinationFor(role, redirectTo));
    } catch {
      toast.error(SIGNIN_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...field}
                />
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
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={submitting}
          className="bg-brand text-primary-foreground hover:bg-brand-hover w-full"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </Form>
  );
}

function SignUpPanel({ redirectTo }: { redirectTo: string }) {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { full_name: "", email: "", password: "" },
  });

  async function onSubmit(values: SignUpInput) {
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { full_name: values.full_name },
        },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!data.user) {
        toast.error("Could not create your account.");
        return;
      }
      if (!data.session) {
        toast.success(
          "Account created. Check your email to confirm and then sign in.",
        );
        return;
      }

      const roleResult = await getTrustedRoleAction(data.user.id);
      const role = roleResult.ok ? roleResult.role : null;
      toast.success("Account created.");
      window.location.assign(destinationFor(role, redirectTo));
    } catch {
      toast.error("Could not create your account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="Jane Doe" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...field}
                />
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
                <Input
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={submitting}
          className="bg-brand text-primary-foreground hover:bg-brand-hover w-full"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>

        <p className="text-muted-foreground text-center text-xs">
          By creating an account you agree to receive emails about your
          applications.
        </p>
      </form>
    </Form>
  );
}
