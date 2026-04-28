"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, FileText, Loader2, Upload } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Surface } from "@/components/brand/surface";
import { submitApplicationAction } from "@/lib/actions/applications";
import {
  applicationClientSchema,
  type ApplicationClientInput,
} from "@/lib/validation/application";

type Stage = "form" | "success";

export function ApplicationForm({
  jobId,
  jobTitle,
  defaultName = "",
  defaultEmail = "",
}: {
  jobId: string;
  jobTitle: string;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("form");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ApplicationClientInput>({
    resolver: zodResolver(applicationClientSchema),
    defaultValues: {
      full_name: defaultName,
      email: defaultEmail,
      phone: "",
      experience: "",
      skills: "",
    },
  });

  const cvFile = useWatch({ control: form.control, name: "cv" });

  async function onSubmit(values: ApplicationClientInput) {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("job_id", jobId);
      formData.set("full_name", values.full_name);
      formData.set("email", values.email);
      formData.set("phone", values.phone);
      formData.set("experience", values.experience);
      formData.set("skills", values.skills);
      formData.set("cv", values.cv);

      const result = await submitApplicationAction(formData);
      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [name, messages] of Object.entries(result.fieldErrors)) {
            const message = messages?.[0];
            if (message) {
              form.setError(name as keyof ApplicationClientInput, {
                type: "server",
                message,
              });
            }
          }
        }
        toast.error(result.error);
        return;
      }

      toast.success("Application submitted!");
      setStage("success");
    } finally {
      setSubmitting(false);
    }
  }

  if (stage === "success") {
    return (
      <Surface className="text-center">
        <div className="bg-status-accepted text-status-accepted-foreground mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-full">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </div>
        <h2 className="font-heading text-foreground text-2xl font-semibold">
          Application received
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Thanks for applying to{" "}
          <span className="text-foreground font-medium">{jobTitle}</span>. Our
          HR team will review your CV and get back to you by email.
        </p>
        <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-3">
          <Button variant="outline" onClick={() => router.push("/jobs")}>
            Browse more roles
          </Button>
          <Button
            className="bg-brand text-primary-foreground hover:bg-brand-hover"
            onClick={() => router.push("/")}
          >
            Back to home
          </Button>
        </div>
      </Surface>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Jane Doe"
                    autoComplete="name"
                    {...field}
                  />
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
                    placeholder="jane@example.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+1 555 123 4567"
                  autoComplete="tel"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Briefly describe your relevant experience…"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills</FormLabel>
              <FormControl>
                <Input
                  placeholder="React, TypeScript, communication, …"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cv"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CV (PDF, max 5 MB)</FormLabel>
              <FormControl>
                <label
                  htmlFor="cv-upload"
                  className="border-border bg-secondary/30 hover:border-foreground/40 flex cursor-pointer items-center justify-between gap-3 rounded-md border border-dashed px-4 py-3 text-sm transition-colors"
                >
                  <span className="text-muted-foreground flex items-center gap-2">
                    {cvFile && cvFile instanceof File ? (
                      <>
                        <FileText
                          className="text-foreground size-4"
                          aria-hidden="true"
                        />
                        <span className="text-foreground">{cvFile.name}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="size-4" aria-hidden="true" />
                        <span>Click to choose a PDF</span>
                      </>
                    )}
                  </span>
                  {cvFile && cvFile instanceof File ? (
                    <span className="text-muted-foreground text-xs">
                      {(cvFile.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  ) : null}
                  <input
                    id="cv-upload"
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(e.target.files?.[0])}
                  />
                </label>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="bg-brand text-primary-foreground hover:bg-brand-hover w-full sm:w-auto"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Submitting…
            </>
          ) : (
            "Submit application"
          )}
        </Button>
      </form>
    </Form>
  );
}
