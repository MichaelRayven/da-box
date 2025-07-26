import { SignInForm } from "./form";

export default function SignInPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="md:-mt-32 mx-auto flex w-full max-w-[400px] flex-col gap-8">
        <SignInForm />
        {/* <span className="w-full flex items-center gap-4">
          <hr className="flex-1 h-px" /> or <hr className="flex-1 h-px" />
        </span> */}
      </div>
    </main>
  );
}
