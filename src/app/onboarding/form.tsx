"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightCircleIcon, TriangleAlertIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import type z from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { onboardingSchema } from "~/lib/validation";
import { AvatarUpload } from "./avatar-upload";
import { submitOnboarding } from "./actions";
import { toast } from "sonner";

export function OnboardingForm() {
  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      username: "",
      avatar: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof onboardingSchema>) => {
    try {
      const res = await submitOnboarding(values);

      toast.success(res);
    } catch (error) {
      toast.error((error as Error).message, {
        icon: <TriangleAlertIcon />,
      });
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar</FormLabel>
              <FormControl>
                <AvatarUpload {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  aria-required="true"
                  autoComplete="name"
                  placeholder="John Doe..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  aria-required="true"
                  autoComplete="username"
                  placeholder="Username..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="mt-4 w-full">
          Continue <ArrowRightCircleIcon className="size-6" />
        </Button>
      </form>
    </Form>
  );
}
