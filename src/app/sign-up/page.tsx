import { SignUpForm } from "./form";

export default async function SignUpPage() {
	return (
		<section className="flex items-center justify-center md:h-screen">
			<div className="md:-mt-32 mx-auto flex w-full max-w-[400px] flex-col">
				<SignUpForm />
			</div>
		</section>
	);
}
