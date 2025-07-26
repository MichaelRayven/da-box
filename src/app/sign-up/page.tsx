import { SignUpDialog } from "./dialog";
export default async function SignUpPage() {
  return (
    <section className="flex items-center justify-center md:h-screen md:-mt-32">
      <SignUpDialog />
    </section>
  );
}
