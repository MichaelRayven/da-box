import { Suspense } from "react";
import { SignInForm } from "./form";

export default function SignInPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="mx-auto flex w-full max-w-[400px] flex-col md:-mt-32">
        <Suspense>
          <SignInForm />
        </Suspense>
      </div>
    </main>
  );
}
