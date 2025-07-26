"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

const formSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().min(2).max(50),
  password: z.string().min(2).max(50),
  confirmPassword: z.string().min(2).max(50),
});

interface SignUpFormProps {
  id?: string;
  className?: string;
  showSubmit?: boolean;
}

export function SignUpForm({
  id,
  className,
  showSubmit = true,
}: SignUpFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // const { isPending, error, data } = useQuery({
    //   queryKey: ["repoData"],
    //   queryFn: () => fetch("/api/auth/sign-in").then((res) => res.json()),
    // });
  };

  return (
    <Form {...form}>
      <form
        id={id}
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-8", className)}
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username *</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  aria-required="true"
                  autoComplete="name"
                  placeholder="John ..."
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
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  aria-required="true"
                  autoComplete="email"
                  placeholder="john@example.com ..."
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
              <FormLabel>Password *</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  aria-required="true"
                  autoComplete="new-password"
                  placeholder="Enter your password ..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password *</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  aria-required="true"
                  autoComplete="new-password"
                  placeholder="Confirm password ..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {showSubmit && (
          <Button type="submit" variant="secondary">
            Submit
          </Button>
        )}
      </form>
    </Form>
  );
}
