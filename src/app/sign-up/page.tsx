import { SignUpForm } from "./form";

export default async function SignUpPage() {
  return (
    <section className="flex items-center justify-center md:h-screen">
      <div className="mx-auto flex w-full max-w-[400px] flex-col md:-mt-32">
        <SignUpForm />
      </div>
    </section>
  );
}
