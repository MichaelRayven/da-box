"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRightCircleIcon,
  LoaderIcon,
  TriangleAlertIcon,
} from "lucide-react";
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
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface OnboardingFormProps {
  defaultName?: string;
  defaultUsername?: string;
  defaultAvatar?: string;
}

export function OnboardingForm({
  defaultName = "",
  defaultUsername = "",
  defaultAvatar,
}: OnboardingFormProps) {
  const router = useRouter();

  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: defaultName,
      username: defaultUsername,
      avatar: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof onboardingSchema>) => {
      return await submitOnboarding(values);
    },
    onSuccess: () => {
      toast.success("Your profile has been updated!");
      router.replace("/");
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        icon: <TriangleAlertIcon />,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof onboardingSchema>) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar</FormLabel>
              <FormControl>
                <AvatarUpload {...field} disabled={mutation.isPending} />
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
                  placeholder="John Doe..."
                  autoComplete="name"
                  aria-required="true"
                  disabled={mutation.isPending}
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
                  placeholder="Username..."
                  autoComplete="username"
                  aria-required="true"
                  disabled={mutation.isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={mutation.isPending}
          className="mt-2 w-full"
        >
          {mutation.isPending ? (
            <>
              Saving...
              <LoaderIcon className="animation-duration-[2s] size-6 animate-spin" />
            </>
          ) : (
            <>
              Continue <ArrowRightCircleIcon className="size-6" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
