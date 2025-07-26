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
import { signIn } from "next-auth/react";

const formSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(2).max(50),
});

interface SignInFormProps {
  id?: string;
  className?: string;
  showSubmit?: boolean;
}

export function SignInForm({
  id,
  className,
  showSubmit = true,
}: SignInFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // const { isPending, error, data } = useQuery({
    //   queryKey: ["repoData"],
    //   queryFn: () => fetch("/api/auth/sign-in").then((res) => res.json()),
    // });
    signIn("credentials", values);
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
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  aria-required="true"
                  autoComplete="name"
                  placeholder="John..."
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
                  aria-required="true"
                  autoComplete="password"
                  placeholder="Enter your password..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {showSubmit && (
          <Button variant="secondary" type="submit">
            Submit
          </Button>
        )}
      </form>
    </Form>
  );
}
