"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "~/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { signInSchema } from "~/lib/validation";

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
	const form = useForm<z.infer<typeof signInSchema>>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = (values: z.infer<typeof signInSchema>) => {
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
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Username</FormLabel>
							<FormControl>
								<Input
									type="email"
									aria-required="true"
									autoComplete="email"
									placeholder="email@example.com ..."
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
									placeholder="Enter your password ..."
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
