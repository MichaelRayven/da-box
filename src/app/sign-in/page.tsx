import { MailIcon } from "lucide-react";
import { Suspense } from "react";
import { Button } from "~/components/ui/button";
import { signIn } from "~/server/auth";
import { SignInForm } from "./form";

export default function SignInPage() {
	return (
		<main className="flex items-center justify-center md:h-screen">
			<div className="md:-mt-32 mx-auto flex w-full max-w-[400px] flex-col">
				<Suspense>
					<SignInForm />
					<form
						action={async () => {
							"use server";
							await signIn("email");
						}}
					>
						<Button className="self-start" type="submit">
							<MailIcon /> Sign in with E-mail
						</Button>
					</form>
				</Suspense>
			</div>
		</main>
	);
}
